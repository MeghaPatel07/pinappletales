import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { contact, site } from '@/config/site'
import { BrandCollage } from './BrandCollage'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{site.founderTitles.join(' • ')}</p>

            <h1 className={styles.title}>
              Empowering every
              <span className={styles.emphasis}> Parent–Child </span>
              Mind.
            </h1>

            <p className={styles.lead}>
              Neuro-Art Therapy, Bibliotherapy and creative writing workshops that work
              with a child’s developing brain — not against it. Led by {site.founder} in
              Vadodara, offline and online.
            </p>

            <div className={styles.actions}>
              <Button to="/contact" size="lg">
                Book a session
                <Icon name="arrowRight" size={17} />
              </Button>
              <Button to="/services" variant="secondary" size="lg">
                Explore services
              </Button>
            </div>

            <ul className={styles.meta}>
              <li className={styles.metaItem}>
                <Icon name="mapPin" size={16} className={styles.metaIcon} />
                Gotri Road, Vadodara
              </li>
              <li className={styles.metaItem}>
                <Icon name="globe" size={16} className={styles.metaIcon} />
                Online sessions worldwide
              </li>
              <li className={styles.metaItem}>
                <Icon name="clock" size={16} className={styles.metaIcon} />
                Saturday sessions & workshops
              </li>
            </ul>
          </div>

          <div className={styles.visual}>
            <BrandCollage />
          </div>
        </div>
      </Container>

      <div className={styles.ticker}>
        <Container>
          <p className={styles.tickerInner}>
            <span className={styles.tickerLabel}>{site.promise}</span>
            <span className={styles.tickerText}>{site.supportLine}</span>
            <a
              href={contact.instagramUrl}
              className={styles.tickerLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contact.instagramHandle}
              <Icon name="arrowRight" size={15} />
            </a>
          </p>
        </Container>
      </div>
    </section>
  )
}
