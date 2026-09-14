/**
 * Confirmation before a destructive action.
 *
 * Built on <dialog> so focus trapping, Escape-to-close and the backdrop come
 * from the platform rather than from hand-written key handlers.
 */

import { useEffect, useRef } from 'react'
import { AdminButton } from './Form'
import styles from './ConfirmDialog.module.css'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** Styles the confirm button as destructive. */
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Escape fires `cancel` rather than a click, so it needs handling separately.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      if (!busy) onCancel()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onCancel, busy])

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="confirm-title">
      <h2 id="confirm-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.message}>{message}</p>

      <div className={styles.actions}>
        <AdminButton variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </AdminButton>
        <AdminButton
          variant={destructive ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Working…' : confirmLabel}
        </AdminButton>
      </div>
    </dialog>
  )
}
