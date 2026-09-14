import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { submitEventRegistration } from '@/content/registrations'
import type { EventForm, EventFormField, EventItem } from '@/types/content'
import styles from './RegistrationForm.module.css'

type Values = Record<string, string | string[]>

const emptyValues = (fields: EventFormField[]): Values => {
  const values: Values = {}
  for (const field of fields) {
    values[field.name] = field.type === 'checkbox' ? [] : ''
  }
  return values
}

const isBlank = (value: string | string[] | undefined): boolean =>
  value === undefined || (Array.isArray(value) ? value.length === 0 : !value.trim())

/**
 * Renders the registration form an admin built for this event.
 *
 * The fields are entirely data-driven, so adding a question in the admin
 * changes this form with no code change. Submissions go straight to Firestore,
 * which accepts creates from anyone but allows nobody except an admin to read
 * them back.
 */
export function RegistrationForm({
  event,
  form,
}: {
  event: EventItem
  form: EventForm
}) {
  const formId = useId()
  const [values, setValues] = useState<Values>(() => emptyValues(form.fields))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const setValue = (name: string, value: string | string[]) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const toggleChoice = (name: string, option: string, checked: boolean) => {
    const current = values[name]
    const list = Array.isArray(current) ? current : []
    setValue(name, checked ? [...list, option] : list.filter((item) => item !== option))
  }

  const validate = (): Record<string, string> => {
    const found: Record<string, string> = {}

    for (const field of form.fields) {
      const value = values[field.name]

      if (field.required && isBlank(value)) {
        found[field.name] = `${field.label} is required.`
        continue
      }

      if (field.type === 'email' && typeof value === 'string' && value.trim()) {
        // Deliberately loose: the only reliable test of an address is sending
        // to it, and a strict pattern rejects valid addresses.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          found[field.name] = 'Please enter a valid email address.'
        }
      }
    }

    return found
  }

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    setSubmitError('')

    const found = validate()
    setErrors(found)

    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0]
      document.getElementById(`${formId}-${firstKey}`)?.focus()
      return
    }

    setSubmitting(true)

    // Empty answers are dropped rather than stored as empty strings, which
    // keeps the CSV export and the admin table readable.
    const filled: Values = {}
    for (const [key, value] of Object.entries(values)) {
      if (!isBlank(value)) filled[key] = value
    }

    const result = await submitEventRegistration({
      eventId: event.id,
      eventName: event.name,
      values: filled,
    })

    setSubmitting(false)

    if (result.ok) {
      setSubmitted(true)
    } else {
      setSubmitError(result.message)
    }
  }

  if (submitted) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon} aria-hidden="true">
          <Icon name="check" size={22} />
        </span>
        <h3 className={styles.successTitle}>Registration received</h3>
        <p className={styles.successBody}>{form.successMessage}</p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>{form.title}</h2>
      {form.intro && <p className={styles.intro}>{form.intro}</p>}

      <div className={styles.fields}>
        {form.fields.map((field) => (
          <Field
            key={field.id}
            field={field}
            idPrefix={formId}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={(value) => setValue(field.name, value)}
            onToggle={(option, checked) => toggleChoice(field.name, option, checked)}
            disabled={submitting}
          />
        ))}
      </div>

      {submitError && (
        <p className={styles.formError} role="alert">
          {submitError}
        </p>
      )}

      <div className={styles.actions}>
        <Button type="submit" size="lg">
          {submitting ? 'Sending…' : form.submitLabel}
        </Button>
      </div>

      <p className={styles.privacy}>
        Your details are sent only to Pineappletales and used to contact you about
        this event.
      </p>
    </form>
  )
}

type FieldProps = {
  field: EventFormField
  idPrefix: string
  value: string | string[] | undefined
  error?: string
  onChange: (value: string) => void
  onToggle: (option: string, checked: boolean) => void
  disabled: boolean
}

function Field({
  field,
  idPrefix,
  value,
  error,
  onChange,
  onToggle,
  disabled,
}: FieldProps) {
  const id = `${idPrefix}-${field.name}`
  const describedBy = error ? `${id}-error` : field.helpText ? `${id}-help` : undefined
  const stringValue = typeof value === 'string' ? value : ''
  const listValue = Array.isArray(value) ? value : []

  const legendOrLabel =
    field.type === 'radio' || field.type === 'checkbox' ? (
      <legend className={styles.label}>
        {field.label}
        {field.required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </legend>
    ) : (
      <label htmlFor={id} className={styles.label}>
        {field.label}
        {field.required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
    )

  const help = field.helpText && !error && (
    <p id={`${id}-help`} className={styles.help}>
      {field.helpText}
    </p>
  )

  const errorMessage = error && (
    <p id={`${id}-error`} className={styles.error} role="alert">
      {error}
    </p>
  )

  // Choice groups need a fieldset so the question is announced with each option.
  if (field.type === 'radio' || field.type === 'checkbox') {
    return (
      <fieldset
        className={styles.field}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      >
        {legendOrLabel}
        <div className={styles.choices}>
          {field.options.map((option) => (
            <label key={option} className={styles.choice}>
              <input
                type={field.type}
                name={id}
                value={option}
                checked={
                  field.type === 'radio'
                    ? stringValue === option
                    : listValue.includes(option)
                }
                onChange={(changeEvent) => {
                  if (field.type === 'radio') onChange(option)
                  else onToggle(option, changeEvent.target.checked)
                }}
                disabled={disabled}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {help}
        {errorMessage}
      </fieldset>
    )
  }

  return (
    <div className={styles.field}>
      {legendOrLabel}

      {field.type === 'textarea' ? (
        <textarea
          id={id}
          rows={4}
          className={[styles.input, styles.textarea, error ? styles.invalid : '']
            .filter(Boolean)
            .join(' ')}
          value={stringValue}
          placeholder={field.placeholder}
          onChange={(changeEvent) => onChange(changeEvent.target.value)}
          disabled={disabled}
          required={field.required}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
      ) : field.type === 'select' ? (
        <select
          id={id}
          className={[styles.input, error ? styles.invalid : ''].filter(Boolean).join(' ')}
          value={stringValue}
          onChange={(changeEvent) => onChange(changeEvent.target.value)}
          disabled={disabled}
          required={field.required}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        >
          <option value="">{field.placeholder || 'Please choose…'}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type}
          className={[styles.input, error ? styles.invalid : ''].filter(Boolean).join(' ')}
          value={stringValue}
          placeholder={field.placeholder}
          onChange={(changeEvent) => onChange(changeEvent.target.value)}
          disabled={disabled}
          required={field.required}
          autoComplete={autoCompleteFor(field)}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
      )}

      {help}
      {errorMessage}
    </div>
  )
}

/** Lets the browser fill in the fields it recognises. */
function autoCompleteFor(field: EventFormField): string | undefined {
  if (field.type === 'email') return 'email'
  if (field.type === 'tel') return 'tel'

  const name = field.name.toLowerCase()
  if (name.includes('name')) return 'name'
  if (name.includes('city')) return 'address-level2'

  return undefined
}
