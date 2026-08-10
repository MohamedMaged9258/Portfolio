import { useEffect } from 'react'
import { SITE, DEFAULT_IMAGE } from './site'

export interface DocumentMeta {
  title: string
  description: string
  /** Route path, e.g. "/projects/homelab". Joined to SITE for canonical + og:url. */
  path: string
  /** Site-root-relative image path. */
  image?: string
  noindex?: boolean
}

/** Upserts a <meta> by its identifying attribute, creating the tag if absent. */
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Per-route <head> management, done imperatively — react-helmet isn't a dependency
 * and isn't worth adding for six routes.
 *
 * This is no longer what crawlers read: scripts/prerender.mjs bakes the correct tags
 * into every route's HTML at build time, so the first paint is already right and social
 * scrapers get real per-page unfurls. What's left for this hook is client-side
 * *navigation* — following a link swaps the route without a document load, and nothing
 * else would update the title or canonical for the new URL.
 *
 * Values here must stay in step with the ones prerender.mjs emits for the same route,
 * or the tab title will change under the visitor a moment after the page settles.
 */
export function useDocumentMeta({ title, description, path, image, noindex }: DocumentMeta) {
  useEffect(() => {
    const url = `${SITE}${path}`
    const imageUrl = `${SITE}${image ?? DEFAULT_IMAGE}`

    document.title = title
    setMeta('name', 'description', description)
    // Written on every route, not just the 404 — adding it conditionally would strand
    // a stale noindex on whatever page you navigated to next.
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow')

    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', imageUrl)

    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', imageUrl)

    setCanonical(url)
  }, [title, description, path, image, noindex])
}
