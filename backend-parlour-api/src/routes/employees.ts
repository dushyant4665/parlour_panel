import express from "express"
import Employee from "../models/Employee"
import { authenticate, requireSuperAdmin, requireAdmin, AuthRequest } from "../middleware/auth"
import Joi from "joi"

const router = express.Router()

// Employee validation schema
const employeeSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().required(),
  department: Joi.string().required(),
})

// Get all employees (public for attendance page)
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find()
    res.json(employees)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get all employees (Admin and Super Admin)
router.get("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const employees = await Employee.find()
    res.json(employees)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Create employee (Super Admin only)
router.post("/", authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  const { error } = employeeSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.details[0].message })
  try {
    const employee = new Employee(req.body)
    await employee.save()
    res.status(201).json(employee)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Update employee (Super Admin only)
router.put("/:id", authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  const { error } = employeeSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.details[0].message })
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!employee) return res.status(404).json({ message: "Employee not found" })
    res.json(employee)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Delete employee (Super Admin only)
router.delete("/:id", authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id)
    if (!employee) return res.status(404).json({ message: "Employee not found" })
    res.json({ message: "Employee deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

export default router
