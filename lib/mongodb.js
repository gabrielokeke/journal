// lib/mongodb.js
import mongoose from 'mongoose'

const connectDB = async () => {
  // Check if already connected
  if (mongoose.connections[0].readyState) {
    return mongoose.connections[0]
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB
    })
    console.log('✅ MongoDB connected')
    return connection
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    throw err
  }
}

export default connectDB