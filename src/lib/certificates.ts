import type { ComponentType } from 'react'

export interface CertificateFrontmatter {
  title: string
  slug: string
  summary: string
  issuer: string
  /** "YYYY-MM" — same zero-padded, fixed-width form as project frontmatter dates. */
  date: string
  credentialId?: string
  /** Verification page on the issuer's site. */
  url?: string
  /** Root-relative, served from data/assets — e.g. "/certs/foo.png". */
  image?: string
  skills?: string[]
  /** Surfaces it in the homepage preview; the full list lives at /certificates. */
  featured?: boolean
}

export interface Certificate extends CertificateFrontmatter {
  /** The compiled MDX body, rendered as a React component. */
  Component: ComponentType
  /**
   * Whether anything was written under the frontmatter. Certificates are often just
   * a credential with nothing to say, and those get a Verify link instead of a
   * clickable card — there'd be nothing behind the click.
   */
  hasBody: boolean
}

interface CertificateModule {
  default: ComponentType
  frontmatter: CertificateFrontmatter
  /** Injected by the `mdx-has-body` plugin in vite.config.ts. */
  hasBody: boolean
}

// Eagerly load every certificate's MDX (frontmatter + compiled body) at build time,
// exactly as lib/projects.ts does.
const modules = import.meta.glob<CertificateModule>('../../data/certificates/*.mdx', {
  eager: true,
})

/**
 * `hasBody` is derived at build time from the file itself rather than declared in
 * frontmatter: a flag would be a second source of truth that drifts the moment someone
 * writes a write-up and forgets to set it, and the failure mode there is prose that
 * silently never renders.
 */
export const certificates: Certificate[] = Object.values(modules)
  .map((mod) => ({
    ...mod.frontmatter,
    Component: mod.default,
    hasBody: mod.hasBody,
  }))
  // newest first (date is an ISO-ish "YYYY-MM" string)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export const featuredCertificates: Certificate[] = certificates.filter((c) => c.featured)

export function getCertificate(slug: string): Certificate | undefined {
  return certificates.find((c) => c.slug === slug)
}

/** "2025-05" → "May 2025". Parsed as UTC so the month can't slip a timezone. */
export function formatCertificateDate(date: string): string {
  const [year, month] = date.split('-')
  const d = new Date(Date.UTC(Number(year), Number(month) - 1))
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
