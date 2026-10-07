import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Container from '../components/Container'
import Footer from '../components/Footer'
import SiteHeader from '../components/SiteHeader'
import PageTransition from '../components/PageTransition'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { profile } from '../lib/profile'

/**
 * Any URL with no prerendered file — a mistyped path or an unknown slug alike — is
 * served as dist/404.html with a genuine 404 status by wrangler.jsonc, and this app
 * boots inside it. ProjectDetail and CertificateDetail also render this directly when
 * in-app routing lands on a slug that doesn't exist. The noindex is belt-and-braces
 * for the second case, which carries whatever status its background page had.
 */
export default function NotFound() {
  // The real path, not a made-up "/404" — this also renders for a bad project slug,
  // and a canonical pointing at a URL that doesn't exist would be its own small lie.
  const { pathname } = useLocation()

  useDocumentMeta({
    title: `404 — ${profile.name}`,
    description: 'That page does not exist.',
    path: pathname,
    noindex: true,
  })

  return (
    <PageTransition>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <p className="eyebrow">// 404</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            No route here
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-400">
            That page doesn&apos;t exist — it may have moved, or the link was mistyped.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </Container>
      </main>
      <Footer />
    </PageTransition>
  )
}
