import data from '../../data/profile.json'

export interface ExperienceItem {
  role: string
  org: string
  location: string
  period: string
  highlights: string[]
}

export interface EducationItem {
  school: string
  degree: string
  period: string
  highlights?: string[]
}

export interface SkillGroup {
  label: string
  items: string[]
}

export interface LanguageItem {
  name: string
  level: string
}

export interface Profile {
  name: string
  title: string
  /** Hero copy. Short enough to read as a headline, so not reused as a meta description. */
  tagline: string
  /** Home page meta/og description. Carries the name and the qualifier terms; ~155 chars. */
  seoDescription: string
  /** Canonical origin, no trailing slash. The one place the production URL is written. */
  site: string
  location: string
  email: string
  phone: string
  availability?: string
  summary: string
  socials: {
    github: string
    linkedin: string
  }
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillGroup[]
  languages: LanguageItem[]
}

export const profile = data as Profile
