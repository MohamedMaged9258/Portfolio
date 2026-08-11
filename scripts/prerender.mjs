import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * Turns the SPA build into a set of real, fully-rendered HTML files — one per route.
 *
 * Two separate problems are solved here, and it is worth keeping them distinct:
 *
 * 1. Metadata. useDocumentMeta sets <head> tags client-side, which reaches crawlers that
 *    run JS but not social scrapers (X, LinkedIn, Discord, Slack) — they read the served
 *    HTML and stop, so every link would unfurl as the homepage card.
 * 2. Content. Until this script rendered React, every file shipped an empty <div id="root">.
 *    Google's renderer copes; Bing, DuckDuckGo and the AI crawlers largely do not execute
 *    JS and saw a blank page. Now each route's markup is baked in and main.tsx hydrates it.
 *
 * Cloudflare's asset matching serves dist/<path>/index.html directly, ahead of the
 * not_found_handling fallback, so every prerendered route is served as a static file and
 * the SPA still boots and routes exactly as before.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const distSsr = join(root, 'dist-ssr')
const dataDir = join(root, 'data')

const profile = JSON.parse(readFileSync(join(dataDir, 'profile.json'), 'utf8'))

// The single source of truth for the production origin, shared with src/lib/site.ts,
// which reads the same field. Moving to a new domain is an edit to profile.json alone.
const SITE = profile.site.replace(/\/$/, '')
const DEFAULT_IMAGE = '/Profile.png'

/** Bare hostname, lowercase. Used as the last rung of the site-name fallback ladder. */
const HOST = SITE.replace(/^https?:\/\//, '').toLowerCase()

/** Stable node ids, so every page's JSON-LD resolves to one Person rather than several. */
const PERSON_ID = `${SITE}/#person`
const WEBSITE_ID = `${SITE}/#website`
const PORTRAIT_ID = `${SITE}/#portrait`

const abs = (path) => `${SITE}${path}`

/* -------------------------------------------------------------------------- */
/* Frontmatter                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Pulls the fields we need out of the YAML frontmatter block. Deliberately minimal
 * rather than a YAML dependency: the shape is fixed and documented in docs/CONTENT.md,
 * and every value we read is either a quoted string or a flow-style array.
 */
function readFrontmatter(file) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))
  if (!block) throw new Error(`No frontmatter in ${file}`)
  const yaml = block[1]

  /** Required quoted scalar. Throws so a typo fails the build instead of shipping blank. */
  const scalar = (key) => {
    const m = new RegExp(`^${key}:\\s*"(.*)"\\s*$`, 'm').exec(yaml)
    if (!m) throw new Error(`Missing "${key}" in ${file}`)
    return m[1]
  }

  const optional = (key) => {
    const m = new RegExp(`^${key}:\\s*"(.*)"\\s*$`, 'm').exec(yaml)
    return m ? m[1] : undefined
  }

  /** Flow-style array, e.g. stack: ["Java", "MySQL"]. Absent is an empty list. */
  const list = (key) => {
    const m = new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`, 'm').exec(yaml)
    if (!m) return []
    return [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1])
  }

  /** One level of nesting, e.g. the indented github: under links:. */
  const nested = (parent, key) => {
    const m = new RegExp(`^${parent}:\\s*\\n(?:[ \\t]+.*\\n?)*`, 'm').exec(yaml)
    if (!m) return undefined
    const inner = new RegExp(`^[ \\t]+${key}:\\s*"(.*)"\\s*$`, 'm').exec(m[0])
    return inner ? inner[1] : undefined
  }

  return {
    title: scalar('title'),
    slug: scalar('slug'),
    summary: scalar('summary'),
    date: optional('date'),
    issuer: optional('issuer'),
    image: optional('image'),
    stack: list('stack'),
    skills: list('skills'),
    repo: nested('links', 'github'),
    live: nested('links', 'live'),
  }
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

/* -------------------------------------------------------------------------- */
/* Open Graph image                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Width and height out of a PNG's IHDR chunk: 8-byte signature, 4-byte length, the
 * "IHDR" tag, then two big-endian uint32s. Read from the file rather than hardcoded so
 * the declared og:image dimensions can never drift from the image actually shipped.
 */
function pngSize(file) {
  const buf = readFileSync(file)
  if (buf.length < 24 || buf.toString('ascii', 12, 16) !== 'IHDR') return undefined
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

const ogImageFile = join(root, 'data', 'assets', DEFAULT_IMAGE.replace(/^\//, ''))
const ogSize = existsSync(ogImageFile) ? pngSize(ogImageFile) : undefined

/**
 * summary_large_image renders a wide banner and crops anything portrait into a mess.
 * The shipped image is currently a 3:4 portrait, so the honest card type is "summary".
 * Swap in a ~1200x630 landscape card (see docs/SEO.md) and this flips on its own.
 */
const twitterCard = ogSize && ogSize.width / ogSize.height >= 1.5 ? 'summary_large_image' : 'summary'

/**
 * The portrait as a first-class node rather than a bare URL string.
 *
 * `primaryImageOfPage` and `Person.image` both declare ImageObject as their expected
 * type; a string satisfies neither cleanly, so validators warn and Google is free to
 * ignore the property. Dimensions come from the same pngSize() read as the og:image tags,
 * so they cannot drift from the file actually shipped.
 *
 * This always describes Profile.png specifically — a certificate page overriding its
 * og:image does not change who the Person is a picture of.
 */
const portraitNode = {
  '@type': 'ImageObject',
  '@id': PORTRAIT_ID,
  url: abs(DEFAULT_IMAGE),
  contentUrl: abs(DEFAULT_IMAGE),
  caption: `${profile.name} — ${profile.title}`,
  ...(ogSize ? { width: ogSize.width, height: ogSize.height } : {}),
}

/* -------------------------------------------------------------------------- */
/* JSON-LD                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The Person node is repeated in full on every page rather than referenced by @id from
 * a single definition. Each page is crawled independently, so a bare @id pointing at a
 * node defined only on the homepage resolves to nothing.
 *
 * sameAs is the field that matters most here: it is what lets Google merge this site,
 * the GitHub account and the LinkedIn profile into one entity, which is the whole game
 * for a query that is just a person's name.
 */
function personNode(extra = {}) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile.name,
    url: `${SITE}/`,
    image: { '@id': PORTRAIT_ID },
    jobTitle: profile.title,
    description: profile.summary,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressCountry: 'EG' },
    nationality: { '@type': 'Country', name: profile.location },
    alumniOf: profile.education.map((e) => ({
      '@type': 'CollegeOrUniversity',
      name: e.school,
    })),
    knowsAbout: profile.skills.flatMap((g) => g.items),
    knowsLanguage: profile.languages.map((l) => ({ '@type': 'Language', name: l.name })),
    sameAs: Object.values(profile.socials),
    ...extra,
  }
}

/**
 * Person plus the portrait it points at, for splatting into a page's @graph.
 *
 * Person.image is an @id reference, and by the same logic as the comment above, that
 * reference resolves to nothing on a page that doesn't also carry the ImageObject. Pairing
 * them in one helper is what stops a route added later from shipping a dangling @id.
 */
const identityNodes = (extra) => [personNode(extra), portraitNode]

/**
 * `name` is what Google renders as the site name above the URL in a result, computed from
 * the home page alone. It has to be here: a subdomain with no WebSite node of its own
 * falls back to the *domain-level* name, which for a dpdns.org host means DigitalPlat's
 * branding rather than yours.
 *
 * alternateName is a preference-ordered ladder, most-preferred first, used only if Google
 * declines `name`. The bare host is the last rung on purpose — Google documents the
 * lowercase domain as the last-resort option, and seeing your own URL there beats seeing
 * the domain provider's brand.
 */
const websiteNode = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE}/`,
  name: profile.name,
  alternateName: [`${profile.name} Portfolio`, HOST],
  description: profile.seoDescription,
  inLanguage: 'en',
  publisher: { '@id': PERSON_ID },
}

/** Breadcrumbs from a list of [name, path] pairs, in order from the site root. */
const breadcrumbs = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: abs(path),
  })),
})

/**
 * Serialised for a <script> context: "<" is escaped so a "</script>" appearing inside
 * any string value cannot close the tag early and inject markup.
 */
const jsonLdScript = (graph) =>
  `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  }).replace(/</g, '\\u003c')}</script>`

/* -------------------------------------------------------------------------- */
/* HTML emission                                                               */
/* -------------------------------------------------------------------------- */

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

// Built by `vite build --ssr`. pathToFileURL is required on Windows, where import() of a
// bare "C:\..." path is treated as a URL with an unknown "c:" protocol and throws.
const ssrEntry = join(distSsr, 'entry-server.js')
if (!existsSync(ssrEntry)) {
  throw new Error(`prerender: missing ${ssrEntry} — run the "vite build --ssr" step first`)
}
const { render } = await import(pathToFileURL(ssrEntry).href)

/** Writes one route's HTML. `path` is the route, e.g. "/projects/homelab". */
async function emit({
  path,
  title,
  description,
  image = DEFAULT_IMAGE,
  ogType = 'website',
  graph,
  noindex = false,
}) {
  const pageTitle = escapeAttr(title)
  const desc = escapeAttr(description)
  const url = abs(path)
  const imageUrl = abs(image)

  let html = template
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`)
  html = replaceTag(
    html,
    /<meta\s[^>]*name="description"[^>]*>/,
    `<meta name="description" content="${desc}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s[^>]*property="og:type"[^>]*>/,
    `<meta property="og:type" content="${ogType}" />`,
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
  // The "og:image" and "twitter:image" patterns end at a closing quote, so neither can
  // match the og:image:width / :height / :alt tags that follow them.
  html = replaceTag(
    html,
    /<meta\s[^>]*property="og:image"[^>]*>/,
    `<meta property="og:image" content="${imageUrl}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s[^>]*name="twitter:card"[^>]*>/,
    `<meta name="twitter:card" content="${twitterCard}" />`,
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
    /<meta\s[^>]*name="twitter:image"[^>]*>/,
    `<meta name="twitter:image" content="${imageUrl}" />`,
  )
  html = replaceTag(
    html,
    /<link\s[^>]*rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${url}" />`,
  )
  if (noindex) {
    html = replaceTag(
      html,
      /<meta\s[^>]*name="robots"[^>]*>/,
      '<meta name="robots" content="noindex, follow" />',
    )
  }

  if (ogSize) {
    html = replaceTag(
      html,
      /<meta\s[^>]*property="og:image:width"[^>]*>/,
      `<meta property="og:image:width" content="${ogSize.width}" />`,
    )
    html = replaceTag(
      html,
      /<meta\s[^>]*property="og:image:height"[^>]*>/,
      `<meta property="og:image:height" content="${ogSize.height}" />`,
    )
  }

  if (graph) html = replaceTag(html, /<\/head>/, `${jsonLdScript(graph)}</head>`)

  // The rendered tree replaces the empty mount point main.tsx now hydrates into.
  // StaticRouter takes the route path, not the absolute URL — handed "https://host/x"
  // it matches nothing and silently renders an empty tree.
  const markup = await render(path)
  html = replaceTag(html, /<div id="root"><\/div>/, `<div id="root">${markup}</div>`)

  // Leading "/" would make join() treat the path as absolute and discard dist.
  const outDir = join(dist, path.replace(/^\//, ''))
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
}

/* -------------------------------------------------------------------------- */
/* Routes                                                                      */
/* -------------------------------------------------------------------------- */

const projectUrl = (slug) => `/projects/${slug}`
const certificateUrl = (slug) => `/certificates/${slug}`

/** ItemList for the two index pages, so their entries are legible as a collection. */
const itemList = (entries, toPath) => ({
  '@type': 'ItemList',
  itemListElement: entries.map((e, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: e.title,
    url: abs(toPath(e.slug)),
  })),
})

const pages = [
  {
    path: '/',
    title: `${profile.name} — ${profile.title}`,
    description: profile.seoDescription,
    // "profile" tells Open Graph this page *is* a person, not a generic site.
    ogType: 'profile',
    graph: [
      ...identityNodes(),
      websiteNode,
      {
        '@type': 'ProfilePage',
        '@id': `${SITE}/#profilepage`,
        url: `${SITE}/`,
        name: `${profile.name} — ${profile.title}`,
        description: profile.seoDescription,
        isPartOf: { '@id': WEBSITE_ID },
        primaryImageOfPage: { '@id': PORTRAIT_ID },
        about: { '@id': PERSON_ID },
        mainEntity: { '@id': PERSON_ID },
        inLanguage: 'en',
      },
    ],
  },
  // Index routes. Titles come from profile.json so they can't drift from the site.
  {
    path: '/projects',
    title: `Projects — ${profile.name}`,
    description: `Case studies and build logs from ${profile.name} — ${profile.title}.`,
    graph: [
      ...identityNodes(),
      websiteNode,
      {
        '@type': 'CollectionPage',
        '@id': `${abs('/projects')}#page`,
        url: abs('/projects'),
        name: `Projects — ${profile.name}`,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': PERSON_ID },
        mainEntity: itemList(projects, projectUrl),
      },
      breadcrumbs([
        [profile.name, '/'],
        ['Projects', '/projects'],
      ]),
    ],
  },
  {
    path: '/certificates',
    title: `Certificates — ${profile.name}`,
    description: `Courses and credentials completed by ${profile.name}.`,
    // The route stays reachable while the collection is empty, but "Nothing here yet"
    // is a thin page that nothing links to — indexing it would only dilute the site.
    // Lifts itself automatically as soon as one certificate exists.
    noindex: certificates.length === 0,
    graph: [
      ...identityNodes(),
      websiteNode,
      {
        '@type': 'CollectionPage',
        '@id': `${abs('/certificates')}#page`,
        url: abs('/certificates'),
        name: `Certificates — ${profile.name}`,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': PERSON_ID },
        mainEntity: itemList(certificates, certificateUrl),
      },
      breadcrumbs([
        [profile.name, '/'],
        ['Certificates', '/certificates'],
      ]),
    ],
  },
  // One per entry. dist/projects/index.html and dist/projects/<slug>/index.html are
  // different paths, so the indexes above and these coexist.
  ...projects.map((p) => {
    const path = projectUrl(p.slug)
    return {
      path,
      title: `${p.title} — ${profile.name}`,
      description: p.summary,
      ogType: 'article',
      graph: [
        ...identityNodes(),
        // Carried because the project node below declares isPartOf against it. Without the
        // node on this page the reference dangles — same reason identityNodes pairs the
        // portrait with the Person.
        websiteNode,
        {
          // SoftwareSourceCode only when there is a repository to point at; the home lab
          // write-up is infrastructure, not source, and CreativeWork describes it honestly.
          '@type': p.repo ? 'SoftwareSourceCode' : 'CreativeWork',
          '@id': `${abs(path)}#project`,
          name: p.title,
          headline: p.title,
          description: p.summary,
          url: abs(path),
          inLanguage: 'en',
          author: { '@id': PERSON_ID },
          isPartOf: { '@id': WEBSITE_ID },
          ...(p.date ? { datePublished: p.date } : {}),
          ...(p.repo ? { codeRepository: p.repo } : {}),
          ...(p.stack.length ? { keywords: p.stack.join(', ') } : {}),
          // programmingLanguage is only defined on SoftwareSourceCode — putting it on a
          // CreativeWork would be an invalid property rather than a merely unused one.
          ...(p.repo && p.stack.length ? { programmingLanguage: p.stack } : {}),
        },
        breadcrumbs([
          [profile.name, '/'],
          ['Projects', '/projects'],
          [p.title, path],
        ]),
      ],
    }
  }),
  // Emitted for every certificate, including ones with no write-up — their detail
  // route resolves even though no card links to it.
  ...certificates.map((c) => {
    const path = certificateUrl(c.slug)
    const credentialId = `${abs(path)}#credential`
    return {
      path,
      title: `${c.title} — ${profile.name}`,
      description: c.summary,
      ogType: 'article',
      image: c.image ?? DEFAULT_IMAGE,
      graph: [
        // hasCredential is the only property that ties a credential back to its holder;
        // the credential node itself has no "awarded to" field.
        ...identityNodes({ hasCredential: { '@id': credentialId } }),
        {
          '@type': 'EducationalOccupationalCredential',
          '@id': credentialId,
          name: c.title,
          description: c.summary,
          url: abs(path),
          credentialCategory: 'certificate',
          ...(c.issuer ? { recognizedBy: { '@type': 'Organization', name: c.issuer } } : {}),
          ...(c.date ? { dateCreated: c.date } : {}),
          ...(c.skills.length ? { keywords: c.skills.join(', ') } : {}),
        },
        breadcrumbs([
          [profile.name, '/'],
          ['Certificates', '/certificates'],
          [c.title, path],
        ]),
      ],
    }
  }),
]

for (const page of pages) await emit(page)

/* -------------------------------------------------------------------------- */
/* robots.txt, sitemap.xml, 404.html                                           */
/* -------------------------------------------------------------------------- */

/**
 * AI crawlers are allowed on purpose. The point of a portfolio is to be found, and
 * being quotable by an assistant someone asks "who is Mohamed Maged" is worth more
 * than withholding a page that is public anyway.
 */
const aiCrawlers = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']

writeFileSync(
  join(dist, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    '',
    ...aiCrawlers.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
    `Sitemap: ${abs('/sitemap.xml')}`,
    '',
  ].join('\n'),
)

/**
 * lastmod takes the entry's own YYYY-MM, padded to a full date. The index routes take
 * the newest date among their entries rather than the build time, so a deploy that
 * changed nothing doesn't churn every timestamp and train crawlers to ignore them.
 */
const fullDate = (d) => (d ? `${d}-01` : undefined)
const newest = (entries) =>
  entries.map((e) => e.date).filter(Boolean).sort().pop()

const urls = [
  // The portrait is listed here so Googlebot-Image has a direct path to it. Otherwise the
  // only route to the file is rendering the homepage and noticing the <img>, which is a
  // slower and less reliable way to get a photo into the index — and being in the image
  // index is the precondition for it ever appearing beside a search result.
  {
    loc: '/',
    lastmod: fullDate(newest([...projects, ...certificates])),
    priority: '1.0',
    image: { loc: DEFAULT_IMAGE, title: `${profile.name} — ${profile.title}` },
  },
  { loc: '/projects', lastmod: fullDate(newest(projects)), priority: '0.8' },
  ...projects.map((p) => ({ loc: projectUrl(p.slug), lastmod: fullDate(p.date), priority: '0.7' })),
  // Skipped while the collection is empty: a listing with nothing on it is a thin page,
  // and asking Google to crawl it only spends budget to find that out.
  ...(certificates.length
    ? [{ loc: '/certificates', lastmod: fullDate(newest(certificates)), priority: '0.6' }]
    : []),
  ...certificates.map((c) => ({
    loc: certificateUrl(c.slug),
    lastmod: fullDate(c.date),
    priority: '0.5',
  })),
]

writeFileSync(
  join(dist, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    // The image namespace is Google's extension, ignored by anything that doesn't know it.
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls.map(({ loc, lastmod, priority, image }) =>
      [
        '  <url>',
        `    <loc>${abs(loc)}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        `    <priority>${priority}</priority>`,
        // escapeAttr covers &, < and > — the three that would make this malformed XML.
        ...(image
          ? [
              '    <image:image>',
              `      <image:loc>${abs(image.loc)}</image:loc>`,
              `      <image:title>${escapeAttr(image.title)}</image:title>`,
              '    </image:image>',
            ]
          : []),
        '  </url>',
      ].join('\n'),
    ),
    '</urlset>',
    '',
  ].join('\n'),
)

/**
 * Served by Cloudflare with a real 404 status (wrangler.jsonc, not_found_handling).
 * Every genuine route above is written as its own file and matches ahead of this, so
 * only unknown URLs land here — previously they returned 200 with the SPA shell, a soft
 * 404 that wasted crawl budget and made /robots.txt itself resolve to HTML.
 *
 * Not prerendered: this file is served under whatever path was missed, so any baked-in
 * markup would be wrong for that URL. The shell boots and NotFound renders client-side.
 */
let notFound = template
notFound = replaceTag(notFound, /<title>[^<]*<\/title>/, `<title>404 — ${profile.name}</title>`)
notFound = replaceTag(
  notFound,
  /<meta\s[^>]*name="robots"[^>]*>/,
  '<meta name="robots" content="noindex, follow" />',
)
notFound = replaceTag(notFound, /<link\s[^>]*rel="canonical"[^>]*>/, '')
writeFileSync(join(dist, '404.html'), notFound)

console.log(
  `prerendered ${pages.length} routes, ${urls.length} sitemap entries, robots.txt, 404.html`,
)
