import { Icon } from './Icon'

type TickListProps = {
  items: readonly string[]
  /** `compact` tightens spacing for use inside cards. */
  size?: 'default' | 'compact'
  tone?: 'light' | 'dark'
  className?: string
}

export function TickList({ items, size = 'default', tone = 'light', className }: TickListProps) {
  return (
    <ul className={['flex flex-col', size === 'compact' ? 'gap-2' : 'gap-3', className].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            className={`mt-0.5 grid shrink-0 place-items-center rounded-full ${
              tone === 'dark' ? 'bg-paper/15 text-paper' : 'bg-brand text-ink'
            }`}
            style={{ width: 20, height: 20 }}
            aria-hidden
          >
            <Icon name="check" size={12} />
          </span>
          <span className={tone === 'dark' ? 'text-paper/90' : 'text-ink-soft'}>{item}</span>
        </li>
      ))}
    </ul>
  )
}
