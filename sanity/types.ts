import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";

/**
 * Hand-written types that match the shape of `studio-headforcode`'s `post`
 * document + our GROQ projections.
 *
 * When you start editing the schema frequently, consider running
 * `npx sanity@latest typegen generate` in the studio to derive these
 * automatically.
 */
export type PostSummary = {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  publishedAt?: string;
  tags?: string[];
  image?: SanityImageSource;
  gpsLat?: string;
  gpsLng?: string;
};

export type Post = PostSummary & {
  body?: PortableTextBlock[];
};
