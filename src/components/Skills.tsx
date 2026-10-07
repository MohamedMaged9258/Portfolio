import { motion } from 'motion/react'
import Section from './Section'
import { profile } from '../lib/profile'
import { rise, stagger, viewportOnce } from '../lib/motion'

export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      {/* A definition matrix rather than pill clouds: the group is the label, the
          items read as one line of text. */}
      <motion.dl
        className="grid gap-x-10 gap-y-6 md:grid-cols-2"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.05)}
      >
        {profile.skills.map((group) => (
          <motion.div key={group.label} variants={rise} className="border-t border-line pt-3">
            <dt className="font-mono text-xs text-ink-subtle">{group.label}</dt>
            <dd className="mt-1.5 leading-relaxed text-ink">{group.items.join(', ')}</dd>
          </motion.div>
        ))}
      </motion.dl>
    </Section>
  )
}
