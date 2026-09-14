import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import styles from './CtaBanner.module.css'

type CtaBannerProps = {
  eyebrow?: string
  title: string
  body?: string
  primaryLabel?: string
  primaryTo?: string
  variant?: 'dark' | 'yellow'
}

export function CtaBanner({
  eyebrow,
  title,
  body,
  primaryLabel,
  primaryTo = '/contact',
  variant = 'yellow',
}: CtaBannerProps) {
  return (
    <section className={`${styles.banner} ${styles[variant]}`}>
      <Container>
        <div className={styles.inner}>
          <div className={styles.copy}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 className={styles.title}>{title}</h2>
            {body && <p className={styles.body}>{body}</p>}
          </div>

          {primaryLabel && (
            <div className={styles.actions}>
              <Button to={primaryTo} variant={variant === 'yellow' ? 'dark' : 'primary'} size="lg">
                {primaryLabel}
                <Icon name="arrowRight" size={17} />
              </Button>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
