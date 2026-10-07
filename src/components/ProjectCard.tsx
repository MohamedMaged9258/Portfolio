import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../lib/projects'
import { rise } from '../lib/motion'

/** The card is the grid item itself — wrapping it would break the flex fill-height. */
const MotionLink = motion.create(Link)

export default function ProjectCard({ project }: { project: Project }) {
  const location = useLocation()
  const layoutLabel = project.layout === 'log' ? 'Build log' : 'Case study'
  const extra = project.stack.length - 4

  return (
    <MotionLink
      to={`/projects/${project.slug}`}
      // Marks this as an in-app click, which App reads to render the write-up as an
      // overlay over the current page. A pasted or refreshed URL carries no state and
      // so falls through to the full ProjectDetail page.
      state={{ backgroundLocation: location }}
      variants={rise}
      // transition-colors, not transition: the bare utility also transitions
      // transform, which would fight motion's reveal animation on the same element.
      className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/40 hover:bg-surface"
    >
      {/* Fills along the top edge on hover, echoing a span in the Experience waterfall. */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-signal group-hover:scale-x-100"
        aria-hidden
      />

      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{layoutLabel}</span>
        <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-100 group-hover:text-white">{project.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{project.summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded border border-line bg-bg px-2 py-0.5 font-mono text-[11px] text-slate-400"
          >
            {t}
          </span>
        ))}
        {extra > 0 && <span className="px-1 py-0.5 font-mono text-[11px] text-slate-500">+{extra}</span>}
      </div>
    </MotionLink>
  )
}
