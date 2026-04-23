import Link from "next/link";

/**
 * Rendered when `notFound()` is called from the post page, or when a user
 * lands on `/post/<missing-slug>` directly.
 */
export default function PostNotFound() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-16">
      <h1 className="text-3xl font-bold">Post not found</h1>
      <p className="text-stone-600 dark:text-stone-300 max-w-md">
        We couldn&rsquo;t find that story. It may have been unpublished in
        Sanity, or the URL might be a typo.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
