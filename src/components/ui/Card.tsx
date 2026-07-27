import type { ReactNode } from 'react'
import styles from './Card.module.css'

export type Accent = 'brand' | 'leaf' | 'coral' | 'indigo'

type CardProps = {
  children: ReactNode
  /** Thin colour marker along the top edge, used to group related content. */
  accent?: Accent
  tone?: 'surface' | 'alt' | 'outline'
  className?: string
  as?: 'div' | 'li' | 'article'
}

export function Card({
  children,
  accent,
  tone = 'surface',
  className,
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      className={[
        styles.card,
        styles[tone],
        accent ? styles.accented : '',
        accent ? styles[accent] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
