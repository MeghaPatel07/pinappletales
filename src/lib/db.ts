/**
 * MongoDB connection singleton (Mongoose).
 *
 * Next.js reuses the Node.js module cache across hot reloads in dev, which
 * would otherwise open a fresh connection on every edit. The promise is
 * cached on `global` so a reload reattaches to the same connection instead.
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI ?? ''

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: Cached | undefined
}

const cache: Cached = global.__mongooseCache ?? { conn: null, promise: null }
global.__mongooseCache = cache

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn

  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add it to .env — see .env.example.',
    )
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }

  cache.conn = await cache.promise
  return cache.conn
}
