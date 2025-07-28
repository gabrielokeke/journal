// lib/mongodb.js
import mongoose from 'mongoose'

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
  }
}

export default connectDB
