import type { ReactNode } from 'react'
import Container from './Container'
import { cn } from '../lib/cn'

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
        <header className="mb-8">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
        </header>
        {children}
      </Container>
    </section>
  )
}
