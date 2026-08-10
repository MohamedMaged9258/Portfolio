import Container from './Container'
import { profile } from '../lib/profile'

export default function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <Container className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        {/* The year is baked in at prerender time, so a visitor loading a build made
            before New Year would otherwise trip a hydration mismatch on this text node.
            Keeping the built year is the honest answer for a static page anyway — it
            says when the site was published, not when you happened to open it. */}
        <p className="font-mono text-xs text-slate-500" suppressHydrationWarning>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="font-mono text-xs text-slate-600">
          Built with React, Vite &amp; Tailwind · Deployed on Cloudflare
        </p>
      </Container>
    </footer>
  )
}
