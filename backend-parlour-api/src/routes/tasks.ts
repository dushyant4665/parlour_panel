import express from "express"
import Task from "../models/Task"
import { authenticate, requireSuperAdmin, requireAdmin, AuthRequest } from "../middleware/auth"
import Joi from "joi"

const router = express.Router()

// Get all tasks (Admin and Super Admin)
router.get("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email").sort({ dueDate: 1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Task validation schema
const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  assignedTo: Joi.string().required(),
  status: Joi.string().valid("pending", "in_progress", "completed").required(),
  dueDate: Joi.date().required(),
})

// Create task (Super Admin only)
router.post("/", authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  const { error } = taskSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.details[0].message })
  try {
    const task = new Task(req.body)
    await task.save()
    await task.populate("assignedTo", "name email")
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Update task (Super Admin only)
router.put("/:id", authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  const { error } = taskSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.details[0].message })
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "assignedTo",
      "name email",
    )
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Delete task (Super Admin only)
router.delete("/:id", authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }
    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

export default router
