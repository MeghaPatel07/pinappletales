import { Link } from 'react-router-dom'
import { address, contact, primaryNav, site } from '@/config/site'
import { services } from '@/data/services'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import styles from './Footer.module.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand ------------------------------------------------------- */}
          <div className={styles.brandCol}>
            <Logo
              tone="dark"
              loading="lazy"
              alt={`${site.name} by ${site.founder} — ${site.founderTitleLine}`}
              className={styles.logo}
            />
            <p className={styles.tagline}>{site.tagline}</p>
            <p className={styles.promise}>{site.promise}</p>

            <ul className={styles.social}>
              <li>
                <a
                  href={contact.instagramUrl}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="instagram" size={18} />
                  <span className="visually-hidden">
                    Instagram — {contact.instagramHandle}
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className={styles.socialLink}>
                  <Icon name="mail" size={18} />
                  <span className="visually-hidden">Email {site.name}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${contact.phoneE164}`} className={styles.socialLink}>
                  <Icon name="phone" size={18} />
                  <span className="visually-hidden">Call {site.founder}</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.whatsappUrl}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="whatsapp" size={18} />
                  <span className="visually-hidden">Message on WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Explore ----------------------------------------------------- */}
          <nav className={styles.col} aria-labelledby="footer-explore">
            <h2 id="footer-explore" className={styles.colTitle}>
              Explore
            </h2>
            <ul className={styles.linkList}>
              {primaryNav.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services ---------------------------------------------------- */}
          <nav className={styles.col} aria-labelledby="footer-services">
            <h2 id="footer-services" className={styles.colTitle}>
              Services
            </h2>
            <ul className={styles.linkList}>
              {services.map((service) => (
                <li key={service.id}>
                  <Link to={`/services#${service.id}`} className={styles.link}>
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact ----------------------------------------------------- */}
          <div className={styles.col}>
            <h2 className={styles.colTitle}>Get in touch</h2>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <Icon name="mail" size={17} className={styles.contactIcon} />
                <a href={`mailto:${contact.email}`} className={styles.link}>
                  {contact.email}
                </a>
              </li>
              <li className={styles.contactItem}>
                <Icon name="phone" size={17} className={styles.contactIcon} />
                <a href={`tel:${contact.phoneE164}`} className={styles.link}>
                  {contact.phoneDisplay}
                </a>
              </li>
              <li className={styles.contactItem}>
                <Icon name="instagram" size={17} className={styles.contactIcon} />
                <a
                  href={contact.instagramUrl}
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contact.instagramHandle}
                </a>
              </li>
              <li className={styles.contactItem}>
                <Icon name="mapPin" size={17} className={styles.contactIcon} />
                <address className={styles.address}>
                  {address.street},
                  <br />
                  {address.locality} {address.postalCode}
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* Closing band --------------------------------------------------- */}
        <div className={styles.closing}>
          <p className={styles.closingLine}>{site.closingLine}</p>
        </div>

        <div className={styles.bottom}>
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className={styles.modes}>{contact.sessionModes.join(' · ')}</p>
        </div>
      </div>
    </footer>
  )
}
