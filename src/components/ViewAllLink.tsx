import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/** Header-row link from a homepage preview section to its full listing. */
export default function ViewAllLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 font-mono text-sm text-ink-muted transition-colors hover:text-accent"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
