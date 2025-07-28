"use client"
import { useState, useEffect } from 'react'

export default function EntryForm({ onSubmit, editingEntry }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title)
      setContent(editingEntry.content)
    } else {
      setTitle('')
      setContent('')
    }
  }, [editingEntry])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ title, content })
    setTitle('')
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        placeholder="Title"
        className="border p-2 mb-2 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="What did you accomplish today?"
        className="border p-2 mb-2 w-full"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        {editingEntry ? 'Update Entry' : 'Add Entry'}
      </button>
    </form>
  )
}
