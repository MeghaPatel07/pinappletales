import { Schema, model, models, type InferSchemaType } from 'mongoose'

const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, default: 'Admin' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
        return ret
      },
    },
  },
)

export type AdminUserDocument = InferSchemaType<typeof AdminUserSchema>

export const AdminUser = models.AdminUser ?? model('AdminUser', AdminUserSchema)
