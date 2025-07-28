import mongoose from 'mongoose'

const EntrySchema = new mongoose.Schema({
  // Title of the journal entry
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  // Main content or description
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Mood rating (1-5) often displayed as emojis:
  // 1 = 😢, 2 = 😞, 3 = 😐, 4 = 🙂, 5 = 😄
  mood: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
    required: true
  },

  // Category of the journal entry
  category: {
    type: String,
    enum: ['Work', 'Personal', 'Health', 'Learning', 'Creative', 'Social', 'Other'],
    default: 'Personal',
    required: true
  }

}, { timestamps: true }) // Adds createdAt and updatedAt automatically

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema)
