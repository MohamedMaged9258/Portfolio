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
  className?: string
}

export default function Section({ id, eyebrow, title, children, className }: SectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-16 sm:py-20', className)}>
      <Container>
        <motion.header
          className="mb-8"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger(0.08)}
        >
          <motion.p variants={slideIn} className="eyebrow">
            {eyebrow}
          </motion.p>
          <motion.h2 variants={rise} className="mt-2 text-2xl font-semibold sm:text-3xl">
            {title}
          </motion.h2>
        </motion.header>
        {children}
      </Container>
    </section>
  )
}
