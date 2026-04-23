import Image from "next/image";
import Link from "next/link";

import { urlFor } from "@/sanity/image";
import type { PostSummary } from "@/sanity/types";

import FormattedDate from "./FormattedDate";

/**
 * Card for a single post in the list. Ported from
 * `headforcode-2026/src/components/PostCard.astro`.
 *
 * This is a Server Component, so the Sanity image URL is built on the server
 * and no JS ships to the browser for this component.
 */
export default function PostCard({ post }: { post: PostSummary }) {
  const href = `/post/${post.slug}`;
  const imageUrl = post.image
    ? urlFor(post.image).width(1200).height(600).fit("crop").url()
    : null;

  // First tag becomes the "category" chip, mirroring the Astro version.
  const category = post.tags?.[0];

  return (
    <article className="grid grid-rows-[300px_auto] md:grid-rows-[300px_220px] min-h-full group">
      <Link
        href={href}
        className="relative overflow-hidden rounded-[2px]"
        aria-label={post.title}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="object-cover group-hover:scale-[101%] transition-transform duration-200"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-stone-800" />
        )}

        {/* Glass overlay with date + category, matching the Astro PostCard. */}
        <div className="z-30 absolute bottom-0 w-full h-20">
          <div className="-z-10 absolute bottom-0 glass w-full min-h-full" />
          <div className="flex items-center justify-between gap-x-1 text-white px-6 py-4">
            <FormattedDate date={post.publishedAt} className="text-sm" />
            {category ? <span className="pb-4">{category}</span> : null}
          </div>
        </div>
      </Link>

      <div className="flex justify-between flex-col gap-4 md:gap-0 py-6 pl-1">
        <div className="flex flex-col gap-3">
          <Link
            href={href}
            className="text-2xl font-semibold -tracking-wider hover:text-teal-600 transition-colors"
          >
            {post.title}
          </Link>
          {post.description ? (
            <p className="overflow-hidden line-clamp-3 text-stone-700 dark:text-white/80 mb-5 font-[400] md:pr-[15%]">
              {post.description}
            </p>
          ) : null}
        </div>

        <footer className="flex justify-between items-center">
          <Link
            href={href}
            className="flex justify-center items-center rounded-full hover:translate-x-1 transition-transform duration-150 ease-in-out font-semibold gap-1 group"
            aria-label={`Read ${post.title}`}
          >
            Read Post
            <span className="mt-[1px] transition-transform duration-200 ease-in-out group-hover:rotate-45">
              ↗
            </span>
          </Link>
        </footer>
      </div>
    </article>
  );
}
