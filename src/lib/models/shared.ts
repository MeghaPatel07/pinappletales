/** Shared Mongoose helpers so every content model serialises the same way. */

import { Schema } from 'mongoose'

// A real Schema (not a plain object literal) with `_id: false` passed as
// schema *options* — the only form Mongoose reliably honours to suppress
// the auto-generated ObjectId on an embedded subdocument. Without this,
// every image (bannerImage, mainImage, each imageGallery entry) carries its
// own Mongoose `_id`, which survives `.toJSON()` as a non-plain ObjectId and
// breaks passing the result from a Server Component into a Client Component.
export const cloudinaryImageSchema = new Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    alt: { type: String, default: '' },
  },
  { _id: false },
)

/** Renames `_id` → `id`, drops `__v`, and keeps dates as ISO strings. */
export function transformDoc(_doc: unknown, ret: Record<string, unknown>) {
  ret.id = String(ret._id)
  delete ret._id
  delete ret.__v
  if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.toISOString()
  if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString()
  return ret
}

/**
 * Forces a value through a JSON round-trip so nothing Mongoose-flavoured
 * (ObjectId, Buffer, Date) survives into a Server → Client Component prop —
 * a cheap, reliable safety net at that exact boundary regardless of how a
 * given document's subdocuments were declared.
 */
export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
