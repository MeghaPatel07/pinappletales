/**
 * Schema.org JSON-LD builders. Everything is derived from the site config and
 * data files so the structured data can never drift from the visible copy.
 */

import { SITE_URL, address, areasServed, contact, site } from '@/config/site'
import { services } from '@/data/services'
import { faqs } from '@/data/faqs'

export type JsonLd = Record<string, unknown>

export const ORGANISATION_ID = `${SITE_URL}/#organization`
export const PERSON_ID = `${SITE_URL}/#kenaa-jadeja`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const absoluteUrl = (path: string): string =>
  path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

/** The practice itself — the anchor entity for local search. */
export function organisationSchema(): JsonLd {
  return {
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': ORGANISATION_ID,
    name: site.name,
    alternateName: site.legalName,
    url: SITE_URL,
    description: site.description,
    slogan: site.strapline,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/logo.png'),
      caption: `${site.name} logo`,
    },
    image: absoluteUrl('/og-image.jpg'),
    email: contact.email,
    telephone: contact.phoneE164,
    founder: { '@id': PERSON_ID },
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: 'Vadodara',
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.countryCode,
    },
    areaServed: areasServed.map((name) => ({ '@type': 'AdministrativeArea', name })),
    sameAs: [contact.instagramUrl],
    knowsAbout: [
      'Neuro-Art Therapy',
      'Bibliotherapy',
      'Child behaviour analysis',
      'Child development',
      'Creative writing for children',
      'Neuroplasticity',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Pineappletales services',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          description: service.summary,
          serviceType: service.title,
          provider: { '@id': ORGANISATION_ID },
          areaServed: 'Vadodara, Gujarat, India and online',
          url: `${SITE_URL}/services#${service.id}`,
        },
      })),
    },
  }
}

/** Kenaa Jadeja as the practitioner behind the practice. */
export function personSchema(): JsonLd {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.founder,
    url: `${SITE_URL}/about`,
    jobTitle: site.founderTitles.join(', '),
    description: `${site.founder} is a ${site.founderTitles.join(', ').toLowerCase()} working with children, parents and schools through Neuro-Art Therapy, Bibliotherapy and creative writing workshops.`,
    image: absoluteUrl('/logo.png'),
    email: contact.email,
    telephone: contact.phoneE164,
    worksFor: { '@id': ORGANISATION_ID },
    knowsAbout: [
      'Child psychology',
      'Neuro-Art Therapy',
      'Bibliotherapy',
      'Neuroplastic development',
    ],
    sameAs: [contact.instagramUrl],
  }
}

export function websiteSchema(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: site.name,
    description: site.description,
    inLanguage: 'en-IN',
    publisher: { '@id': ORGANISATION_ID },
  }
}

export function webPageSchema(params: {
  path: string
  name: string
  description: string
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'
}): JsonLd {
  const url = absoluteUrl(params.path)
  return {
    '@type': params.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: params.name,
    description: params.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANISATION_ID },
    inLanguage: 'en-IN',
  }
}

export function breadcrumbSchema(
  trail: readonly { name: string; path: string }[],
): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

export function faqSchema(): JsonLd {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function servicesListSchema(): JsonLd {
  return {
    '@type': 'ItemList',
    name: 'Services offered by Pineappletales',
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
        serviceType: service.title,
        url: `${SITE_URL}/services#${service.id}`,
        provider: { '@id': ORGANISATION_ID },
        audience: { '@type': 'Audience', audienceType: service.bestFor },
        areaServed: 'Vadodara, Gujarat, India and online',
      },
    })),
  }
}

/**
 * Wraps a set of node schemas into a single @graph document, which is the
 * preferred shape when several entities reference one another.
 */
export function buildGraph(nodes: readonly JsonLd[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  }
}
