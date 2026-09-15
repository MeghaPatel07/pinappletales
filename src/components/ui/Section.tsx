import type { ReactNode } from 'react'

type SectionProps = {
  children: ReactNode
  /** Background treatment. `dark` is the ink editorial band. */
  tone?: 'canvas' | 'surface' | 'alt' | 'sunk' | 'dark'
  size?: 'default' | 'compact'
  id?: string
  className?: string
  /** Draws a hairline rule above the section. */
  divider?: boolean
  'aria-labelledby'?: string
}

const TONE_CLASSES: Record<NonNullable<SectionProps['tone']>, string> = {
  canvas: 'bg-paper text-ink',
  surface: 'bg-card text-ink',
  alt: 'bg-paper-2 text-ink',
  sunk: 'bg-card text-ink',
  dark: 'bg-ink text-paper',
}

export function Section({
  children,
  tone = 'canvas',
  size = 'default',
  id,
  className,
  divider = false,
  'aria-labelledby': ariaLabelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={[
        TONE_CLASSES[tone],
        size === 'compact' ? 'py-14 md:py-16' : 'py-20 md:py-28',
        divider ? 'border-t border-line' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  )
}
