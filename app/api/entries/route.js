import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Entry from '@/models/Entry'

// GET method
export async function GET() {
  try {
    await connectDB()
    const entries = await Entry.find().sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: entries }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST method
export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    const entry = await Entry.create(body)
    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
