import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import Home from './pages/Home'

// Home stays eager — it's the landing route. The secondary routes split off with
// @mdx-js/react and mdxComponents behind them.
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  const location = useLocation()

  /**
   * Fires between the outgoing page's exit and the incoming page's enter. Resetting
   * on pathname change instead (the old ScrollToTop) would jump the page while the
   * previous route is still animating out. In-page #anchors keep their position —
   * useScrollToHash (called from PageTransition) owns those.
   */
  const resetScroll = () => {
    if (location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={resetScroll}>
      {/* The key belongs on AnimatePresence's *direct* child, so it moved from
          <Routes> to <Suspense> when the boundary was added — keyed one level down,
          AnimatePresence sees a single unchanging child, and both the exit animation
          and the onExitComplete scroll reset stop firing.

          fallback={null} rather than a spinner: the chunks are small and same-origin,
          so anything visible here would only ever flash. */}
      <Suspense key={location.pathname} fallback={null}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}
