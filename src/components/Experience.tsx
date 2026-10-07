import { useRef } from 'react'
import { motion, useInView, useScroll } from 'motion/react'
import Section from './Section'
import { cn } from '../lib/cn'
import { profile } from '../lib/profile'
import { pop, probeOnce, riseStagger } from '../lib/motion'

type Job = (typeof profile.experience)[number]

/**
 * The line the rail's fill tip sits on, as a fraction of the viewport from the top.
 * Role reveals key off the same line, so each node lights as the fill reaches it.
 */
const TIP = '70%'

function Role({ job }: { job: Job }) {
  const ref = useRef<HTMLLIElement>(null)
  // Bottom margin puts the trigger on the TIP line. The 9999px top margin is the same
  // fix as viewportOnce: a deep link that jumps past this role still counts as in
  // view, so it can't be stranded at opacity 0.
  const reached = useInView(ref, { once: true, margin: '9999px 0px -30% 0px' })

  return (
    <motion.li
      ref={ref}
      initial="hidden"
      animate={reached ? 'show' : 'hidden'}
      variants={riseStagger(0.05)}
      className="relative grid gap-x-8 gap-y-1 sm:grid-cols-[10.5rem_1fr]"
    >
      {/* Sits before the node in DOM so it emerges from behind it. */}
      <motion.span
        aria-hidden
        variants={probeOnce}
        className="absolute -left-[29.5px] top-1.5 h-2.5 w-2.5 bg-accent"
      />
      <span
        className={cn(
          'absolute -left-[29.5px] top-1.5 h-2.5 w-2.5 border border-accent transition-colors duration-300',
          reached ? 'bg-accent' : 'bg-bg',
        )}
      />

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
  )
}

export default function Experience() {
  const ref = useRef<HTMLDivElement>(null)
  // 0 when the list's top reaches the TIP line, 1 when its bottom does.
  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${TIP}`, `end ${TIP}`] })

  return (
    <Section id="experience" title="Experience">
      {/* The timeline fills in step with your scroll, like a trace being collected.
          The rail lives outside the <ol> so it stays clear of space-y-12's child
          selector. Under reduced motion the CSS override shows it fully drawn. */}
      <div ref={ref} className="relative">
        <motion.span
          aria-hidden
          style={{ scaleY: scrollYProgress }}
          className="absolute left-0 top-0 h-full w-px origin-top bg-accent/60 motion-reduce:transform-none!"
        />

        <ol className="relative space-y-12 border-l border-line pl-6">
          {profile.experience.map((job) => (
            <Role key={`${job.role}-${job.org}`} job={job} />
          ))}
        </ol>
      </div>
    </Section>
  )
}
