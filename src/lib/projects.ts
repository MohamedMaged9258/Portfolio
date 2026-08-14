import type { ComponentType } from 'react'

export type ProjectLayout = 'log' | 'case-study'

export interface ProjectLinks {
  github?: string
  live?: string
  linkedin?: string
}

export interface ProjectFrontmatter {
  title: string
  slug: string
  summary: string
  stack: string[]
  date: string
  layout: ProjectLayout
  links?: ProjectLinks
  featured?: boolean
  /**
   * Publication date and body of the LinkedIn post named by links.linkedin.
   *
   * Read only by scripts/prerender.mjs, which needs them to emit a valid
   * SocialMediaPosting — nothing renders them. Declared here anyway so this interface
   * stays an honest description of what a project file may contain. All three fields
   * travel together: any one missing and the JSON-LD node is omitted entirely.
   *
   * linkedinDate must be a full ISO 8601 datetime *with a timezone*
   * ("2026-06-16T18:17:53Z"). A bare date fails the build — Google's validator rejects
   * it, and it is better to hear that from npm than from Search Console a week later.
   */
  linkedinDate?: string
  linkedinText?: string
}

export interface Project extends ProjectFrontmatter {
  /** The compiled MDX body, rendered as a React component. */
  Component: ComponentType
}

interface ProjectModule {
  default: ComponentType
  frontmatter: ProjectFrontmatter
}

// Eagerly load every project's MDX (frontmatter + compiled body) at build time.
const modules = import.meta.glob<ProjectModule>('../../data/projects/*.mdx', {
  eager: true,
})

export const projects: Project[] = Object.values(modules)
  .map((mod) => ({ ...mod.frontmatter, Component: mod.default }))
  // newest first (date is an ISO-ish "YYYY-MM" string)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export const featuredProjects: Project[] = projects.filter((p) => p.featured)

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
