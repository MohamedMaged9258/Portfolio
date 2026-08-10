# Mohamed Maged — Portfolio

Personal portfolio site. Live at **https://mohamedm.dpdns.org**.

## Tech

- **Vite + React + TypeScript**
- **Tailwind CSS v4** (CSS-first tokens in `src/index.css`)
- **MDX** for project and certificate write-ups
- Deployed on **Cloudflare Workers** (static assets)

## Content (no database — everything is static and in the repo)

| What | Where |
|------|-------|
| CV data (about, experience, skills, education, contact) | `data/profile.json` |
| The production URL — canonicals, sitemap, JSON-LD all derive from it | `site` in `data/profile.json` |
| Project write-ups (one file each) | `data/projects/*.mdx` |
| Certificates (one file each) | `data/certificates/*.mdx` |
| Static files (CV, portrait, images) | `data/assets/` → served from `/` |

**→ [docs/CONTENT.md](docs/CONTENT.md) documents every field, what it does, and the
authoring traps.** Read it before adding a project or certificate — in particular, the
frontmatter syntax rule, which `npm run dev` does not enforce but the deploy does.

**→ [docs/SEO.md](docs/SEO.md) covers how the site gets found**, what the build generates
(`sitemap.xml`, `robots.txt`, JSON-LD, per-route HTML), and the off-site checklist —
Search Console, LinkedIn, GitHub — that has to be done by hand.

**→ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) explains how it all fits together** —
routing, the overlay/page split, the prerender pipeline, and the MDX loading. Read it
before changing code rather than content.

To update the site: **edit a file, commit, push** — Cloudflare redeploys automatically
(locally or straight in GitHub's web editor). Run `npm run build` first if you added or
edited frontmatter; it's the only command that validates it.

## Routes & rendering

| Path | Page |
|------|------|
| `/` | Home — hero, about, experience, and **featured-only** previews of projects and certificates |
| `/projects` | Every project |
| `/projects/:slug` | A project write-up |
| `/certificates` | Every certificate |
| `/certificates/:slug` | A certificate write-up |
| anything else | 404 — a real 404 status, not the app pretending |

The home page shows only entries marked `featured: true`; each section's **View all**
link leads to the full listing.

**A write-up has two views.** Clicking a card opens it as an overlay (a native
`<dialog>`) over the listing, leaving the page behind it mounted; a pasted link, a
refresh, or a crawler gets the full page instead. `ProjectCard` marks the in-app click
with `state={{ backgroundLocation }}` and `src/App.tsx` branches on it. Both render the
same body component.

**Adding a route is two edits.** A new `<Route>` in `src/App.tsx` also needs an entry in
`scripts/prerender.mjs`, or it works in-app and 404s on a direct visit. The two `:slug`
routes are already covered — the script emits one file per entry in each collection.

## Develop

```bash
npm install
npm run dev        # start dev server (http://localhost:5173)
npm run build      # production build → dist/
npm run preview    # preview the production build
npm run typecheck  # type-check with tsc
```

`npm run build` is three steps: the client build, a second **SSR build** of
`src/entry-server.tsx` into `dist-ssr/`, then `scripts/prerender.mjs`. That last step
renders every route to real HTML, fills in its `<head>`, and writes `sitemap.xml`,
`robots.txt` and `404.html`. The app hydrates that markup rather than building the page
from scratch, so `src/main.tsx` and `src/entry-server.tsx` have to stay in step.

## Deploy (Cloudflare Workers — static assets)

Cloudflare builds on every push and runs `npx wrangler deploy`. Config is in `wrangler.jsonc`:

- Assets served from `dist/`
- Build command (Cloudflare project setting): `npm run build`
- Deep-links (e.g. `/projects/homelab`) are real prerendered files, matched directly by
  `assets.html_handling: "auto-trailing-slash"`
- Anything else falls through to `assets.not_found_handling: "404-page"`, which serves
  `dist/404.html` with a genuine 404 status — the app still boots and renders `NotFound`
