// models/UserProfile.js
import mongoose from 'mongoose'

const UserProfileSchema = new mongoose.Schema({
  // Clerk user ID (primary key)
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  
  // Custom username (optional, falls back to Clerk data)
  username: {
    type: String,
    trim: true,
    maxlength: [30, 'Username cannot exceed 30 characters'],
    unique: true,
    sparse: true // Allows multiple null values
  },
  
  // User bio/description
  bio: {
    type: String,
    maxlength: [150, 'Bio cannot exceed 150 characters'],
    trim: true,
    default: ''
  },
  
  // Profile picture (base64 or URL)
  profilePicture: {
    type: String,
    maxlength: [5000000, 'Profile picture size too large'] // Reduced to 5MB
  },
  
  // Theme preferences (removed dark theme)
  theme: {
    type: String,
    enum: {
      values: ['purple', 'blue', 'green', 'pink', 'orange'],
      message: 'Invalid theme selection'
    },
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
      default: '20:00', // 8 PM
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)
        },
        message: 'Invalid time format. Use HH:MM'
      }
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
      required: true,
      enum: ['first_entry', 'ten_entries', 'fifty_entries', 'hundred_entries', 'week_streak', 'month_streak']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: {
      type: String,
      required: true
    }
  }],
  
  // Journal streak tracking
  streak: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    longest: {
      type: Number,
      default: 0,
      min: 0
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
}, { 
  timestamps: true 
})

// Compound indexes for better performance
UserProfileSchema.index({ userId: 1 })
UserProfileSchema.index({ username: 1 })

// Method to safely return profile data
UserProfileSchema.methods.toSafeObject = function() {
  const profile = this.toObject()
  return {
    userId: profile.userId,
    username: profile.username,
    bio: profile.bio,
    profilePicture: profile.profilePicture,
    theme: profile.theme,
    notifications: profile.notifications,
    privacy: profile.privacy,
    achievements: profile.achievements,
    streak: profile.streak,
    preferences: profile.preferences,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  }
}

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema)