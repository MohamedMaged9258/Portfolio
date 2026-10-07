import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import Container from './Container'
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

      <Container className="relative pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Intro: availability, name, one line of subtext, two actions. Location and
              socials live in About and the header so the hero stays one moment. */}
          <motion.div
            className="lg:col-span-7"
            initial="hidden"
            animate="show"
            variants={stagger(0.07, 0.1)}
          >
            {profile.availability && (
              <motion.p
                variants={rise}
                className="inline-flex items-center gap-2.5 font-mono text-xs text-ink-subtle"
              >
                {/* The one status dot on the site: it states a real availability flag. */}
                <span className="relative grid h-2 w-2 shrink-0 place-items-center">
                  <span className="absolute h-2 w-2 animate-probe rounded-full bg-accent" aria-hidden />
                  <span className="relative h-2 w-2 rounded-full bg-accent" />
                </span>
                {profile.availability}
              </motion.p>
            )}

            <motion.h1
              variants={rise}
              className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
            >
              {profile.name}
            </motion.h1>
            <motion.p variants={rise} className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-muted">
              <span className="text-ink">{profile.title}.</span> {profile.tagline}
            </motion.p>

            <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-3">
              {/* A Link, not an anchor: a bare href="#projects" would scroll natively
                  and set location.hash, racing useScrollToHash's own scroll. */}
              <Link
                to="/#projects"
                className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:brightness-110 active:scale-[0.98]"
              >
                View projects
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <ResumeButton />
            </motion.div>
          </motion.div>

          {/* Portrait */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
          >
            <div className="relative mx-auto w-full max-w-[15rem] overflow-hidden rounded border border-line sm:max-w-[18rem] lg:ml-auto lg:mr-0 lg:max-w-sm">
              {/* alt carries the job title, not the word "portrait": it is the label
                  Google Images matches against, and the query worth winning is the name
                  plus a qualifier. Intrinsic dimensions and fetchPriority mark this as
                  the page's principal image rather than decoration — aspect-[3/4] still
                  drives the rendered size, so layout is unchanged. */}
              <img
                src="/Profile.png"
                alt={`${profile.name}, ${profile.title}`}
                width={848}
                height={1264}
                loading="eager"
                fetchPriority="high"
                className="aspect-[3/4] w-full object-cover object-center"
              />
              {/* fade the photo into the page background */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent"
                aria-hidden
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
