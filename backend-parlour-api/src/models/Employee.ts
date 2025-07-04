import mongoose, { type Document, Schema } from "mongoose"

export interface IEmployee extends Document {
  name: string
  email: string
  role: string
  department: string
  isActive: boolean
  lastPunchAction?: "punch_in" | "punch_out"
  lastPunchTime?: Date
}

const employeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastPunchAction: { type: String, enum: ["punch_in", "punch_out"] },
    lastPunchTime: { type: Date },
  },
  { timestamps: true },
)

export default mongoose.model<IEmployee>("Employee", employeeSchema)
