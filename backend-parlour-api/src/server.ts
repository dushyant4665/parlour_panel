import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
dotenv.config()
console.log('JWT_SECRET from env (server.ts):', process.env.JWT_SECRET)
import connectDB from "./config/database"
import authRoutes from "./routes/auth"
import employeeRoutes from "./routes/employees"
import taskRoutes from "./routes/tasks"
import attendanceRoutes from "./routes/attendance"
import { authenticateSocket } from "./middleware/auth"

// import dotenv from "dotenv"
// dotenv.config()

// import express from "express"

const PORT = 5000

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'https://super-memory-g449pxp6jqp529rqp-3000.app.github.dev/login',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
})

// Middleware
app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}))
app.use(express.json())

// Connect to MongoDB
connectDB()

// Socket.IO middleware
io.use(authenticateSocket)

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.data.user.email}`)

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.data.user.email}`)
  })
})

// Make io available to routes
app.set("io", io)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/attendance", attendanceRoutes)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})