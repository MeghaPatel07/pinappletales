import type { ReactNode } from 'react'
import styles from './SectionHeading.module.css'

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
    <header
      className={[styles.heading, styles[align], tone === 'dark' ? styles.dark : '']
        .filter(Boolean)
        .join(' ')}
    >
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <Tag id={id} className={styles.title}>
        {title}
      </Tag>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  )
}
