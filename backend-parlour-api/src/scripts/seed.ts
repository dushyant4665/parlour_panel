import mongoose from "mongoose"
import User from "../models/User"
import Employee from "../models/Employee"
import dotenv from "dotenv"
dotenv.config()

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) throw new Error("MONGODB_URI not set in environment")

const seedData = async () => {
  try {
    await mongoose.connect(mongoUri)

    // Clear existing data
    await User.deleteMany({})
    await Employee.deleteMany({})

    // Create admin users (passwords will be hashed by pre-save hook)
    const superAdmin = new User({
      name: "Super Admin",
      email: "superadmin@parlour.com",
      password: "password123",
      role: "super_admin",
    })
    const admin = new User({
      name: "Admin User",
      email: "admin@parlour.com",
      password: "password123",
      role: "admin",
    })
    await superAdmin.save()
    await admin.save()

    // Create sample employees
    const employees = [
      { name: "Mohan", email: "Mohan@parlour.com", role: "Hair Stylist", department: "Hair" },
      { name: "Vikram", email: "Vikram@parlour.com", role: "Nail Technician", department: "Nails" },
      { name: "Anshita", email: "Anshita@parlour.com", role: "Massage Therapist", department: "Spa" },
      { name: "Sarah", email: "sarah@parlour.com", role: "Receptionist", department: "Front Desk" },
      { name: "Virat", email: "virat@parlour.com", role: "Makeup Artist", department: "Beauty" },
    ]
    for (const emp of employees) {
      const employee = new Employee(emp)
      await employee.save()
    }

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    await mongoose.disconnect()
    process.exit(1)
  }
}

seedData()
