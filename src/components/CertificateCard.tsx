import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import { formatCertificateDate, type Certificate } from '../lib/certificates'
import { rise } from '../lib/motion'

/**
 * Unlike ProjectCard, this is an <article> rather than a Link. It has to be: the card
 * carries a Verify link out to the issuer, and an anchor cannot contain another anchor.
 *
 * When there's a write-up, the title's Link stretches a pseudo-element over the whole
 * card instead, so the full surface is still clickable. Verify is lifted above that
 * overlay. The side benefit over a wrapping anchor is two properly-named tab stops —
 * the certificate and Verify — rather than one whose accessible name is the card's
 * entire text content.
 *
 * With no write-up there's nothing to click through to, so the card is inert and only
 * Verify remains.
 */
export default function CertificateCard({ certificate }: { certificate: Certificate }) {
  const location = useLocation()
  const { title, slug, issuer, date, credentialId, url, image, skills, hasBody } = certificate

  return (
    <motion.article
      variants={rise}
      // transition-colors, not transition: the bare utility also transitions
      // transform, which would fight motion's reveal animation on the same element.
      className="group relative flex flex-col border-b border-r border-line p-5 transition-colors hover:bg-surface"
    >
      {hasBody && (
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-signal group-hover:scale-x-100"
          aria-hidden
        />
      )}

      {image && (
        <img
          src={image}
          alt={`${title} certificate`}
          loading="lazy"
          className="mb-4 aspect-[4/3] w-full rounded border border-line object-cover"
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-ink-subtle">
          {issuer}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-xs text-ink-subtle">
            {formatCertificateDate(date)}
          </span>
          {hasBody && (
            <ArrowUpRight className="h-4 w-4 text-ink-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          )}
        </div>
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight">
        {hasBody ? (
          <Link
            to={`/certificates/${slug}`}
            // Same marker ProjectCard uses to ask App for an overlay rather than a
            // full page navigation.
            state={{ backgroundLocation: location }}
            // The stretched link: this pseudo-element covers the whole card, which is
            // already `relative`.
            className="transition-colors after:absolute after:inset-0 group-hover:text-accent"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>

      {credentialId && <p className="mt-2 font-mono text-xs text-ink-subtle">ID: {credentialId}</p>}

      {/* Spacer keeps the footer rows aligned across cards of unequal height. */}
      <div className="flex-1" />

      {skills && skills.length > 0 && (
        <p className="mt-4 font-mono text-xs text-ink-subtle">{skills.join(' / ')}</p>
      )}

      {(hasBody || url) && (
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          {/* A span, not a link: the title's stretched pseudo-element already covers
              this, so clicking it opens the detail view. A second <a> to the same
              place would only add a duplicate tab stop. */}
          {hasBody ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              Read more
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          ) : (
            <span />
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              // relative z-10 lifts this above the stretched link's pseudo-element —
              // without it the card's click area swallows Verify entirely.
              className="relative z-10 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-accent"
            >
              Verify
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </motion.article>
  )
}
