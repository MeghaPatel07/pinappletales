import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import styles from './PageHeader.module.css'

type PageHeaderProps = {
  title: string
  description?: string
  /** Buttons or links shown at the right of the header. */
  actions?: ReactNode
  /** Renders a back link above the title, for detail and edit screens. */
  backTo?: { to: string; label: string }
}

export function PageHeader({ title, description, actions, backTo }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {backTo && (
          <Link to={backTo.to} className={styles.back}>
            <Icon name="chevronLeft" size={14} />
            {backTo.label}
          </Link>
        )}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}

/** Shown in a list when the collection has nothing in it yet. */
export function EmptyState({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className={styles.empty}>
      <h2 className={styles.emptyTitle}>{title}</h2>
      <p className={styles.emptyMessage}>{message}</p>
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  )
}

/** Published / draft indicator, used across every list. */
export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={active ? styles.badgeActive : styles.badgeDraft}>
      {active ? 'Published' : 'Draft'}
    </span>
  )
}

/** Small marker for a featured blog post. */
export function FeaturedBadge() {
  return <span className={styles.badgeFeatured}>Featured</span>
}
