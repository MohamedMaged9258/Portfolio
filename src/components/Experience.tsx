import { motion } from 'motion/react'
import Section from './Section'
import { profile } from '../lib/profile'
import { drawY, pop, probeOnce, riseStagger, stagger, viewportOnce } from '../lib/motion'

export default function Experience() {
  return (
    <Section id="experience" title="Experience">
      {/* The timeline reveals like a trace being collected: the rail draws top-down,
          each role lands with a liveness probe, then its highlights tail in. The rail
          lives outside the <ol> so it stays clear of space-y-12's child selector. */}
      <motion.div
        className="relative"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.12)}
      >
        <motion.span
          aria-hidden
          variants={drawY}
          className="absolute left-0 top-0 h-full w-px origin-top bg-accent/50"
        />

        <ol className="relative space-y-12 border-l border-line pl-6">
          {profile.experience.map((job) => (
            <motion.li
              key={`${job.role}-${job.org}`}
              variants={riseStagger(0.05)}
              className="relative grid gap-x-8 gap-y-1 sm:grid-cols-[8.5rem_1fr]"
            >
              {/* Sits before the node in DOM so it emerges from behind it. */}
              <motion.span
                aria-hidden
                variants={probeOnce}
                className="absolute -left-[29.5px] top-1.5 h-2.5 w-2.5 bg-accent"
              />
              <span className="absolute -left-[29.5px] top-1.5 h-2.5 w-2.5 border border-accent bg-bg" />

              <p className="pt-0.5 font-mono text-xs text-ink-subtle">{job.period}</p>

              <div>
                <h3 className="text-lg font-semibold">{job.role}</h3>
                <p className="mt-0.5 text-sm">
                  <span className="text-accent">{job.org}</span>{' '}
                  <span className="text-ink-subtle">{job.location}</span>
                </p>
                <ul className="mt-4 max-w-[65ch] list-disc space-y-2 pl-4 marker:text-line">
                  {job.highlights.map((h, i) => (
                    <motion.li key={i} variants={pop}>
                      {h}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </Section>
  )
}
