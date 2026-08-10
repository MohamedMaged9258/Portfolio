import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import Container from './Container'
import { cn } from '../lib/cn'
import { rise, slideIn, stagger, viewportOnce } from '../lib/motion'

interface SectionProps {
  id: string
  eyebrow: string
  title: string
  children: ReactNode
  /** Optional trailing control on the header row — e.g. a "View all →" link. */
  action?: ReactNode
  className?: string
}

export default function Section({
  id,
  eyebrow,
  title,
  children,
  action,
  className,
}: SectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-16 sm:py-20', className)}>
      <Container>
        <motion.header
          className="mb-8 flex items-end justify-between gap-4"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger(0.08)}
        >
          <div>
            <motion.p variants={slideIn} className="eyebrow">
              {eyebrow}
            </motion.p>
            <motion.h2 variants={rise} className="mt-2 text-2xl font-semibold sm:text-3xl">
              {title}
            </motion.h2>
          </div>
          {/* Given its own variant so it joins the header stagger rather than being
              the one element on the row that appears unanimated. */}
          {action && (
            <motion.div variants={rise} className="shrink-0">
              {action}
            </motion.div>
          )}
        </motion.header>
        {children}
      </Container>
    </section>
  )
}
