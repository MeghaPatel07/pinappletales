import { Schema, model, models } from 'mongoose'
import { transformDoc } from './shared'

const PodcastSchema = new Schema(
  {
    name: { type: String, required: true, default: '' },
    slug: { type: String, required: true, unique: true, trim: true },
    youtubeLink: { type: String, default: '' },
    description: { type: String, default: '' },
    date: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    legacyFirestoreId: { type: String },
  },
  { timestamps: true, toJSON: { transform: transformDoc } },
)

export const Podcast = models.Podcast ?? model('Podcast', PodcastSchema)
