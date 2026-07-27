import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { contact } from '@/config/site'
import styles from './CtaBanner.module.css'

type CtaBannerProps = {
  eyebrow?: string
  title: string
  body: string
  primaryLabel?: string
  primaryTo?: string
}

export function CtaBanner({
  eyebrow = 'Let’s connect',
  title,
  body,
  primaryLabel = 'Book a session',
  primaryTo = '/contact',
}: CtaBannerProps) {
  return (
    <section className={styles.banner}>
      <Container>
        <div className={styles.inner}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.body}>{body}</p>
          </div>

          <div className={styles.actions}>
            <Button to={primaryTo} size="lg">
              {primaryLabel}
              <Icon name="arrowRight" size={17} />
            </Button>
            <Button href={contact.whatsappUrl} variant="onDark" size="lg">
              <Icon name="whatsapp" size={17} />
              Message on WhatsApp
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
