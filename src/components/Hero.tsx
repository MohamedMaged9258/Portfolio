import { MapPin, ArrowUpRight } from 'lucide-react'
import Container from './Container'
import Socials from './Socials'
import ResumeButton from './ResumeButton'
import { profile } from '../lib/profile'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        aria-hidden
      />
      <Container className="relative py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-5 lg:gap-14">
          {/* Intro */}
          <div className="lg:col-span-3">
            {profile.availability && (
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs text-slate-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                {profile.availability}
              </span>
            )}

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-50 sm:text-6xl">
              {profile.name}
            </h1>
            <p className="mt-3 font-mono text-lg text-accent sm:text-xl">{profile.title}</p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">{profile.tagline}</p>

            <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110"
              >
                View projects
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <ResumeButton />
              <Socials className="ml-1" />
            </div>
          </div>

          {/* Portrait */}
          <div className="lg:col-span-2">
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
          </div>
        </div>
      </Container>
    </section>
  )
}
