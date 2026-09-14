import { address, contact, site } from '@/config/site'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import styles from './Footer.module.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand & Cursive Slogan -------------------------------------- */}
          <div className={styles.brandCol}>
            <Logo
              tone="light"
              loading="lazy"
              alt={`${site.name} by ${site.founder} — ${site.founderTitleLine}`}
              className={styles.logo}
            />
            <p className={styles.tagline}>{site.tagline}</p>
            <p className={styles.closingLineCursive}>
              Let's build a brighter tomorrow,
              <br />
              one child at a time.
            </p>
          </div>

          {/* Contacts ---------------------------------------------------- */}
          <div className={styles.col}>
            <h2 className={styles.colTitle}>Get in touch</h2>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <Icon name="mail" size={18} className={styles.contactIcon} />
                <a href={`mailto:${contact.email}`} className={styles.link}>
                  {contact.email}
                </a>
              </li>
              <li className={styles.contactItem}>
                <Icon name="phone" size={18} className={styles.contactIcon} />
                <a href={`tel:${contact.phoneE164}`} className={styles.link}>
                  {contact.phoneDisplay}
                </a>
              </li>
              <li className={styles.contactItem}>
                <Icon name="instagram" size={18} className={styles.contactIcon} />
                <a
                  href={contact.instagramUrl}
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contact.instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          {/* Address ----------------------------------------------------- */}
          <div className={styles.col}>
            <h2 className={styles.colTitle}>Location</h2>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <Icon name="mapPin" size={18} className={styles.contactIcon} />
                <address className={styles.address}>
                  <strong>Gotri Road Studio:</strong>
                  <br />
                  {address.street},
                  <br />
                  {address.locality} {address.postalCode}
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className={styles.bottomLinks}>
            <a href="/privacy" className={styles.bottomLink}>Privacy Policy</a>
            <span className={styles.separator}>|</span>
            <a href="/terms" className={styles.bottomLink}>Terms & Conditions</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
