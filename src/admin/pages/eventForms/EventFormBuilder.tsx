'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { toEventForm, toEventItem } from '@/lib/mappers'
import { slugify } from '@/lib/slug'
import {
  COLLECTIONS,
  type EventForm,
  type EventFormField,
  type EventFormFieldType,
  type EventItem,
} from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import {
  AdminButton,
  DateField,
  FieldRow,
  FormActions,
  FormPanel,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '../../components/Form'
import { PageHeader } from '../../components/PageHeader'
import { Spinner } from '../../components/Spinner'
import { useToast } from '../../components/Toast'
import {
  deleteRecord,
  describeApiError,
  getRecord,
  putRecord,
} from '../../lib/crud'
import styles from './EventFormBuilder.module.css'
import shared from '../shared.module.css'

const FIELD_TYPES: { value: EventFormFieldType; label: string }[] = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'email', label: 'Email address' },
  { value: 'tel', label: 'Phone number' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Single choice' },
  { value: 'checkbox', label: 'Multiple choice' },
]

/** Types whose answers come from a fixed list. */
const HAS_OPTIONS: EventFormFieldType[] = ['select', 'radio', 'checkbox']

const DEFAULTS: Omit<EventForm, 'eventId'> = {
  isActive: true,
  registrationStartDate: '',
  registrationEndDate: '',
  title: 'Register for this event',
  intro: '',
  submitLabel: 'Submit registration',
  successMessage: 'Thank you — your registration has been received.',
  fields: [],
}

/** A sensible starting point, so nobody builds a name/email form by hand. */
const STARTER_FIELDS: EventFormField[] = [
  {
    id: 'starter-name',
    name: 'full_name',
    label: 'Full name',
    type: 'text',
    placeholder: '',
    helpText: '',
    required: true,
    options: [],
  },
  {
    id: 'starter-email',
    name: 'email',
    label: 'Email address',
    type: 'email',
    placeholder: '',
    helpText: '',
    required: true,
    options: [],
  },
  {
    id: 'starter-phone',
    name: 'phone',
    label: 'Phone number',
    type: 'tel',
    placeholder: '',
    helpText: '',
    required: false,
    options: [],
  },
]

const newFieldId = () =>
  `field-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

/**
 * Answers are stored keyed by field name, so a name must be unique within the
 * form and stable — renaming one orphans the answers already collected under
 * the old key.
 */
function uniqueFieldName(label: string, existing: EventFormField[], selfId: string) {
  const base = slugify(label).replace(/-/g, '_') || 'field'
  const taken = new Set(
    existing.filter((field) => field.id !== selfId).map((field) => field.name),
  )

  if (!taken.has(base)) return base

  let suffix = 2
  while (taken.has(`${base}_${suffix}`)) suffix += 1
  return `${base}_${suffix}`
}

export function EventFormBuilder() {
  const { eventId } = useParams<{ eventId: string }>()
  const router = useRouter()
  const toast = useToast()

  const [event, setEvent] = useState<EventItem | null>(null)
  const [form, setForm] = useState<EventForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!eventId) return

    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const [loadedEvent, loadedForm] = await Promise.all([
          getRecord(COLLECTIONS.events, eventId, toEventItem),
          getRecord(COLLECTIONS.eventForms, eventId, toEventForm),
        ])

        if (cancelled) return

        setEvent(loadedEvent)
        setForm(loadedForm ?? { ...DEFAULTS, eventId, fields: [] })
      } catch (caught) {
        if (!cancelled) setError(describeApiError(caught))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [eventId])

  const patch = (changes: Partial<EventForm>) => {
    setForm((current) => (current ? { ...current, ...changes } : current))
    setDirty(true)
  }

  const patchField = (id: string, changes: Partial<EventFormField>) => {
    setForm((current) => {
      if (!current) return current
      return {
        ...current,
        fields: current.fields.map((field) =>
          field.id === id ? { ...field, ...changes } : field,
        ),
      }
    })
    setDirty(true)
  }

  const addField = () => {
    setForm((current) => {
      if (!current) return current
      const id = newFieldId()
      return {
        ...current,
        fields: [
          ...current.fields,
          {
            id,
            name: uniqueFieldName('question', current.fields, id),
            label: '',
            type: 'text',
            placeholder: '',
            helpText: '',
            required: false,
            options: [],
          },
        ],
      }
    })
    setDirty(true)
  }

  const removeField = (id: string) => {
    setForm((current) =>
      current
        ? { ...current, fields: current.fields.filter((field) => field.id !== id) }
        : current,
    )
    setDirty(true)
  }

  const moveField = (index: number, delta: number) => {
    setForm((current) => {
      if (!current) return current
      const target = index + delta
      if (target < 0 || target >= current.fields.length) return current

      const fields = [...current.fields]
      const [moved] = fields.splice(index, 1)
      if (moved) fields.splice(target, 0, moved)
      return { ...current, fields }
    })
    setDirty(true)
  }

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    if (!form || !eventId) return

    if (
      form.registrationStartDate &&
      form.registrationEndDate &&
      form.registrationStartDate > form.registrationEndDate
    ) {
      toast.error('Registration end date must be on or after the start date.')
      return
    }

    const unlabelled = form.fields.filter((field) => !field.label.trim())
    if (unlabelled.length > 0) {
      toast.error('Every field needs a label.')
      return
    }

    const missingOptions = form.fields.filter(
      (field) => HAS_OPTIONS.includes(field.type) && field.options.length === 0,
    )
    if (missingOptions.length > 0) {
      toast.error(
        `“${missingOptions[0]?.label}” is a choice field, so it needs at least one option.`,
      )
      return
    }

    setSaving(true)

    try {
      await putRecord(COLLECTIONS.eventForms, eventId, {
        eventId,
        isActive: form.isActive,
        registrationStartDate: form.registrationStartDate,
        registrationEndDate: form.registrationEndDate,
        title: form.title.trim() || DEFAULTS.title,
        intro: form.intro.trim(),
        submitLabel: form.submitLabel.trim() || DEFAULTS.submitLabel,
        successMessage: form.successMessage.trim() || DEFAULTS.successMessage,
        fields: form.fields.map((field) => ({
          ...field,
          label: field.label.trim(),
          options: HAS_OPTIONS.includes(field.type) ? field.options : [],
        })),
      })

      setDirty(false)
      toast.success('Registration form saved.')
    } catch (caught) {
      toast.error(describeApiError(caught))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!eventId) return
    setDeleting(true)

    try {
      await deleteRecord(COLLECTIONS.eventForms, eventId)
      toast.success('Registration form removed.')
      router.replace('/admin/event-forms')
    } catch (caught) {
      toast.error(describeApiError(caught))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner full label="Loading form…" />

  if (error) {
    return (
      <PageHeader
        title="Could not load this form"
        description={error}
        backTo={{ to: '/admin/event-forms', label: 'All event forms' }}
      />
    )
  }

  if (!event || !form) {
    return (
      <PageHeader
        title="Event not found"
        description="A registration form belongs to an event, and this one no longer exists."
        backTo={{ to: '/admin/event-forms', label: 'All event forms' }}
      />
    )
  }

  return (
    <form className={`${shared.form} ${shared.formWide}`} onSubmit={handleSubmit}>
      <PageHeader
        title={`Registration form — ${event.name}`}
        description="Visitors fill this in on the event page. Submissions appear under Registrations."
        backTo={{ to: '/admin/event-forms', label: 'All event forms' }}
        actions={
          <Link href={`/admin/registrations?event=${event.id}`} className={shared.viewLink}>
            View registrations
            <Icon name="arrowRight" size={14} />
          </Link>
        }
      />

      <FormPanel title="Form settings">
        <ToggleField
          label="Accepting registrations"
          checked={form.isActive}
          onChange={(checked) => patch({ isActive: checked })}
          description="Off hides the form from the event page. Submissions already collected are kept."
        />

        <FieldRow>
          <DateField
            label="Registration start date"
            value={form.registrationStartDate}
            onChange={(value) => patch({ registrationStartDate: value })}
            hint="The form opens at the start of this day. Leave empty for no start limit."
          />
          <DateField
            label="Registration end date"
            value={form.registrationEndDate}
            onChange={(value) => patch({ registrationEndDate: value })}
            hint="The form closes at the end of this day. Leave empty for no end limit."
          />
        </FieldRow>

        <TextField
          label="Form heading"
          value={form.title}
          onChange={(value) => patch({ title: value })}
          placeholder="Register for this event"
        />

        <TextAreaField
          label="Introduction"
          value={form.intro}
          onChange={(value) => patch({ intro: value })}
          rows={2}
          hint="A line or two above the fields — deadlines, fees, what happens next."
        />

        <FieldRow>
          <TextField
            label="Submit button label"
            value={form.submitLabel}
            onChange={(value) => patch({ submitLabel: value })}
            placeholder="Submit registration"
          />
          <TextField
            label="Confirmation message"
            value={form.successMessage}
            onChange={(value) => patch({ successMessage: value })}
            placeholder="Thank you — your registration has been received."
          />
        </FieldRow>
      </FormPanel>

      <FormPanel
        title="Fields"
        description="These are the questions a visitor answers, in this order."
      >
        {form.fields.length === 0 ? (
          <div className={styles.noFields}>
            <p className={styles.noFieldsText}>
              This form has no fields yet.
            </p>
            <div className={styles.noFieldsActions}>
              <AdminButton
                variant="secondary"
                onClick={() => {
                  patch({ fields: STARTER_FIELDS.map((field) => ({ ...field })) })
                }}
              >
                Start with name, email and phone
              </AdminButton>
              <AdminButton variant="secondary" onClick={addField}>
                Add a blank field
              </AdminButton>
            </div>
          </div>
        ) : (
          <ol className={styles.fieldList}>
            {form.fields.map((field, index) => (
              <li key={field.id} className={styles.fieldCard}>
                <div className={styles.fieldCardHeader}>
                  <span className={styles.fieldIndex}>
                    <Icon name="grip" size={14} />
                    {index + 1}
                  </span>

                  <span className={styles.fieldKey}>
                    stored as <code>{field.name}</code>
                  </span>

                  <div className={styles.fieldCardActions}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => moveField(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <Icon name="chevronUp" size={14} />
                      <span className="visually-hidden">Move up</span>
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => moveField(index, 1)}
                      disabled={index === form.fields.length - 1}
                      title="Move down"
                    >
                      <Icon name="chevronDown" size={14} />
                      <span className="visually-hidden">Move down</span>
                    </button>
                    <button
                      type="button"
                      className={styles.iconDanger}
                      onClick={() => removeField(field.id)}
                      title="Remove field"
                    >
                      <Icon name="trash" size={14} />
                      <span className="visually-hidden">Remove field</span>
                    </button>
                  </div>
                </div>

                <div className={styles.fieldCardBody}>
                  <FieldRow>
                    <TextField
                      label="Label"
                      value={field.label}
                      onChange={(value) => {
                        // The storage key follows the label only while the
                        // field is new; renaming later would orphan answers.
                        const shouldRename = field.name.startsWith('question')
                        patchField(field.id, {
                          label: value,
                          ...(shouldRename
                            ? { name: uniqueFieldName(value, form.fields, field.id) }
                            : {}),
                        })
                      }}
                      required
                      placeholder="Child’s age"
                    />

                    <SelectField
                      label="Type"
                      value={field.type}
                      onChange={(value) =>
                        patchField(field.id, { type: value as EventFormFieldType })
                      }
                      options={FIELD_TYPES}
                    />
                  </FieldRow>

                  <FieldRow>
                    <TextField
                      label="Placeholder"
                      value={field.placeholder}
                      onChange={(value) => patchField(field.id, { placeholder: value })}
                    />
                    <TextField
                      label="Help text"
                      value={field.helpText}
                      onChange={(value) => patchField(field.id, { helpText: value })}
                    />
                  </FieldRow>

                  {HAS_OPTIONS.includes(field.type) && (
                    <TextAreaField
                      label="Options"
                      value={field.options.join('\n')}
                      onChange={(value) =>
                        patchField(field.id, {
                          options: value
                            .split('\n')
                            .map((option) => option.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={4}
                      required
                      hint="One option per line."
                      placeholder={'3–5 years\n6–8 years\n9–12 years'}
                    />
                  )}

                  <ToggleField
                    label="Required"
                    checked={field.required}
                    onChange={(checked) => patchField(field.id, { required: checked })}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}

        {form.fields.length > 0 && (
          <AdminButton variant="secondary" onClick={addField}>
            <Icon name="plus" size={15} />
            Add field
          </AdminButton>
        )}
      </FormPanel>

      <FormActions>
        <AdminButton type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save form'}
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() => router.push('/admin/event-forms')}
        >
          Cancel
        </AdminButton>

        <span className={shared.actionSpacer} />

        {dirty && <span className={shared.savedNote}>Unsaved changes</span>}

        <AdminButton variant="danger" onClick={() => setConfirmDelete(true)}>
          Delete form
        </AdminButton>
      </FormActions>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this registration form?"
        message="The event keeps its page, but visitors will no longer be able to register. Submissions already collected are kept."
        confirmLabel="Delete form"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  )
}
