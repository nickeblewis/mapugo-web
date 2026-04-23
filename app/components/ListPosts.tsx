import type { PostSummary } from "@/sanity/types";

import PostCard from "./PostCard";

type ListPostsProps = {
  posts: PostSummary[];
  /**
   * When true, the first card spans two columns on `md` and up, giving the
   * homepage a "featured article" feel. Matches the Astro `FirstBig` prop.
   */
  firstBig?: boolean;
};

/**
 * Responsive grid of post cards. Ported from
 * `headforcode-2026/src/components/ListPosts.astro`.
 *
 * The `[&>*:first-child]:col-span-2` arbitrary variant targets the first
 * child and tells it to span two columns — an inline replacement for
 * writing a dedicated CSS class.
 */
export default function ListPosts({ posts, firstBig = false }: ListPostsProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-600 p-8 text-center">
        <p className="text-lg font-medium">No posts yet.</p>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          Run <code className="font-mono">pnpm dev</code> in
          {" "}
          <code className="font-mono">studio-headforcode</code> and publish a
          post — it will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <section
      className={[
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-3",
        firstBig ? "md:[&>*:first-child]:col-span-2" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </section>
  );
}
