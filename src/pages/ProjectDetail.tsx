import { useParams, Link } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'
import Container from '../components/Container'
import Footer from '../components/Footer'
import SiteHeader from '../components/SiteHeader'
import PageTransition from '../components/PageTransition'
import { mdxComponents } from '../components/mdxComponents'
import NotFound from './NotFound'
import { getProject } from '../lib/projects'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { profile } from '../lib/profile'
import { cn } from '../lib/cn'

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
function ProjectPage({ project }: { project: NonNullable<ReturnType<typeof getProject>> }) {
  const { Component, layout, links } = project
  const isLog = layout === 'log'

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
            {/* Back sits with the article, not in the bar — the shared header already
                carries the full nav and a third cluster crowded it. */}
            <Link
              to="/#projects"
              className="inline-flex items-center gap-2 font-mono text-sm text-slate-400 transition hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              back to projects
            </Link>

            <p className="eyebrow mt-8">{isLog ? '// build log' : '// case study'}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              {project.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">{project.summary}</p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {project.stack.map((t) => (
                <span
                  key={t}
                  className="rounded border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-slate-400"
                >
                  {t}
                </span>
              ))}
            </div>

            {links && (links.github || links.live) && (
              <div className="mt-5 flex flex-wrap items-center gap-4">
                {links.github && (
                  <a
                    href={links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-accent"
                  >
                    <FaGithub className="h-4 w-4" />
                    Source
                  </a>
                )}
                {links.live && (
                  <a
                    href={links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-accent"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Live
                  </a>
                )}
              </div>
            )}

            <hr className="mt-8 border-line" />

            <article
              className={cn(
                'prose prose-invert mt-8 max-w-none',
                'prose-headings:font-semibold prose-headings:text-slate-100',
                'prose-a:text-accent prose-a:no-underline hover:prose-a:underline',
                'prose-strong:text-slate-100',
                'prose-code:text-cyan-300 prose-code:before:content-none prose-code:after:content-none',
                'prose-pre:border prose-pre:border-line prose-pre:bg-surface',
                isLog && 'lg:prose-lg',
              )}
            >
              <MDXProvider components={mdxComponents}>
                <Component />
              </MDXProvider>
            </article>
          </div>
        </Container>
      </main>
      <Footer />
    </PageTransition>
  )
}
