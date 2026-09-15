/**
 * Renders body HTML written in the admin editor.
 *
 * The HTML is sanitised once, when it is saved (admin/lib/sanitize.ts), so what
 * is stored is already safe to inject and no sanitiser needs to ship to
 * visitors. Anything written straight into MongoDB by other means would
 * bypass that — which is why the /api/admin/** write routes are the only way
 * in, and they're gated by src/middleware.ts.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={[
        'prose max-w-none text-[1.05rem] leading-relaxed text-ink-soft',
        'prose-headings:font-display prose-headings:font-medium prose-headings:text-ink prose-headings:tracking-[-0.01em]',
        'prose-p:my-4 prose-a:text-brand-deep prose-a:underline-offset-2 prose-strong:text-ink',
        'prose-img:rounded-card prose-blockquote:border-l-brand prose-blockquote:font-display prose-blockquote:italic',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
