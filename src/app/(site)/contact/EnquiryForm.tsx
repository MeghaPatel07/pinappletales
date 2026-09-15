'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { contact } from '@/config/site'
import { services } from '@/data/services'

type FormState = {
  name: string
  email: string
  phone: string
  childAge: string
  interest: string
  message: string
}

const EMPTY: FormState = { name: '', email: '', phone: '', childAge: '', interest: '', message: '' }

const fieldClasses = 'w-full rounded-xl border border-line bg-paper px-3.5 py-3 text-[0.98rem] text-ink'
const labelClasses = 'eyebrow text-ink-soft'

/**
 * The site is fully static on the contact-form front, so there is no server
 * to post to. Instead the form composes a well-structured email and hands it
 * to the visitor's mail client — nothing is sent or stored by the page.
 */
export function EnquiryForm() {
  const [values, setValues] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  const update =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
    }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const subject = values.interest ? `Enquiry — ${values.interest}` : 'Enquiry from the Pineappletales website'
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      values.phone ? `Phone: ${values.phone}` : null,
      values.childAge ? `Child’s age: ${values.childAge}` : null,
      values.interest ? `Interested in: ${values.interest}` : null,
      '',
      values.message,
    ]
      .filter((line) => line !== null)
      .join('\n')

    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }

  return (
    <form className="grid gap-5 rounded-card border border-line bg-card p-6 md:p-8" onSubmit={handleSubmit}>
      <p className="flex items-center gap-2 text-[0.88rem] text-ink-soft">
        <Icon name="mail" size={16} className="shrink-0 text-brand-deep" />
        Sending opens your email app with the details filled in — nothing is stored by this website.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={labelClasses}>
            Your name <span aria-hidden>*</span>
          </span>
          <input type="text" required autoComplete="name" className={fieldClasses} value={values.name} onChange={update('name')} />
        </label>

        <label className="grid gap-1.5">
          <span className={labelClasses}>
            Email <span aria-hidden>*</span>
          </span>
          <input type="email" required autoComplete="email" className={fieldClasses} value={values.email} onChange={update('email')} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={labelClasses}>Phone (optional)</span>
          <input type="tel" autoComplete="tel" className={fieldClasses} value={values.phone} onChange={update('phone')} />
        </label>

        <label className="grid gap-1.5">
          <span className={labelClasses}>Child’s age (optional)</span>
          <input type="text" inputMode="numeric" className={fieldClasses} value={values.childAge} onChange={update('childAge')} />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className={labelClasses}>What would you like support with?</span>
        <select className={fieldClasses} value={values.interest} onChange={update('interest')}>
          <option value="">Not sure yet — please advise</option>
          {services.map((service) => (
            <option key={service.id} value={service.title}>
              {service.title}
            </option>
          ))}
          <option value="School / organisation programme">School / organisation programme</option>
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className={labelClasses}>
          Tell us a little more <span aria-hidden>*</span>
        </span>
        <textarea
          rows={5}
          required
          className={`${fieldClasses} resize-y`}
          placeholder="What you’ve noticed, what you’d like to change, and whether you’d prefer offline or online sessions."
          value={values.message}
          onChange={update('message')}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg">
          Send enquiry <span className="arrow" aria-hidden>→</span>
        </Button>
        <Button href={contact.whatsappUrl} variant="secondary" size="lg">
          <Icon name="whatsapp" size={17} />
          WhatsApp instead
        </Button>
      </div>

      <p className="min-h-[1.2em] text-[0.9rem] text-ink-soft" role="status" aria-live="polite">
        {submitted ? `Your email app should now be open. If nothing happened, write to ${contact.email} directly.` : ''}
      </p>
    </form>
  )
}
