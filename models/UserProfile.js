// models/UserProfile.js
import mongoose from 'mongoose'

const UserProfileSchema = new mongoose.Schema({
  // Clerk user ID (primary key)
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Custom username (optional, falls back to Clerk data)
  username: {
    type: String,
    trim: true,
    maxlength: 30,
    unique: true,
    sparse: true // Allows multiple null values
  },

  // User bio/description
  bio: {
    type: String,
    maxlength: 150,
    trim: true
  },

  // Profile picture (base64 or URL)
  profilePicture: {
    type: String,
    maxlength: 10000000 // ~7MB for base64
  },

  // Theme preferences
  theme: {
    type: String,
    enum: ['purple', 'blue', 'green', 'pink', 'orange', 'dark'],
    default: 'purple'
  },

  // Notification preferences
  notifications: {
    writingReminders: {
      type: Boolean,
      default: false
    },
    reminderTime: {
      type: String,
      default: '20:00' // 8 PM
    },
    weeklyReports: {
      type: Boolean,
      default: true
    }
  },

  // Privacy settings
  privacy: {
    profileVisible: {
      type: Boolean,
      default: true
    },
    statsVisible: {
      type: Boolean,
      default: true
    }
  },

  // Achievement tracking
  achievements: [{
    name: {
      type: String,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],

  // Journal streak tracking
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastEntryDate: {
      type: Date
    }
  },

  // App preferences
  preferences: {
    defaultCategory: {
      type: String,
      enum: ['Work', 'Personal', 'Health', 'Learning', 'Creative', 'Social', 'Other'],
      default: 'Personal'
    },
    defaultMood: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    entriesPerPage: {
      type: Number,
      default: 10,
      min: 5,
      max: 50
    }
  }

}, { timestamps: true })

// Index for faster queries
UserProfileSchema.index({ userId: 1 })
UserProfileSchema.index({ username: 1 })

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema)