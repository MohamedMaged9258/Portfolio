import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Emits a real HTML file per project route, with its <head> already filled in.
 *
 * useDocumentMeta sets these tags client-side, which is enough for crawlers that run
 * JS (Google) but not for social scrapers (X, LinkedIn, Discord, Slack) — they read
 * the served HTML and stop, so every project link would unfurl as the homepage card.
 *
 * Cloudflare's asset matching serves dist/projects/<slug>/index.html directly for
 * /projects/<slug>, ahead of the single-page-application fallback, so scrapers get
 * the right tags while the SPA still boots and routes exactly as before.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const projectsDir = join(root, 'data', 'projects')

// Keep in step with SITE in src/lib/useDocumentMeta.ts.
const SITE = 'https://mohamedm.dpdns.org'

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
 * under a project URL, which is the exact bug this script exists to prevent.
 */
function replaceTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: no match for ${pattern}`)
  return html.replace(pattern, replacement)
}

const template = readFileSync(join(dist, 'index.html'), 'utf8')

const projects = readdirSync(projectsDir)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => readFrontmatter(join(projectsDir, f)))

for (const { title, slug, summary } of projects) {
  const pageTitle = escapeAttr(`${title} — Mohamed Maged`)
  const description = escapeAttr(summary)
  const url = `${SITE}/projects/${slug}`

  let html = template
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`)
  html = replaceTag(
    html,
    /<meta\s[^>]*name="description"[^>]*>/,
    `<meta name="description" content="${description}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s[^>]*property="og:title"[^>]*>/,
    `<meta property="og:title" content="${pageTitle}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s[^>]*property="og:description"[^>]*>/,
    `<meta property="og:description" content="${description}" />`,
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
    `<meta name="twitter:description" content="${description}" />`,
  )
  html = replaceTag(
    html,
    /<link\s[^>]*rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${url}" />`,
  )

  const outDir = join(dist, 'projects', slug)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
}

console.log(`prerendered ${projects.length} project routes`)
