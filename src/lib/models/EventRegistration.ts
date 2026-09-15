import { Schema, model, models } from 'mongoose'
import { transformDoc } from './shared'

const EventRegistrationSchema = new Schema(
  {
    eventId: { type: String, required: true, index: true },
    eventName: { type: String, default: '' },
    values: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: { transform: transformDoc } },
)

export const EventRegistration =
  models.EventRegistration ?? model('EventRegistration', EventRegistrationSchema)
