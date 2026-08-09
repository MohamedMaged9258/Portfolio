import { motion } from 'motion/react'
import { ExternalLink } from 'lucide-react'
import type { Certificate } from '../lib/certificates'
import { pop, rise } from '../lib/motion'

/** "2025-05" → "May 2025". Parsed as UTC so the month can't slip a timezone. */
function formatDate(date: string) {
  const [year, month] = date.split('-')
  const d = new Date(Date.UTC(Number(year), Number(month) - 1))
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export default function CertificateCard({ certificate }: { certificate: Certificate }) {
  const { name, issuer, date, credentialId, url, image, skills } = certificate

  return (
    <motion.article
      variants={rise}
      // transition-colors, not transition: the bare utility also transitions
      // transform, which would fight motion's reveal animation on the same element.
      className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/40 hover:bg-elevated"
    >
      {image && (
        <img
          src={image}
          alt={`${name} certificate`}
          loading="lazy"
          className="mb-4 aspect-[4/3] w-full rounded-lg border border-line object-cover"
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
          {issuer}
        </span>
        <span className="shrink-0 font-mono text-[11px] text-slate-500">{formatDate(date)}</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-100">{name}</h3>

      {credentialId && (
        <p className="mt-2 font-mono text-xs text-slate-500">ID: {credentialId}</p>
      )}

      {/* flex-1 on the spacer keeps the footer row aligned across cards of unequal height. */}
      <div className="flex-1" />

      {skills && skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <motion.span
              key={s}
              variants={pop}
              className="rounded border border-line bg-bg px-2 py-0.5 font-mono text-[11px] text-slate-400"
            >
              {s}
            </motion.span>
          ))}
        </div>
      )}

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-accent"
        >
          Verify
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </motion.article>
  )
}
