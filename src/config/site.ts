/**
 * Single source of truth for business identity, contact details (NAP) and
 * navigation. Every component and every SEO/structured-data helper reads from
 * here, so updating a phone number or address is a one-line change.
 */

/**
 * Production origin, no trailing slash. Used for canonical URLs, Open Graph
 * URLs, the sitemap and JSON-LD. Override at build time with:
 *   VITE_SITE_URL=https://your-domain.com npm run build
 */
export const SITE_URL: string = (
  import.meta.env.VITE_SITE_URL ?? 'https://www.pineappletales.com'
).replace(/\/$/, '')

export const site = {
  name: 'Pineappletales',
  legalName: 'Pineappletales by Kenaa Jadeja',
  founder: 'Kenaa Jadeja',
  founderTitles: [
    'Child Analyst',
    'Author',
    'Neuro-Art Therapist',
    'Bibliotherapist',
  ],
  /** Rendered under the wordmark, matching the printed collateral. */
  founderTitleLine: 'Child Analyst • Neuro-Art Therapist • Bibliotherapist',
  tagline: 'Empowering every Parent–Child Mind.',
  strapline: 'Nurturing minds, inspiring growth.',
  promise: 'Personalised. Creative. Meaningful.',
  supportLine: 'Therapy that understands and empowers.',
  closingLine: "Let's build a brighter tomorrow, one child at a time.",
  description:
    'Neuro-Art Therapy, Bibliotherapy and creative writing workshops for children, parents and schools — led by Kenaa Jadeja in Vadodara, offline and online.',
} as const

export const contact = {
  email: 'pineappletales1@gmail.com',
  phoneDisplay: '+91 98256 78226',
  phoneE164: '+919825678226',
  instagramHandle: '@pineappletales1',
  instagramUrl: 'https://www.instagram.com/pineappletales1/',
  whatsappUrl:
    'https://wa.me/919825678226?text=Hi%20Kenaa%2C%20I%27d%20like%20to%20know%20more%20about%20Pineappletales%20sessions.',
  sessionModes: ['Offline sessions in Vadodara', 'Online sessions worldwide'],
} as const

export const address = {
  street: '5/6 Mangal Murti Society, opposite Mother’s School',
  locality: 'Gotri Road, Vadodara',
  region: 'Gujarat',
  postalCode: '390021',
  country: 'India',
  countryCode: 'IN',
  /** Single-line form for meta descriptions and JSON-LD. */
  full: '5/6 Mangal Murti Society, opposite Mother’s School, Gotri Road, Vadodara, Gujarat 390021, India',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Mangal+Murti+Society+Gotri+Road+Vadodara+390021',
} as const

export type NavItem = {
  label: string
  path: string
}

export const primaryNav: readonly NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Events', path: '/events' },
  { label: 'Blog', path: '/blog' },
  { label: 'Podcast', path: '/podcast' },
  { label: 'Contact', path: '/contact' },
] as const

/** Areas served — used for local SEO copy and structured data. */
export const areasServed: readonly string[] = [
  'Vadodara',
  'Gujarat',
  'Online — India & worldwide',
] as const
