import type { Metadata } from 'next'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { TickList } from '@/components/ui/TickList'
import { PageHero } from '@/components/sections/PageHero'
import { JsonLd } from '@/components/JsonLd'
import { SITE_URL, address, contact, site } from '@/config/site'
import { buildMetadata } from '@/seo/nextMetadata'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'
import { EnquiryForm } from './EnquiryForm'

const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = buildMetadata({
  title: 'Contact Pineappletales | Book a Session in Vadodara or Online',
  description:
    'Book a Neuro-Art Therapy, Bibliotherapy or parent guidance session with Kenaa Jadeja. Studio at Gotri Road, Vadodara — call +91 98256 78226, email or message on Instagram.',
  canonical: `${SITE_URL}/contact`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: `Contact ${site.name}`,
})

const jsonLd = buildGraph([
  organisationSchema(),
  personSchema(),
  websiteSchema(),
  webPageSchema({
    path: '/contact',
    name: `Contact — ${site.name}`,
    description: 'Contact details, studio address and session formats for Pineappletales.',
    type: 'ContactPage',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ]),
])

const channels = [
  { icon: 'mail' as const, label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
  { icon: 'phone' as const, label: 'Phone', value: contact.phoneDisplay, href: `tel:${contact.phoneE164}` },
  { icon: 'whatsapp' as const, label: 'WhatsApp', value: contact.phoneDisplay, href: contact.whatsappUrl },
  { icon: 'instagram' as const, label: 'Instagram', value: contact.instagramHandle, href: contact.instagramUrl },
]

export default function ContactPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        eyebrow="Contact"
        title="Let’s connect"
        lead="Send a message to book a session or collaborate. Share your child’s age and what you’d like support with, and you’ll receive a recommended starting point."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="reveal bg-paper py-20 md:py-28">
        <Container className="grid gap-12 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <span className="eyebrow text-brand-deep">Ways to reach us</span>
            <h2 className="font-display mt-3 text-[1.6rem] font-semibold leading-[1.15]">Pick whichever is easiest</h2>

            <ul className="mt-7 flex flex-col gap-3">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    className="lift flex items-center gap-4 rounded-2xl border border-line bg-card p-4"
                    {...(channel.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-ink">
                      <Icon name={channel.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="eyebrow block text-ink-soft">{channel.label}</span>
                      <span className="block truncate text-[0.98rem] font-medium">{channel.value}</span>
                    </span>
                    <Icon name="arrowRight" size={16} className="shrink-0 text-ink-soft" />
                  </a>
                </li>
              ))}
            </ul>

            <Card tone="alt" className="mt-6">
              <h3 className="flex items-center gap-2 font-display text-[1.1rem] font-semibold">
                <Icon name="mapPin" size={18} className="text-brand-deep" />
                Studio address
              </h3>
              <address className="mt-3 text-[0.95rem] not-italic leading-relaxed text-ink-soft">
                {address.street},
                <br />
                {address.locality} {address.postalCode}
                <br />
                {address.region}, {address.country}
              </address>
              <a
                href={address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-move mt-4 inline-flex items-center gap-1.5 text-[0.92rem] font-medium text-ink"
              >
                Open in Google Maps <span className="arrow" aria-hidden>→</span>
              </a>
            </Card>
          </div>

          <div className="md:col-span-7">
            <h2 className="font-display text-[1.6rem] font-semibold leading-[1.15]">Send an enquiry</h2>
            <div className="mt-6">
              <EnquiryForm />
            </div>
          </div>
        </Container>
      </section>

      <section className="reveal bg-paper-2 py-16 md:py-20">
        <Container>
          <span className="eyebrow text-brand-deep">Good to know</span>
          <h2 className="font-display mt-3 text-[1.6rem] font-semibold leading-[1.15]">Before your first session</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card tone="surface">
              <h3 className="font-display text-[1.05rem] font-semibold">Helpful to include</h3>
              <div className="mt-3">
                <TickList
                  size="compact"
                  items={[
                    'Your child’s age',
                    'What you’ve noticed at home or school',
                    'What you would like to change',
                    'Whether you prefer offline or online sessions',
                  ]}
                />
              </div>
            </Card>
            <Card tone="surface">
              <h3 className="font-display text-[1.05rem] font-semibold">Session modes</h3>
              <div className="mt-3">
                <TickList size="compact" items={contact.sessionModes} />
              </div>
              <p className="mt-4 text-[0.88rem] text-ink-soft">
                Writing and Neuro-Art workshops run in both formats. School and community programmes are scheduled
                directly with the institution.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* <section className="bg-ink py-16 text-paper md:py-20">
        <Container width="narrow">
          <p className="text-center font-display text-[1.4rem] font-medium leading-[1.4]">{site.closingLine}</p>
        </Container>
      </section> */}
    </>
  )
}
