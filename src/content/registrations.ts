/**
 * Public submission of an event registration.
 *
 * Written over the REST API rather than the Firebase SDK so that visiting an
 * event page never downloads the SDK. firestore.rules permits `create` here and
 * nothing else — a visitor cannot read, edit or delete registrations.
 */

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'pineappletales'
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY ?? ''

const DOCUMENTS = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

const ID_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

/** Firestore-style 20-character auto id, generated with a CSPRNG. */
function autoId(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  let id = ''
  for (const byte of bytes) {
    id += ID_ALPHABET[byte % ID_ALPHABET.length]
  }
  return id
}

type FirestoreValue = Record<string, unknown>

function encode(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value }
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encode) } }
  }
  if (typeof value === 'object') {
    return { mapValue: { fields: encodeFields(value as Record<string, unknown>) } }
  }
  return { stringValue: String(value) }
}

function encodeFields(data: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {}
  for (const [key, value] of Object.entries(data)) {
    fields[key] = encode(value)
  }
  return fields
}

export type RegistrationInput = {
  eventId: string
  eventName: string
  values: Record<string, string | string[]>
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; message: string }

/**
 * Creates one registration document.
 *
 * `createdAt` is filled in by a server-side transform rather than by the
 * browser, which is what lets the security rule pin it to `request.time` and
 * stops a submission from being backdated.
 */
export async function submitEventRegistration(
  input: RegistrationInput,
): Promise<SubmitResult> {
  if (!API_KEY) {
    return {
      ok: false,
      message: 'Registration is not configured yet. Please contact us directly.',
    }
  }

  const name = `projects/${PROJECT_ID}/databases/(default)/documents/eventRegistrations/${autoId()}`

  const body = {
    writes: [
      {
        update: {
          name,
          fields: encodeFields({
            eventId: input.eventId,
            eventName: input.eventName,
            values: input.values,
          }),
        },
        // Refuses to overwrite, in the vanishingly unlikely case of an id clash.
        currentDocument: { exists: false },
        updateTransforms: [
          { fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' },
        ],
      },
    ],
  }

  try {
    const response = await fetch(`${DOCUMENTS}:commit?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error(
        `[registration] submit failed: ${response.status} ${response.statusText}`,
        await response.text().catch(() => ''),
      )
      return {
        ok: false,
        message:
          'Something went wrong sending your registration. Please try again, or contact us directly.',
      }
    }

    return { ok: true }
  } catch (error) {
    console.error('[registration] submit failed:', error)
    return {
      ok: false,
      message:
        'We could not reach the server. Check your connection and try again.',
    }
  }
}
