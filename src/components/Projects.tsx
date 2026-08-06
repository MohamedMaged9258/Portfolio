import { motion } from 'motion/react'
import Section from './Section'
import ProjectCard from './ProjectCard'
import { projects } from '../lib/projects'
import { stagger, viewportOnce } from '../lib/motion'

export default function Projects() {
  return (
    <Section id="projects" eyebrow="// projects" title="Projects">
      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.08)}
      >
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </motion.div>
    </Section>
  )
}
