import { createContext, useCallback, useEffect, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'

/** Fraction of the viewport height a section's top must pass to become active. */
const LINE = 0.45

/**
 * Returns the section the reader is in, or null while the hero fills the screen.
 *
 * Active is the last section whose top has crossed a line 45% down the viewport —
 * except at the very bottom of the page, where it's the last section outright. That
 * exception is what makes the final section reachable at all: the page runs out
 * before its top can climb to the line, so a mid-viewport band left it permanently
 * behind the section above it.
 *
 * Scroll changes arrive through motion's useScroll, already in use for the header,
 * rather than a raw scroll listener. Ids that don't render (an empty Certificates
 * section) are skipped.
 *
 * `ids` must be referentially stable — define it at module scope, not inline.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  const update = useCallback(() => {
    const present = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    const root = document.documentElement
    const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 2
    if (atBottom && present.length > 0) {
      setActive(present[present.length - 1].id)
      return
    }

    const line = window.innerHeight * LINE
    const crossed = present.filter((el) => el.getBoundingClientRect().top <= line)
    setActive(crossed.length > 0 ? crossed[crossed.length - 1].id : null)
  }, [ids])

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', update)

  // Once on mount (a deep link lands mid-page with no scroll event to follow), and
  // whenever the viewport resizes, which moves both the line and the page bottom.
  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  return active
}

/**
 * The active section id for the current page, provided once by Home so the header
 * nav and each section's rail heading read the same answer. Pages without the
 * provider get null, i.e. no section is active.
 */
export const ActiveSectionContext = createContext<string | null>(null)
