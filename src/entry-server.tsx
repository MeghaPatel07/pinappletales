import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { App } from './App'
import { SITE_URL } from './config/site'
import { seoPages, getSeo, type PageSeo } from './seo/seo.config'

/**
 * Build-time entry point consumed by scripts/prerender.mjs.
 *
 * Vite compiles this with `--ssr`, then the script renders each route to a
 * complete HTML document. Nothing here runs in the browser.
 */

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}

export { seoPages, getSeo, SITE_URL }
export type { PageSeo }
