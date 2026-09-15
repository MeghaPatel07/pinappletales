import { Schema, model, models } from 'mongoose'
import { cloudinaryImageSchema, transformDoc } from './shared'

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true, default: '' },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String, default: '' },
    bannerImage: { type: cloudinaryImageSchema, default: null },
    date: { type: String, default: '' },
    minuteRead: { type: Number, default: 1 },
    description: { type: String, default: '' },
    author: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    isPrimary: { type: Boolean, default: false },
    legacyFirestoreId: { type: String },
  },
  { timestamps: true, toJSON: { transform: transformDoc } },
)

export const BlogPost = models.BlogPost ?? model('BlogPost', BlogPostSchema)
