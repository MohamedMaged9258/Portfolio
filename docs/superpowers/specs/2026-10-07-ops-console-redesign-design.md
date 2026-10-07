# Portfolio overhaul: "ops console" redesign

## Context
User asked to redesign the portfolio with `redesign-existing-projects` + `design-taste-frontend`. Chose **Overhaul**, direction **Ops console**. Audit of current site: Inter everywhere, every block is the same bordered card, `// x` eyebrow above every section repeating its title, skills/contact are generic card layouts, saturated cyan, no focus ring, no skip link. Strengths kept: the motion vocabulary (`src/lib/motion.ts`), hero scan grid, experience trace, overlay/prerender architecture.

**Design read:** developer portfolio for recruiters hiring entry-level AIOps engineers, restrained dark ops-console language, Tailwind v4 + Geist + existing motion system. **Dials:** VARIANCE 6 / MOTION 6 / DENSITY 5.

All three design sections approved in chat (visual system, per-section layouts, motion/a11y/verification).

## 1. Visual system (`src/index.css`, `src/main.tsx`, `index.html`)
- Fonts: `npm i @fontsource-variable/geist @fontsource-variable/geist-mono`, `npm rm @fontsource-variable/inter @fontsource-variable/jetbrains-mono`; swap imports in `src/main.tsx`; `--font-sans: "Geist Variable"`, `--font-mono: "Geist Mono Variable"` (verify family names from the package CSS).
- Tokens in `@theme` (replace bg/surface/elevated/line/accent/accent-soft):
  `bg #0e0d0c`, `surface #161412`, `line #2a2724`, `ink #ece8e3`, `ink-muted #a8a29e`, `ink-subtle #8a837d`, `accent #e3a74f`. Drop `elevated`/`accent-soft` if unused after the pass.
- Base: body `bg-bg text-ink-muted`, headings `text-ink`, `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }`. Keep scan/probe keyframes and the reduced-motion block. `.bg-grid-scan` recolors automatically via `--color-accent`. Delete `.eyebrow` once no callers remain.
- Shape rule: structure sharp + hairline (`border-line`), buttons/portrait/dialog `rounded` (4px). No cards, pills, shadows, glows.
- `index.html`: `theme-color` → `#0e0d0c`.
- Every `slate-*` / `cyan-*` utility (≈71 uses) → semantic `ink*` tokens.

## 2. Shared primitives
- `Container.tsx`: `max-w-5xl` → `max-w-6xl`.
- `Section.tsx`: drop `eyebrow` prop. `border-t border-line`; `lg:grid lg:grid-cols-12`; h2 in `lg:col-span-3` (`lg:sticky lg:top-24`, `text-lg font-semibold text-ink`), content `lg:col-span-9`; below lg stacks. `action` renders under the h2 on lg, beside it on mobile. Keep `id`, `scroll-mt-20`, motion reveal.
- Buttons (hero CTA, `ResumeButton`, 404): primary `bg-accent text-bg`, secondary `border border-line text-ink`, both `rounded active:scale-[0.98]`.
- `SiteHeader.tsx`: add skip link first (`sr-only focus:not-sr-only`, `onClick` preventDefault → focus `#main` + scrollIntoView, so the hash/`useScrollToHash` is untouched). Restyle: scrolled = `bg-bg/85 backdrop-blur border-line`; active underline stays (`bg-accent`). Container width matches `max-w-6xl`.
- Every page's `<main>` → `<main id="main" tabIndex={-1} className="outline-none">` (Home, ProjectsIndex, ProjectDetail, CertificatesIndex, CertificateDetail, NotFound).
- `Wordmark.tsx`, `Socials.tsx`, `ViewAllLink.tsx`: recolor only.

## 3. Sections (each a different layout family)
- **Hero** (`Hero.tsx`): text left (`lg:col-span-7`), portrait right (`lg:col-span-5`, remove `lg:order-first`, remove glow blob, keep fade + hairline, `rounded`). Max 4 text elements: availability line w/ probe dot, h1 name (`text-4xl sm:text-5xl tracking-tight`), one subtext `{title}. {tagline}`, CTAs View projects + Résumé. Drop location + Socials from hero. Padding ≤ `pt-24`. Scan grid kept.
- **About**: summary `max-w-[65ch] text-lg`; then `dl` fact strip `sm:grid-cols-3` with `border-t border-line pt-6`: Education (degree/school/period), Location, Languages. No boxes.
- **Experience**: rows `grid sm:grid-cols-[8rem_1fr]`: mono period left, role/org/highlights right. Keep `drawY` rail + `probeOnce` node.
- **Projects** (`ProjectCard.tsx` restyled into an index row, filename kept): `divide-y divide-line`; left title (`text-xl`) + summary (`max-w-[60ch]`) + stack as mono slash-separated text; right mono layout label + date + arrow. Hover: `bg-surface`, top accent sweep (existing span), title → accent, arrow nudge. Used by home and `/projects`.
- **Certificates** (`CertificateCard.tsx`, `Certificates.tsx`): 2-col hairline cell grid (`gap-px bg-line` trick, cells `bg-bg`). Currently hidden (none featured).
- **Skills**: `dl` `md:grid-cols-2`, each group: mono `dt` (`ink-subtle`), `dd` items joined `, ` in `text-ink`. Title "Skills".
- **Contact**: one sentence (no em-dash), email as large link (`text-2xl sm:text-4xl text-ink hover:text-accent`), Socials + Résumé below. No card.
- **Footer**: one hairline row; `© {year} {name}` and `Built with React, Vite and Tailwind. Deployed on Cloudflare.`
- **Index pages** (`ProjectsIndex`, `CertificatesIndex`): no eyebrow; h1 + one-line intro (no em-dash); same row/cell components; empty state styled.
- **ProjectBody / CertificateBody**: meta line (mono `ink-subtle`: "Case study" / "Build log"), h1, summary, stack as slash text, links; prose: `prose-a:text-accent`, `prose-code:text-accent`, `prose-pre:bg-surface prose-pre:border-line prose-pre:rounded`, headings `text-ink`.
- **DetailModal**: `bg-surface border border-line rounded`, close button recolor.
- **NotFound**: left-aligned, mono "404" line + h1 + text + primary button.

## 4. Copy edits (visible strings only)
- `data/profile.json`: period `–` → `-`. Leave other fields.
- Contact sentence, ProjectsIndex intro, Footer text: rewrite without `—`/`·`.
- Out of scope (user's call): MDX bodies, `useDocumentMeta` titles, JSON-LD.

## 5. Not touched
Routes, section IDs, nav labels, `App.tsx` overlay logic, `scripts/prerender.mjs`, `src/lib/*` logic, MDX content, metadata.

## Execution order & commits (commit only, never push)
-1. `git switch -c redesign/ops-console` from `main`; all commits below land on this branch (no merge, no push).
0. Save this spec to `docs/superpowers/specs/2026-10-07-ops-console-redesign-design.md`, commit.
1. Fonts + tokens + base CSS + theme-color + focus ring → commit "Retheme to ops-console tokens and Geist".
2. Container/Section/buttons/header/skip link/main ids → commit.
3. Hero, About, Experience, Projects rows, Certificates, Skills, Contact, Footer → commit.
4. Index pages, bodies, modal, 404, copy edits → commit.
Run `npm run typecheck` after each step.

## Verification
- `npm run typecheck` and `npm run build` (build runs prerender; must pass).
- Grep `src/` for `slate-|cyan-|eyebrow|—|–` in rendered strings/classes → none left (comments excepted).
- `npm run preview` + Chrome screenshots at 1440px and 390px: `/`, `/projects`, `/projects/yantiq`, overlay opened from home, `/nope` (404). Check no horizontal scroll, nav on one line at lg, hero fits viewport.
- Keyboard: Tab from load → skip link visible → Enter focuses main; focus rings visible on nav, rows, buttons, dialog close.
- Reduced motion (DevTools emulation): scan hidden, reveals resolve visible.
- Run the taste-skill pre-flight checklist (eyebrow count ≤ 3, one accent, one radius rule, no em-dashes in UI).
