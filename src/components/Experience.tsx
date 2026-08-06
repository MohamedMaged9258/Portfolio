import { motion } from 'motion/react'
import Section from './Section'
import { profile } from '../lib/profile'
import { drawY, pop, probeOnce, riseStagger, stagger, viewportOnce } from '../lib/motion'

export default function Experience() {
  return (
    <Section id="experience" eyebrow="// experience" title="Experience">
      {/* The timeline reveals like a trace being collected: the rail draws top-down,
          each role lands with a liveness probe, then its highlights tail in. The rail
          lives outside the <ol> so it stays clear of space-y-10's child selector. */}
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

        <ol className="relative space-y-10 border-l border-line pl-6">
          {profile.experience.map((job) => (
            <motion.li
              key={`${job.role}-${job.org}`}
              variants={riseStagger(0.05)}
              className="relative"
            >
              {/* Sits before the dot in DOM so it emerges from behind it. */}
              <motion.span
                aria-hidden
                variants={probeOnce}
                className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-accent"
              />
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
                  <motion.li key={i} variants={pop} className="flex gap-2.5 text-slate-400">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                    <span>{h}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </Section>
  )
}
