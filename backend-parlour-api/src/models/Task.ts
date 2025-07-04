import mongoose, { type Document, Schema } from "mongoose"

export interface ITask extends Document {
  title: string
  description: string
  assignedTo: mongoose.Types.ObjectId
  status: "pending" | "in_progress" | "completed"
  dueDate: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true },
)

export default mongoose.model<ITask>("Task", taskSchema)
