import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User, { type IUser } from "../models/User"

export interface AuthRequest extends Request {
  user?: IUser
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" })
  }
  const token = authHeader.split(" ")[1]
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const user = await User.findById(decoded.userId)
    if (!user) return res.status(401).json({ message: "User not found" })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Forbidden: Super Admins only" })
  }
  next()
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role ?? ""
  if (!["admin", "super_admin"].includes(role)) {
    return res.status(403).json({ message: "Forbidden: Admins only" })
  }
  next()
}

export const authenticateSocket = async (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error("No token provided"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await User.findById(decoded.userId)

    if (!user) {
      return next(new Error("Invalid token"))
    }

    socket.data.user = user
    next()
  } catch (error) {
    next(new Error("Authentication error"))
  }
}
