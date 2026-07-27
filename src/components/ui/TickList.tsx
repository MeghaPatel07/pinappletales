import { Icon } from './Icon'
import styles from './TickList.module.css'

type TickListProps = {
  items: readonly string[]
  /** `compact` tightens spacing for use inside cards. */
  size?: 'default' | 'compact'
  tone?: 'light' | 'dark'
  className?: string
}

export function TickList({
  items,
  size = 'default',
  tone = 'light',
  className,
}: TickListProps) {
  return (
    <ul
      className={[
        styles.list,
        size === 'compact' ? styles.compact : '',
        tone === 'dark' ? styles.dark : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item) => (
        <li key={item} className={styles.item}>
          <span className={styles.marker} aria-hidden="true">
            <Icon name="check" size={12} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
