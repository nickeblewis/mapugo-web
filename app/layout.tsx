import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import Footer from "./components/Footer";
import Header from "./components/Header";

import "./globals.css";

/**
 * `next/font/google` downloads the font at build time and self-hosts it.
 * `variable` exposes a CSS variable we reference in `app/globals.css` via
 * `--font-manrope` → `--font-sans`.
 */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mapugo",
    template: "%s · Mapugo",
  },
  description:
    "Mapugo — a Next.js + Sanity sandbox built on the headforcode design language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} scroll-smooth h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {/*
          Layout mirror of `headforcode-2026/src/layouts/BaseLayout.astro`:
          constrained column width, 12px grid gap, consistent gutter.
        */}
        <main className="px-5 sm:mx-auto sm:max-w-2xl sm:px-8 lg:px-0 antialiased md:max-w-6xl grid gap-12 mt-4 overflow-hidden md:overflow-visible">
          <Header />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
