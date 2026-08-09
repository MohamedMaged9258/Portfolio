import SiteHeader from '../components/SiteHeader'
import Hero from '../components/Hero'
import About from '../components/About'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Certificates from '../components/Certificates'
import Skills from '../components/Skills'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { profile } from '../lib/profile'

export default function Home() {
  // Sourced from profile.json rather than retyped, so the tab title can't drift
  // from the Hero the way index.html's hardcoded copy did.
  useDocumentMeta({
    title: `${profile.name} — ${profile.title}`,
    description: profile.tagline,
    path: '/',
  })

  return (
    <PageTransition>
      <SiteHeader />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        {/* Renders nothing while no data/certificates/*.mdx is marked featured. */}
        <Certificates />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </PageTransition>
  )
}
