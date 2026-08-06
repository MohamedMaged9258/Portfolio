import { useEffect, useState } from 'react'

/**
 * Returns whichever section id currently crosses the middle band of the viewport,
 * or null when none does (i.e. while the hero fills the screen).
 *
 * The rootMargin collapses the observation window to a horizontal strip across the
 * viewport's middle, so "active" tracks what the reader is actually looking at
 * rather than whatever happens to be partly on screen.
 *
 * `ids` must be referentially stable — define it at module scope, not inline.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // Resolve in document order so the result doesn't depend on callback order.
        setActive(ids.find((id) => visible.has(id)) ?? null)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}
