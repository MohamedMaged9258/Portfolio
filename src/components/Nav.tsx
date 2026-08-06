import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, X } from 'lucide-react'
import Socials from './Socials'
import ResumeButton from './ResumeButton'
import { cn } from '../lib/cn'
import { DUR, EASE } from '../lib/motion'
import { useActiveSection } from '../lib/useActiveSection'

const sections = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

/** Module scope keeps the identity stable so useActiveSection's effect runs once. */
const sectionIds = sections.map((s) => s.href.slice(1))

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection(sectionIds)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 8))

  // At the top the header dissolves into the hero; the open menu needs the solid
  // backing regardless of scroll position.
  const solid = scrolled || open

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        solid ? 'border-line/70 bg-bg/80 backdrop-blur' : 'border-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-sm text-slate-200">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-accent">M</span>
          <span className="hidden sm:inline">
            mohamed<span className="text-accent">.</span>maged
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {sections.map((s) => {
            const isActive = active === s.href.slice(1)
            return (
              <a
                key={s.href}
                href={s.href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative rounded-md px-3 py-2 text-sm transition-colors',
                  isActive ? 'text-slate-100' : 'text-slate-400 hover:text-slate-100',
                )}
              >
                {s.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-px bg-accent"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
              </a>
            )
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Socials />
          <ResumeButton />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-300 transition hover:bg-elevated md:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? 'close' : 'menu'}
              className="inline-flex"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: DUR.micro, ease: EASE }}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-menu"
            // The border lives on the inner wrapper — on this collapsing element it
            // would still paint a stray 1px rule at height 0.
            className="overflow-hidden md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="border-t border-line bg-bg">
              <div className="mx-auto max-w-5xl px-5 py-4 sm:px-8">
                <div className="flex flex-col">
                  {sections.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-2 py-2.5 text-sm text-slate-300 transition hover:bg-elevated hover:text-white"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <Socials />
                  <ResumeButton />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
