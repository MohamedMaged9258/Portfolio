import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Container from '../components/Container'
import Footer from '../components/Footer'
import SiteHeader from '../components/SiteHeader'
import PageTransition from '../components/PageTransition'
import ProjectBody from '../components/ProjectBody'
import NotFound from './NotFound'
import { getProject } from '../lib/projects'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { profile } from '../lib/profile'
import type { Project } from '../lib/projects'

/**
 * The full-page view of a project. Reached by a direct visit, a refresh or a shared
 * link — an in-app card click gets ProjectModal instead, over the listing. Both
 * render the same ProjectBody.
 */
export default function ProjectDetail() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined

  // An unknown slug says so rather than silently teleporting home, which left the
  // reader with no idea the link was broken.
  if (!project) return <NotFound />

  return <ProjectPage project={project} />
}

/**
 * Split out so useDocumentMeta sits above the missing-project bail — calling it in
 * ProjectDetail would put a hook after a conditional return.
 */
function ProjectPage({ project }: { project: Project }) {
  useDocumentMeta({
    title: `${project.title} — ${profile.name}`,
    description: project.summary,
    path: `/projects/${project.slug}`,
  })

  return (
    <PageTransition>
      <SiteHeader />

      <main>
        <Container className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <Link
              to="/projects"
              className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-slate-400 transition hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              back to projects
            </Link>

            <ProjectBody project={project} />
          </div>
        </Container>
      </main>
      <Footer />
    </PageTransition>
  )
}
