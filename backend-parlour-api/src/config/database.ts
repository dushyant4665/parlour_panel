import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('MONGODB_URI from env:', mongoUri);
    if (!mongoUri) throw new Error("MONGODB_URI not set in environment");
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected Successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1)
  }
}

export default connectDB
