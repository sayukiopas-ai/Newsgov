import mongoose, { Document, Schema } from 'mongoose'

export interface IBoard extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

const BoardSchema = new Schema<IBoard>(
  {
    title: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model<IBoard>('Board', BoardSchema)
