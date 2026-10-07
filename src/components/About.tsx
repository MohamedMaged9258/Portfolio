import { motion } from 'motion/react'
import Section from './Section'
import { profile } from '../lib/profile'
import { pop, rise, stagger, viewportOnce } from '../lib/motion'

/** Mono label over a fact in the strip below the summary. */
function FactLabel({ children }: { children: string }) {
  return <dt className="font-mono text-xs text-ink-subtle">{children}</dt>
}

export default function About() {
  return (
    <Section id="about" title="About">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.08)}
      >
        <motion.p variants={rise} className="max-w-[65ch] text-lg leading-relaxed">
          {profile.summary}
        </motion.p>

        <motion.dl
          variants={stagger(0.06)}
          className="mt-10 grid gap-8 border-t border-line pt-6 sm:grid-cols-3"
        >
          {profile.education.map((ed) => (
            <motion.div key={ed.school} variants={rise}>
              <FactLabel>Education</FactLabel>
              <dd className="mt-2">
                <p className="font-medium text-ink">{ed.degree}</p>
                <p className="text-sm">{ed.school}</p>
                <p className="mt-1 font-mono text-xs text-ink-subtle">{ed.period}</p>
                {ed.highlights && ed.highlights.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {ed.highlights.map((h, i) => (
                      <motion.li key={i} variants={pop}>
                        {h}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </dd>
            </motion.div>
          ))}

          <motion.div variants={rise}>
            <FactLabel>Location</FactLabel>
            <dd className="mt-2 font-medium text-ink">{profile.location}</dd>
          </motion.div>

          <motion.div variants={rise}>
            <FactLabel>Languages</FactLabel>
            <dd className="mt-2 space-y-1.5 text-sm">
              {profile.languages.map((l) => (
                <p key={l.name}>
                  <span className="font-medium text-ink">{l.name}</span> {l.level}
                </p>
              ))}
            </dd>
          </motion.div>
        </motion.dl>
      </motion.div>
    </Section>
  )
}
