'use client'

/**
 * Admin form controls.
 *
 * Each control owns its own label, hint and error wiring — the id is generated
 * with useId and pointed at by `aria-describedby`, so a validation message is
 * announced rather than only shown.
 */

import { useId, type ReactNode } from 'react'

const INPUT_BASE =
  'w-full rounded-xl border bg-paper px-3.5 py-2.5 text-[0.95rem] text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-deep/40'

type FieldShellProps = {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
  /** Rendered at the right of the label row — character counts, buttons. */
  aside?: ReactNode
}

function FieldShell({ id, label, required, hint, error, children, aside }: FieldShellProps) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="eyebrow text-ink-soft">
          {label}
          {required ? (
            <span className="ml-1 text-coral" aria-hidden>
              *
            </span>
          ) : (
            <span className="ml-1 normal-case tracking-normal text-ink-soft/70">(optional)</span>
          )}
        </label>
        {aside}
      </div>

      {children}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-[0.82rem] text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[0.82rem] text-coral" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const describedBy = (id: string, hint?: string, error?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined

type BaseProps = {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  hint?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  aside?: ReactNode
}

export function TextField({
  label,
  value,
  onChange,
  required,
  hint,
  error,
  placeholder,
  disabled,
  aside,
  type = 'text',
  maxLength,
}: BaseProps & { type?: 'text' | 'email' | 'tel' | 'url'; maxLength?: number }) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} aside={aside}>
      <input
        id={id}
        type={type}
        className={`${INPUT_BASE} ${error ? 'border-coral' : 'border-line'}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  required,
  hint,
  error,
  placeholder,
  disabled,
  aside,
  rows = 3,
  maxLength,
}: BaseProps & { rows?: number; maxLength?: number }) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} aside={aside}>
      <textarea
        id={id}
        rows={rows}
        className={`${INPUT_BASE} resize-y ${error ? 'border-coral' : 'border-line'}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </FieldShell>
  )
}

export function DateField({ label, value, onChange, required, hint, error, disabled }: Omit<BaseProps, 'placeholder'>) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <input
        id={id}
        type="date"
        className={`${INPUT_BASE} ${error ? 'border-coral' : 'border-line'}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </FieldShell>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  required,
  hint,
  error,
  disabled,
  min,
  max,
  aside,
}: Omit<BaseProps, 'value' | 'onChange' | 'placeholder'> & {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} aside={aside}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className={`${INPUT_BASE} ${error ? 'border-coral' : 'border-line'}`}
        value={Number.isFinite(value) ? value : ''}
        onChange={(event) => onChange(Number(event.target.value))}
        min={min}
        max={max}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </FieldShell>
  )
}

export type SelectOption = { value: string; label: string }

export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  hint,
  error,
  disabled,
  placeholder,
}: Omit<BaseProps, 'placeholder'> & { options: SelectOption[]; placeholder?: string }) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <select
        id={id}
        className={`${INPUT_BASE} cursor-pointer ${error ? 'border-coral' : 'border-line'}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

/**
 * A switch, not a checkbox: these flags (isActive, isPrimary) take effect on
 * save and read better as on/off than as ticked/unticked.
 */
export function ToggleField({
  label,
  checked,
  onChange,
  description,
  disabled,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  disabled?: boolean
}) {
  const id = useId()

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-deep' : 'bg-line'}`}
      >
        <span
          aria-hidden
          className="absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform duration-200"
          style={{ left: checked ? '22px' : '2px' }}
        />
      </button>

      <div>
        <label htmlFor={id} className="text-[0.95rem] font-medium text-ink">
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className="mt-0.5 text-[0.82rem] text-ink-soft">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export function FormPanel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-paper p-6 md:p-7">
      <div className="mb-5">
        <h2 className="font-display text-[1.15rem] font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-[0.9rem] text-ink-soft">{description}</p>}
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  )
}

/** Side-by-side fields that stack on narrow screens. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>
}

/** Sticky save bar so the action stays reachable on a long form. */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 border-t border-line bg-paper-2/95 px-1 py-4 backdrop-blur">
      {children}
    </div>
  )
}

const BUTTON_VARIANTS = {
  primary: 'bg-brand text-ink hover:bg-brand-deep',
  secondary: 'border border-line bg-paper text-ink hover:bg-card',
  danger: 'bg-coral text-paper hover:opacity-90',
  ghost: 'bg-transparent text-ink-soft hover:text-ink',
} as const

const BUTTON_SIZES = {
  sm: 'px-3.5 py-1.5 text-[0.85rem]',
  md: 'px-5 py-2.5 text-[0.92rem]',
} as const

export function AdminButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  size = 'md',
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: keyof typeof BUTTON_VARIANTS
  disabled?: boolean
  size?: keyof typeof BUTTON_SIZES
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn inline-flex items-center gap-1.5 rounded-full font-medium disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]}`}
    >
      {children}
    </button>
  )
}
