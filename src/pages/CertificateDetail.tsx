import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Container from '../components/Container'
import Footer from '../components/Footer'
import SiteHeader from '../components/SiteHeader'
import PageTransition from '../components/PageTransition'
import CertificateBody from '../components/CertificateBody'
import NotFound from './NotFound'
import { getCertificate, type Certificate } from '../lib/certificates'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { profile } from '../lib/profile'

/**
 * The full-page view of a certificate. Reached by a direct visit, a refresh or a shared
 * link — an in-app card click gets CertificateModal instead, over the listing.
 *
 * This route resolves for every certificate, including ones with no write-up whose
 * cards aren't clickable: a shared or typed URL should land on something rather than
 * 404.
 */
export default function CertificateDetail() {
  const { slug } = useParams()
  const certificate = slug ? getCertificate(slug) : undefined

  if (!certificate) return <NotFound />

  return <CertificatePage certificate={certificate} />
}

/**
 * Split out so useDocumentMeta sits above the missing-certificate bail — calling it in
 * CertificateDetail would put a hook after a conditional return.
 */
function CertificatePage({ certificate }: { certificate: Certificate }) {
  useDocumentMeta({
    title: `${certificate.title} — ${profile.name}`,
    description: certificate.summary,
    path: `/certificates/${certificate.slug}`,
  })

  return (
    <PageTransition>
      <SiteHeader />

      <main id="main" tabIndex={-1} className="outline-none">
        <Container className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <Link
              to="/certificates"
              className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-slate-400 transition hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              back to certificates
            </Link>

            <CertificateBody certificate={certificate} />
          </div>
        </Container>
      </main>
      <Footer />
    </PageTransition>
  )
}
