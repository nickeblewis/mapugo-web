import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

import { client } from "./client";

const builder = createImageUrlBuilder(client);

/**
 * Build a URL for any Sanity image reference.
 *
 * Example:
 *   urlFor(post.image).width(800).height(500).fit("crop").url()
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
