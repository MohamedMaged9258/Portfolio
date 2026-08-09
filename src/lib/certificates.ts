import data from '../../data/certificates.json'

export interface Certificate {
  name: string
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

/**
 * Mirrors lib/projects.ts so the two collections read alike. Certificates carry no
 * prose body, so this is a flat JSON record rather than an MDX collection.
 *
 * The cast follows profile.ts's `data as Profile` convention — nothing validates at
 * runtime. An empty file types as never[], which is assignable, so [] needs no
 * special case.
 */
export const certificates: Certificate[] = (data as Certificate[])
  .slice()
  // newest first; string compare works because the date format is fixed-width
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export const featuredCertificates: Certificate[] = certificates.filter((c) => c.featured)
