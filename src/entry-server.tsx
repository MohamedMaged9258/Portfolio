import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import { StaticRouter } from 'react-router'
import { MotionConfig } from 'motion/react'
import App from './App'

/**
 * Build-time render target for scripts/prerender.mjs. Mirrors src/main.tsx's provider
 * stack so the markup this produces is what hydrateRoot expects to find.
 *
 * Two deliberate differences from main.tsx:
 *
 * - StaticRouter instead of BrowserRouter. It carries no location.state, so App's
 *   `backgroundLocation` check is always false and every route renders as its full
 *   page rather than the overlay — which is exactly what a crawler should be served.
 * - No CSS imports. index.css and the fontsource packages are pulled in by the client
 *   entry and land in dist/index.html as a <link> from the client build; importing them
 *   here would only add unusable assets to the SSR bundle. Styles cannot affect the
 *   markup string this returns.
 */
export async function render(url: string): Promise<string> {
  /**
   * prerender, not renderToString. Five of the six routes in App.tsx are React.lazy —
   * renderToString hits their Suspense boundary, emits `fallback={null}`, and returns an
   * *empty string* for every route except "/". The static APIs wait for all Suspense to
   * settle before resolving, which is the whole reason this file exists.
   *
   * The web-stream variant rather than prerenderToNodeStream: its prelude is a standard
   * ReadableStream, which types cleanly against the DOM lib without pulling in @types/node.
   */
  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouter location={url}>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </StaticRouter>
    </StrictMode>,
  )

  // Decoded incrementally with stream:true so a multi-byte character split across two
  // chunks (the copy is full of em dashes) doesn't get mangled into replacement chars.
  const reader = prelude.getReader()
  const decoder = new TextDecoder()
  let html = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    html += decoder.decode(value, { stream: true })
  }
  return html + decoder.decode()
}
