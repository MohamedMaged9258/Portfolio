import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'

/**
 * The site mark — "M" tile plus the wordmark — and the single owner of what
 * clicking it does. Both headers render this, so the two can't drift apart.
 *
 * On the home route a plain <Link to="/"> is inert: the path already matches, so
 * nothing remounts and App's scroll reset (which rides AnimatePresence's exit)
 * never fires. Intercept and scroll ourselves; elsewhere the Link navigates home,
 * where that same reset lands us at the top anyway.
 */
export default function Wordmark({ className }: { className?: string }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Let the browser own new-tab/new-window clicks.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    if (pathname !== '/') return

    e.preventDefault()
    // Drops a lingering #contact so the URL matches where we actually end up.
    // pathname is unchanged, so AnimatePresence's key holds and nothing remounts.
    navigate('/', { replace: true })
    // No `behavior`: it resolves to the computed scroll-behavior, which index.css
    // sets to smooth and flips to auto under prefers-reduced-motion. Hardcoding
    // 'smooth' here would override that opt-out.
    window.scrollTo({ top: 0, left: 0 })
  }

  return (
    <Link
      to="/"
      onClick={handleClick}
      className={cn('inline-flex items-center gap-2 font-mono text-sm text-slate-200', className)}
    >
      <span className="grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-accent">
        M
      </span>
      {/* Hidden below sm, but kept in the accessibility tree — as `hidden sm:inline`
          the link's entire accessible name on a phone was the letter "M". */}
      <span className="sr-only sm:not-sr-only">Mohamed Maged</span>
    </Link>
  )
}
