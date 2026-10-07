import { MDXProvider } from '@mdx-js/react'
import { ExternalLink } from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa6'
import { mdxComponents } from './mdxComponents'
import type { Project } from '../lib/projects'
import { cn } from '../lib/cn'

/**
 * The write-up itself — everything from the meta line down through the MDX body,
 * with no page chrome. Rendered by both ProjectDetail (full page) and ProjectModal
 * (overlay) so the two views can't drift apart.
 *
 * `titleId` is wired to the overlay's aria-labelledby; the full page has no use for
 * it, and it's harmless there.
 */
export default function ProjectBody({
  project,
  titleId,
}: {
  project: Project
  titleId?: string
}) {
  const { Component, layout, links } = project
  const isLog = layout === 'log'

  return (
    <>
      <p className="font-mono text-xs text-ink-subtle">
        {isLog ? 'Build log' : 'Case study'} / {project.date}
      </p>
      <h1 id={titleId} className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {project.title}
      </h1>
      <p className="mt-4 max-w-[65ch] text-lg leading-relaxed">{project.summary}</p>

      <p className="mt-4 font-mono text-xs text-ink-subtle">{project.stack.join(' / ')}</p>

      {links && (links.github || links.live || links.linkedin) && (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {links.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-ink transition hover:text-accent"
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
              className="inline-flex items-center gap-2 text-sm text-ink transition hover:text-accent"
            >
              <ExternalLink className="h-4 w-4" />
              Live
            </a>
          )}
          {links.linkedin && (
            <a
              href={links.linkedin}
              target="_blank"
              // Plain noreferrer, not the rel="me" Socials.tsx uses: "me" claims the target
              // is another profile of the same person, and a post *about* the project isn't
              // an identity claim. The subjectOf node in prerender.mjs states the real relation.
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-ink transition hover:text-accent"
            >
              <FaLinkedinIn className="h-4 w-4" />
              LinkedIn
            </a>
          )}
        </div>
      )}

      <hr className="mt-8 border-line" />

      <article
        className={cn(
          'prose prose-invert mt-8 max-w-none',
          'prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-ink',
          'prose-a:text-accent prose-a:no-underline hover:prose-a:underline',
          'prose-strong:text-ink',
          'prose-code:text-accent prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:rounded prose-pre:border prose-pre:border-line prose-pre:bg-surface',
          isLog && 'lg:prose-lg',
        )}
      >
        <MDXProvider components={mdxComponents}>
          <Component />
        </MDXProvider>
      </article>
    </>
  )
}
