import { Download } from 'lucide-react'
import { cn } from '../lib/cn'

/** Links to the compiled CV PDF placed in /public. */
export default function ResumeButton({ className }: { className?: string }) {
  return (
    <a
      href="/Mohamed_Maged_CV.pdf"
      download
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-accent/50 hover:text-accent',
        className,
      )}
    >
      <Download className="h-4 w-4" />
      Résumé
    </a>
  )
}
