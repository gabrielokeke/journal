import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Entry from '@/models/Entry'

// PUT /api/entries/:id
export async function PUT(req, { params }) {
  try {
    await connectDB()
    const body = await req.json()
    const updated = await Entry.findByIdAndUpdate(params.id, body, { new: true })
    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/entries/:id
export async function DELETE(_, { params }) {
  try {
    await connectDB()
    await Entry.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: 'Deleted' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
