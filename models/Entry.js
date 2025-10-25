// models/Entry.js
import mongoose from 'mongoose'

const EntrySchema = new mongoose.Schema({
  // Title of the journal entry
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  // Main content or description
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  
  // Image for the entry (base64 string or URL)
  image: {
    type: String,
    required: false,
    maxlength: [5000000, 'Image size too large'] // Reduced from 10MB to 5MB
  },
  
  // Mood rating (1-5) often displayed as emojis:
  // 1 = 😢, 2 = 😞, 3 = 😐, 4 = 😊, 5 = 🎉
  mood: {
    type: Number,
    min: [1, 'Mood must be at least 1'],
    max: [5, 'Mood cannot exceed 5'],
    default: 3,
    required: [true, 'Mood is required']
  },
  
  // Category of the journal entry
  category: {
    type: String,
    enum: {
      values: ['Work', 'Personal', 'Health', 'Learning', 'Creative', 'Social', 'Other'],
      message: 'Invalid category'
    },
    default: 'Personal',
    required: [true, 'Category is required']
  },
  
  // User ID to be integrated with Clerk
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
})

// Create compound index for better query performance
EntrySchema.index({ userId: 1, createdAt: -1 })

// Add a method to format the entry for API responses
EntrySchema.methods.toJSON = function() {
  const entry = this.toObject()
  return {
    _id: entry._id,
    title: entry.title,
    content: entry.content,
    image: entry.image,
    mood: entry.mood,
    category: entry.category,
    userId: entry.userId,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  }
}

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema)