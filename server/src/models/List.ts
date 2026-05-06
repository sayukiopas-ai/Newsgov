import mongoose, { Document, Schema } from 'mongoose'

export interface IList extends Document {
  _id: mongoose.Types.ObjectId
  boardId: mongoose.Types.ObjectId
  title: string
  position: number
  createdAt: Date
  updatedAt: Date
}

const ListSchema = new Schema<IList>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    title: { type: String, required: true },
    position: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
)

ListSchema.index({ boardId: 1, position: 1 })

export default mongoose.model<IList>('List', ListSchema)
