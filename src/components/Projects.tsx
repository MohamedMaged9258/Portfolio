import Section from './Section'
import ProjectCard from './ProjectCard'
import { projects } from '../lib/projects'

export default function Projects() {
  return (
    <Section id="projects" eyebrow="// projects" title="Projects">
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </Section>
  )
}
