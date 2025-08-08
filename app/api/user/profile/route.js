// app/api/user/profile/route.js
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import UserProfile from '@/models/UserProfile'
import Entry from '@/models/Entry'

// GET - Fetch user profile
export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Get or create user profile
    let profile = await UserProfile.findOne({ userId: user.id })
    
    if (!profile) {
      // Create default profile for new users
      profile = await UserProfile.create({
        userId: user.id,
        username: user.firstName || '',
        bio: '',
        theme: 'purple'
      })
    }

    // Calculate streak and achievements
    const entries = await Entry.find({ userId: user.id }).sort({ createdAt: -1 })
    const updatedProfile = await calculateStreakAndAchievements(profile, entries)

    return NextResponse.json({ success: true, data: updatedProfile }, { status: 200 })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Update user profile
export async function POST(req) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await req.json()

    // Validate username uniqueness if provided
    if (body.username) {
      const existingUser = await UserProfile.findOne({ 
        username: body.username, 
        userId: { $ne: user.id } 
      })
      
      if (existingUser) {
        return NextResponse.json({ 
          success: false, 
          error: 'Username already taken' 
        }, { status: 400 })
      }
    }

    // Update or create profile
    const profile = await UserProfile.findOneAndUpdate(
      { userId: user.id },
      { ...body, userId: user.id },
      { new: true, upsert: true }
    )

    return NextResponse.json({ success: true, data: profile }, { status: 200 })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Helper function to calculate streaks and achievements
async function calculateStreakAndAchievements(profile, entries) {
  if (entries.length === 0) return profile

  // Calculate current streak
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Sort entries by date (newest first)
  const sortedEntries = entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  // Check for consecutive days
  let checkDate = new Date(today)
  let streakBroken = false
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].createdAt)
    entryDate.setHours(0, 0, 0, 0)
    
    if (entryDate.getTime() === checkDate.getTime()) {
      if (!streakBroken) currentStreak++
      tempStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (entryDate.getTime() < checkDate.getTime()) {
      // Gap in days, streak is broken for current calculation
      if (tempStreak > longestStreak) longestStreak = tempStreak
      tempStreak = 1
      streakBroken = true
      checkDate = new Date(entryDate)
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }
  
  if (tempStreak > longestStreak) longestStreak = tempStreak

  // Calculate achievements
  const achievements = []
  
  // First entry achievement
  if (entries.length >= 1 && !profile.achievements.some(a => a.name === 'first_entry')) {
    achievements.push({
      name: 'first_entry',
      earnedAt: new Date(),
      icon: '🎉'
    })
  }

  // Milestone achievements
  const milestones = [
    { count: 10, name: 'ten_entries', icon: '📝' },
    { count: 50, name: 'fifty_entries', icon: '📚' },
    { count: 100, name: 'hundred_entries', icon: '🏆' }
  ]

  milestones.forEach(milestone => {
    if (entries.length >= milestone.count && !profile.achievements.some(a => a.name === milestone.name)) {
      achievements.push({
        name: milestone.name,
        earnedAt: new Date(),
        icon: milestone.icon
      })
    }
  })

  // Streak achievements
  if (currentStreak >= 7 && !profile.achievements.some(a => a.name === 'week_streak')) {
    achievements.push({
      name: 'week_streak',
      earnedAt: new Date(),
      icon: '🔥'
    })
  }

  if (currentStreak >= 30 && !profile.achievements.some(a => a.name === 'month_streak')) {
    achievements.push({
      name: 'month_streak',
      earnedAt: new Date(),
      icon: '💪'
    })
  }

  // Update profile with new data
  const updatedProfile = await UserProfile.findOneAndUpdate(
    { userId: profile.userId },
    {
      $set: {
        'streak.current': currentStreak,
        'streak.longest': Math.max(longestStreak, profile.streak?.longest || 0),
        'streak.lastEntryDate': entries[0].createdAt
      },
      $addToSet: {
        achievements: { $each: achievements }
      }
    },
    { new: true }
  )

  return updatedProfile
}