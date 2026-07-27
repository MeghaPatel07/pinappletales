import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TickList } from '@/components/ui/TickList'
import { PageHero } from '@/components/sections/PageHero'
import { address, contact, site } from '@/config/site'
import { EnquiryForm } from './EnquiryForm'
import styles from './Contact.module.css'

const channels = [
  {
    icon: 'mail' as const,
    label: 'Email',
    value: contact.email,
    href: `mailto:${contact.email}`,
    hint: 'Best for detailed enquiries',
  },
  {
    icon: 'phone' as const,
    label: 'Phone',
    value: contact.phoneDisplay,
    href: `tel:${contact.phoneE164}`,
    hint: 'Call to talk it through',
  },
  {
    icon: 'whatsapp' as const,
    label: 'WhatsApp',
    value: contact.phoneDisplay,
    href: contact.whatsappUrl,
    hint: 'Quick questions and scheduling',
  },
  {
    icon: 'instagram' as const,
    label: 'Instagram',
    value: contact.instagramHandle,
    href: contact.instagramUrl,
    hint: 'Follow along, or send a DM',
  },
]

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s connect"
        lead="Send a message to book a session or collaborate. Share your child’s age and what you’d like support with, and you’ll receive a recommended starting point."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      {/* Channels + form -------------------------------------------------- */}
      <Section tone="canvas" aria-labelledby="reach-title">
        <Container>
          <div className={styles.layout}>
            <div className={styles.aside}>
              <SectionHeading
                id="reach-title"
                eyebrow="Ways to reach us"
                title="Pick whichever is easiest"
              />

              <ul className={styles.channelList}>
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      className={styles.channel}
                      {...(channel.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <span className={styles.channelIcon}>
                        <Icon name={channel.icon} size={18} />
                      </span>
                      <span className={styles.channelText}>
                        <span className={styles.channelLabel}>{channel.label}</span>
                        <span className={styles.channelValue}>{channel.value}</span>
                        <span className={styles.channelHint}>{channel.hint}</span>
                      </span>
                      <Icon name="arrowRight" size={16} className={styles.channelArrow} />
                    </a>
                  </li>
                ))}
              </ul>

              <Card tone="alt" className={styles.studioCard}>
                <h3 className={styles.studioTitle}>
                  <Icon name="mapPin" size={18} className={styles.studioIcon} />
                  Studio address
                </h3>
                <address className={styles.address}>
                  {address.street},
                  <br />
                  {address.locality} {address.postalCode}
                  <br />
                  {address.region}, {address.country}
                </address>
                <a
                  href={address.mapsUrl}
                  className={styles.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                  <Icon name="arrowRight" size={15} />
                </a>
              </Card>
            </div>

            <div className={styles.formColumn}>
              <h2 className={styles.formTitle}>Send an enquiry</h2>
              <EnquiryForm />
            </div>
          </div>
        </Container>
      </Section>

      {/* Practicalities --------------------------------------------------- */}
      <Section tone="alt" size="compact" aria-labelledby="practical-title">
        <Container>
          <div className={styles.practical}>
            <SectionHeading
              id="practical-title"
              eyebrow="Good to know"
              title="Before your first session"
            />
            <div className={styles.practicalGrid}>
              <Card tone="surface">
                <h3 className={styles.practicalTitle}>Helpful to include</h3>
                <TickList
                  size="compact"
                  items={[
                    'Your child’s age',
                    'What you’ve noticed at home or school',
                    'What you would like to change',
                    'Whether you prefer offline or online sessions',
                  ]}
                />
              </Card>
              <Card tone="surface">
                <h3 className={styles.practicalTitle}>Session modes</h3>
                <TickList size="compact" items={contact.sessionModes} />
                <p className={styles.practicalNote}>
                  Writing and Neuro-Art workshops run in both formats. School and
                  community programmes are scheduled directly with the institution.
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Closing ---------------------------------------------------------- */}
      <Section tone="dark" size="compact">
        <Container width="narrow">
          <p className={styles.closing}>{site.closingLine}</p>
        </Container>
      </Section>
    </>
  )
}
