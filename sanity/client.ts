import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "./env";

/**
 * A singleton Sanity client for read-only public content.
 *
 * `next-sanity`'s `createClient` is compatible with the App Router's data
 * cache, so you can safely call `client.fetch(query, params, { next: { ... } })`
 * from Server Components.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // fast, cached, eventually-consistent; fine for public pages.
});
