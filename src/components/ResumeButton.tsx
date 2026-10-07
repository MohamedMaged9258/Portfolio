import { Download } from 'lucide-react'
import { cn } from '../lib/cn'

/** Links to the compiled CV PDF placed in /public. The site's secondary button style. */
export default function ResumeButton({ className }: { className?: string }) {
  return (
    <a
      href="/Mohamed_Maged_CV.pdf"
      download
      className={cn(
        'inline-flex items-center gap-2 rounded border border-line px-3.5 py-2 text-sm font-medium text-ink transition hover:border-accent/60 hover:text-accent active:scale-[0.98]',
        className,
      )}
    >
      <Download className="h-4 w-4" />
      Résumé
    </a>
  )
}
