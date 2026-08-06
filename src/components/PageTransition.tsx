import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE } from '../lib/motion'

/**
 * Root wrapper for each route, crossfaded by AnimatePresence in App.
 *
 * Opacity only, deliberately: a transform here would make the page root a
 * containing block for the sticky nav and a new backdrop root for its blur.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
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
