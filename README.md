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
| CV data (about, experience, skills, education, contact) | `src/content/profile.json` |
| Project write-ups (one file each) | `src/content/projects/*.mdx` |
| Downloadable CV | `public/Mohamed_Maged_CV.pdf` |
| Portrait | `public/Profile.png` |

Each project's frontmatter has a `layout` flag — `log` (long build-log) or `case-study` (short) —
which controls how its detail page renders. To update the site: **edit a file, commit, push** —
Cloudflare Pages redeploys automatically (locally or straight in GitHub's web editor).

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
