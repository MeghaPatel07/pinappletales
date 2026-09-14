/**
 * HTML sanitising for editor output.
 *
 * Runs once, on save, rather than on every render. That keeps DOMPurify inside
 * the admin bundle — public pages inject already-clean HTML and never pay for
 * a sanitiser — and it means what is stored is what is shown, so the
 * prerendered HTML and the runtime HTML cannot differ.
 */

import DOMPurify from 'dompurify'

/** Everything the editor's toolbar can produce, and nothing else. */
const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'span', 'div',
  'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'iframe',
]

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'title',
  'src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding',
  'class', 'style',
  'colspan', 'rowspan', 'align',
  'allow', 'allowfullscreen', 'frameborder',
]

/** Video embeds are useful in a post; anything else in an iframe is not. */
const IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
]

let hooksInstalled = false

function installHooks(): void {
  if (hooksInstalled) return
  hooksInstalled = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'IFRAME') {
      const src = node.getAttribute('src') ?? ''
      let allowed = false
      try {
        allowed = IFRAME_HOSTS.includes(new URL(src, window.location.href).hostname)
      } catch {
        allowed = false
      }
      if (!allowed) node.remove()
      return
    }

    // Links that open in a new tab must not hand the opener to the target.
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer')
    }

    // Images the editor inserted should not block first paint.
    if (node.tagName === 'IMG') {
      if (!node.getAttribute('loading')) node.setAttribute('loading', 'lazy')
      if (!node.getAttribute('decoding')) node.setAttribute('decoding', 'async')
    }
  })
}

/**
 * Returns HTML safe to inject with dangerouslySetInnerHTML.
 * Empty output (an editor left with only a stray <p><br></p>) collapses to ''.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  installHooks()

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // data: URIs would let a base64 image bloat the document; uploads go to
    // Cloudinary instead.
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
    ADD_ATTR: ['target'],
    KEEP_CONTENT: true,
  })

  return clean.replace(/^(?:\s|<p>(?:\s|<br\s*\/?>|&nbsp;)*<\/p>)+$/gi, '').trim()
}
