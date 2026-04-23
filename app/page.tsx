import { client } from "@/sanity/client";
import { POSTS_QUERY } from "@/sanity/queries";
import type { PostSummary } from "@/sanity/types";

import Hero from "./components/Hero";
import ListPosts from "./components/ListPosts";
import Map, { type MapMarker } from "./components/Map";

/** Central London (Charing Cross area): 51.5074° N, 0.1278° W. */
const CENTRAL_LONDON: [number, number] = [51.5074, -0.1278];

/**
 * A small curated set of London landmarks. Set to `undefined` to drop them
 * from the map entirely.
 */
const LONDON_LANDMARKS: MapMarker[] | undefined = [
  { lat: 51.5113, lng: -0.1281, label: "Leicester Square" },
  { lat: 51.5132, lng: -0.1588, label: "Marble Arch" },
  { lat: 51.5014, lng: -0.1419, label: "Buckingham Palace" },
  { lat: 51.5081, lng: -0.0759, label: "Tower of London" },
  { lat: 51.5055, lng: -0.0754, label: "Tower Bridge" },
];

/**
 * Homepage. This is an **async Server Component** — the default in the App
 * Router. It runs on the server only, which means:
 *
 *   - You can `await` data fetching inline, no `getServerSideProps` needed.
 *   - Nothing in this file ships to the client as JavaScript.
 *   - Secrets / server-only logic are safe to use here.
 *
 * The `{ next: { revalidate: 60 } }` option caches the response for 60
 * seconds and revalidates in the background — see
 * `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`.
 */
export default async function Home() {
  const posts = await client.fetch<PostSummary[]>(
    POSTS_QUERY,
    {},
    { next: { revalidate: 60 } },
  );

  // `gpsLat` / `gpsLng` are stored as strings in Sanity (see
  // `studio-mapugo/schemaTypes/postType.ts`). Parse them here, drop any posts
  // whose coordinates are missing or non-numeric, and hand the rest to Map.
  // If no posts have valid coordinates, `markers` is `undefined` and the map
  // renders with no pins.
  const postMarkers: MapMarker[] = posts.flatMap((post) => {
    const lat = post.gpsLat != null ? Number.parseFloat(post.gpsLat) : NaN;
    const lng = post.gpsLng != null ? Number.parseFloat(post.gpsLng) : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
    return [{ lat, lng, label: post.title }];
  });

  // Combine landmarks with any post coordinates. `center` on the Map call
  // below keeps the view on central London regardless of where markers sit.
  const combined: MapMarker[] = [
    ...(LONDON_LANDMARKS ?? []),
    ...postMarkers,
  ];
  const markers: MapMarker[] | undefined =
    combined.length > 0 ? combined : undefined;

  return (
    <>
      <Hero />

      <section aria-labelledby="map-heading">
        <h2
          id="map-heading"
          className="text-lg font-medium tracking-wide mb-3"
        >
          Find us
        </h2>
        <Map markers={markers} center={CENTRAL_LONDON} zoom={12} />
      </section>

      <section>
        <h2 className="text-lg font-medium tracking-wide text-end">
          Latest Posts
        </h2>
        <ListPosts posts={posts} firstBig />
      </section>
    </>
  );
}
