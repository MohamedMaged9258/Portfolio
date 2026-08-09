import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation, type Location } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import Home from './pages/Home'

// Home stays eager — it's the landing route. The secondary routes split off with
// @mdx-js/react and mdxComponents behind them.
const ProjectsIndex = lazy(() => import('./pages/ProjectsIndex'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const CertificatesIndex = lazy(() => import('./pages/CertificatesIndex'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ProjectModal = lazy(() => import('./components/ProjectModal'))

export default function App() {
  const location = useLocation()

  /**
   * Set by ProjectCard on an in-app click, and only then. Its presence is what
   * distinguishes "opened from the listing" (show the write-up as an overlay, leave
   * the page behind it mounted) from a direct visit, refresh or shared link (render
   * the full ProjectDetail page).
   */
  const state = location.state as { backgroundLocation?: Location } | null
  const background = state?.backgroundLocation

  /**
   * Fires between the outgoing page's exit and the incoming page's enter. Resetting
   * on pathname change instead (the old ScrollToTop) would jump the page while the
   * previous route is still animating out. In-page #anchors keep their position —
   * useScrollToHash (called from PageTransition) owns those.
   *
   * Opening or closing the overlay doesn't reach this: the page route is unchanged,
   * so nothing exits and the listing keeps its scroll position.
   */
  const resetScroll = () => {
    if (location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }

  return (
    <>
      <AnimatePresence mode="wait" onExitComplete={resetScroll}>
        {/* The key belongs on AnimatePresence's *direct* child, so it moved from
            <Routes> to <Suspense> when the boundary was added — keyed one level down,
            AnimatePresence sees a single unchanging child, and both the exit animation
            and the onExitComplete scroll reset stop firing.

            It keys off the *background* pathname when there is one. Keyed on the raw
            location, opening the overlay would remount the page behind it — losing its
            scroll position and replaying every reveal animation.

            fallback={null} rather than a spinner: the chunks are small and same-origin,
            so anything visible here would only ever flash. */}
        <Suspense key={(background ?? location).pathname} fallback={null}>
          <Routes location={background ?? location}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectsIndex />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/certificates" element={<CertificatesIndex />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>

      {/* Overlay layer. AnimatePresence here lets the panel animate out before the
          <dialog> is removed from the DOM, which is what closes it. */}
      <AnimatePresence>
        {background && (
          <Suspense key="project-overlay" fallback={null}>
            <Routes location={location}>
              <Route path="/projects/:slug" element={<ProjectModal />} />
            </Routes>
          </Suspense>
        )}
      </AnimatePresence>
    </>
  )
}
