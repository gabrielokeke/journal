//app/api/entries/[id]/route.js
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Entry from '@/models/Entry'

// PUT /api/entries/:id
export async function PUT(req, { params }) {
  try {
    // Check if user is authenticated
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    await connectDB()
    const body = await req.json()
    
    // First check if the entry exists and belongs to the user
    const existingEntry = await Entry.findOne({ _id: params.id, userId })
    if (!existingEntry) {
      return NextResponse.json({ success: false, error: 'Entry not found or unauthorized' }, { status: 404 })
    }
    
    // Update only if it belongs to the authenticated user
    const updated = await Entry.findByIdAndUpdate(params.id, body, { new: true })
    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/entries/:id
export async function DELETE(_, { params }) {
  try {
    // Check if user is authenticated
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    await connectDB()
    
    // First check if entry exists
    const anyEntry = await Entry.findById(params.id)
    if (!anyEntry) {
      return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 })
    }
    
    // Check if the entry belongs to the user
    const existingEntry = await Entry.findOne({ _id: params.id, userId })
    if (!existingEntry) {
      return NextResponse.json({ success: false, error: 'Unauthorized - not your entry' }, { status: 403 })
    }
    
    // Delete the entry
    await Entry.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: 'Deleted' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}