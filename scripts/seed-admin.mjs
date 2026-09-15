/**
 * Creates an admin account in MongoDB.
 *
 *   npm run seed:admin
 *   npm run seed:admin -- someone@example.com theirpassword "Their Name"
 *
 * Defines its own minimal copy of the AdminUser schema rather than importing
 * src/lib/models/AdminUser.ts, since this plain Node script has no
 * TypeScript loader — the two are kept in sync by hand (email, passwordHash,
 * name, timestamps).
 */

import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

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

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, default: 'Admin' },
  },
  { timestamps: true },
)

async function main() {
  const env = await loadEnv()
  const uri = env.MONGODB_URI ?? process.env.MONGODB_URI

  if (!uri) {
    fail('MONGODB_URI is not set in .env. Add your MongoDB connection string first.')
  }

  const [email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD, name = DEFAULT_NAME] =
    process.argv.slice(2)

  if (password.length < 1) {
    fail('A password is required.')
  }
  if (password.length < 8) {
    console.warn(
      `\n  ⚠  That password is only ${password.length} characters — weak for an admin\n` +
        '     account with access to real visitor data. Consider changing it later\n' +
        '     (Firebase-inherited 6-char minimum has been removed, not a recommendation).',
    )
  }

  console.log(`\n  Connecting to MongoDB…`)
  await mongoose.connect(uri)

  const AdminUser = mongoose.models.AdminUser ?? mongoose.model('AdminUser', AdminUserSchema)

  const normalisedEmail = email.trim().toLowerCase()
  const passwordHash = await bcrypt.hash(password, 10)

  const existing = await AdminUser.findOne({ email: normalisedEmail })

  if (existing) {
    existing.passwordHash = passwordHash
    existing.name = name
    await existing.save()
    console.log(`\n  Updated existing admin.`)
  } else {
    await AdminUser.create({ email: normalisedEmail, passwordHash, name })
    console.log(`\n  Created admin.`)
  }

  console.log(`  Email     ${normalisedEmail}`)
  console.log(`  Name      ${name}`)
  console.log(`\n  Done. Sign in at /admin/login with those credentials.\n`)

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error('\n  Seeding failed:\n', error)
  process.exit(1)
})
