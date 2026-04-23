/**
 * Minimal footer. Server Component.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="flex justify-center items-center w-full px-16 h-28 border-t-2 border-stone-200 dark:border-stone-700">
      <p className="text-sm">
        &copy; {year} Mapugo. All rights reserved.
      </p>
    </footer>
  );
}
