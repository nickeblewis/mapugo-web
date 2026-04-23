import { defineQuery } from "next-sanity";

/**
 * Most recent posts, newest first.
 * `defineQuery` is just a tagged template that helps tools like Sanity TypeGen
 * infer types — at runtime it is a plain string.
 */
export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    title,
    description,
    "slug": slug.current,
    publishedAt,
    tags,
    image,
    location
  }
`);

/**
 * A single post by slug, including the block-content body.
 */
export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    description,
    "slug": slug.current,
    publishedAt,
    tags,
    image,
    body,
    location
  }
`);

/**
 * Just the slugs — used by `generateStaticParams` to prerender post routes.
 */
export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{ "slug": slug.current }
`);
