import styles from './Spinner.module.css'

type SpinnerProps = {
  /** Rendered next to the spinner and announced to screen readers. */
  label?: string
  /** Centres the spinner in a tall block, for whole-page loading states. */
  full?: boolean
}

export function Spinner({ label = 'Loading…', full = false }: SpinnerProps) {
  return (
    <div className={full ? styles.full : styles.inline} role="status">
      <span className={styles.dot} aria-hidden="true" />
      <span className={full ? styles.label : 'visually-hidden'}>{label}</span>
    </div>
  )
}
