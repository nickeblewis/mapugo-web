import Link from "next/link";

/**
 * Site header — a simple, responsive navigation bar.
 *
 * This is a Server Component (no "use client"), so all the rendering happens
 * on the server and zero JavaScript ships to the browser for it.
 */
const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export default function Header() {
  return (
    <header className="relative flex items-center h-12 font-semibold">
      <Link href="/" aria-label="Home" className="flex items-center gap-2">
        {/* Hook up a real logo later via next/image + /public/images/hfc-logo.jpeg */}
        <span className="inline-block h-10 w-10 rounded bg-teal-600" aria-hidden />
        <span className="text-lg font-semibold">Mapugo</span>
      </Link>

      <nav className="ml-auto flex items-center gap-5 text-base">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={label}
            href={href}
            className="hidden sm:inline-block hover:text-teal-600 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
