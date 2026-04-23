import Link from "next/link";

type HeroProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /**
   * Background image path (served from `/public`). If the file is missing
   * the hero still renders with a gradient fallback — see `globals.css`.
   */
  backgroundSrc?: string;
};

/**
 * The big rounded hero card, ported from `headforcode-2026/src/pages/index.astro`.
 *
 * Server Component. The background image is applied via inline style so you
 * can swap it out without touching this file (just pass `backgroundSrc`).
 */
export default function Hero({
  eyebrow = "JAMStack Web, Reading, Berkshire",
  title = "Helping your business find the greatest outcomes through technology",
  body = "We develop solutions that help businesses like yours reach the outcomes you set out to achieve.",
  ctaLabel = "Get in contact today",
  ctaHref = "/contact",
  backgroundSrc = "/images/hero.jpg",
}: HeroProps) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-cover bg-center min-h-[360px] md:min-h-[440px] flex items-center bg-gradient-to-br from-teal-700 to-stone-900"
      style={{ backgroundImage: `url('${backgroundSrc}')` }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div className="relative z-10 p-6 md:p-12 max-w-3xl text-white">
        <p className="uppercase tracking-widest text-sm md:text-base font-semibold text-teal-200">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">
          {title}
        </h1>
        <p className="mt-4 text-base md:text-lg leading-relaxed text-white/90">
          {body}
        </p>
        <Link
          href={ctaHref}
          className="inline-block mt-6 bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
