import { motion } from 'motion/react'
import Section from './Section'
import CertificateCard from './CertificateCard'
import ViewAllLink from './ViewAllLink'
import { featuredCertificates } from '../lib/certificates'
import { stagger, viewportOnce } from '../lib/motion'

export default function Certificates() {
  // Drops the whole section rather than rendering an empty grid. Adding a featured
  // entry to data/certificates/ brings it back with no code change.
  if (featuredCertificates.length === 0) return null

  return (
    <Section
      id="certificates"
      title="Certificates"
      action={<ViewAllLink to="/certificates" label="View all" />}
    >
      <motion.div
        className="grid border-l border-t border-line sm:grid-cols-2"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.08)}
      >
        {featuredCertificates.map((c) => (
          <CertificateCard key={c.slug} certificate={c} />
        ))}
      </motion.div>
    </Section>
  )
}
