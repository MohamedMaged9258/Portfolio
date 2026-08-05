import Section from './Section'
import { profile } from '../lib/profile'

export default function Skills() {
  return (
    <Section id="skills" eyebrow="// skills" title="Technical Skills">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile.skills.map((group) => (
          <div key={group.label} className="rounded-lg border border-line bg-surface p-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-500">{group.label}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-line bg-bg px-2.5 py-1 text-sm text-slate-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
