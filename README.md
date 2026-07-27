# Pineappletales — website

Marketing site for **Pineappletales by Kenaa Jadeja** — Child Analyst, Author,
Neuro-Art Therapist and Bibliotherapist, Vadodara.

Front-end only. No backend, no database, no API. The build produces plain static
HTML files that can be dropped on any static host.

---

## Stack

| Concern       | Choice                                                     |
| ------------- | ---------------------------------------------------------- |
| Framework     | React 19 + TypeScript (strict)                             |
| Build         | Vite 8                                                     |
| Routing       | React Router 7 (library mode)                              |
| Styling       | CSS Modules on top of a CSS custom-property token layer    |
| SEO           | Build-time prerendering to static HTML + JSON-LD           |
| Dependencies  | `react`, `react-dom`, `react-router-dom` — nothing else    |

---

## Commands

```bash
npm install

npm run dev        # dev server with HMR
npm run typecheck  # tsc --noEmit
npm run build      # typecheck → client build → SSR build → prerender
npm run preview    # serve the built dist/ locally
npm run build:spa  # client-only build, skips prerendering (rarely needed)
```

`npm run build` writes to `dist/`. That folder is the deployable artefact.

---

## How the SEO works

This is a static site, but it is **not** a JavaScript-only shell. `npm run build`
runs three steps:

1. `vite build` — the normal client bundle.
2. `vite build --ssr src/entry-server.tsx` — the same React tree compiled for Node.
3. `node scripts/prerender.mjs` — renders every route to a finished HTML document.

The result is one real document per route, each with its own `<title>`,
description, canonical, Open Graph / Twitter tags and JSON-LD — all present
before any JavaScript runs. The client bundle then hydrates the markup.

```
dist/
├── index.html                 /
├── about.html  about/index.html      /about
├── services.html  services/index.html /services
├── contact.html  contact/index.html   /contact
├── 404.html                   noindex 404 document
├── sitemap.xml                generated from the route table
└── robots.txt                 generated, points at the sitemap
```

Each route is written twice (`about.html` **and** `about/index.html`) so a bare
`/about` resolves whether the host appends `.html` or looks for a directory index.

### Structured data

`src/seo/structuredData.ts` builds a single `@graph` per page containing:

- `ProfessionalService` / `LocalBusiness` — the practice, with NAP, service
  catalogue and areas served (this is the entity local search keys off)
- `Person` — Kenaa Jadeja, linked to the practice
- `WebSite`, `WebPage` / `AboutPage` / `ContactPage` / `CollectionPage`
- `BreadcrumbList` on every page
- `ItemList` of services and `FAQPage` on `/services`

Everything is derived from `src/config/site.ts` and `src/data/*`, so the
structured data cannot drift from the visible copy.

### Editing page metadata

All of it lives in one file: **`src/seo/seo.config.ts`**. Add a route there and
it is automatically prerendered, added to the sitemap, and picked up by the
runtime `<Seo />` component during client-side navigation.

---

## Before going live

Two things need real values:

1. **Domain.** Canonical URLs, the sitemap and JSON-LD default to
   `https://www.pineappletales.in`. Set the real origin at build time:

   ```bash
   VITE_SITE_URL=https://your-domain.com npm run build
   ```

   (or edit the fallback in `src/config/site.ts`).

2. **Social share image.** `public/og-image.jpg` is currently the business card
   artwork. Ideally replace it with a purpose-made 1200×630 image — it is what
   appears when the site is shared on WhatsApp, Instagram or LinkedIn.

Optional, worth doing once the site is live: verify the domain in Google Search
Console, submit `sitemap.xml`, and create a Google Business Profile for the Gotri
Road studio pointing at the site (this is what makes the `LocalBusiness` markup
pay off).

---

## Deployment

`dist/` is a plain static folder — no Node runtime required.

- **Netlify / Cloudflare Pages** — build `npm run build`, publish `dist`.
  `public/_redirects` is already configured to serve `404.html` with a real 404
  status for unknown paths.
- **Vercel** — build `npm run build`, output directory `dist`. Clean URLs are on
  by default, so `/about` resolves to `about.html`.
- **GitHub Pages / nginx / Apache** — directory-index resolution picks up
  `about/index.html`. Point the host's 404 handler at `404.html`.

---

## Project structure

```
src/
├── config/site.ts          Business identity, contact/NAP, navigation.
│                           Change a phone number here and it changes everywhere.
├── data/                   Content, separated from presentation
│   ├── services.ts         The six core services + session formats
│   ├── audiences.ts        For children / parents / communities
│   ├── approach.ts         Method, philosophy, guiding principles
│   └── faqs.ts             FAQ copy (also emitted as FAQPage schema)
├── seo/
│   ├── seo.config.ts       Per-route <head> — the single source of truth
│   ├── structuredData.ts   JSON-LD builders
│   └── Seo.tsx             Keeps <head> in sync on client-side navigation
├── styles/
│   ├── tokens.css          Design tokens (colour, type, space, motion)
│   └── base.css            Reset and base element styles
├── components/
│   ├── ui/                 Primitives: Button, Card, Container, Section,
│   │                       SectionHeading, TickList, Accordion, Logo, Icon
│   ├── layout/             Header, Footer, Layout shell, ScrollToTop
│   └── sections/           Composed blocks: Hero, PageHero, CtaBanner,
│                           BrandCollage
├── pages/                  One folder per route: component + its CSS module
├── App.tsx                 Route table
├── main.tsx                Client entry (hydrates prerendered markup)
└── entry-server.tsx        Build-time entry used by the prerenderer
```

### Adding a page

1. Create `src/pages/Thing/Thing.tsx` (+ `Thing.module.css`).
2. Register the route in `src/App.tsx`.
3. Add a `PageSeo` entry in `src/seo/seo.config.ts` and include it in `seoPages`.
4. Add it to `primaryNav` in `src/config/site.ts` if it belongs in the header.

Prerendering, the sitemap and the runtime head all follow automatically.

---

## Design system

Colours are taken from the brand collateral: the golden yellow of the pineapple
mark (`--brand-500: #f2be1a`), the warm near-black of the wordmark
(`--ink-900: #16130f`), the cream card stock (`--canvas`, `--surface-alt`) and
the espresso tone of the Instagram creatives (`--espresso-900`), used for the
dark editorial bands. The green / coral / indigo accents come from the geometric
shapes on the studio poster and are used only as small category markers.

Type pairs **Playfair Display** (display serif — headings, pull quotes) with
**Inter** (UI and body). Sizes are fluid `clamp()` values, so there are no
type-size breakpoints to maintain.

Layout breakpoints are `rem`-based and mobile-first: 30 / 34 / 40 / 48 / 62 / 64rem.

### Accessibility notes

- Skip link, one `<h1>` per page, labelled landmarks and `aria-labelledby` on
  every section.
- FAQ uses native `<details>`/`<summary>` — keyboard accessible, and the answers
  stay in the DOM for crawlers.
- Visible `:focus-visible` rings, `prefers-reduced-motion` honoured.
- Mobile menu traps body scroll and closes on `Escape`.

---

## The contact form

`src/pages/Contact/EnquiryForm.tsx` has no server to post to. On submit it
composes a structured `mailto:` and hands it to the visitor's mail client;
nothing is sent or stored by the page. If a real inbox integration is wanted
later, swapping the submit handler for a Formspree/Netlify Forms endpoint is a
single-function change.
