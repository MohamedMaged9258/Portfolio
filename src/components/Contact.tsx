import { motion } from 'motion/react'
import Section from './Section'
import Socials from './Socials'
import ResumeButton from './ResumeButton'
import { profile } from '../lib/profile'
import { rise, stagger, viewportOnce } from '../lib/motion'

export default function Contact() {
  // Lowercase only the leading letter: the string carries acronyms ("AIOps") that a
  // blanket toLowerCase() would flatten to "aiops".
  const availability = profile.availability
    ? profile.availability[0].toLowerCase() + profile.availability.slice(1)
    : 'open to new opportunities'

  return (
    <Section id="contact" title="Contact">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.08)}
      >
        <motion.p variants={rise} className="max-w-[60ch] text-lg leading-relaxed">
          I&apos;m currently {availability}. Email is the fastest way to reach me, and I reply as
          soon as I can.
        </motion.p>

        {/* The address is the call to action: set large, so it reads at a glance and
            copies cleanly. */}
        <motion.a
          variants={rise}
          href={`mailto:${profile.email}`}
          className="mt-6 inline-block break-all text-2xl font-semibold tracking-tight text-ink underline decoration-line decoration-1 underline-offset-8 transition-colors hover:text-accent hover:decoration-accent sm:text-4xl"
        >
          {profile.email}
        </motion.a>

        <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-3">
          <ResumeButton />
          <Socials />
        </motion.div>
      </motion.div>
    </Section>
  )
}
