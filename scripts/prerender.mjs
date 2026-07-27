/**
 * Static site generation for Pineappletales.
 *
 * Runs after both Vite builds and turns the single-page shell into one complete
 * HTML document per route — real markup, a real <head>, real JSON-LD — so
 * crawlers, link previews and no-JS visitors get the full page immediately. The
 * client bundle then hydrates it.
 *
 *   dist/index.html          →  /
 *   dist/about/index.html    →  /about
 *   dist/services/index.html →  /services
 *   dist/contact/index.html  →  /contact
 *   dist/404.html            →  host 404 fallback
 *   dist/sitemap.xml, dist/robots.txt
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SSR_ENTRY = join(ROOT, 'dist-ssr', 'entry-server.js')

const HEAD_START = '<!--seo:start-->'
const HEAD_END = '<!--seo:end-->'
const APP_PLACEHOLDER = '<!--app-html-->'

/** Escapes a value destined for an HTML attribute. */
const attr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Escapes text content of an element. */
const text = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** JSON-LD must not be able to close the surrounding <script>. */
const jsonLdSafe = (value) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')

function buildHead(seo, siteName) {
  const meta = [
    `<title>${text(seo.title)}</title>`,
    `<meta name="description" content="${attr(seo.description)}" />`,
    `<meta name="robots" content="${seo.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}" />`,
    `<link rel="canonical" href="${attr(seo.canonical)}" />`,
    '',
    `<meta property="og:type" content="${attr(seo.ogType)}" />`,
    `<meta property="og:site_name" content="${attr(siteName)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:title" content="${attr(seo.title)}" />`,
    `<meta property="og:description" content="${attr(seo.description)}" />`,
    `<meta property="og:url" content="${attr(seo.canonical)}" />`,
    `<meta property="og:image" content="${attr(seo.ogImage)}" />`,
    `<meta property="og:image:alt" content="${attr(seo.ogImageAlt)}" />`,
    '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(seo.title)}" />`,
    `<meta name="twitter:description" content="${attr(seo.description)}" />`,
    `<meta name="twitter:image" content="${attr(seo.ogImage)}" />`,
    `<meta name="twitter:image:alt" content="${attr(seo.ogImageAlt)}" />`,
    '',
    `<script type="application/ld+json" data-seo="managed">${jsonLdSafe(seo.jsonLd)}</script>`,
  ]

  return meta.map((line) => (line === '' ? '' : `    ${line}`)).join('\n')
}

/**
 * Every route is written twice so a bare `/about` resolves on any static host:
 * `about.html` covers hosts that append the .html extension (Netlify, Vercel,
 * Cloudflare Pages, `vite preview`), `about/index.html` covers hosts that do
 * directory-index lookup (nginx, Apache, GitHub Pages).
 */
function outputPathsFor(routePath) {
  if (routePath === '/') return ['index.html']
  if (routePath === '/404') return ['404.html']
  const slug = routePath.replace(/^\//, '')
  return [`${slug}.html`, `${slug}/index.html`]
}

function buildSitemap(pages) {
  const today = new Date().toISOString().split('T')[0]

  const urls = pages
    .filter((page) => !page.noIndex)
    .map((page) => {
      const loc = page.canonical
      const changefreq = page.sitemap?.changefreq ?? 'monthly'
      const priority = (page.sitemap?.priority ?? 0.5).toFixed(1)
      return [
        '  <url>',
        `    <loc>${attr(loc)}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n')
}

function buildRobots(siteUrl) {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
}

async function main() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8')

  if (!template.includes(HEAD_START) || !template.includes(APP_PLACEHOLDER)) {
    throw new Error(
      'dist/index.html is missing the prerender markers. Check index.html for <!--seo:start--> and <!--app-html-->.',
    )
  }

  const { render, seoPages, SITE_URL } = await import(pathToFileURL(SSR_ENTRY).href)

  const headPattern = new RegExp(
    `${HEAD_START}[\\s\\S]*?${HEAD_END}`,
  )

  for (const seo of seoPages) {
    const routeUrl = seo.path === '/404' ? '/this-route-does-not-exist' : seo.path
    const appHtml = render(routeUrl)

    // Function replacers, not string replacers: `$&`, `$1`, `$$` and friends in
    // the rendered markup or JSON-LD would otherwise be treated as substitution
    // patterns and silently corrupt the output.
    const head = `${HEAD_START}\n${buildHead(seo, 'Pineappletales')}\n    ${HEAD_END}`
    const html = template
      .replace(headPattern, () => head)
      .replace(APP_PLACEHOLDER, () => appHtml)

    const targets = outputPathsFor(seo.path)
    for (const target of targets) {
      const outputPath = join(DIST, target)
      await mkdir(dirname(outputPath), { recursive: true })
      await writeFile(outputPath, html, 'utf8')
    }

    console.log(`  prerendered  ${seo.path.padEnd(10)} →  ${targets.join(', ')}`)
  }

  await writeFile(join(DIST, 'sitemap.xml'), buildSitemap(seoPages), 'utf8')
  await writeFile(join(DIST, 'robots.txt'), buildRobots(SITE_URL), 'utf8')

  console.log(`  generated    sitemap.xml, robots.txt  (origin: ${SITE_URL})`)
}

main().catch((error) => {
  console.error('\nPrerender failed:\n', error)
  process.exit(1)
})
