import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={`${styles.hero} reveal reveal-fade`}>
      <img
        className={styles.backgroundImage}
        src="https://images.unsplash.com/photo-1607211851821-8be3cd6146f0?auto=format&fit=crop&w=1800&q=85"
        alt="A child creating with bright paint during a creative session"
      />
      <div className={styles.overlay} aria-hidden="true" />
      <Container>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Personalised · Creative · Meaningful</p>

            <h1 className={styles.title}>
              Empowering every <span className="script-highlight">Parent–Child</span> Mind.
            </h1>

            <p className={styles.lead}>
              Neuro-Art Therapy, Bibliotherapy and creative writing workshops that work with a child’s developing brain. Led by Kenaa Jadeja in Vadodara, offline and online.
            </p>

            <div className={styles.actions}>
              <Button to="/contact" size="lg" className={styles.primaryBtn}>
                Book a Session
                <Icon name="arrowRight" size={17} />
              </Button>
              <Button to="/services" variant="onDark" size="lg" className={styles.secondaryBtn}>
                Explore Services
              </Button>
            </div>

            <ul className={styles.features}>
              <li className={styles.featureItem}>
                <span className={styles.featureIconWrapper}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </span>
                Child-Centered Approach
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIconWrapper}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </span>
                Evidence-Based Therapies
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIconWrapper}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-1-6l-3-3 1.41-1.41L11 13.17l4.59-4.59L17 10l-6 6z" />
                  </svg>
                </span>
                Safe, Supportive Environment
              </li>
            </ul>
          </div>

        </div>
      </Container>
    </section>
  )
}
