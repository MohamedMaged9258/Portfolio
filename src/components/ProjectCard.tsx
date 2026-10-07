import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../lib/projects'
import { rise } from '../lib/motion'

/** The row is the list item itself, so motion's stagger reaches it directly. */
const MotionLink = motion.create(Link)

/**
 * One project as an index row: what it is on the left, what kind of write-up and when
 * on the right. Parents lay these out with `divide-y divide-line`.
 */
export default function ProjectCard({ project }: { project: Project }) {
  const location = useLocation()
  const layoutLabel = project.layout === 'log' ? 'Build log' : 'Case study'

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
      className="group relative -mx-4 grid gap-x-8 gap-y-3 px-4 py-6 transition-colors hover:bg-surface sm:grid-cols-[1fr_auto]"
    >
      {/* Fills along the top edge on hover, echoing a span in the Experience trace. */}
      <span
        className="pointer-events-none absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-signal group-hover:scale-x-100"
        aria-hidden
      />

      <div className="min-w-0">
        <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        <p className="mt-2 max-w-[60ch] leading-relaxed">{project.summary}</p>
        <p className="mt-3 font-mono text-xs text-ink-subtle">{project.stack.join(' / ')}</p>
      </div>

      <div className="flex items-start gap-4 font-mono text-xs text-ink-subtle sm:row-start-1 sm:col-start-2 sm:flex-col sm:items-end sm:gap-1.5 sm:pt-1.5">
        <span>{layoutLabel}</span>
        <span>{project.date}</span>
        <ArrowUpRight className="ml-auto h-4 w-4 text-ink-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:ml-0 sm:mt-2" />
      </div>
    </MotionLink>
  )
}
