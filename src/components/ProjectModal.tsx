import { useEffect, useId, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import ProjectBody from './ProjectBody'
import { getProject } from '../lib/projects'
import { DUR, EASE } from '../lib/motion'

/**
 * Project write-up in an overlay, shown when a card is clicked in-app. The URL still
 * becomes /projects/<slug>; a direct visit or refresh on that URL renders the full
 * ProjectDetail page instead. See App.tsx for how the two are told apart.
 *
 * Built on the native <dialog> element rather than a hand-rolled overlay: showModal()
 * brings focus trapping, Escape handling, background inertness and blocked background
 * scrolling with it, and renders in the top layer — which matters concretely here,
 * because the site header is `sticky z-50` with backdrop-blur and so creates a stacking
 * context that a plain z-index overlay would have to fight. No manual scroll lock, for
 * that reason: hand-rolling one is how you get a layout jump on every open.
 */
export default function ProjectModal() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // Capture the trigger before showModal() moves focus. <dialog> restores focus on
    // close(), but AnimatePresence unmounts this one rather than closing it, so the
    // restore is done by hand in the cleanup.
    const opener = document.activeElement as HTMLElement | null

    // Guarded: showModal() on an already-open dialog throws InvalidStateError, which
    // StrictMode's double-invoked effects would otherwise trigger on every open.
    if (!dialog.open) dialog.showModal()

    return () => {
      // Closing explicitly (rather than relying on removal) is what keeps the
      // StrictMode mount → unmount → mount cycle from hitting the throw above.
      if (dialog.open) dialog.close()
      opener?.focus?.()
    }
  }, [])

  // Unreachable from the UI — cards only ever link to slugs that exist, and a typed
  // bad URL carries no background location, so it takes the full-page path where
  // ProjectDetail already renders NotFound.
  if (!project) return null

  // Close through the router so the URL returns to the listing. Going back through
  // history rather than pushing means the browser Back button closes it too.
  const close = () => navigate(-1)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Escape: stop the browser closing the element outright, or it would vanish
        // without the exit animation and leave the URL on the detail route.
        e.preventDefault()
        close()
      }}
      onClick={(e) => {
        // The backdrop is not a child, so clicks on it land on the dialog itself.
        if (e.target === dialogRef.current) close()
      }}
      className="m-auto max-h-[85vh] w-[min(46rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-line bg-bg p-0 text-slate-300 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: DUR.base, ease: EASE }}
        className="relative p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="sticky top-0 z-10 -mt-2 ml-auto grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-slate-400 transition hover:bg-elevated hover:text-accent"
        >
          <X className="h-4 w-4" />
        </button>

        <ProjectBody project={project} titleId={titleId} />
      </motion.div>
    </dialog>
  )
}
