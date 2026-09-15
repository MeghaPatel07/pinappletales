import { Icon } from '@/components/ui/Icon'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

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
  const isYellow = variant === 'yellow'

  return (
    <section className={isYellow ? 'bg-brand text-ink' : 'bg-ink text-paper'}>
      <Container>
        <div className="reveal flex flex-col items-center gap-5 py-16 text-center md:py-20">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h2
            className="font-display max-w-[26ch] font-medium leading-[1.1] tracking-[-0.01em]"
            style={{ fontSize: 'clamp(1.8rem, 3.6vw, 2.8rem)' }}
          >
            {title}
          </h2>
          {body ? (
            <p className={`max-w-[46ch] text-[1.02rem] ${isYellow ? 'text-ink/75' : 'text-paper/80'}`}>{body}</p>
          ) : null}
          {primaryLabel ? (
            <Button to={primaryTo} variant={isYellow ? 'dark' : 'primary'} size="lg">
              {primaryLabel}
              <span className="arrow" aria-hidden>
                <Icon name="arrowRight" size={17} />
              </span>
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
