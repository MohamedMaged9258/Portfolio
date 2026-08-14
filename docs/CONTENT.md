# Content reference

Everything the site reads, and what each field actually does.

There's no database. All content is files in `data/`:

| Path | What |
|---|---|
| `data/profile.json` | CV data — name, about, experience, education, skills, languages, contact |
| `data/projects/*.mdx` | One file per project write-up |
| `data/certificates/*.mdx` | One file per certificate |
| `data/assets/` | Static files served from the site root (CV PDF, portrait, images) |

Edit a file, commit, push — Cloudflare rebuilds and redeploys.

---

## Read this first: the frontmatter syntax rule

The build script that generates per-page social/SEO tags parses frontmatter with a regex, not a YAML library. It is **stricter than YAML**, and it only runs during `npm run build` — **never during `npm run dev`**.

That means a mistake here works perfectly on your machine and then **fails the deploy**.

`title`, `slug` and `summary` must each be:

- at the **start of a line**, no indentation
- followed by a value in **double quotes**, on **one line**

```yaml
title: "My Project"        # ✅
title: My Project          # ❌ fails the build — unquoted
title: 'My Project'        # ❌ fails the build — single quotes
  title: "My Project"      # ❌ fails the build — indented
title: "My Project" # note # ❌ fails the build — trailing comment
summary: >                 # ❌ fails the build — block scalar
  A long summary
```

The `---` opening the frontmatter must be the **very first characters in the file** — no blank line above it.

Other fields (`stack`, `date`, `layout`, `issuer`, `featured`…) aren't parsed by that script, so normal YAML is fine for them. Sticking to quoted strings everywhere is the simplest habit.

**If the build fails**, you'll see `Missing "title" in …` or `No frontmatter in …` naming the file.

---

## Templates

Copy one of these into a new file. Filename doesn't matter to the site (only the `slug` does), but naming it after the slug keeps things findable.

> **Don't save a template file inside `data/projects/` or `data/certificates/`.**
> Every `.mdx` in those folders is loaded as real content — including one named `_template.mdx`
> or `.template.mdx`. A half-filled template will either show up as a broken card on the live
> site or fail the build outright. Keep templates here in this doc.

### New project → `data/projects/my-project.mdx`

```mdx
---
title: "My Project"
slug: "my-project"
summary: "One or two sentences. Shown on the card and used as the page description when the link is shared."
stack: ["React", "TypeScript", "Postgres"]
date: "2025-08"
layout: "case-study"
links:
  github: "https://github.com/you/repo"
  live: "https://example.com"
  linkedin: "https://www.linkedin.com/posts/you_slug-activity-123456789/"
featured: true
---

## The problem

Write the story here in Markdown. Headings, lists, `code`, **bold**, links — all work.

## What I built

Prose goes here.
```

### New certificate → `data/certificates/my-cert.mdx`

```mdx
---
title: "Certificate Name"
slug: "my-cert"
summary: "One sentence about what it covers. Shown on the detail page and when the link is shared."
issuer: "Issuing Organisation"
date: "2025-08"
credentialId: "ABC-12345"
url: "https://issuer.example.com/verify/ABC-12345"
image: "/certs/my-cert.png"
skills: ["Kubernetes", "Networking"]
featured: true
---

Anything written here becomes the certificate's write-up, and makes its card
clickable. Delete everything below the frontmatter if you have nothing to say —
the card will then just show its Verify button.
```

---

## Projects — `data/projects/*.mdx`

| Field | Required | What it does |
|---|---|---|
| `title` | **yes** | Card heading, page heading, browser tab title, and the title in link previews |
| `slug` | **yes** | The URL: `/projects/<slug>` |
| `summary` | **yes** | Card description, the lede under the page heading, and the description in link previews |
| `stack` | **yes** | Technology pills. **The card shows only the first 4** |
| `date` | **yes** | Sort order only — **never shown anywhere** |
| `layout` | **yes** | `"log"` or `"case-study"` — see below |
| `links.github` | no | Adds a "Source" link on the detail page |
| `links.live` | no | Adds a "Live" link on the detail page |
| `links.linkedin` | no | Adds a "LinkedIn" link on the detail page, pointing at a post about the project |
| `linkedinDate` | no | The LinkedIn post's publication date, `"YYYY-MM-DD"`. **Structured data only — never rendered** |
| `linkedinText` | no | The LinkedIn post's body. **Structured data only — never rendered** |
| `featured` | no | `true` puts it on the home page. `/projects` always lists everything |

### The three LinkedIn fields are all-or-nothing

`links.linkedin` on its own is enough for the **visible button** — that part always works.

The three together are what let the page describe the post in its structured data, and
there Google validates `SocialMediaPosting` against its Discussion Forum rich result,
which requires an author, a publication date, and the post's text. A partial one isn't
ignored; it's reported as a **critical error against the whole page** in Search Console.
So the build emits the JSON-LD only when all three are present, and nothing at all
otherwise. Add `linkedinDate` and `linkedinText` together or leave both out.

`linkedinText` is the one field that uses YAML's `|` block form, because a post body
carries its own quotes and line breaks and won't survive a single quoted line. Indent
every line under the pipe by the same amount — the indentation is stripped back off:

```yaml
linkedinText: |
    First paragraph of the post, "quotes" and all.

    Second paragraph.
```

### `layout` does less than it sounds like

It changes exactly three cosmetic things:

1. The label on the card — "Build log" vs "Case study"
2. The eyebrow on the detail page — `// build log` vs `// case study`
3. Slightly larger body text for `log`, **only on screens wider than 1024px**

It does not enforce or change length, layout, or structure. Write whatever you want under either.

Anything that isn't exactly `"log"` — a typo, a missing field, `"Log"` with a capital — silently renders as **case study**. No warning.

### `date` must be `"YYYY-MM"` with a leading zero

Sorting is a plain text comparison, so `"2025-3"` sorts **after** `"2025-12"`. Write `"2025-03"`.

Because projects never display the date, a wrong one has no visible symptom — the list is just in the wrong order.

### `stack` order matters

The card shows the **first four** entries plus a `+3` counter. Everything appears on the detail page. Put the most recognisable technologies first.

Don't repeat a value — duplicates cause a React warning.

**Leaving `stack` out entirely breaks the page** (blank screen). Use `stack: []` if you genuinely have none.

---

## Certificates — `data/certificates/*.mdx`

| Field | Required | What it does |
|---|---|---|
| `title` | **yes** | Card heading, page heading, tab title, link previews |
| `slug` | **yes** | The URL: `/certificates/<slug>` |
| `summary` | **yes** | Detail page lede and link previews. **Not shown on the card** |
| `issuer` | **yes** | Small label at the top of the card, and the detail byline |
| `date` | **yes** | Sorts newest first **and is displayed** as e.g. "May 2025" |
| `credentialId` | no | Shown as `ID: ABC-123` on the card, and in the detail byline |
| `url` | no | Adds the **Verify** button — link to the issuer's verification page |
| `image` | no | Thumbnail on the card, full-width picture on the detail page |
| `skills` | no | Pills. Unlike projects' `stack`, these are **not** truncated |
| `featured` | no | `true` puts it on the home page — see the warning below |

### Writing a body is what makes the card clickable

There's no field for this. The site checks whether you wrote anything under the frontmatter:

- **Wrote something** → the whole card is clickable, shows a **Read more →** button, and opens your write-up.
- **Wrote nothing** → the card isn't clickable and shows only its **Verify** button, because there'd be nothing behind the click.

**Verify appears in both places** — on the card and inside the write-up.

The four combinations:

| Body | `url` | The card shows |
|---|---|---|
| yes | yes | Clickable card, **Read more** + **Verify** |
| yes | no | Clickable card, **Read more** |
| no | yes | Not clickable, **Verify** only |
| no | no | Not clickable, no buttons — a dead end. Add one or the other |

One catch: a body containing *only* a comment still counts as "wrote something", so the card becomes clickable and opens an empty page. Delete the comment rather than leaving it.

### `featured` controls more than you'd expect

If **no certificate** has `featured: true`, the home page's Certificates section **and the Certificates nav tab both disappear entirely**. That's intentional — an empty section looks broken.

`/certificates` still works if you go there directly; it says "Nothing here yet."

So: mark at least one certificate `featured: true`, or the section is invisible.

### `date` is displayed here, so mistakes show

`"2025-05"` renders as "May 2025". A malformed value renders the literal text **`Invalid Date`** on the card. Unlike projects, you'll see this one immediately.

---

## Writing the body (both collections)

Standard Markdown. A few site-specific behaviours:

**What you write appears in two places.** Clicking a card opens the write-up as an overlay panel over the listing; a pasted link, a refresh, or a shared link opens it as a full page. Same text either way, so open with a sentence that stands on its own — don't write "as you can see above", because in the overlay there is no above.

**Links to other sites** — anything starting with `http` automatically opens in a new tab. You don't need to do anything.

**Links within the site** — `[see this](/projects/homelab)` works, but causes a **full page reload** rather than a smooth transition. Fine occasionally; don't build navigation out of it.

**Headings become link targets.** `## Why I built it` gets an id automatically, so `/projects/x#why-i-built-it` jumps straight there. Following such a link opens the **full page**, not the overlay. Note that **renaming a heading breaks any link pointing at it**, and there's no visible anchor icon in the UI.

**Images** in the body use the same root-relative paths as everywhere else: `![alt](/certs/my-cert.png)`.

---

## `data/profile.json`

| Field | Where it appears |
|---|---|
| `name` | Hero heading, footer copyright, every page title |
| `title` | The accent line under your name (e.g. "AIOps Engineer") |
| `tagline` | Hero paragraph, and the home page's description in link previews |
| `location` | Hero, next to a pin icon |
| `email` | Contact section — becomes a `mailto:` link |
| `phone` | **Not displayed anywhere** — see the note below |
| `availability` | The pill with the pulsing dot in the hero, and a line in Contact. Remove it and the pill disappears |
| `summary` | The main About paragraph |
| `socials.github`, `socials.linkedin` | Icon buttons in the header, hero and contact |
| `experience[]` | The timeline. Each needs `role`, `org`, `location`, `period`, `highlights[]` |
| `education[]` | Card in About. Needs `school`, `degree`, `period`; optional `highlights[]` |
| `skills[]` | Grouped pills. Each is `{ label, items[] }` |
| `languages[]` | List in About. Each is `{ name, level }` |

Notes:

- **`experience[].period`** is free text — write it however you like (`"Jun 2024 – Present"`).
- **Order is preserved** for `experience`, `education`, `skills` and `languages`. Put the most recent or most important first; nothing sorts these for you.
- **`education[].degree` renders above `school`**, regardless of the order in the file.
- **Two entries with the same `education[].school`** (or the same `role` + `org`) cause a React warning. Vary them slightly if you need duplicates.

### About `phone`

`phone` is in `profile.json` but **no part of the site displays it**. It's kept deliberately.

Worth knowing: the whole file is bundled into the site's JavaScript, so the number **is publicly readable** by anyone who views the page source, even though it's never shown. If you'd rather it weren't, delete the `phone` line from `data/profile.json` and the `phone` field from `Profile` in `src/lib/profile.ts` — nothing else references it.

---

## Assets — `data/assets/`

Everything in `data/assets/` is copied to the **root of the site**, so paths drop the folder:

| File | URL to use |
|---|---|
| `data/assets/Profile.png` | `/Profile.png` |
| `data/assets/Mohamed_Maged_CV.pdf` | `/Mohamed_Maged_CV.pdf` |
| `data/assets/certs/aws.png` | `/certs/aws.png` |

Rules:

- Always start the path with `/`. `certs/aws.png` won't work.
- Subfolders are preserved — certificate images go in `data/assets/certs/`.
- Filenames are **case-sensitive** once deployed, even though Windows doesn't care locally.
- These files are **not** renamed with a content hash, so replacing an image keeps its URL and browsers may show the cached old one for a while. Use a new filename if you need the change to appear immediately.

---

## Gotchas

**Slugs must be unique across a collection.** Two projects with `slug: "foo"` will silently break: one card links to the other's page, and one overwrites the other's shared-link preview. Nothing warns you.

**Filenames don't matter, slugs do.** `data/projects/anything.mdx` with `slug: "my-project"` still lives at `/projects/my-project`. Matching them is just a convention worth keeping.

**Never put a template or draft `.mdx` in a collection folder.** Every `.mdx` file is loaded, including ones starting with `_` or `.`. A partial file breaks the build; a complete-looking one appears on the live site. Keep drafts outside `data/`, or with a different extension like `.mdx.txt`.

**`npm run dev` doesn't catch frontmatter syntax errors.** Only `npm run build` does. Run it before pushing if you've added a file.

**Deleting the last certificate** is fine — the section and nav tab hide themselves, and `/certificates` shows "Nothing here yet." Leave `data/certificates/.gitkeep` in place so the empty folder survives.

---

## Checking your work

```bash
npm run dev        # see it locally at http://localhost:5173
npm run build      # the one that catches frontmatter mistakes — run before pushing
npm run typecheck  # type errors in the app code
npm run preview    # serve the production build locally
```
