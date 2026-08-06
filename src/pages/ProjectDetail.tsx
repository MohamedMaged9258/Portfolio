import { useParams, Link, Navigate } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'
import Container from '../components/Container'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { mdxComponents } from '../components/mdxComponents'
import { getProject } from '../lib/projects'
import { cn } from '../lib/cn'

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined

  if (!project) return <Navigate to="/" replace />

  const { Component, layout, links } = project
  const isLog = layout === 'log'

  return (
    <PageTransition>
      <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/80 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 font-mono text-sm text-slate-400 transition hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            back
          </Link>
          <Link to="/" className="font-mono text-sm text-slate-300">
            mohamed<span className="text-accent">.</span>maged
          </Link>
        </Container>
      </header>

      <main>
        <Container className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <p className="eyebrow">{isLog ? '// build log' : '// case study'}</p>
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
