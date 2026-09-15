import { Schema, model, models } from 'mongoose'
import { transformDoc } from './shared'

const EventFormFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    helpText: { type: String, default: '' },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
  },
  { _id: false },
)

/** The document id *is* the event id — mirrors the old eventForms/{eventId} shape. */
const EventFormSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    registrationStartDate: { type: String, default: '' },
    registrationEndDate: { type: String, default: '' },
    title: { type: String, default: 'Register for this event' },
    intro: { type: String, default: '' },
    submitLabel: { type: String, default: 'Submit registration' },
    successMessage: {
      type: String,
      default: 'Thank you — your registration has been received.',
    },
    fields: { type: [EventFormFieldSchema], default: [] },
  },
  { timestamps: true, toJSON: { transform: transformDoc } },
)

export const EventForm = models.EventForm ?? model('EventForm', EventFormSchema)
