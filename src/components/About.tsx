import Section from './Section'
import { profile } from '../lib/profile'

export default function About() {
  return (
    <Section id="about" eyebrow="// about" title="About">
      <div className="grid gap-8 md:grid-cols-3">
        <p className="text-lg leading-relaxed text-slate-400 md:col-span-2">{profile.summary}</p>

        <div className="space-y-4">
          {profile.education.map((ed) => (
            <div key={ed.school} className="rounded-lg border border-line bg-surface p-4">
              <p className="eyebrow">// education</p>
              <p className="mt-2 font-medium text-slate-100">{ed.degree}</p>
              <p className="text-sm text-slate-400">{ed.school}</p>
              <p className="mt-1 font-mono text-xs text-slate-500">{ed.period}</p>
            </div>
          ))}

          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="eyebrow">// languages</p>
            <dl className="mt-3 space-y-2 text-sm">
              {profile.languages.map((l) => (
                <div key={l.name} className="flex gap-3">
                  <dt className="w-16 shrink-0 font-medium text-slate-200">{l.name}</dt>
                  <dd className="text-slate-500">{l.level}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Section>
  )
}
