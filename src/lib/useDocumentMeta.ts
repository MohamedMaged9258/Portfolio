import { useEffect } from 'react'

const SITE = 'https://mohamedm.dpdns.org'
const DEFAULT_IMAGE = '/Profile.png'

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
 * and isn't worth adding for three routes. index.html keeps its tags as the pre-JS
 * default; each route overwrites them on mount.
 *
 * Client-side only, so this reaches crawlers that execute JS (Google) but not social
 * scrapers (X, LinkedIn, Discord, Slack), which read the static index.html. Fixing
 * those unfurls needs per-route HTML emitted at build time.
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
