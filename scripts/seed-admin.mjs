/**
 * Creates an admin account.
 *
 *   npm run seed:admin
 *   npm run seed:admin -- someone@example.com theirpassword "Their Name"
 *
 * Two things are needed for admin access, and this script does both:
 *
 *   1. a Firebase Auth user — who you are
 *   2. a document at admins/{uid} — permission to act
 *
 * Both are enforced by firestore.rules, so a user without the document can sign
 * in and still do nothing.
 *
 * Uses the public REST APIs with the web API key rather than the Admin SDK, so
 * it needs no service-account file. That has one consequence: writing to the
 * admins collection is blocked for clients by the rules (deliberately), so the
 * script prints the exact document to add if it cannot write it itself. Run it
 * once with rules temporarily allowing the write, or add the document from the
 * Firebase console — the script tells you which applies.
 */

import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const DEFAULT_EMAIL = 'admin@gmail.com'
const DEFAULT_PASSWORD = '1234567'
const DEFAULT_NAME = 'Administrator'

/** Minimal .env reader — enough for KEY=value, ignoring comments and quotes. */
async function loadEnv() {
  const env = {}

  for (const filename of ['.env', '.env.local']) {
    let contents
    try {
      contents = await readFile(resolve(ROOT, filename), 'utf8')
    } catch {
      continue
    }

    for (const line of contents.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const separator = trimmed.indexOf('=')
      if (separator === -1) continue

      const key = trimmed.slice(0, separator).trim()
      const value = trimmed
        .slice(separator + 1)
        .trim()
        .replace(/^["']|["']$/g, '')

      if (value) env[key] = value
    }
  }

  return env
}

const fail = (message) => {
  console.error(`\n  ${message}\n`)
  process.exit(1)
}

async function main() {
  const env = await loadEnv()

  const apiKey = env.VITE_FIREBASE_API_KEY
  const projectId = env.VITE_FIREBASE_PROJECT_ID ?? 'pineappletales'

  if (!apiKey) {
    fail(
      'VITE_FIREBASE_API_KEY is not set in .env.\n' +
        '  Get it from the Firebase console: Project settings → General →\n' +
        '  Your apps → Web app → SDK setup and configuration.',
    )
  }

  const [email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD, name = DEFAULT_NAME] =
    process.argv.slice(2)

  if (password.length < 6) {
    fail('Firebase requires a password of at least 6 characters.')
  }

  console.log(`\n  Project   ${projectId}`)
  console.log(`  Email     ${email}`)

  // 1. The auth user ---------------------------------------------------------
  const identity = 'https://identitytoolkit.googleapis.com/v1/accounts'

  let uid = ''
  let idToken = ''

  const signUp = await fetch(`${identity}:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })

  const signUpPayload = await signUp.json()

  if (signUp.ok) {
    uid = signUpPayload.localId
    idToken = signUpPayload.idToken
    console.log('  Auth user created.')
  } else if (signUpPayload?.error?.message === 'EMAIL_EXISTS') {
    // Already created on a previous run — sign in instead so we still get a uid.
    const signIn = await fetch(`${identity}:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    })

    const signInPayload = await signIn.json()

    if (!signIn.ok) {
      fail(
        `That email already has an account, but the password given does not match it.\n` +
          `  Firebase said: ${signInPayload?.error?.message ?? signIn.status}\n` +
          `  Either pass the correct password, or reset it in the Firebase console.`,
      )
    }

    uid = signInPayload.localId
    idToken = signInPayload.idToken
    console.log('  Auth user already existed — signed in to read its uid.')
  } else {
    const reason = signUpPayload?.error?.message ?? String(signUp.status)

    if (reason === 'OPERATION_NOT_ALLOWED') {
      fail(
        'Email/password sign-in is switched off for this project.\n' +
          '  Firebase console → Authentication → Sign-in method → enable Email/Password.',
      )
    }

    fail(`Could not create the auth user. Firebase said: ${reason}`)
  }

  console.log(`  UID       ${uid}`)

  // 2. The admins document ---------------------------------------------------
  const documentUrl =
    `https://firestore.googleapis.com/v1/projects/${projectId}` +
    `/databases/(default)/documents/admins/${uid}?key=${apiKey}`

  const body = {
    fields: {
      email: { stringValue: email },
      name: { stringValue: name },
      createdAt: { stringValue: new Date().toISOString() },
    },
  }

  const write = await fetch(documentUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  })

  if (write.ok) {
    console.log('  Admin document written.\n')
    console.log('  Done. Sign in at /admin/login with those credentials.\n')
    return
  }

  // Expected when the rules are already deployed: admins is not client-writable.
  console.log('\n  The admins document could not be written from here.')
  console.log('  This is expected — firestore.rules blocks client writes to')
  console.log('  the admins collection on purpose.\n')
  console.log('  Add it manually in the Firebase console:\n')
  console.log('    Firestore Database → Start collection → "admins"')
  console.log(`    Document ID:  ${uid}`)
  console.log(`    email  (string)      ${email}`)
  console.log(`    name   (string)      ${name}`)
  console.log(`    createdAt (string)   ${new Date().toISOString()}\n`)
  console.log('  Then sign in at /admin/login.\n')
}

main().catch((error) => {
  console.error('\n  Seeding failed:\n', error)
  process.exit(1)
})
