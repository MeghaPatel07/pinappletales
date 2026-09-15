import type { JsonLd as JsonLdType } from '@/seo/structuredData'

/** Line/paragraph separators are legal JSON but terminate a <script> line. */
const LINE_SEPARATORS = new RegExp('[\\u2028\\u2029]', 'g')

/** JSON embedded in a <script> must not be able to close or break it. */
function jsonScriptSafe(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(LINE_SEPARATORS, (character) =>
      character.charCodeAt(0) === 0x2028 ? '\\u2028' : '\\u2029',
    )
}

export function JsonLd({ data }: { data: JsonLdType }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonScriptSafe(data) }}
    />
  )
}
