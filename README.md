# mapugo-web

A **Next.js 16 + React 19 + Tailwind v4** web app that reads content from the
`studio-headforcode` Sanity studio and renders it with a layout inspired by
the `headforcode-2026` Astro template.

This project is deliberately small and heavily commented so you can use it as a
learning sandbox for the newest Next.js / React features.

---

## 1. Setup

```bash
# Install deps
npm install

# Configure Sanity connection (defaults already point at the existing studio)
cp .env.local.example .env.local

# Start the dev server at http://localhost:3000
npm run dev
```

If you want live editing, run the Sanity studio in a second terminal:

```bash
cd ../studio-headforcode
pnpm dev   # http://localhost:3333
```

Publish a post in the studio and it will appear on the homepage within ~60
seconds (or immediately on dev server restart).

## 2. What's in the box

```
app/
  layout.tsx              # Root layout: Manrope font, Header/Footer shell
  page.tsx                # Homepage: Hero + ListPosts fed by Sanity
  globals.css             # Tailwind v4 + theme tokens + .glass utility
  components/
    Header.tsx            # Top nav
    Footer.tsx            # Copyright strip
    Hero.tsx              # Rounded hero card (ported from headforcode-2026)
    ListPosts.tsx         # 1/2/3-col responsive grid with optional "first big"
    PostCard.tsx          # Single post preview with image + glass overlay
    FormattedDate.tsx     # Tiny date helper
  post/[slug]/
    page.tsx              # Post detail, PortableText body, generateStaticParams
    not-found.tsx         # Shown when notFound() is called
sanity/
  env.ts                  # Reads NEXT_PUBLIC_SANITY_* env vars
  client.ts               # next-sanity createClient singleton
  image.ts                # urlFor(source) helper
  queries.ts              # GROQ queries
  types.ts                # Hand-written Post / PostSummary types
public/
  images/                 # Static images (drop hero.jpg here)
.env.local.example        # Copy to .env.local
next.config.ts            # images.remotePatterns whitelists cdn.sanity.io
```

## 3. Sanity integration

The studio at `../studio-headforcode` exposes a single `post` document with
these fields: `title`, `description`, `tags`, `slug`, `publishedAt`, `image`,
`body` (block content). We read that in three ways:

- `POSTS_QUERY` — list of post summaries for the homepage grid.
- `POST_BY_SLUG_QUERY` — one post (including body) for the detail page.
- `POST_SLUGS_QUERY` — used by `generateStaticParams` to pre-render detail
  pages at build time.

Images are served through Sanity's CDN via the `@sanity/image-url` builder —
see `sanity/image.ts`. `next.config.ts` whitelists `cdn.sanity.io` so
`<Image>` can optimise them.

## 4. Design system port

The headforcode-2026 Astro template uses Tailwind v3 with a `tailwind.config.cjs`
file. Tailwind v4 doesn't use that file; all customisation lives inside the
`@theme` block of `app/globals.css`. The port translates:

- `white: '#f8f9fa'` → `--color-white: #f8f9fa`
- `fontFamily.body: ['Manrope', ...]` → `--font-sans` / `--font-body` pointing
  at the Manrope variable from `next/font/google`
- `gridTemplateColumns.list: repeat(...)` → `--grid-template-columns-list`
- `darkMode: 'class'` → `@custom-variant dark (&:where(.dark, .dark *));`
- `.glass` utility → copied verbatim

The homepage grid uses the same Tailwind classes as the Astro `ListPosts.astro`
(`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-3` plus the arbitrary
variant `md:[&>*:first-child]:col-span-2` for the featured card).

## 5. New Next.js / React 19 features to explore

This is **not** the Next.js you may remember — APIs have moved. The bundled
docs in `node_modules/next/dist/docs/` are the authoritative reference; here
are the bits used in this repo.

### Server Components by default

Every file under `app/` that does **not** start with `"use client"` is a Server
Component. They run on the server, never ship JS, and can `await` I/O inline.
`app/page.tsx`, `app/post/[slug]/page.tsx`, and every component in
`app/components/` are Server Components.

Doc: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

### Async pages + Promise-shaped `params`

Dynamic routes get their URL params **as a Promise**. Always `await` it:

```tsx
export default async function PostPage(props: PageProps<"/post/[slug]">) {
  const { slug } = await props.params;
  // ...
}
```

`PageProps<"/post/[slug]">` is a globally-generated type — no import needed.
Types are regenerated on `next dev`, `next build`, or `next typegen`.

Doc: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`

### Fetching data & caching

`fetch` (and any `next-sanity` `client.fetch`) isn't cached by default in
Next 16. To cache, pass `{ next: { revalidate: seconds } }` or
`{ cache: "force-cache" }`. The homepage uses:

```ts
client.fetch(POSTS_QUERY, {}, { next: { revalidate: 60 } })
```

Doc: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`

### `generateStaticParams`

The equivalent of `getStaticPaths`. Returns an array of `{ slug }` objects
used to pre-render dynamic routes at build time.

Doc: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`

### Suspense & streaming (to explore next)

Wrap slow children in `<Suspense fallback={...}>` to stream them in after the
rest of the page. Combine with `use(promise)` in a Client Component to read a
promise passed down from a Server Component.

Doc: `node_modules/next/dist/docs/01-app/02-guides/streaming.md`

### Metadata as data

`app/layout.tsx` exports `metadata` and `app/post/[slug]/page.tsx` exports
`generateMetadata` — Next builds the `<title>` / OG tags for you.

## 6. Extending the schema

When you add a new field in `../studio-headforcode/schemaTypes/postType.ts`:

1. Extend `sanity/types.ts` (or generate types via `npx sanity@latest typegen generate`).
2. Add the field to the projection in `sanity/queries.ts`.
3. Render it where you want — probably `app/components/PostCard.tsx` or
   `app/post/[slug]/page.tsx`.

## 7. Useful commands

```bash
npm run dev      # dev server with hot reload
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```
