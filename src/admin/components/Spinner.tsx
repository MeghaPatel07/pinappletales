type SpinnerProps = {
  /** Rendered next to the spinner and announced to screen readers. */
  label?: string
  /** Centres the spinner in a tall block, for whole-page loading states. */
  full?: boolean
}

export function Spinner({ label = 'Loading…', full = false }: SpinnerProps) {
  return (
    <div
      className={full ? 'grid min-h-[40vh] place-items-center gap-2 text-ink-soft' : 'inline-flex items-center gap-2 text-ink-soft'}
      role="status"
    >
      <span aria-hidden className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-deep" />
      <span className={full ? 'text-[0.92rem]' : 'visually-hidden'}>{label}</span>
    </div>
  )
}
