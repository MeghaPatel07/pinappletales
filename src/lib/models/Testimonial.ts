import { Schema, model, models } from 'mongoose'
import { transformDoc } from './shared'

const TestimonialSchema = new Schema(
  {
    testimonial: { type: String, default: '' },
    name: { type: String, default: '' },
    designation: { type: String, default: '' },
    showOnHome: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    legacyFirestoreId: { type: String },
  },
  { timestamps: true, toJSON: { transform: transformDoc } },
)

export const Testimonial = models.Testimonial ?? model('Testimonial', TestimonialSchema)
