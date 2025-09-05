"use client"
import { useState, useEffect, useRef } from "react"
import { LuUpload, LuX, LuImage } from 'react-icons/lu'

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
  const [image, setImage] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title || "")
      setContent(editingEntry.content || "")
      setCategory(editingEntry.category || "Personal")
      setMood(editingEntry.mood || 3)
      setImage(editingEntry.image || "")
      setImagePreview(editingEntry.image || "")
    } else {
      setTitle("")
      setContent("")
      setCategory("Personal")
      setMood(3)
      setImage("")
      setImagePreview("")
    }
  }, [editingEntry])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setUploading(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const base64 = e.target.result
      setImage(base64)
      setImagePreview(base64)
      setUploading(false)
    }
    
    reader.onerror = () => {
      alert('Error reading file')
      setUploading(false)
    }
    
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage("")
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ title, content, category, mood, image })
    
    // Reset form
    setTitle("")
    setContent("")
    setCategory("Personal")
    setMood(3)
    setImage("")
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto mb-6"
    >
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        {editingEntry ? "Edit Entry" : "Add New Entry"}
      </h2>

      <input
        type="text"
        placeholder="Title"
        className="w-full p-3 mb-4 text-black dark:text-white placeholder:text-black dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={100}
      />

      <textarea
        placeholder="What did you accomplish today?"
        className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder:text-black dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 resize-none"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        maxLength={1000}
      />

      {/* Image Upload Section */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
          Add Image (optional)
        </label>
        
        {!imagePreview ? (
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <span className="text-gray-600 dark:text-gray-300">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <LuUpload className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> an image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
            >
              <LuX className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col flex-1">
          <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none text-black dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
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
          <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">Mood</label>
          <select
            value={mood}
            onChange={(e) => setMood(parseInt(e.target.value))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none text-black dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
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
        disabled={uploading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:from-purple-700 hover:to-blue-700"
      >
        {uploading ? "Processing..." : editingEntry ? "Update Entry" : "Add Entry"}
      </button>
    </form>
  )
}