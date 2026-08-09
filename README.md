# Mohamed Maged — Portfolio

Personal portfolio site. Live at **https://mohamedm.dpdns.org**.

## Tech

- **Vite + React + TypeScript**
- **Tailwind CSS v4** (CSS-first tokens in `src/index.css`)
- **MDX** for project write-ups
- Deployed on **Cloudflare Pages**

## Content (no database — everything is static and in the repo)

| What | Where |
|------|-------|
| CV data (about, experience, skills, education, contact) | `data/profile.json` |
| Project write-ups (one file each) | `data/projects/*.mdx` |
| Certificates (one file each) | `data/certificates/*.mdx` |
| Downloadable CV | `data/assets/Mohamed_Maged_CV.pdf` |
| Portrait | `data/assets/Profile.png` |

`data/assets/` is Vite's `publicDir`, so everything in it is served from the site root —
`data/assets/Profile.png` is `/Profile.png`. Certificate images go in `data/assets/certs/`.

Each project's frontmatter has a `layout` flag — `log` (long build-log) or `case-study` (short) —
which controls how its detail page renders.

Certificates use `title`, `slug`, `summary`, `issuer` and `date` (required), plus optional
`credentialId`, `url`, `image`, `skills` and `featured`. Prose under the frontmatter is
optional: write some and the card becomes clickable through to a detail view; leave it out
and the card shows only its **Verify** link. `featured: true` is what puts an entry on the
home page — without at least one, the Certificates nav tab and home section stay hidden.

To update the site: **edit a file, commit, push** — Cloudflare redeploys automatically
(locally or straight in GitHub's web editor).

## Develop

```bash
npm install
npm run dev        # start dev server (http://localhost:5173)
npm run build      # production build → dist/
npm run preview    # preview the production build
npm run typecheck  # type-check with tsc
```

## Deploy (Cloudflare Workers — static assets)

Cloudflare builds on every push and runs `npx wrangler deploy`. Config is in `wrangler.jsonc`:

- Assets served from `dist/`
- Build command (Cloudflare project setting): `npm run build`
- SPA deep-links (e.g. `/projects/homelab`) handled by `assets.not_found_handling: "single-page-application"`
