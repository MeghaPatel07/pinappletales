import type { ReactNode } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'

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
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {backTo && (
          <Link href={backTo.to} className="mb-2 inline-flex items-center gap-1 text-[0.85rem] font-medium text-ink-soft hover:text-ink">
            <Icon name="chevronLeft" size={14} />
            {backTo.label}
          </Link>
        )}
        <h1 className="font-display text-[1.6rem] font-semibold leading-tight text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-[60ch] text-[0.95rem] text-ink-soft">{description}</p>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

/** Shown in a list when the collection has nothing in it yet. */
export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-paper-2 px-6 py-14 text-center">
      <h2 className="font-display text-[1.15rem] font-semibold text-ink">{title}</h2>
      <p className="max-w-[42ch] text-[0.92rem] text-ink-soft">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Published / draft indicator, used across every list. */
export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ${
        active ? 'bg-brand text-ink' : 'bg-paper-2 text-ink-soft'
      }`}
    >
      {active ? 'Published' : 'Draft'}
    </span>
  )
}

/** Small marker for a featured blog post. */
export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-brand-deep px-2.5 py-0.5 text-[0.72rem] font-semibold text-brand-deep">
      Featured
    </span>
  )
}
