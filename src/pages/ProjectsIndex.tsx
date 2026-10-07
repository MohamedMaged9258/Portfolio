import { motion } from 'motion/react'
import Container from '../components/Container'
import Footer from '../components/Footer'
import SiteHeader from '../components/SiteHeader'
import PageTransition from '../components/PageTransition'
import ProjectCard from '../components/ProjectCard'
import { projects } from '../lib/projects'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { profile } from '../lib/profile'
import { rise, slideIn, stagger, viewportOnce } from '../lib/motion'

export default function ProjectsIndex() {
  useDocumentMeta({
    title: `Projects — ${profile.name}`,
    description: `Case studies and build logs from ${profile.name} — ${profile.title}.`,
    path: '/projects',
  })

  return (
    <PageTransition>
      <SiteHeader />

      <main id="main" tabIndex={-1} className="outline-none">
        <Container className="py-12 sm:py-16">
          <motion.header
            className="mb-10"
            initial="hidden"
            animate="show"
            variants={stagger(0.08)}
          >
            <motion.p variants={slideIn} className="eyebrow">
              // projects
            </motion.p>
            <motion.h1
              variants={rise}
              className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl"
            >
              Projects
            </motion.h1>
            <motion.p variants={rise} className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
              Everything I&apos;ve written up — case studies and build logs.
            </motion.p>
          </motion.header>

          <motion.div
            className="divide-y divide-line"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={stagger(0.08)}
          >
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </motion.div>
        </Container>
      </main>
      <Footer />
    </PageTransition>
  )
}
