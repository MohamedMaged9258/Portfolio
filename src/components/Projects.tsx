import { motion } from 'motion/react'
import Section from './Section'
import ProjectCard from './ProjectCard'
import ViewAllLink from './ViewAllLink'
import { featuredProjects } from '../lib/projects'
import { stagger, viewportOnce } from '../lib/motion'

export default function Projects() {
  return (
    <Section
      id="projects"
      title="Projects"
      // The home section is a preview: only frontmatter-tagged `featured: true`
      // projects land here, the full set lives at /projects.
      action={<ViewAllLink to="/projects" label="View all" />}
    >
      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.08)}
      >
        {featuredProjects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </motion.div>
    </Section>
  )
}
