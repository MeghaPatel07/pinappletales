/**
 * One-off migration: copies published and draft content from the old
 * Firestore project into MongoDB. Read-only against Firestore — nothing in
 * the Firebase project is modified or deleted.
 *
 *   npm run migrate:firestore
 *
 * Requires in .env:
 *   MONGODB_URI               destination
 *   FIREBASE_API_KEY          the old web API key
 *   FIREBASE_PROJECT_ID       defaults to "pineappletales"
 *   MIGRATION_ADMIN_EMAIL     an existing Firestore admin's login —
 *   MIGRATION_ADMIN_PASSWORD  needed to read *draft* documents, since
 *                             firestore.rules only lets admins see those.
 *
 * Does NOT migrate admin accounts: Firebase never exposes password hashes,
 * so there is nothing to port. Run `npm run seed:admin` afterwards to create
 * a MongoDB login.
 */

import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

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
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '')
      if (value) env[key] = value
    }
  }
  return { ...env, ...process.env }
}

const fail = (message) => {
  console.error(`\n  ${message}\n`)
  process.exit(1)
}

// -----------------------------------------------------------------------------
// Firestore REST decoding (mirrors the deleted src/lib/firestore/rest.ts)
// -----------------------------------------------------------------------------

function decodeValue(value) {
  if (!value) return null
  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('timestampValue' in value) return value.timestampValue
  if ('nullValue' in value) return null
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decodeValue)
  if ('mapValue' in value) return decodeFields(value.mapValue.fields)
  return null
}

function decodeFields(fields) {
  const out = {}
  for (const [key, value] of Object.entries(fields ?? {})) out[key] = decodeValue(value)
  return out
}

function decodeDocument(doc) {
  const id = (doc.name ?? '').split('/').pop() ?? ''
  return { ...decodeFields(doc.fields), id }
}

// -----------------------------------------------------------------------------
// Mongo schemas (kept minimal and independent of src/lib/models/*.ts, since
// this plain Node script has no TypeScript loader)
// -----------------------------------------------------------------------------

const image = { url: String, publicId: String, width: Number, height: Number, alt: String }

const models = {
  blogs: mongoose.model(
    'BlogPost',
    new mongoose.Schema(
      {
        title: String,
        slug: { type: String, unique: true },
        shortDescription: String,
        bannerImage: image,
        date: String,
        minuteRead: Number,
        description: String,
        author: String,
        isActive: Boolean,
        isPrimary: Boolean,
        legacyFirestoreId: String,
      },
      { timestamps: true },
    ),
  ),
  events: mongoose.model(
    'Event',
    new mongoose.Schema(
      {
        name: String,
        slug: { type: String, unique: true },
        date: String,
        shortDescription: String,
        description: String,
        mainImage: image,
        imageGallery: [image],
        isPrimary: Boolean,
        isActive: Boolean,
        legacyFirestoreId: String,
      },
      { timestamps: true },
    ),
  ),
  testimonials: mongoose.model(
    'Testimonial',
    new mongoose.Schema(
      {
        testimonial: String,
        name: String,
        designation: String,
        showOnHome: Boolean,
        isActive: Boolean,
        legacyFirestoreId: String,
      },
      { timestamps: true },
    ),
  ),
  podcasts: mongoose.model(
    'Podcast',
    new mongoose.Schema(
      {
        name: String,
        slug: { type: String, unique: true },
        youtubeLink: String,
        description: String,
        date: String,
        isActive: Boolean,
        legacyFirestoreId: String,
      },
      { timestamps: true },
    ),
  ),
  eventForms: mongoose.model(
    'EventForm',
    new mongoose.Schema(
      {
        eventId: { type: String, unique: true },
        isActive: Boolean,
        registrationStartDate: String,
        registrationEndDate: String,
        title: String,
        intro: String,
        submitLabel: String,
        successMessage: String,
        fields: [mongoose.Schema.Types.Mixed],
      },
      { timestamps: true },
    ),
  ),
  eventRegistrations: mongoose.model(
    'EventRegistration',
    new mongoose.Schema(
      { eventId: String, eventName: String, values: mongoose.Schema.Types.Mixed },
      { timestamps: { createdAt: true, updatedAt: false } },
    ),
  ),
}

async function main() {
  const env = await loadEnv()

  const mongoUri = env.MONGODB_URI
  const apiKey = env.FIREBASE_API_KEY
  const projectId = env.FIREBASE_PROJECT_ID ?? 'pineappletales'
  const adminEmail = env.MIGRATION_ADMIN_EMAIL
  const adminPassword = env.MIGRATION_ADMIN_PASSWORD

  if (!mongoUri) fail('MONGODB_URI is not set in .env.')
  if (!apiKey) fail('FIREBASE_API_KEY is not set in .env.')

  let idToken = null

  if (adminEmail && adminPassword) {
    console.log('\n  Signing in to Firebase…')
    const signIn = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword, returnSecureToken: true }),
      },
    )
    const signInPayload = await signIn.json()
    if (!signIn.ok) {
      fail(`Could not sign in to Firebase: ${signInPayload?.error?.message ?? signIn.status}`)
    }
    idToken = signInPayload.idToken
    console.log('  Signed in — migrating drafts and published content.')
  } else {
    console.log(
      '\n  MIGRATION_ADMIN_EMAIL/PASSWORD not set — running in PUBLIC-ONLY mode.\n' +
        '  Only already-published (isActive: true) records will be migrated;\n' +
        '  drafts in Firestore are left behind. Set those two variables and re-run\n' +
        '  to also pick up drafts.',
    )
  }

  console.log('  Connecting to MongoDB…')
  await mongoose.connect(mongoUri)

  const BASE = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`

  /** Authenticated path: lists every document, drafts included. */
  async function listCollectionAsAdmin(name) {
    const documents = []
    let pageToken

    do {
      const url = new URL(`${BASE}/${name}`)
      url.searchParams.set('pageSize', '300')
      if (pageToken) url.searchParams.set('pageToken', pageToken)

      const response = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } })
      if (!response.ok) {
        console.warn(`  ! ${name}: ${response.status} ${response.statusText} — skipping`)
        return documents
      }

      const payload = await response.json()
      for (const doc of payload.documents ?? []) documents.push(decodeDocument(doc))
      pageToken = payload.nextPageToken
    } while (pageToken)

    return documents
  }

  /** Unauthenticated path: only documents matching isActive == true, per firestore.rules. */
  async function listCollectionPublic(name) {
    const response = await fetch(`${BASE}:runQuery?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: name }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'isActive' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
        },
      }),
    })

    if (!response.ok) {
      console.warn(`  ! ${name}: ${response.status} ${response.statusText} — skipping`)
      return []
    }

    const payload = await response.json()
    return payload.filter((entry) => entry.document).map((entry) => decodeDocument(entry.document))
  }

  async function listCollection(name) {
    return idToken ? listCollectionAsAdmin(name) : listCollectionPublic(name)
  }

  async function migrate(firestoreCollection, mongoKey, mapDoc, matchField = 'legacyFirestoreId') {
    const docs = await listCollection(firestoreCollection)
    const Model = models[mongoKey]
    let migrated = 0

    for (const doc of docs) {
      const data = mapDoc(doc)
      const matchValue = matchField === 'legacyFirestoreId' ? doc.id : data[matchField]
      try {
        await Model.updateOne(
          { [matchField]: matchValue },
          { $set: data },
          { upsert: true },
        )
        migrated += 1
      } catch (error) {
        console.warn(`  ! ${firestoreCollection}/${doc.id}: ${error.message}`)
      }
    }

    console.log(`  ${firestoreCollection.padEnd(18)} ${migrated}/${docs.length} migrated`)
  }

  console.log('\n  Migrating content…\n')

  await migrate('blogs', 'blogs', (doc) => ({
    title: doc.title ?? '',
    slug: doc.slug ?? doc.id,
    shortDescription: doc.shortDescription ?? '',
    bannerImage: doc.bannerImage ?? null,
    date: doc.date ?? '',
    minuteRead: doc.minuteRead ?? 1,
    description: doc.description ?? '',
    author: doc.author ?? '',
    isActive: Boolean(doc.isActive),
    isPrimary: Boolean(doc.isPrimary),
    legacyFirestoreId: doc.id,
    createdAt: doc.createdAt ?? undefined,
    updatedAt: doc.updatedAt ?? undefined,
  }))

  await migrate('events', 'events', (doc) => ({
    name: doc.name ?? '',
    slug: doc.slug ?? doc.id,
    date: doc.date ?? '',
    shortDescription: doc.shortDescription ?? '',
    description: doc.description ?? '',
    mainImage: doc.mainImage ?? null,
    imageGallery: doc.imageGallery ?? [],
    isPrimary: Boolean(doc.isPrimary),
    isActive: Boolean(doc.isActive),
    legacyFirestoreId: doc.id,
    createdAt: doc.createdAt ?? undefined,
    updatedAt: doc.updatedAt ?? undefined,
  }))

  await migrate('testimonials', 'testimonials', (doc) => ({
    testimonial: doc.testimonial ?? '',
    name: doc.name ?? '',
    designation: doc.designation ?? '',
    showOnHome: Boolean(doc.showOnHome),
    isActive: Boolean(doc.isActive),
    legacyFirestoreId: doc.id,
  }))

  await migrate('podcasts', 'podcasts', (doc) => ({
    name: doc.name ?? '',
    slug: doc.slug ?? doc.id,
    youtubeLink: doc.youtubeLink ?? '',
    description: doc.description ?? '',
    date: doc.date ?? '',
    isActive: Boolean(doc.isActive),
    legacyFirestoreId: doc.id,
  }))

  await migrate('eventForms', 'eventForms', (doc) => ({
    eventId: doc.eventId ?? doc.id,
    isActive: Boolean(doc.isActive),
    registrationStartDate: doc.registrationStartDate ?? '',
    registrationEndDate: doc.registrationEndDate ?? '',
    title: doc.title ?? 'Register for this event',
    intro: doc.intro ?? '',
    submitLabel: doc.submitLabel ?? 'Submit registration',
    successMessage: doc.successMessage ?? 'Thank you — your registration has been received.',
    fields: doc.fields ?? [],
  }), 'eventId')

  await migrate('eventRegistrations', 'eventRegistrations', (doc) => ({
    eventId: doc.eventId ?? '',
    eventName: doc.eventName ?? '',
    values: doc.values ?? {},
    createdAt: doc.createdAt ?? undefined,
  }))

  console.log('\n  Done. Admin accounts were not migrated — run `npm run seed:admin`\n  to create a login for MongoDB.\n')

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error('\n  Migration failed:\n', error)
  process.exit(1)
})
