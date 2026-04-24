import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import type { SanityClient } from "next-sanity";

import { getWriteClient } from "@/sanity/write-client";

/**
 * POST /api/places — create a user-submitted place as a Sanity `post` draft.
 *
 * Shared-secret auth is intentionally shallow; see
 * `docs/adr/0001-sanity-write-through-backend-proxy.md` in the mapugo repo.
 */

/** iOS typically produces HEIC; Android tends to JPEG. Sanity handles both. */
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
]);

const MAX_TITLE_LEN = 120;
const MAX_DESCRIPTION_LEN = 2000;
const MAX_SLUG_ATTEMPTS = 50;

type ErrorCode = "invalid_input" | "unauthorised" | "sanity_error" | "internal";

function problem(status: number, code: ErrorCode, error: string) {
  return NextResponse.json({ error, code }, { status });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Resolve a slug that does not clash with an existing `post.slug.current`.
 * The strategy matches the spec: append `-2`, `-3`, … up to a cap, then fall
 * back to a short random suffix rather than looping forever.
 */
async function uniqueSlug(client: SanityClient, base: string): Promise<string> {
  const query = `count(*[_type == "post" && slug.current == $slug])`;
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const count = await client.fetch<number>(query, { slug: candidate });
    if (count === 0) return candidate;
  }
  return `${base}-${randomUUID().slice(0, 6)}`;
}

/**
 * Constant-time string compare so naive timing attacks on the shared secret
 * are harder. Not bullet-proof since the bundle is inspectable, but we may as
 * well not make it trivial either.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request: Request) {
  const appSecret = process.env.MAPUGO_APP_SECRET;
  if (!appSecret) {
    console.error("[api/places] MAPUGO_APP_SECRET is not configured.");
    return problem(500, "internal", "Server is not configured for submissions.");
  }

  const provided = request.headers.get("x-mapugo-app-secret") ?? "";
  if (!safeEqual(provided, appSecret)) {
    return problem(401, "unauthorised", "Missing or invalid app secret.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return problem(400, "invalid_input", "Expected multipart/form-data.");
  }

  // --- Image -----------------------------------------------------------
  const image = form.get("image");
  if (!(image instanceof File)) {
    return problem(400, "invalid_input", "Image is required.");
  }
  if (image.size === 0) {
    return problem(400, "invalid_input", "Image is empty.");
  }
  if (!ALLOWED_MIME.has(image.type)) {
    return problem(
      400,
      "invalid_input",
      `Unsupported image type: ${image.type || "unknown"}.`,
    );
  }

  // --- Text fields -----------------------------------------------------
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const publishedAt = String(form.get("publishedAt") ?? "").trim();
  const slugInput = String(form.get("slug") ?? "").trim();

  if (!title) {
    return problem(400, "invalid_input", "Title is required.");
  }
  if (title.length > MAX_TITLE_LEN) {
    return problem(
      400,
      "invalid_input",
      `Title must be ${MAX_TITLE_LEN} characters or fewer.`,
    );
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    return problem(
      400,
      "invalid_input",
      `Description must be ${MAX_DESCRIPTION_LEN} characters or fewer.`,
    );
  }

  // --- Numeric coordinates --------------------------------------------
  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return problem(400, "invalid_input", "lat must be a number between -90 and 90.");
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return problem(400, "invalid_input", "lng must be a number between -180 and 180.");
  }

  // --- Timestamp -------------------------------------------------------
  if (!publishedAt || Number.isNaN(Date.parse(publishedAt))) {
    return problem(
      400,
      "invalid_input",
      "publishedAt must be an ISO-8601 timestamp.",
    );
  }

  const baseSlug = slugify(slugInput || title);
  if (!baseSlug) {
    return problem(400, "invalid_input", "Could not derive a slug from the title.");
  }

  // --- Sanity client ---------------------------------------------------
  let client: SanityClient;
  try {
    client = getWriteClient();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/places] write client error:", message);
    return problem(500, "internal", "Server is not configured to write to Sanity.");
  }

  // --- Upload + create -------------------------------------------------
  try {
    const slug = await uniqueSlug(client, baseSlug);

    // `assets.upload` accepts a Buffer in Node runtime. Converting up front
    // sidesteps variance across Node / File streaming implementations.
    const buffer = Buffer.from(await image.arrayBuffer());
    const asset = await client.assets.upload("image", buffer, {
      filename: image.name || `${slug}.jpg`,
      contentType: image.type,
    });

    const doc = await client.create({
      _id: `drafts.${randomUUID()}`,
      _type: "post",
      title,
      ...(description ? { description } : {}),
      slug: { _type: "slug", current: slug },
      publishedAt,
      location: { _type: "geopoint", lat, lng },
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
    });

    return NextResponse.json({ _id: doc._id, slug }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/places] Sanity error:", message);
    return problem(502, "sanity_error", "Failed to create place document.");
  }
}
