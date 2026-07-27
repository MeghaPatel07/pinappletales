import type { ReactNode } from 'react'
import styles from './Section.module.css'

type SectionProps = {
  children: ReactNode
  /** Background treatment. `dark` is the espresso editorial band. */
  tone?: 'canvas' | 'surface' | 'alt' | 'sunk' | 'dark'
  size?: 'default' | 'compact'
  id?: string
  className?: string
  /** Draws a hairline rule above the section. */
  divider?: boolean
  'aria-labelledby'?: string
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
        styles.section,
        styles[tone],
        size === 'compact' ? styles.compact : '',
        divider ? styles.divider : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  )
}
