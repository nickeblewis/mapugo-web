/**
 * Runtime configuration for the Sanity client.
 *
 * Values come from `NEXT_PUBLIC_*` env vars (readable on both the server and
 * the client). Defaults mirror `studio-headforcode/sanity.config.ts` so the
 * app works out of the box while you are learning.
 */

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "4zdvmoav";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

// Pin an API version so Sanity can't silently change query semantics.
// See: https://www.sanity.io/docs/api-versioning
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";
