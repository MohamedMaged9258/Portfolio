import { useId } from 'react'
import { useParams } from 'react-router-dom'
import DetailModal from './DetailModal'
import ProjectBody from './ProjectBody'
import { getProject } from '../lib/projects'

/** Project write-up in the shared overlay shell. */
export default function ProjectModal() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined
  const titleId = useId()

  // Unreachable from the UI — cards only ever link to slugs that exist, and a typed
  // bad URL carries no background location, so it takes the full-page path where
  // ProjectDetail already renders NotFound.
  if (!project) return null

  return (
    <DetailModal titleId={titleId}>
      <ProjectBody project={project} titleId={titleId} />
    </DetailModal>
  )
}
