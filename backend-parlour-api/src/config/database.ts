import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
const connectDB = async () => {
  try {
const mongoUri = process.env.MONGODB_URI;
    const conn = await mongoose.connect(mongoUri)
    console.log(mongoUri)
  } catch (error) {
    process.exit(1)
  }
}

export default connectDB
