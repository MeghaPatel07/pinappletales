'use client'

/**
 * Confirmation before a destructive action.
 *
 * Built on <dialog> so focus trapping, Escape-to-close and the backdrop come
 * from the platform rather than from hand-written key handlers.
 */

import { useEffect, useRef } from 'react'
import { AdminButton } from './Form'

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
    <dialog
      ref={dialogRef}
      className="w-[min(28rem,90vw)] rounded-card border border-line bg-paper p-6 text-ink shadow-[0_40px_80px_-32px_rgba(36,31,24,0.5)] backdrop:bg-ink/40"
      aria-labelledby="confirm-title"
    >
      <h2 id="confirm-title" className="font-display text-[1.2rem] font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-[0.95rem] text-ink-soft">{message}</p>

      <div className="mt-6 flex justify-end gap-3">
        <AdminButton variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </AdminButton>
        <AdminButton variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </AdminButton>
      </div>
    </dialog>
  )
}
