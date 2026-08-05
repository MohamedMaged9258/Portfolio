import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Socials from './Socials'
import ResumeButton from './ResumeButton'

const sections = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-sm text-slate-200">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-accent">M</span>
          <span className="hidden sm:inline">
            mohamed<span className="text-accent">.</span>maged
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {sections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-md px-3 py-2 text-sm text-slate-400 transition hover:text-slate-100"
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Socials />
          <ResumeButton />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-300 transition hover:bg-elevated md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-bg md:hidden">
          <div className="mx-auto max-w-5xl px-5 py-4 sm:px-8">
            <div className="flex flex-col">
              {sections.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm text-slate-300 transition hover:bg-elevated hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <Socials />
              <ResumeButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
