import mongoose, { type Document, Schema } from "mongoose"

export interface IAttendanceLog extends Document {
  employee: mongoose.Types.ObjectId
  action: "punch_in" | "punch_out"
  timestamp: Date
}

const attendanceLogSchema = new Schema<IAttendanceLog>({
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  action: { type: String, enum: ["punch_in", "punch_out"], required: true },
  timestamp: { type: Date, default: Date.now },
})

export default mongoose.model<IAttendanceLog>("AttendanceLog", attendanceLogSchema)
