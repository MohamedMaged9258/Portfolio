import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Emits a real HTML file per route, with its <head> already filled in.
 *
 * useDocumentMeta sets these tags client-side, which is enough for crawlers that run
 * JS (Google) but not for social scrapers (X, LinkedIn, Discord, Slack) — they read
 * the served HTML and stop, so every link would unfurl as the homepage card.
 *
 * Cloudflare's asset matching serves dist/<path>/index.html directly, ahead of the
 * single-page-application fallback, so scrapers get the right tags while the SPA
 * still boots and routes exactly as before.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const dataDir = join(root, 'data')

// Keep in step with SITE in src/lib/useDocumentMeta.ts.
const SITE = 'https://mohamedm.dpdns.org'

const profile = JSON.parse(readFileSync(join(dataDir, 'profile.json'), 'utf8'))

/**
 * Pulls the scalar fields we need out of the YAML frontmatter block. Deliberately
 * minimal rather than a YAML dependency: every value we read is a quoted string.
 */
function readFrontmatter(file) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))
  if (!block) throw new Error(`No frontmatter in ${file}`)

  const scalar = (key) => {
    const m = new RegExp(`^${key}:\\s*"(.*)"\\s*$`, 'm').exec(block[1])
    if (!m) throw new Error(`Missing "${key}" in ${file}`)
    return m[1]
  }

  return { title: scalar('title'), slug: scalar('slug'), summary: scalar('summary') }
}

const escapeAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * `[^>]*` spans newlines, so this also matches the multi-line tags in index.html.
 * Throws on a miss — a silently un-rewritten tag would ship the homepage's metadata
 * under another URL, which is the exact bug this script exists to prevent.
 */
function replaceTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: no match for ${pattern}`)
  return html.replace(pattern, replacement)
}

const template = readFileSync(join(dist, 'index.html'), 'utf8')

/** Writes one route's HTML. `path` is the route, e.g. "/projects/homelab". */
function emit({ path, title, description }) {
  const pageTitle = escapeAttr(title)
  const desc = escapeAttr(description)
  const url = `${SITE}${path}`

  let html = template
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`)
  html = replaceTag(
    html,
    /<meta\s[^>]*name="description"[^>]*>/,
    `<meta name="description" content="${desc}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s[^>]*property="og:title"[^>]*>/,
    `<meta property="og:title" content="${pageTitle}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s[^>]*property="og:description"[^>]*>/,
    `<meta property="og:description" content="${desc}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s[^>]*property="og:url"[^>]*>/,
    `<meta property="og:url" content="${url}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s[^>]*name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${pageTitle}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s[^>]*name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${desc}" />`,
  )
  html = replaceTag(
    html,
    /<link\s[^>]*rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${url}" />`,
  )

  // Leading "/" would make join() treat the path as absolute and discard dist.
  const outDir = join(dist, path.replace(/^\//, ''))
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
}

/**
 * Frontmatter for every .mdx in a data/ collection.
 *
 * The existsSync guard is load-bearing: readdirSync on a missing path throws ENOENT,
 * which would fail the whole build rather than degrade. A collection directory can
 * legitimately be absent — git tracks files, not directories, so one holding nothing
 * but ignored content wouldn't survive a fresh checkout.
 */
function collection(name) {
  const dir = join(dataDir, name)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => readFrontmatter(join(dir, f)))
}

const projects = collection('projects')
const certificates = collection('certificates')

const pages = [
  // Index routes. Titles come from profile.json so they can't drift from the site.
  {
    path: '/projects',
    title: `Projects — ${profile.name}`,
    description: `Case studies and build logs from ${profile.name} — ${profile.title}.`,
  },
  {
    path: '/certificates',
    title: `Certificates — ${profile.name}`,
    description: `Courses and credentials completed by ${profile.name}.`,
  },
  // One per entry. dist/projects/index.html and dist/projects/<slug>/index.html are
  // different paths, so the indexes above and these coexist.
  ...projects.map(({ title, slug, summary }) => ({
    path: `/projects/${slug}`,
    title: `${title} — ${profile.name}`,
    description: summary,
  })),
  // Emitted for every certificate, including ones with no write-up — their detail
  // route resolves even though no card links to it.
  ...certificates.map(({ title, slug, summary }) => ({
    path: `/certificates/${slug}`,
    title: `${title} — ${profile.name}`,
    description: summary,
  })),
]

for (const page of pages) emit(page)

console.log(`prerendered ${pages.length} routes`)
