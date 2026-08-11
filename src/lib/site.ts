import { profile } from './profile'

/**
 * Canonical origin, no trailing slash.
 *
 * Sourced from data/profile.json rather than declared here, because scripts/prerender.mjs
 * needs the same value and is plain Node ESM outside the Vite graph — it can read the JSON
 * but not import this module. profile.json is the one file both sides can agree on, so
 * moving to a real domain is a single-line edit there.
 */
export const SITE = profile.site

/** Site-root-relative. Overridden per route by pages that have their own image. */
export const DEFAULT_IMAGE = '/Profile.png'

/**
 * The robots directive for every indexable route.
 *
 * `max-image-preview:large` is what makes the portrait eligible to appear as a thumbnail
 * beside the search result — without it Google caps previews at a size it won't bother
 * rendering. It has to live in a constant because two places emit this tag and Googlebot
 * reads the *rendered* DOM: index.html ships it prerendered, then useDocumentMeta rewrites
 * it on mount. When those two disagreed, the hook silently overwrote the directive a tick
 * after first paint and it never reached the crawler on any route.
 *
 * index.html carries the same string as a literal — it is the build template and cannot
 * import from here. Keep the two in step.
 */
export const ROBOTS_INDEX = 'index, follow, max-image-preview:large'

/** Joins a route path onto the origin. `path` is expected to start with "/". */
export const absoluteUrl = (path: string) => `${SITE}${path}`
