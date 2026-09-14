import styles from './RichText.module.css'

/**
 * Renders body HTML written in the admin editor.
 *
 * The HTML is sanitised once, when it is saved (admin/lib/sanitize.ts), so what
 * is stored is already safe to inject and no sanitiser needs to ship to
 * visitors. Anything written straight into Firestore by other means would
 * bypass that — which is why firestore.rules only lets admins write these
 * fields.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={[styles.prose, className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
