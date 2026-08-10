# Architecture

How the site is put together — routing, rendering, and the build that turns a React SPA
into a set of static HTML files.

For *authoring* content see [CONTENT.md](CONTENT.md); for the search side see
[SEO.md](SEO.md). This document is about the machinery underneath both.

---

## The shape of it

Vite + React 19 + React Router 7 + Tailwind v4, with MDX for write-ups. There is no
server and no database. Every deploy is a folder of static files on Cloudflare's edge.

| Where | What lives there |
|---|---|
| `data/` | All content — `profile.json`, the two MDX collections, and `data/assets/` (served from the site root via `publicDir`) |
| `src/pages/` | One component per route |
| `src/components/` | Everything reusable, including the homepage sections |
| `src/lib/` | Content loaders (`projects.ts`, `certificates.ts`, `profile.ts`), hooks, motion tokens, `site.ts` |
| `scripts/prerender.mjs` | The build step that renders every route to real HTML |
| `src/entry-server.tsx` | What that script renders. Mirrors `src/main.tsx` |

Two things are worth knowing before reading any of it:

1. **The site renders twice** — once at build time into static HTML, once in the browser
   as hydration. Anything that differs between the two shows up as a hydration mismatch.
2. **A write-up has two homes** — an overlay over the listing, and a full page. Same
   component, two contexts.

---

## Routing

`src/App.tsx` owns the route table:

| Path | Component | Notes |
|---|---|---|
| `/` | `Home` | Eager — it's the landing route |
| `/projects` | `ProjectsIndex` | Every project |
| `/projects/:slug` | `ProjectDetail` | Full page, or `ProjectModal` as an overlay |
| `/certificates` | `CertificatesIndex` | Every certificate |
| `/certificates/:slug` | `CertificateDetail` | Full page, or `CertificateModal` |
| `*` | `NotFound` | Also rendered for an unknown slug on either detail route |

Everything except `Home` is `React.lazy`, which keeps `@mdx-js/react` and the MDX
component map out of the landing chunk. This has a consequence at build time — see
[Build & prerender](#build--prerender).

There is no layout route. Each page renders `SiteHeader`, `PageTransition` and `Footer`
itself. That is deliberate: a layout route would sit above `AnimatePresence` and the
header would never participate in a page transition.

### Page transitions and scroll

`AnimatePresence mode="wait"` crossfades routes. Two details are load-bearing:

- **The key sits on `<Suspense>`, not `<Routes>`.** `AnimatePresence` only sees its
  direct child; keyed a level down it sees one unchanging child, and both the exit
  animation and `onExitComplete` stop firing.
- **It keys off the *background* pathname when there is one.** Keyed on the raw
  location, opening an overlay would remount the page behind it — losing its scroll
  position and replaying every reveal animation.

Scroll reset runs from `onExitComplete`, between the outgoing page's exit and the
incoming page's enter, rather than on pathname change — which would jump the page while
the previous route is still animating out. It skips when `location.hash` is set, because
`useScrollToHash` owns those.

`useScrollToHash` (`src/lib/useScrollToHash.ts`) is called from `PageTransition`, not
`App`. Under `mode="wait"` the incoming page mounts a beat after the location changes, so
an effect in `App` would fire while the target section is still unmounted. `location.key`
is in its dependency list on purpose: clicking "About" while already at `/#about`
produces an identical URL but a fresh key, and without it the link would be dead after
the first click.

---

## Overlay vs. page

Clicking a project card from a listing opens the write-up as an overlay over the page
behind it. Pasting the same URL, refreshing, or arriving as a crawler renders the full
page. Both routes are the same URL — what distinguishes them is router state:

1. **`src/components/ProjectCard.tsx`** sets `state={{ backgroundLocation: location }}`
   on its `<Link>`. Only an in-app click can do this; a pasted URL carries no state.
2. **`src/App.tsx`** reads it. When present, the main `<Routes>` renders
   `background` — keeping the listing mounted — and a second `<Routes>` below renders
   `ProjectModal` / `CertificateModal` for the real location.
3. **`src/components/DetailModal.tsx`** is the shared shell.

`DetailModal` is built on the native `<dialog>` element. `showModal()` brings focus
trapping, Escape handling, background inertness and blocked background scrolling with it,
and renders in the **top layer** — which matters concretely, because `SiteHeader` is
`sticky z-50` with `backdrop-blur` and so creates a stacking context that a plain
z-index overlay would have to fight. Nothing here hand-rolls a scroll lock; that is how
you get a layout jump on every open.

Closing goes through the router — `navigate(-1)` — so the URL returns to the listing and
the browser Back button closes the overlay too.

The write-up itself is `ProjectBody` / `CertificateBody`, shared verbatim by the overlay
and the full page. That sharing is the reason a body should read standalone: it may open
with no page heading above it.

---

## Build & prerender

```
npm run build
  ├─ vite build                                        → dist/        (client)
  ├─ vite build --ssr src/entry-server.tsx --outDir …  → dist-ssr/    (SSR bundle)
  └─ node scripts/prerender.mjs                        → dist/**/index.html
```

The third step imports the SSR bundle, renders each route to a string, injects it into
`dist/index.html`'s `<div id="root">` along with that route's `<head>` tags, and writes
the result to `dist/<path>/index.html`. It also emits `sitemap.xml`, `robots.txt` and
`404.html`.

Two choices in `src/entry-server.tsx` are worth not undoing:

- **`prerender()` from `react-dom/static`, not `renderToString`.** Five of the six routes
  are `React.lazy`. `renderToString` hits their Suspense boundary, emits
  `fallback={null}`, and returns an **empty string** for every route except `/`. The
  static APIs wait for all Suspense to settle first — that is the whole reason the file
  exists.
- **`StaticRouter`, not `BrowserRouter`.** It carries no `location.state`, so App's
  `backgroundLocation` check is always false and every route prerenders as its full page
  rather than an overlay. That is exactly what a crawler should be served.

`src/main.tsx` calls **`hydrateRoot`**, adopting that markup rather than rebuilding it.
Its provider stack (`StrictMode` → `BrowserRouter` → `MotionConfig reducedMotion="user"`)
must stay identical to `entry-server.tsx`'s, or hydration mismatches. `entry-server.tsx`
deliberately imports no CSS — the client build owns that, and styles cannot affect the
markup string it returns.

**Adding a route is two edits.** A new `<Route>` in `App.tsx` also needs an entry in
`scripts/prerender.mjs`, or it will work in-app and 404 on a direct visit, because
`wrangler.jsonc` serves a real 404 for any path with no prerendered file. The two `:slug`
routes are already covered — the script emits one file per entry in each collection.

---

## Metadata

Every route's `<title>`, description, canonical, `og:*`, `twitter:*` and JSON-LD are
baked into its HTML by `scripts/prerender.mjs`. That is what social scrapers and
non-JS crawlers read.

`src/lib/useDocumentMeta.ts` handles the other half: **client-side navigation**, where
following a link swaps the route without a document load and nothing else would update
the title or canonical. Each page calls it with the same values the script emits for that
route — if the two drift, the tab title visibly changes a moment after the page settles.

The production origin lives in exactly one place: **`site` in `data/profile.json`**.
`src/lib/site.ts` reads it for the app; `prerender.mjs` reads the JSON directly, because
it is plain Node ESM outside the Vite graph and cannot import the module. Moving to a new
domain is a one-line edit there — see the appendix in [SEO.md](SEO.md).

---

## Content pipeline

`src/lib/projects.ts` and `src/lib/certificates.ts` each load their collection with
`import.meta.glob('../../data/<collection>/*.mdx', { eager: true })`, map the frontmatter
and compiled component into a typed object, and sort newest-first on the `"YYYY-MM"`
date string. Each exports the full list, a `featured…` filter, and a `get…(slug)` lookup.
Nothing is fetched at runtime; it is all in the bundle.

Two Vite plugins shape the MDX, in `vite.config.ts`:

- **`mdx-has-body`** (local, `enforce: 'pre'`) appends `export const hasBody = …` to every
  `.mdx`, true when anything is written under the frontmatter. Certificates use it to
  decide whether a card links through to a write-up or just offers its Verify link. It
  must run **before** `@mdx-js/rollup` — both are `pre`, so array order decides — because
  that is the one point in the pipeline where the raw source text is still available.
- **`@mdx-js/rollup`** with `remark-frontmatter` + `remark-mdx-frontmatter` (frontmatter
  becomes a named export) and `rehype-slug` (headings get ids, so `#deep-links` work).

`publicDir` is `data/assets`, so everything under it is copied to the site root and all
content lives under `data/`.

---

## Header and homepage sections

`src/components/SiteHeader.tsx` is the one header, rendered by every page. Its items are
a tour of the home page — `/#about`, `/#experience`, `/#projects`, … — and the full
listings are reached from each section's "View all" link rather than from the nav.

- Items are router `<Link>`s, not bare `href="#about"` anchors, even on the home route. A
  bare anchor scrolls natively *and* updates `location.hash`, which would set
  `useScrollToHash` off as well — two scrolls racing. `Link` preventDefaults, leaving the
  hook as the only thing that moves the page, and the links keep working from a detail
  page (where they navigate home first).
- The underline follows `useActiveSection`, which returns `null` off the home route —
  correct, since no section is on screen there.
- The **Certificates** item is filtered out entirely when no certificate is
  `featured`, because the homepage section it targets doesn't render either. See the
  `featured` notes in [CONTENT.md](CONTENT.md).

Homepage sections are previews: `Projects` and `Certificates` render only `featured`
entries and pair a `ViewAllLink` with the section heading.

---

## Deploy

Cloudflare Workers static assets, configured in `wrangler.jsonc`. Cloudflare runs
`npm run build` then `npx wrangler deploy`, which uploads `dist/`.

- `html_handling: "auto-trailing-slash"` resolves an extensionless `/projects/homelab` to
  `projects/homelab/index.html`. It is the default, but it is pinned because the
  prerendered metadata depends on it being served at all.
- `not_found_handling: "404-page"` serves `dist/404.html` with a **real 404 status** for
  anything with no prerendered file. The previous `"single-page-application"` returned
  200 for every unknown URL — a soft 404 that wasted crawl budget and made
  `/robots.txt` resolve to the HTML shell.

`404.html` still boots the app, so `NotFound` renders and in-app navigation works from
there; the status code is what changed.
