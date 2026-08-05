import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../lib/projects'

export default function ProjectCard({ project }: { project: Project }) {
  const layoutLabel = project.layout === 'log' ? 'Build log' : 'Case study'
  const extra = project.stack.length - 4

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-accent/40 hover:bg-elevated"
    >
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
    </Link>
  )
}
