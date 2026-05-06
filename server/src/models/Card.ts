import mongoose, { Document, Schema } from 'mongoose'

export interface ILabel {
  text: string
  color: string
}

export interface ICard extends Document {
  _id: mongoose.Types.ObjectId
  listId: mongoose.Types.ObjectId
  title: string
  description?: string
  position: number
  labels?: ILabel[]
  startDate?: Date
  dueDate?: Date
  reminder?: Date
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

const CardSchema = new Schema<ICard>(
  {
    listId: { type: Schema.Types.ObjectId, ref: 'List', required: true },
    title: { type: String, required: true },
    description: { type: String },
    position: { type: Number, required: true, default: 0 },
    labels: [{
      text: { type: String, required: true },
      color: { type: String, required: true, default: 'blue' }
    }],
    startDate: { type: Date },
    dueDate: { type: Date },
    reminder: { type: Date },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

CardSchema.index({ listId: 1, position: 1 })

export default mongoose.model<ICard>('Card', CardSchema)