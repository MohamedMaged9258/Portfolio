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
      <p className="eyebrow">// certificate</p>
      <h1 id={titleId} className="mt-3 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
        {title}
      </h1>

      <p className="mt-4 font-mono text-sm text-slate-400">
        {issuer} · {formatCertificateDate(date)}
        {credentialId && <> · ID {credentialId}</>}
      </p>

      <p className="mt-4 text-lg leading-relaxed text-slate-400">{certificate.summary}</p>

      {skills && skills.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span
              key={s}
              className="rounded border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-slate-400"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {url && (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-accent"
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
          className="mt-8 w-full rounded-lg border border-line"
        />
      )}

      {/* Only when something was actually written — otherwise the rule would sit there
          with nothing under it. */}
      {hasBody && (
        <>
          <hr className="mt-8 border-line" />
          <article
            className="prose prose-invert mt-8 max-w-none prose-headings:font-semibold prose-headings:text-slate-100 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-100 prose-code:text-cyan-300 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-line prose-pre:bg-surface"
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
