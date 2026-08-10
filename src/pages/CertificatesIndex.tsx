import { motion } from 'motion/react'
import Container from '../components/Container'
import Footer from '../components/Footer'
import SiteHeader from '../components/SiteHeader'
import PageTransition from '../components/PageTransition'
import CertificateCard from '../components/CertificateCard'
import { certificates } from '../lib/certificates'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { profile } from '../lib/profile'
import { rise, slideIn, stagger, viewportOnce } from '../lib/motion'

export default function CertificatesIndex() {
  useDocumentMeta({
    title: `Certificates — ${profile.name}`,
    description: `Courses and credentials completed by ${profile.name}.`,
    path: '/certificates',
    // A listing with nothing on it is a thin page, and while the collection is empty
    // nothing links here either. Keep it out of the index until it has content — this
    // mirrors what scripts/prerender.mjs writes into the served HTML.
    noindex: certificates.length === 0,
  })

  return (
    <PageTransition>
      <SiteHeader />

      <main>
        <Container className="py-12 sm:py-16">
          <motion.header
            className="mb-10"
            initial="hidden"
            animate="show"
            variants={stagger(0.08)}
          >
            <motion.p variants={slideIn} className="eyebrow">
              // certificates
            </motion.p>
            <motion.h1
              variants={rise}
              className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl"
            >
              Certificates
            </motion.h1>
          </motion.header>

          {/* The route stays reachable while the collection is empty — only the nav
              tab and the homepage section hide themselves. */}
          {certificates.length === 0 ? (
            <p className="text-lg leading-relaxed text-slate-400">Nothing here yet.</p>
          ) : (
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              variants={stagger(0.08)}
            >
              {certificates.map((c) => (
                <CertificateCard key={c.slug} certificate={c} />
              ))}
            </motion.div>
          )}
        </Container>
      </main>
      <Footer />
    </PageTransition>
  )
}
