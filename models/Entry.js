import mongoose from 'mongoose'

const EntrySchema = new mongoose.Schema({
  title: String,
  content: String,
}, { timestamps: true })

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema)
