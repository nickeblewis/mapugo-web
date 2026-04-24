import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";

import FormattedDate from "@/app/components/FormattedDate";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import {
  POST_BY_SLUG_QUERY,
  POST_SLUGS_QUERY,
} from "@/sanity/queries";
import type { Post } from "@/sanity/types";

import Map from "@/app/components/Map";

/**
 * Pre-render all known post slugs at build time. Next.js will still render
 * newly-published posts on demand the first time they're requested.
 *
 * See `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`.
 */
export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(POST_SLUGS_QUERY);
  return slugs.map(({ slug }) => ({ slug }));
}

/**
 * `generateMetadata` lets us set `<title>` / OG tags per page. Like `Page`,
 * `params` is a Promise that must be awaited.
 */
export async function generateMetadata(
  props: PageProps<"/post/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug });
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
  };
}

/**
 * The `PageProps<'/post/[slug]'>` helper is a globally-available type in
 * Next.js 16 that's generated from your route tree during `next dev` /
 * `next build` / `next typegen`. It types `params` as a `Promise` so the
 * runtime must `await` it.
 */
export default async function PostPage(props: PageProps<"/post/[slug]">) {
  const { slug } = await props.params;

  const post = await client.fetch<Post | null>(
    POST_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60 } },
  );

  if (!post) notFound();

  const imageUrl = post.image
    ? urlFor(post.image).width(1600).height(900).fit("crop").url()
    : null;

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
          <FormattedDate date={post.publishedAt} />
          {post.tags && post.tags.length > 0 ? (
            <span className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-teal-600/10 text-teal-700 dark:text-teal-200 px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </span>
          ) : null}
        </div>
        {post.description ? (
          <p className="text-lg text-stone-700 dark:text-stone-200">
            {post.description}
          </p>
        ) : null}
      </header>

      {imageUrl ? (
        <div className="relative w-full h-[320px] md:h-[480px] rounded-2xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {post.location ? (
        <Map
          center={[post.location.lat, post.location.lng]}
          markers={[{ lat: post.location.lat, lng: post.location.lng }]}
          zoom={18}
        />
      ) : null}
      
      {post.body ? (
        <div className="max-w-3xl flex flex-col gap-5 text-base md:text-lg leading-relaxed [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_a]:underline [&_a]:text-teal-700 dark:[&_a]:text-teal-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_code]:font-mono [&_code]:bg-stone-100 dark:[&_code]:bg-stone-800 [&_code]:px-1 [&_code]:rounded">
          <PortableText value={post.body} />
        </div>
      ) : null}
    </article>
  );
}
