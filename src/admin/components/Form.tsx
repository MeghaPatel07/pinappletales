/**
 * Admin form controls.
 *
 * Each control owns its own label, hint and error wiring — the id is generated
 * with useId and pointed at by `aria-describedby`, so a validation message is
 * announced rather than only shown.
 */

import { useId, type ReactNode } from 'react'
import styles from './Form.module.css'

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

function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  children,
  aside,
}: FieldShellProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : (
            <span className={styles.optional}>optional</span>
          )}
        </label>
        {aside}
      </div>

      {children}

      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
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
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      aside={aside}
    >
      <input
        id={id}
        type={type}
        className={[styles.input, error ? styles.invalid : ''].filter(Boolean).join(' ')}
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
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      aside={aside}
    >
      <textarea
        id={id}
        rows={rows}
        className={[styles.input, styles.textarea, error ? styles.invalid : '']
          .filter(Boolean)
          .join(' ')}
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

export function DateField({
  label,
  value,
  onChange,
  required,
  hint,
  error,
  disabled,
}: Omit<BaseProps, 'placeholder'>) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <input
        id={id}
        type="date"
        className={[styles.input, error ? styles.invalid : ''].filter(Boolean).join(' ')}
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
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      aside={aside}
    >
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className={[styles.input, error ? styles.invalid : ''].filter(Boolean).join(' ')}
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
}: Omit<BaseProps, 'placeholder'> & {
  options: SelectOption[]
  placeholder?: string
}) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <select
        id={id}
        className={[styles.input, styles.selectControl, error ? styles.invalid : '']
          .filter(Boolean)
          .join(' ')}
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
    <div className={styles.toggleRow}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        className={[styles.toggle, checked ? styles.toggleOn : '']
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
      >
        <span className={styles.toggleKnob} aria-hidden="true" />
      </button>

      <div className={styles.toggleText}>
        <label htmlFor={id} className={styles.toggleLabel}>
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className={styles.hint}>
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

export function FormPanel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{title}</h2>
        {description && <p className={styles.panelDescription}>{description}</p>}
      </div>
      <div className={styles.panelBody}>{children}</div>
    </section>
  )
}

/** Side-by-side fields that stack on narrow screens. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>
}

/** Sticky save bar so the action stays reachable on a long form. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>
}

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
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
  size?: 'sm' | 'md'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[styles.button, styles[variant], styles[size]].join(' ')}
    >
      {children}
    </button>
  )
}
