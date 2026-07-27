import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { contact } from '@/config/site'
import { services } from '@/data/services'
import styles from './EnquiryForm.module.css'

type FormState = {
  name: string
  email: string
  phone: string
  childAge: string
  interest: string
  message: string
}

const EMPTY: FormState = {
  name: '',
  email: '',
  phone: '',
  childAge: '',
  interest: '',
  message: '',
}

/**
 * The site is fully static, so there is no server to post to. Instead the form
 * composes a well-structured email and hands it to the visitor's mail client —
 * nothing is sent or stored by the page itself.
 */
export function EnquiryForm() {
  const [values, setValues] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  const update =
    (field: keyof FormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
    }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const subject = values.interest
      ? `Enquiry — ${values.interest}`
      : 'Enquiry from the Pineappletales website'

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

    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`

    setSubmitted(true)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate={false}>
      <p className={styles.note}>
        <Icon name="mail" size={16} className={styles.noteIcon} />
        Sending opens your email app with the details filled in — nothing is stored
        by this website.
      </p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Your name <span aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={styles.input}
            value={values.name}
            onChange={update('name')}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={styles.input}
            value={values.email}
            onChange={update('email')}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="phone" className={styles.label}>
            Phone <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={styles.input}
            value={values.phone}
            onChange={update('phone')}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="childAge" className={styles.label}>
            Child’s age <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="childAge"
            name="childAge"
            type="text"
            inputMode="numeric"
            className={styles.input}
            value={values.childAge}
            onChange={update('childAge')}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="interest" className={styles.label}>
          What would you like support with?
        </label>
        <select
          id="interest"
          name="interest"
          className={styles.select}
          value={values.interest}
          onChange={update('interest')}
        >
          <option value="">Not sure yet — please advise</option>
          {services.map((service) => (
            <option key={service.id} value={service.title}>
              {service.title}
            </option>
          ))}
          <option value="School / organisation programme">
            School / organisation programme
          </option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>
          Tell us a little more <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={styles.textarea}
          placeholder="What you’ve noticed, what you’d like to change, and whether you’d prefer offline or online sessions."
          value={values.message}
          onChange={update('message')}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" size="lg">
          Send enquiry
          <Icon name="arrowRight" size={17} />
        </Button>
        <Button href={contact.whatsappUrl} variant="secondary" size="lg">
          <Icon name="whatsapp" size={17} />
          WhatsApp instead
        </Button>
      </div>

      <p className={styles.status} role="status" aria-live="polite">
        {submitted
          ? 'Your email app should now be open. If nothing happened, write to ' +
            contact.email +
            ' directly.'
          : ''}
      </p>
    </form>
  )
}
