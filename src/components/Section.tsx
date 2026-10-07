import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import Container from './Container'
import { cn } from '../lib/cn'
import { rise, stagger, viewportOnce } from '../lib/motion'

interface SectionProps {
  id: string
  title: string
  children: ReactNode
  /** Optional control under the heading — e.g. a "View all →" link. */
  action?: ReactNode
  className?: string
}

/**
 * The home page's section frame: a hairline across the top, the heading in a narrow
 * left rail that stays pinned while the content beside it scrolls. Below lg the rail
 * collapses and the heading sits above the content, with the action beside it.
 */
export default function Section({ id, title, children, action, className }: SectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-20 border-t border-line py-16 sm:py-20', className)}>
      <Container className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <motion.header
          className="flex items-baseline justify-between gap-4 lg:col-span-3 lg:sticky lg:top-24 lg:flex-col lg:justify-start lg:self-start"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger(0.08)}
        >
          <motion.h2 variants={rise} className="text-lg font-semibold tracking-tight">
            {title}
          </motion.h2>
          {/* Given its own variant so it joins the header stagger rather than being
              the one element on the row that appears unanimated. */}
          {action && (
            <motion.div variants={rise} className="shrink-0">
              {action}
            </motion.div>
          )}
        </motion.header>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </Container>
    </section>
  )
}
