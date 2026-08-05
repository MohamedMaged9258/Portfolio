import Container from './Container'
import { profile } from '../lib/profile'

export default function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <Container className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="font-mono text-xs text-slate-500">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="font-mono text-xs text-slate-600">
          Built with React, Vite &amp; Tailwind · Deployed on Cloudflare Pages
        </p>
      </Container>
    </footer>
  )
}
