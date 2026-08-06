import type { Variants } from 'motion/react'

/**
 * Shared motion vocabulary. Every reveal on the site pulls its timing from here
 * so the whole page moves on one curve — don't reach for ad-hoc durations in
 * components. Mirrors --ease-signal / --animate-* in index.css.
 */

/** expo-out: arrives fast, settles. Typed as a tuple or motion's Easing rejects it. */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const DUR = { micro: 0.16, base: 0.32, reveal: 0.6, draw: 0.9 }

export const rise: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.reveal, ease: EASE } },
}

export const slideIn: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: DUR.reveal, ease: EASE } },
}

/** Smaller, faster sibling of `rise` for chips, pills and list bullets. */
export const pop: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
}

/** `rise`, but also staggers its own motion descendants — for nested sequences. */
export const riseStagger = (each = 0.04): Variants => ({
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: EASE, staggerChildren: each },
  },
})

/** Vertical rail draw, for the Experience trace waterfall. Needs `origin-top`. */
export const drawY: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: DUR.draw, ease: EASE } },
}

/** One-shot liveness probe: a disc that expands past its anchor and fades out. */
export const probeOnce: Variants = {
  hidden: { scale: 1, opacity: 0.55 },
  show: { scale: 2.6, opacity: 0, transition: { duration: 1.1, ease: 'easeOut' } },
}

export const stagger = (each = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: each, delayChildren: delay } },
})

/**
 * Reveal trigger for scroll-in sections.
 *
 * The huge top margin is load-bearing, not a style choice. It extends the observer's
 * root far above the viewport so anything already scrolled past counts as in view.
 * Without it, a hard jump (a deep link with a #hash, or the browser restoring scroll
 * on reload) moves a section straight from below-the-fold to above-the-viewport
 * without it ever being reported as intersecting — so with `once: true` the reveal
 * never fires and the section is stranded at opacity 0.
 *
 * Measured, not assumed: dropping the top margin to 0px and hard-jumping to the page
 * bottom leaves all four passed sections at opacity 0. A bare observer fires
 * [false] across that jump, versus [false, true] with the margin in place.
 *
 * The -10% bottom keeps the intended "reveal just after it enters" timing scrolling
 * down. `as const` keeps `margin` a literal — motion's MarginType rejects a widened
 * string.
 */
export const viewportOnce = { once: true, amount: 0.25, margin: '9999px 0px -10% 0px' } as const
