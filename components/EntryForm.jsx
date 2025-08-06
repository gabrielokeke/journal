"use client"
import { useState, useEffect } from "react"

const categories = [
  "Work",
  "Personal",
  "Health",
  "Learning",
  "Creative",
  "Social",
  "Other",
]

const moodLabels = {
  1: "😢 Very Low",
  2: "😞 Low",
  3: "😐 Neutral",
  4: "😊 Good",
  5: "🎉 Excellent",
}

export default function EntryForm({ onSubmit, editingEntry }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("Personal")
  const [mood, setMood] = useState(3)

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title || "")
      setContent(editingEntry.content || "")
      setCategory(editingEntry.category || "Personal")
      setMood(editingEntry.mood || 3)
    } else {
      setTitle("")
      setContent("")
      setCategory("Personal")
      setMood(3)
    }
  }, [editingEntry])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ title, content, category, mood })
    setTitle("")
    setContent("")
    setCategory("Personal")
    setMood(3)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto mb-6"
    >
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {editingEntry ? "Edit Entry" : "Add New Entry"}
      </h2>

      <input
        type="text"
        placeholder="Title"
        className="w-full p-3 mb-4 text-black placeholder:text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={100}
      />

      <textarea
        placeholder="What did you accomplish today?"
        className="w-full p-3 mb-4 border text-black placeholder:text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        maxLength={1000}
      />

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col flex-1">
          <label className="mb-1 font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded-md focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col flex-1">
          <label className="mb-1 font-medium text-gray-700">Mood</label>
          <select
            value={mood}
            onChange={(e) => setMood(parseInt(e.target.value))}
            className="p-2 border rounded-md focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
            required
          >
            {Object.entries(moodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-md font-semibold "
      >
        {editingEntry ? "Update Entry" : "Add Entry"}
      </button>
    </form>
  )
}
