/**
 * Static site generation for Pineappletales.
 *
 * Runs after both Vite builds and turns the single-page shell into one complete
 * HTML document per route — real markup, a real <head>, real JSON-LD — so
 * crawlers, link previews and no-JS visitors get the full page immediately. The
 * client bundle then hydrates it.
 *
 * Fixed routes come from src/seo/seo.config.ts. Blog posts and events are
 * fetched from Firestore at build time, so each published record also becomes a
 * real file with its own canonical URL and sitemap entry:
 *
 *   dist/index.html               →  /
 *   dist/about/index.html         →  /about
 *   dist/services/index.html      →  /services
 *   dist/blog/index.html          →  /blog
 *   dist/blog/<slug>/index.html   →  /blog/<slug>
 *   dist/events/<slug>/index.html →  /events/<slug>
 *   dist/podcast/index.html       →  /podcast
 *   dist/404.html                 →  host 404 fallback
 *   dist/sitemap.xml, dist/robots.txt
 *
 * Anything published after the last build has no file yet: the hosting rewrite
 * serves the shell and the page fetches itself at runtime. The next deploy
 * bakes it in.
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
const ROOT_DIV = '<div id="root">'

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

/**
 * Line and paragraph separators are legal inside a JSON string but terminate
 * a line in a classic <script>, so they must be escaped alongside the angle
 * brackets. Built from a string literal to keep this source ASCII.
 */
const LINE_SEPARATORS = new RegExp('[\\u2028\\u2029]', 'g')

/** JSON embedded in a <script> must not be able to close or break it. */
const jsonScriptSafe = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(LINE_SEPARATORS, (character) =>
      character.charCodeAt(0) === 0x2028 ? '\\u2028' : '\\u2029',
    )

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
  ]

  // Article metadata, present only on blog posts and events.
  if (seo.publishedTime) {
    meta.push(
      `<meta property="article:published_time" content="${attr(seo.publishedTime)}" />`,
    )
  }
  if (seo.modifiedTime) {
    meta.push(
      `<meta property="article:modified_time" content="${attr(seo.modifiedTime)}" />`,
    )
  }
  if (seo.author) {
    meta.push(`<meta property="article:author" content="${attr(seo.author)}" />`)
  }

  meta.push(
    '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(seo.title)}" />`,
    `<meta name="twitter:description" content="${attr(seo.description)}" />`,
    `<meta name="twitter:image" content="${attr(seo.ogImage)}" />`,
    `<meta name="twitter:image:alt" content="${attr(seo.ogImageAlt)}" />`,
    '',
    `<script type="application/ld+json" data-seo="managed">${jsonScriptSafe(seo.jsonLd)}</script>`,
  )

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
      const changefreq = page.sitemap?.changefreq ?? 'monthly'
      const priority = (page.sitemap?.priority ?? 0.5).toFixed(1)
      return [
        '  <url>',
        `    <loc>${attr(page.canonical)}</loc>`,
        // A record's own last-modified date is far more useful to a crawler
        // than the build date, which would touch every URL on every deploy.
        `    <lastmod>${attr(page.lastmod ?? today)}</lastmod>`,
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
    '# The admin is behind authentication and has nothing to index.',
    'Disallow: /admin',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
}

async function main() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8')

  if (
    !template.includes(HEAD_START) ||
    !template.includes(APP_PLACEHOLDER) ||
    !template.includes(ROOT_DIV)
  ) {
    throw new Error(
      'dist/index.html is missing the prerender markers. Check index.html for <!--seo:start-->, <div id="root"> and <!--app-html-->.',
    )
  }

  const {
    render,
    seoPages,
    SITE_URL,
    site,
    collectContentRoutes,
    indexListSchemas,
  } = await import(pathToFileURL(SSR_ENTRY).href)

  // Published content. Returns empty lists (and logs a warning) when Firebase
  // is not configured, so the site still builds before .env has been filled in.
  // A query that fails for any other reason stops the build rather than baking
  // an empty archive into the static HTML.
  const content = await collectContentRoutes()
  const listSchemas = indexListSchemas(content)

  const headPattern = new RegExp(`${HEAD_START}[\\s\\S]*?${HEAD_END}`)

  /** Writes one document. */
  async function emit(seo, snapshot) {
    const routeUrl = seo.path === '/404' ? '/this-route-does-not-exist' : seo.path
    const appHtml = render(routeUrl, snapshot)

    const head = `${HEAD_START}\n${buildHead(seo, site.name)}\n    ${HEAD_END}`

    // Function replacers, not string replacers: `$&`, `$1`, `$$` and friends in
    // the rendered markup or JSON-LD would otherwise be treated as substitution
    // patterns and silently corrupt the output.
    let html = template
      .replace(headPattern, () => head)
      .replace(APP_PLACEHOLDER, () => appHtml)

    // The data this page was rendered from, so hydration matches the markup
    // rather than flashing a loading state and refetching. A classic inline
    // script runs before the deferred module bundle, so it is set in time.
    if (snapshot && Object.keys(snapshot).length > 0) {
      html = html.replace(
        ROOT_DIV,
        () =>
          `<script>window.__CONTENT__=${jsonScriptSafe(snapshot)}</script>\n    ${ROOT_DIV}`,
      )
    }

    const targets = outputPathsFor(seo.path)
    for (const target of targets) {
      const outputPath = join(DIST, target)
      await mkdir(dirname(outputPath), { recursive: true })
      await writeFile(outputPath, html, 'utf8')
    }

    return targets
  }

  // Fixed routes ------------------------------------------------------------
  for (const seo of seoPages) {
    const snapshot = content.indexSnapshots[seo.path] ?? {}

    // Index pages list their records, so their @graph gains an ItemList.
    const listSchema = listSchemas[seo.path]
    const withList = listSchema
      ? { ...seo, jsonLd: { ...seo.jsonLd, '@graph': [...seo.jsonLd['@graph'], listSchema] } }
      : seo

    const targets = await emit(withList, snapshot)
    console.log(`  prerendered  ${seo.path.padEnd(12)} →  ${targets.join(', ')}`)
  }

  // Records -----------------------------------------------------------------
  for (const route of content.routes) {
    await emit(route.seo, route.snapshot)
  }

  if (content.routes.length > 0) {
    console.log(
      `  prerendered  ${content.counts.blogs} blog post(s), ${content.counts.events} event(s)`,
    )
  } else {
    console.log(
      '  no content    Firestore returned nothing to prerender (check VITE_FIREBASE_API_KEY, or publish some records)',
    )
  }

  // Sitemap and robots ------------------------------------------------------
  const sitemapPages = [...seoPages, ...content.routes.map((route) => route.seo)]

  await writeFile(join(DIST, 'sitemap.xml'), buildSitemap(sitemapPages), 'utf8')
  await writeFile(join(DIST, 'robots.txt'), buildRobots(SITE_URL), 'utf8')

  const indexed = sitemapPages.filter((page) => !page.noIndex).length
  console.log(
    `  generated    sitemap.xml (${indexed} URLs), robots.txt  (origin: ${SITE_URL})`,
  )
}

main().catch((error) => {
  console.error('\nPrerender failed:\n', error)
  process.exit(1)
})
