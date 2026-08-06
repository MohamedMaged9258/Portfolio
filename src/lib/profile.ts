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
  tagline: string
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
