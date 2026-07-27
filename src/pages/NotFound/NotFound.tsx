import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { Section } from '@/components/ui/Section'
import { primaryNav } from '@/config/site'
import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <Section tone="canvas">
      <Container width="narrow">
        <div className={styles.wrap}>
          <Logo className={styles.mark} />
          <p className={styles.code}>404</p>
          <h1 className={styles.title}>This page has wandered off</h1>
          <p className={styles.body}>
            The page you were looking for isn’t here. It may have been moved, or the
            link may have a typo in it.
          </p>

          <div className={styles.actions}>
            <Button to="/" size="lg">
              Back to home
              <Icon name="arrowRight" size={17} />
            </Button>
            <Button to="/contact" variant="secondary" size="lg">
              Get in touch
            </Button>
          </div>

          <nav aria-label="Site pages" className={styles.nav}>
            <ul className={styles.navList}>
              {primaryNav.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={styles.navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </Section>
  )
}
