import { motion } from 'motion/react'
import { Mail } from 'lucide-react'
import Section from './Section'
import Socials from './Socials'
import { profile } from '../lib/profile'
import { rise, viewportOnce } from '../lib/motion'

export default function Contact() {
  const availability = profile.availability ? profile.availability.toLowerCase() : 'open to new opportunities'

  return (
    <Section id="contact" eyebrow="// contact" title="Get in touch">
      <motion.div
        className="rounded-xl border border-line bg-surface p-8 text-center"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={rise}
      >
        <p className="mx-auto max-w-xl leading-relaxed text-slate-400">
          I&apos;m currently {availability}. The fastest way to reach me is email — I&apos;ll get back to you as
          soon as I can.
        </p>

        <a
          href={`mailto:${profile.email}`}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110"
        >
          <Mail className="h-4 w-4" />
          {profile.email}
        </a>

        <div className="mt-6 flex justify-center">
          <Socials />
        </div>
      </motion.div>
    </Section>
  )
}
