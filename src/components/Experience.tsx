import Section from './Section'
import { profile } from '../lib/profile'

export default function Experience() {
  return (
    <Section id="experience" eyebrow="// experience" title="Experience">
      <ol className="relative space-y-10 border-l border-line pl-6">
        {profile.experience.map((job) => (
          <li key={`${job.role}-${job.org}`} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg" />
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-lg font-semibold text-slate-100">{job.role}</h3>
              <span className="font-mono text-xs text-slate-500">{job.period}</span>
            </div>
            <p className="mt-0.5 text-sm text-accent">
              {job.org} <span className="text-slate-500">· {job.location}</span>
            </p>
            <ul className="mt-3 space-y-2">
              {job.highlights.map((h, i) => (
                <li key={i} className="flex gap-2.5 text-slate-400">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}
