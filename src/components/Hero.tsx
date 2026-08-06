import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { MapPin, ArrowUpRight } from 'lucide-react'
import Container from './Container'
import Socials from './Socials'
import ResumeButton from './ResumeButton'
import { profile } from '../lib/profile'
import { cn } from '../lib/cn'
import { EASE, rise, stagger } from '../lib/motion'

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  // mask-position isn't compositor-accelerated, so keep the sweep from repainting
  // once the hero has scrolled away. Re-entering restarts it, which reads fine.
  const scanning = useInView(ref, { amount: 0.1 })

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Both grid layers share one wrapper so the vignette mask applies to each. */}
      <motion.div
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className={cn('absolute inset-0 bg-grid-scan', scanning && 'animate-scan')} />
      </motion.div>

      <Container className="relative py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-5 lg:gap-14">
          {/* Intro */}
          <motion.div
            className="lg:col-span-3"
            initial="hidden"
            animate="show"
            variants={stagger(0.07, 0.1)}
          >
            {profile.availability && (
              <motion.span
                variants={rise}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs text-slate-400"
              >
                <span className="relative grid h-2 w-2 shrink-0 place-items-center">
                  <span className="absolute h-2 w-2 animate-probe rounded-full bg-accent" aria-hidden />
                  <span className="relative h-2 w-2 rounded-full bg-accent" />
                </span>
                {profile.availability}
              </motion.span>
            )}

            <motion.h1
              variants={rise}
              className="mt-6 text-4xl font-bold tracking-tight text-slate-50 sm:text-6xl"
            >
              {profile.name}
            </motion.h1>
            <motion.p variants={rise} className="mt-3 font-mono text-lg text-accent sm:text-xl">
              {profile.title}
            </motion.p>
            <motion.p
              variants={rise}
              className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400"
            >
              {profile.tagline}
            </motion.p>

            <motion.div
              variants={rise}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500"
            >
              <MapPin className="h-4 w-4" />
              {profile.location}
            </motion.div>

            <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110"
              >
                View projects
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <ResumeButton />
              <Socials className="ml-1" />
            </motion.div>
          </motion.div>

          {/* Portrait */}
          <motion.div
            className="lg:col-span-2 lg:order-first"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
          >
            <div className="relative mx-auto w-full max-w-[16rem] lg:max-w-none">
              {/* ambient accent glow */}
              <div className="absolute -inset-4 -z-10 rounded-full bg-accent/10 blur-3xl" aria-hidden />
              <div className="relative overflow-hidden rounded-2xl border border-line">
                <img
                  src="/Profile.png"
                  alt={`${profile.name} — portrait`}
                  loading="eager"
                  className="aspect-[3/4] w-full object-cover object-center"
                />
                {/* fade the photo into the page background */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent"
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" aria-hidden />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
