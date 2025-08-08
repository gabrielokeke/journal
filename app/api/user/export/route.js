// app/api/user/export/route.js
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Entry from '@/models/Entry'
import UserProfile from '@/models/UserProfile'

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Fetch all user data
    const [entries, profile] = await Promise.all([
      Entry.find({ userId: user.id }).sort({ createdAt: -1 }),
      UserProfile.findOne({ userId: user.id })
    ])

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      },
      profile: profile || null,
      entries: entries.map(entry => ({
        id: entry._id,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        category: entry.category,
        image: entry.image ? 'Image included' : null, // Don't include full base64 in export
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      })),
      statistics: {
        totalEntries: entries.length,
        entriesByCategory: entries.reduce((acc, entry) => {
          acc[entry.category] = (acc[entry.category] || 0) + 1
          return acc
        }, {}),
        entriesByMood: entries.reduce((acc, entry) => {
          acc[entry.mood] = (acc[entry.mood] || 0) + 1
          return acc
        }, {}),
        averageMood: entries.length > 0 
          ? (entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length).toFixed(2)
          : 0,
        firstEntry: entries.length > 0 ? entries[entries.length - 1].createdAt : null,
        lastEntry: entries.length > 0 ? entries[0].createdAt : null
      }
    }

    // Create JSON response with proper headers for download
    const response = new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="journal-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

    return response
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}