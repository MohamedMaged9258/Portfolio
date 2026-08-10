import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './App'

// hydrateRoot, not createRoot: scripts/prerender.mjs ships real markup inside #root for
// every route, so this adopts that DOM instead of discarding and rebuilding it. The tree
// below must stay in step with src/entry-server.tsx or hydration will mismatch.
hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <BrowserRouter>
      {/* Drops transform and layout animations when the OS asks for reduced motion,
          keeping opacity so every reveal still resolves to visible. The CSS-only
          pieces (scan sweep, probe ring, smooth scroll) are guarded in index.css. */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
