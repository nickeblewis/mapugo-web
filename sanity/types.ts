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
/**
 * Shape of Sanity's built-in `geopoint` field. `alt` is optional; we omit
 * `_type` since our GROQ projections don't select it.
 */
export type GeoPoint = {
  lat: number;
  lng: number;
  alt?: number;
};

export type PostSummary = {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  publishedAt?: string;
  tags?: string[];
  image?: SanityImageSource;
  location?: GeoPoint;
};

export type Post = PostSummary & {
  body?: PortableTextBlock[];
};
