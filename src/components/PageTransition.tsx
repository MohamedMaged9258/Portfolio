import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE } from '../lib/motion'
import { useScrollToHash } from '../lib/useScrollToHash'

/**
 * Root wrapper for each route, crossfaded by AnimatePresence in App.
 *
 * Opacity only, deliberately: a transform here would make the page root a
 * containing block for the sticky nav and a new backdrop root for its blur.
 *
 * Also the hook site for hash scrolling — this mounts with the page it wraps, so
 * the target section exists by the time the effect runs. See useScrollToHash.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  useScrollToHash()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
