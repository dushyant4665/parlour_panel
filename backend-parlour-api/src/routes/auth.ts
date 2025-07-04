import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User"
import { authenticate, type AuthRequest } from "../middleware/auth"
import Joi from "joi"
import dotenv from "dotenv"
dotenv.config()

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET!
console.log(JWT_SECRET);

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

// Login
router.post("/login", async (req, res) => {
  const { error } = loginSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.details[0].message })
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" })
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get current user
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  res.json({
    user: {
      id: req.user!._id,
      name: req.user!.name,
      email: req.user!.email,
      role: req.user!.role,
    },
  })
})

// Debug route to list all users
router.get("/debug-users", async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

export default router
