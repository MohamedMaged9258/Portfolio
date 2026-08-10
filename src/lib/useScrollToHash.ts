import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to `location.hash` after a route commits. React Router's declarative
 * mode doesn't handle fragments at all, so without this `/#projects` navigates
 * but never moves the page.
 *
 * Call it from PageTransition, not App. AnimatePresence runs `mode="wait"`, so the
 * incoming page mounts a beat after the location changes — an effect in App would
 * fire while the target section is still unmounted. PageTransition is rendered by
 * each page, so its effect runs once that page's DOM exists. That also covers a
 * hard refresh on a deep link, where the browser's native fragment scroll happens
 * before React has rendered anything.
 */
export function useScrollToHash() {
  const { hash, key } = useLocation()

  useEffect(() => {
    if (!hash) return

    // `key` is in the deps on purpose. Clicking "About" while already at /#about
    // produces an identical URL, but Router still pushes a fresh key — without it
    // the effect wouldn't re-run and the link would be dead after the first click.
    const id = decodeURIComponent(hash.slice(1))
    // A frame's grace so the section has been laid out before we measure it.
    const raf = requestAnimationFrame(() => {
      // No `behavior` — inherits smooth from CSS, instant under reduced motion.
      // scrollIntoView honours the sections' scroll-mt-20, clearing the sticky header.
      document.getElementById(id)?.scrollIntoView()
    })
    return () => cancelAnimationFrame(raf)
  }, [hash, key])
}
