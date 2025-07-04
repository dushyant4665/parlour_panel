import express from "express"
import Employee from "../models/Employee"
import AttendanceLog from "../models/AttendanceLog"
import { authenticate, type AuthRequest } from "../middleware/auth"
import Joi from "joi"

const router = express.Router()

// Attendance punch validation schema
const punchSchema = Joi.object({
  employeeId: Joi.string().required(),
  action: Joi.string().valid("punch_in", "punch_out").required(),
})

// Punch in/out (public endpoint for front desk)
router.post("/punch", async (req, res) => {
  const { error } = punchSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.details[0].message })
  try {
    const { employeeId, action } = req.body
    const io = req.app.get("io")

    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    // Update employee's last punch info
    employee.lastPunchAction = action
    employee.lastPunchTime = new Date()
    await employee.save()

    // Create attendance log
    const log = new AttendanceLog({
      employee: employeeId,
      action,
      timestamp: new Date(),
    })
    await log.save()
    await log.populate("employee", "name email role")

    // Emit real-time update
    io.emit("attendance_update", log)

    res.json({
      message: `${employee.name} ${action === "punch_in" ? "punched in" : "punched out"} successfully`,
      log,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get attendance logs (authenticated)
router.get("/logs", authenticate, async (req: AuthRequest, res) => {
  try {
    const logs = await AttendanceLog.find().populate("employee", "name email role").sort({ timestamp: -1 }).limit(10)
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

export default router
