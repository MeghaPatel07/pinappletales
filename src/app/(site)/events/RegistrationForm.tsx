'use client'

import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { EventForm, EventFormField, EventItem } from '@/types/content'

type Values = Record<string, string | string[]>

const emptyValues = (fields: EventFormField[]): Values => {
  const values: Values = {}
  for (const field of fields) values[field.name] = field.type === 'checkbox' ? [] : ''
  return values
}

const isBlank = (value: string | string[] | undefined): boolean =>
  value === undefined || (Array.isArray(value) ? value.length === 0 : !value.trim())

async function submitEventRegistration(input: {
  eventId: string
  eventName: string
  values: Values
}): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      return { ok: false, message: 'Something went wrong sending your registration. Please try again, or contact us directly.' }
    }
    return { ok: true }
  } catch {
    return { ok: false, message: 'We could not reach the server. Check your connection and try again.' }
  }
}

const fieldClasses = 'w-full rounded-xl border border-line bg-paper px-3.5 py-3 text-[0.98rem] text-ink'
const invalidClasses = 'border-coral'

export function RegistrationForm({ event, form }: { event: EventItem; form: EventForm }) {
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
    const filled: Values = {}
    for (const [key, value] of Object.entries(values)) {
      if (!isBlank(value)) filled[key] = value
    }

    const result = await submitEventRegistration({ eventId: event.id, eventName: event.name, values: filled })
    setSubmitting(false)

    if (result.ok) setSubmitted(true)
    else setSubmitError(result.message)
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-line bg-card p-8 text-center" role="status">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand text-ink">
          <Icon name="check" size={22} />
        </span>
        <h3 className="font-display mt-4 text-[1.3rem] font-semibold">Registration received</h3>
        <p className="mt-2 text-[0.98rem] text-ink-soft">{form.successMessage}</p>
      </div>
    )
  }

  return (
    <form className="rounded-card border border-line bg-card p-6 md:p-8" onSubmit={handleSubmit} noValidate>
      <h2 className="font-display text-[1.4rem] font-semibold">{form.title}</h2>
      {form.intro && <p className="mt-2 text-[0.98rem] text-ink-soft">{form.intro}</p>}

      <div className="mt-6 flex flex-col gap-5">
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
        <p className="mt-4 text-[0.9rem] text-coral" role="alert">
          {submitError}
        </p>
      )}

      <div className="mt-6">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Sending…' : form.submitLabel}
        </Button>
      </div>

      <p className="mt-4 text-[0.85rem] text-ink-soft">
        Your details are sent only to Pineappletales and used to contact you about this event.
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

function Field({ field, idPrefix, value, error, onChange, onToggle, disabled }: FieldProps) {
  const id = `${idPrefix}-${field.name}`
  const describedBy = error ? `${id}-error` : field.helpText ? `${id}-help` : undefined
  const stringValue = typeof value === 'string' ? value : ''
  const listValue = Array.isArray(value) ? value : []

  const legendOrLabel =
    field.type === 'radio' || field.type === 'checkbox' ? (
      <legend className="eyebrow text-ink-soft">
        {field.label} {field.required && <span aria-hidden>*</span>}
      </legend>
    ) : (
      <label htmlFor={id} className="eyebrow text-ink-soft">
        {field.label} {field.required && <span aria-hidden>*</span>}
      </label>
    )

  const help = field.helpText && !error && <p className="mt-1.5 text-[0.85rem] text-ink-soft">{field.helpText}</p>
  const errorMessage = error && (
    <p id={`${id}-error`} className="mt-1.5 text-[0.85rem] text-coral" role="alert">
      {error}
    </p>
  )

  if (field.type === 'radio' || field.type === 'checkbox') {
    return (
      <fieldset className="grid gap-2" aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
        {legendOrLabel}
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
          {field.options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-[0.95rem]">
              <input
                type={field.type}
                name={id}
                value={option}
                checked={field.type === 'radio' ? stringValue === option : listValue.includes(option)}
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
    <div className="grid gap-1.5">
      {legendOrLabel}
      {field.type === 'textarea' ? (
        <textarea
          id={id}
          rows={4}
          className={`${fieldClasses} resize-y ${error ? invalidClasses : ''}`}
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
          className={`${fieldClasses} ${error ? invalidClasses : ''}`}
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
          className={`${fieldClasses} ${error ? invalidClasses : ''}`}
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

function autoCompleteFor(field: EventFormField): string | undefined {
  if (field.type === 'email') return 'email'
  if (field.type === 'tel') return 'tel'
  const name = field.name.toLowerCase()
  if (name.includes('name')) return 'name'
  if (name.includes('city')) return 'address-level2'
  return undefined
}
