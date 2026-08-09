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
| Project write-ups (one file each) | `data/projects/*.mdx` |
| Certificates (one file each) | `data/certificates/*.mdx` |
| Static files (CV, portrait, images) | `data/assets/` → served from `/` |

**→ [docs/CONTENT.md](docs/CONTENT.md) documents every field, what it does, and the
authoring traps.** Read it before adding a project or certificate — in particular, the
frontmatter syntax rule, which `npm run dev` does not enforce but the deploy does.

To update the site: **edit a file, commit, push** — Cloudflare redeploys automatically
(locally or straight in GitHub's web editor). Run `npm run build` first if you added or
edited frontmatter; it's the only command that validates it.

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
