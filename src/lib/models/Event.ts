import { Schema, model, models } from 'mongoose'
import { cloudinaryImageSchema, transformDoc } from './shared'

const EventSchema = new Schema(
  {
    name: { type: String, required: true, default: '' },
    slug: { type: String, required: true, unique: true, trim: true },
    date: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    mainImage: { type: cloudinaryImageSchema, default: null },
    imageGallery: { type: [cloudinaryImageSchema], default: [] },
    isPrimary: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    legacyFirestoreId: { type: String },
  },
  { timestamps: true, toJSON: { transform: transformDoc } },
)

export const Event = models.Event ?? model('Event', EventSchema)
