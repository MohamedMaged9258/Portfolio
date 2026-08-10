import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { DUR, EASE } from '../lib/motion'

/**
 * The overlay shell shared by project and certificate detail views, shown when a card
 * is clicked in-app. The URL still becomes the detail route; a direct visit or refresh
 * on that URL renders the full page instead. See App.tsx for how the two are told apart.
 *
 * Built on the native <dialog> element rather than a hand-rolled overlay: showModal()
 * brings focus trapping, Escape handling, background inertness and blocked background
 * scrolling with it, and renders in the top layer — which matters concretely here,
 * because the site header is `sticky z-50` with backdrop-blur and so creates a stacking
 * context that a plain z-index overlay would have to fight. No manual scroll lock, for
 * that reason: hand-rolling one is how you get a layout jump on every open.
 *
 * The caller owns `useId()` and passes the same id here and to its body component, so
 * the dialog is labelled by the heading the body renders.
 */
export default function DetailModal({
  titleId,
  children,
}: {
  titleId: string
  children: ReactNode
}) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

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
      // 64rem matches the site's max-w-5xl container, so the overlay reads as the
      // same width as the page rather than an arbitrary box.
      //
      // Deliberately not a flex container, and the height cap is on the child instead:
      // the UA sheet closes a dialog with `dialog:not([open]) { display: none }`, and
      // author styles beat UA styles whatever the specificity — so a `flex` class here
      // would override that and paint the panel inline in the page for the one frame
      // before showModal() runs (useEffect fires after paint).
      className="m-auto w-[min(64rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-bg p-0 text-slate-300 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: DUR.base, ease: EASE }}
        // The body components carry `prose max-w-none` on their article, sized for the
        // full page's narrow column. At this width that would run text to ~60rem lines,
        // so the reading column is reined back in here while headings and meta stay
        // full-width.
        className="relative flex max-h-[88vh] flex-col [&_article]:max-w-3xl"
      >
        {/* Absolute against the panel, not the scroll container, so it holds position
            while content scrolls and costs no layout height — a header row would band
            the top of the panel with empty space for one button. Kept first in the DOM
            so it's the first tab stop; `overflow: auto` alone opens no stacking context,
            so z-10 is enough to keep it above the scrolling text.

            Its fill is opaque, which is load-bearing: text passes underneath and would
            otherwise show through. */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          // right-6/sm:right-8 matches the body's own p-6/sm:p-8, so the button's right
          // edge sits flush with the text column's rather than floating nearer the border.
          className="absolute right-6 top-4 z-10 grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-slate-400 transition hover:bg-elevated hover:text-accent sm:right-8"
        >
          <X className="h-4 w-4" />
        </button>

        {/* min-h-0 is required: flex children default to min-height:auto and refuse to
            shrink below their content, so without it this never scrolls and the panel
            blows past max-h instead. */}
        <div className="min-h-0 overflow-y-auto p-6 sm:p-8">{children}</div>
      </motion.div>
    </dialog>
  )
}
