'use client'

/**
 * Transient confirmations and errors.
 *
 * Rendered in an aria-live region so a save is announced, not just shown, and
 * errors stay put until dismissed — a failed save should never scroll away
 * unnoticed.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Icon } from '@/components/ui/Icon'

type ToastTone = 'success' | 'error' | 'info'

type Toast = {
  id: number
  tone: ToastTone
  message: string
}

type ToastApi = {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const AUTO_DISMISS_MS = 4000

const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'border-brand-deep bg-brand text-ink',
  error: 'border-coral bg-coral text-paper',
  info: 'border-line bg-paper text-ink',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current
      nextId.current += 1

      setToasts((current) => [...current, { id, tone, message }])

      if (tone !== 'error') {
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
      }
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-[0.92rem] font-medium shadow-[0_20px_40px_-20px_rgba(36,31,24,0.5)] ${TONE_CLASSES[toast.tone]}`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              className="shrink-0 opacity-80 transition-opacity hover:opacity-100"
              onClick={() => dismiss(toast.id)}
            >
              <Icon name="close" size={15} />
              <span className="visually-hidden">Dismiss</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>.')
  }
  return context
}
