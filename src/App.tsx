import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'

export default function App() {
  const location = useLocation()

  /**
   * Fires between the outgoing page's exit and the incoming page's enter. Resetting
   * on pathname change instead (the old ScrollToTop) would jump the page while the
   * previous route is still animating out. In-page #anchors keep their position.
   */
  const resetScroll = () => {
    if (location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={resetScroll}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AnimatePresence>
  )
}
