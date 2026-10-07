import { useState, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, X } from 'lucide-react'
import Socials from './Socials'
import ResumeButton from './ResumeButton'
import Wordmark from './Wordmark'
import { cn } from '../lib/cn'
import { DUR, EASE } from '../lib/motion'
import { useActiveSection } from '../lib/useActiveSection'
import { featuredCertificates } from '../lib/certificates'

interface NavItem {
  /** Absolute and used verbatim — see the note below on why it isn't interpolated. */
  to: string
  label: string
  /** Present only for links that target a homepage section. */
  sectionId?: string
}

/**
 * Every item targets a homepage section — the nav is a tour of the home page, and
 * the full /projects and /certificates listings are reached from each section's
 * "View all" link rather than from here. The NavItem shape still supports plain page
 * links (omit `sectionId`) should one be wanted later.
 *
 * `to` holds the complete target rather than a bare "#about" the component prefixes.
 * The old shape built links as `/${item.href}`, which is correct only for a
 * "#"-prefixed value — a "/certificates" entry through it yielded "//certificates", a
 * protocol-relative URL that points at an entirely different host.
 */
const allNavItems: NavItem[] = [
  { to: '/#about', label: 'About', sectionId: 'about' },
  { to: '/#experience', label: 'Experience', sectionId: 'experience' },
  { to: '/#projects', label: 'Projects', sectionId: 'projects' },
  { to: '/#certificates', label: 'Certificates', sectionId: 'certificates' },
  { to: '/#skills', label: 'Skills', sectionId: 'skills' },
  { to: '/#contact', label: 'Contact', sectionId: 'contact' },
]

// Gated on *featured* certificates, not all of them: this link points at the homepage
// section, which itself only renders when there's something featured to put in it.
// A tab scrolling to a section that isn't there would be a dead link.
const navItems = allNavItems.filter(
  (item) => item.sectionId !== 'certificates' || featuredCertificates.length > 0,
)

/** Module scope keeps the identity stable so useActiveSection's effect runs once. */
const sectionIds = navItems
  .map((item) => item.sectionId)
  .filter((id): id is string => id !== undefined)

/**
 * The one header, on every route.
 *
 * Section links are router <Link>s rather than bare `href="#about"` anchors, even on
 * the home route. A bare anchor scrolls natively *and* updates location.hash, which
 * would set useScrollToHash off as well — two scrolls racing. Link preventDefaults,
 * leaving that hook as the only thing that moves the page. It also means the links
 * work from a project page, where they now navigate home first.
 *
 * On non-home routes useActiveSection finds no sections and returns null, so no
 * underline shows — which is correct there.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection(sectionIds)
  const { pathname } = useLocation()

  /**
   * Section links track the scroll position; page links track the URL. The two can't
   * both win — on "/" no page link matches, and on a page route useActiveSection
   * finds no sections and returns null. The prefix test keeps Projects lit while the
   * detail overlay is open at /projects/<slug>.
   */
  const isActive = (item: NavItem) =>
    item.sectionId
      ? active === item.sectionId
      : pathname === item.to || pathname.startsWith(`${item.to}/`)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 8))

  // At the top the header dissolves into the hero; the open menu needs the solid
  // backing regardless of scroll position.
  const solid = scrolled || open

  // Moves focus without touching the URL: a bare href="#main" would set
  // location.hash and send useScrollToHash scrolling as well.
  const skipToMain = (e: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById('main')
    if (!main) return
    e.preventDefault()
    main.focus({ preventScroll: true })
    main.scrollIntoView()
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        solid ? 'border-line bg-bg/85 backdrop-blur' : 'border-transparent',
      )}
    >
      <a
        href="#main"
        onClick={skipToMain}
        className="sr-only rounded bg-accent px-3 py-2 text-sm font-semibold text-bg focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10"
      >
        Skip to content
      </a>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Wordmark />

        {/* lg, not md: six items plus Socials plus Résumé overflow the max-w-6xl bar
            at 768px, so the 768–1024px band gets the mobile menu instead. */}
        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const activeItem = isActive(item)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={activeItem ? 'true' : undefined}
                className={cn(
                  'relative rounded px-3 py-2 text-sm transition-colors',
                  activeItem ? 'text-ink' : 'text-ink-muted hover:text-ink',
                )}
              >
                {item.label}
                {activeItem && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-px bg-accent"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Socials />
          <ResumeButton />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded text-ink-muted transition hover:bg-surface hover:text-ink lg:hidden"
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
            className="overflow-hidden lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="border-t border-line bg-bg">
              <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
                <div className="flex flex-col">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'rounded px-2 py-2.5 text-sm transition hover:bg-surface hover:text-ink',
                        isActive(item) ? 'text-ink' : 'text-ink-muted',
                      )}
                    >
                      {item.label}
                    </Link>
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
