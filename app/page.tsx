import { client } from "@/sanity/client";
import { POSTS_QUERY } from "@/sanity/queries";
import type { PostSummary } from "@/sanity/types";

import Hero from "./components/Hero";
import ListPosts from "./components/ListPosts";

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

  return (
    <>
      <Hero />

      <section>
        <h2 className="text-lg font-medium tracking-wide text-end">
          Latest Posts
        </h2>
        <ListPosts posts={posts} firstBig />
      </section>
    </>
  );
}
