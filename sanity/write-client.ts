import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "./env";

/**
 * Server-side Sanity client used for authenticated writes (document create,
 * asset upload). MUST only be imported from server code — never from a Client
 * Component or anything that ends up in the browser bundle. The write token is
 * a secret.
 *
 * The factory lazily throws if `SANITY_API_WRITE_TOKEN` is unset, so unrelated
 * parts of the app still build in dev without write credentials. Route handlers
 * that actually need it should call `getWriteClient()` on each request rather
 * than at module scope.
 *
 * See `docs/adr/0001-sanity-write-through-backend-proxy.md` in the sibling
 * `mapugo` repo for why writes are proxied through this app.
 */
export function getWriteClient(): SanityClient {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "SANITY_API_WRITE_TOKEN is not set. Configure it in mapugo-web's environment before handling write requests.",
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    // Writes must go to the origin, and authenticated reads made during a
    // write flow should not be served from the cached CDN.
    useCdn: false,
  });
}
