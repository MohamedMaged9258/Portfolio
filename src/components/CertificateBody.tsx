import { MDXProvider } from '@mdx-js/react'
import { ExternalLink } from 'lucide-react'
import { mdxComponents } from './mdxComponents'
import { formatCertificateDate, type Certificate } from '../lib/certificates'

/**
 * The certificate write-up with no page chrome, rendered by both CertificateDetail
 * (full page) and CertificateModal (overlay) so the two can't drift apart. Mirrors
 * ProjectBody.
 *
 * `titleId` is wired to the overlay's aria-labelledby; the full page has no use for
 * it, and it's harmless there.
 */
export default function CertificateBody({
  certificate,
  titleId,
}: {
  certificate: Certificate
  titleId?: string
}) {
  const { Component, title, issuer, date, credentialId, url, image, skills, hasBody } =
    certificate

  return (
    <>
      <p className="font-mono text-xs text-ink-subtle">Certificate</p>
      <h1 id={titleId} className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>

      <p className="mt-4 font-mono text-sm text-ink-muted">
        {issuer} / {formatCertificateDate(date)}
        {credentialId && <> / ID {credentialId}</>}
      </p>

      <p className="mt-4 max-w-[65ch] text-lg leading-relaxed">{certificate.summary}</p>

      {skills && skills.length > 0 && (
        <p className="mt-4 font-mono text-xs text-ink-subtle">{skills.join(' / ')}</p>
      )}

      {url && (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-ink transition hover:text-accent"
          >
            <ExternalLink className="h-4 w-4" />
            Verify
          </a>
        </div>
      )}

      {image && (
        <img
          src={image}
          alt={`${title} certificate`}
          className="mt-8 w-full rounded border border-line"
        />
      )}

      {/* Only when something was actually written — otherwise the rule would sit there
          with nothing under it. */}
      {hasBody && (
        <>
          <hr className="mt-8 border-line" />
          <article
            className="prose prose-invert mt-8 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-ink prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-ink prose-code:text-accent prose-code:before:content-none prose-code:after:content-none prose-pre:rounded prose-pre:border prose-pre:border-line prose-pre:bg-surface"
          >
            <MDXProvider components={mdxComponents}>
              <Component />
            </MDXProvider>
          </article>
        </>
      )}
    </>
  )
}
