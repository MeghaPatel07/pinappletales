import type { ReactNode } from 'react'

export type Accent = 'brand' | 'leaf' | 'coral' | 'indigo'

type CardProps = {
  children: ReactNode
  /** Thin colour marker along the top edge, used to group related content. */
  accent?: Accent
  tone?: 'surface' | 'alt' | 'outline'
  className?: string
  as?: 'div' | 'li' | 'article'
}

const TONE_CLASSES: Record<NonNullable<CardProps['tone']>, string> = {
  surface: 'bg-card border border-line',
  alt: 'bg-paper-2 border border-line',
  outline: 'bg-transparent border border-line',
}

const ACCENT_CLASSES: Record<Accent, string> = {
  brand: 'border-t-[3px] border-t-brand-deep',
  leaf: 'border-t-[3px] border-t-teal',
  coral: 'border-t-[3px] border-t-coral',
  indigo: 'border-t-[3px] border-t-teal-soft',
}

export function Card({ children, accent, tone = 'surface', className, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={[
        'lift rounded-card p-6',
        TONE_CLASSES[tone],
        accent ? ACCENT_CLASSES[accent] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
