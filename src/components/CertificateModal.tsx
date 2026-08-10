import { useId } from 'react'
import { useParams } from 'react-router-dom'
import DetailModal from './DetailModal'
import CertificateBody from './CertificateBody'
import { getCertificate } from '../lib/certificates'

/** Certificate write-up in the shared overlay shell. */
export default function CertificateModal() {
  const { slug } = useParams()
  const certificate = slug ? getCertificate(slug) : undefined
  const titleId = useId()

  // Unreachable from the UI — only certificates with a body get a clickable card, and
  // a typed URL carries no background location, so it takes the full-page path.
  if (!certificate) return null

  return (
    <DetailModal titleId={titleId}>
      <CertificateBody certificate={certificate} titleId={titleId} />
    </DetailModal>
  )
}
