import { motion } from 'motion/react'
import Section from './Section'
import { profile } from '../lib/profile'
import { pop, riseStagger, stagger, viewportOnce } from '../lib/motion'

export default function Skills() {
  return (
    <Section id="skills" eyebrow="// skills" title="Technical Skills">
      {/* Two-level stagger: cards at 0.04, pills at 0.02 inside each. Kept tight so
          the last pill lands well under a second — six groups drag otherwise. */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.04)}
      >
        {profile.skills.map((group) => (
          <motion.div
            key={group.label}
            variants={riseStagger(0.02)}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-500">{group.label}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <motion.span
                  key={item}
                  variants={pop}
                  className="rounded-md border border-line bg-bg px-2.5 py-1 text-sm text-slate-300"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}
