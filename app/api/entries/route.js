//app/api/entries/route.js
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Entry from '@/models/Entry'

// GET method
export async function GET() {
  try {
    // Check if user is authenticated
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    await connectDB()
    // Only get entries for the authenticated user
    const entries = await Entry.find({ userId }).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: entries }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST method
export async function POST(req) {
  try {
    // Check if user is authenticated
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    await connectDB()
    const body = await req.json()
    
    // Add userId to the entry so it belongs to the authenticated user
    const entry = await Entry.create({
      ...body,
      userId
    })
    
    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}