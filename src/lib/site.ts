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

/** Joins a route path onto the origin. `path` is expected to start with "/". */
export const absoluteUrl = (path: string) => `${SITE}${path}`
