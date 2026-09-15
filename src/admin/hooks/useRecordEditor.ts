'use client'

/**
 * The plumbing shared by every "create or edit one record" screen: loading an
 * existing document, saving, deleting, and warning before a tab with unsaved
 * work is closed.
 *
 * Field state stays in each form, because that is the part that genuinely
 * differs between a blog post and a podcast.
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RawDocument } from '@/lib/apiTypes'
import { useToast } from '../components/Toast'
import {
  createRecord,
  deleteRecord,
  describeApiError,
  getRecord,
  updateRecord,
} from '../lib/crud'

type Options<T> = {
  collectionName: string
  /** Undefined, or the literal 'new', means this is a create screen. */
  id: string | undefined
  map: (doc: RawDocument) => T
  /** Populates the form's fields from a loaded record. */
  onLoaded: (record: T) => void
  /** Where to go after a delete, and what the back link points at. */
  listPath: string
  /** Used in toasts: "Post saved", "Event deleted". */
  label: string
}

export type RecordEditor = {
  /** True while an existing record is being fetched. */
  loading: boolean
  /** The id was not found — the form should render a message instead. */
  missing: boolean
  saving: boolean
  deleting: boolean
  /** Set once any field changes; drives the unsaved-changes warning. */
  dirty: boolean
  setDirty: (dirty: boolean) => void
  /**
   * Writes the document. Returns the record id on success, null on failure —
   * the caller decides whether to navigate.
   */
  save: (data: Record<string, unknown>) => Promise<string | null>
  remove: () => Promise<void>
}

export function useRecordEditor<T>({
  collectionName,
  id,
  map,
  onLoaded,
  listPath,
  label,
}: Options<T>): RecordEditor {
  const router = useRouter()
  const toast = useToast()

  const isNew = !id || id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dirty, setDirty] = useState(false)

  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  useEffect(() => {
    if (isNew || !id || loadedFor === id) return

    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const record = await getRecord(collectionName, id, map)
        if (cancelled) return

        if (record) {
          onLoaded(record)
          setMissing(false)
        } else {
          setMissing(true)
        }
        setLoadedFor(id)
      } catch (error) {
        if (!cancelled) {
          toast.error(describeApiError(error))
          setMissing(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // onLoaded and map are intentionally excluded: they are redefined per
    // render, and loadedFor already guards against a repeat fetch.
  }, [collectionName, id, isNew, loadedFor, toast])

  // Browsers only show their own generic message here, but the prompt itself is
  // what matters — a half-written post should not vanish with the tab.
  useEffect(() => {
    if (!dirty) return

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const save = useCallback(
    async (data: Record<string, unknown>): Promise<string | null> => {
      setSaving(true)

      try {
        if (isNew) {
          const newId = await createRecord(collectionName, data)
          setDirty(false)
          toast.success(`${label} created.`)
          return newId
        }

        await updateRecord(collectionName, id as string, data)
        setDirty(false)
        toast.success(`${label} saved.`)
        return id as string
      } catch (error) {
        toast.error(describeApiError(error))
        return null
      } finally {
        setSaving(false)
      }
    },
    [collectionName, id, isNew, label, toast],
  )

  const remove = useCallback(async () => {
    if (isNew || !id) return
    setDeleting(true)

    try {
      await deleteRecord(collectionName, id)
      setDirty(false)
      toast.success(`${label} deleted.`)
      router.replace(listPath)
    } catch (error) {
      toast.error(describeApiError(error))
    } finally {
      setDeleting(false)
    }
  }, [collectionName, id, isNew, label, listPath, router, toast])

  return { loading, missing, saving, deleting, dirty, setDirty, save, remove }
}
