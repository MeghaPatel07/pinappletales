import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  tone?: 'light' | 'dark'
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  as: Tag = 'h2',
  id,
  tone = 'light',
}: SectionHeadingProps) {
  return (
    <header className={align === 'center' ? 'text-center' : ''}>
      {eyebrow ? (
        <span className={`eyebrow block ${tone === 'dark' ? 'text-paper/70' : 'text-ink-soft'}`}>
          {eyebrow}
        </span>
      ) : null}
      <Tag
        id={id}
        className={`font-display mt-4 font-medium leading-[1.08] tracking-[-0.02em] ${
          tone === 'dark' ? 'text-paper' : 'text-ink'
        }`}
        style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
      >
        {title}
      </Tag>
      {lead ? (
        <p
          className={`mt-4 max-w-[52ch] text-[1.05rem] leading-normal ${
            align === 'center' ? 'mx-auto' : ''
          } ${tone === 'dark' ? 'text-paper/80' : 'text-ink-soft'}`}
        >
          {lead}
        </p>
      ) : null}
    </header>
  )
}
