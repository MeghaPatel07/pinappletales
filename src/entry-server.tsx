import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { App } from './App'
import { SITE_URL, site } from './config/site'
import { seoPages, getSeo, type PageSeo } from './seo/seo.config'
import { setSnapshot, snapshotKeys } from './content/snapshot'
import {
  collectContentRoutes,
  indexListSchemas,
  type ContentRoute,
} from './content/prerender'

/**
 * Build-time entry point consumed by scripts/prerender.mjs.
 *
 * Vite compiles this with `--ssr`, then the script renders each route to a
 * complete HTML document. Nothing here runs in the browser.
 */

/**
 * Renders one route.
 *
 * `snapshot` is the content this page needs, already fetched. It is installed
 * before rendering so the components read it synchronously instead of showing
 * a loading state, and the script writes the same object into the document as
 * `window.__CONTENT__` so the client hydrates against identical markup.
 */
export function render(url: string, snapshot: Record<string, unknown> = {}): string {
  setSnapshot(snapshot)

  try {
    return renderToString(
      <StrictMode>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </StrictMode>,
    )
  } finally {
    // Never let one page's data leak into the next render.
    setSnapshot({})
  }
}

export {
  SITE_URL,
  site,
  seoPages,
  getSeo,
  collectContentRoutes,
  indexListSchemas,
  snapshotKeys,
}
export type { PageSeo, ContentRoute }
