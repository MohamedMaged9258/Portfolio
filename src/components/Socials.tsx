import { FaGithub, FaLinkedinIn } from 'react-icons/fa6'
import { profile } from '../lib/profile'
import { cn } from '../lib/cn'

export default function Socials({ className }: { className?: string }) {
  const items = [
    { href: profile.socials.github, label: 'GitHub', Icon: FaGithub },
    { href: profile.socials.linkedin, label: 'LinkedIn', Icon: FaLinkedinIn },
  ]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-400 transition hover:bg-elevated hover:text-accent"
        >
          <Icon className="h-[18px] w-[18px]" />
        </a>
      ))}
    </div>
  )
}
