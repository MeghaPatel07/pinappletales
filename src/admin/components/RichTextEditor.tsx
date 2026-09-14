/**
 * The long-form body editor (Jodit).
 *
 * Loaded with React.lazy so its ~1 MB of JavaScript and CSS only arrives on the
 * screens that actually edit a body — list pages never pay for it.
 *
 * Images do not use Jodit's own uploader. They are routed through
 * lib/cloudinary's `uploadImage` instead, which means the toolbar button,
 * drag-and-drop and paste all behave the same and all honour whichever upload
 * path is configured. Jodit's base64 fallback is switched off deliberately: a
 * pasted screenshot would otherwise be inlined into the document and stored in
 * Firestore.
 */

import { Suspense, lazy, useCallback, useMemo, useRef, useState } from 'react'
import type { IJodit } from 'jodit/esm/types/jodit'
import type { JoditEditorProps } from 'jodit-react'
import { cloudinaryUrl, isCloudinaryConfigured, uploadImage, UploadError } from '@/lib/cloudinary'
import styles from './RichTextEditor.module.css'

const JoditEditor = lazy(() => import('jodit-react'))

type RichTextEditorProps = {
  label: string
  value: string
  onChange: (html: string) => void
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
  height?: number
}

/** Bodies are rendered at ~740px; 1200 covers retina without shipping originals. */
const INSERT_WIDTH = 1200

export function RichTextEditor({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  placeholder = 'Write the article…',
  height = 460,
}: RichTextEditorProps) {
  const [status, setStatus] = useState('')
  const editorRef = useRef<IJodit | null>(null)

  const insertImage = useCallback(async (editor: IJodit, file: File) => {
    if (!isCloudinaryConfigured()) {
      setStatus('Cloudinary is not configured, so images cannot be uploaded yet.')
      return
    }

    setStatus(`Uploading ${file.name}…`)

    try {
      const uploaded = await uploadImage(file)
      const src = cloudinaryUrl(uploaded, { width: INSERT_WIDTH, crop: 'limit' })
      editor.s.insertHTML(
        `<img src="${src}" alt="" loading="lazy" decoding="async" />`,
      )
      setStatus('')
    } catch (caught) {
      setStatus(
        caught instanceof UploadError ? caught.message : 'Image upload failed.',
      )
    }
  }, [])

  /** Picks images out of a paste or drop and handles them ourselves. */
  const handleDroppedFiles = useCallback(
    (editor: IJodit, files: FileList | null | undefined, event: Event) => {
      const images = Array.from(files ?? []).filter((file) =>
        file.type.startsWith('image/'),
      )
      if (images.length === 0) return undefined

      event.preventDefault()
      event.stopPropagation()

      void (async () => {
        for (const image of images) {
          await insertImage(editor, image)
        }
      })()

      // Tells Jodit not to run its own handling for this event.
      return false
    },
    [insertImage],
  )

  // jodit-react destroys and rebuilds the editor whenever `config` changes
  // identity, which would wipe the caret on every keystroke. Both this and
  // `attachEditor` below must therefore stay referentially stable.
  const config = useMemo(
    () =>
      ({
        height,
        placeholder,
        toolbarAdaptive: false,
        toolbarSticky: true,
        statusbar: true,
        spellcheck: true,
        // Word and Google Docs paste a wall of inline styles; take the text.
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: 'insert_clear_html',
        uploader: { insertImageAsBase64URI: false },
        buttons: [
          'bold',
          'italic',
          'underline',
          'strikethrough',
          '|',
          'paragraph',
          'brush',
          '|',
          'ul',
          'ol',
          '|',
          'link',
          'cloudinaryImage',
          'table',
          '|',
          'align',
          'hr',
          'eraser',
          '|',
          'undo',
          'redo',
          '|',
          'source',
        ],
        extraButtons: [
          {
            name: 'cloudinaryImage',
            icon: 'image',
            tooltip: 'Upload an image',
            exec: (editor: IJodit) => {
              const picker = document.createElement('input')
              picker.type = 'file'
              picker.accept = 'image/jpeg,image/png,image/webp,image/avif,image/gif'
              picker.addEventListener('change', () => {
                const file = picker.files?.[0]
                if (file) void insertImage(editor, file)
              })
              picker.click()
            },
          },
        ],
      }) as JoditEditorProps['config'],
    [height, placeholder, insertImage],
  )

  const attachEditor = useCallback(
    (editor: IJodit) => {
      editorRef.current = editor

      editor.e.on('paste', (event: ClipboardEvent) =>
        handleDroppedFiles(editor, event.clipboardData?.files, event),
      )
      editor.e.on('drop', (event: DragEvent) =>
        handleDroppedFiles(editor, event.dataTransfer?.files, event),
      )
    },
    [handleDroppedFiles],
  )

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <span className={styles.label}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : (
            <span className={styles.optional}>optional</span>
          )}
        </span>
        {status && <span className={styles.status}>{status}</span>}
      </div>

      <div
        className={[styles.editor, error ? styles.invalid : ''].filter(Boolean).join(' ')}
      >
        <Suspense
          fallback={
            <div className={styles.loading} style={{ height }}>
              Loading editor…
            </div>
          }
        >
          <JoditEditor
            value={value}
            config={config}
            editorRef={attachEditor}
            onChange={onChange}
          />
        </Suspense>
      </div>

      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
