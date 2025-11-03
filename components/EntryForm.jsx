"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { LuUpload, LuX, LuWifiOff, LuMic } from 'react-icons/lu'
import { saveOfflineEntry } from '../lib/offlineStorage'
import dynamic from 'next/dynamic'

// Dynamically import VoiceRecorder to prevent SSR issues
const VoiceRecorder = dynamic(() => import('./VoiceRecorder'), {
  ssr: false,
  loading: () => <div>Loading voice recorder...</div>
})

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
  console.log('📝 [EntryForm] Component rendered')
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("Personal")
  const [mood, setMood] = useState(3)
  const [image, setImage] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const fileInputRef = useRef(null)

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setOfflineMode(!navigator.onLine)
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title || "")
      setContent(editingEntry.content || "")
      setCategory(editingEntry.category || "Personal")
      setMood(editingEntry.mood || 3)
      setImage(editingEntry.image || "")
      setImagePreview(editingEntry.image || "")
    } else {
      resetForm()
    }
  }, [editingEntry])

  const resetForm = () => {
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

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

  // Use useCallback to prevent re-creating this function on every render
  const handleVoiceTranscript = useCallback((transcript) => {
    console.log('🎤 [EntryForm] Received transcript:', transcript)
    
    // Add transcript to content
    setContent(prevContent => {
      if (prevContent) {
        return prevContent + '\n\n' + transcript
      }
      return transcript
    })
    
    // Close the modal
    setShowVoiceRecorder(false)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    const formData = { 
      title, 
      content, 
      category, 
      mood, 
      image 
    }

    if (!navigator.onLine) {
      try {
        await saveOfflineEntry(formData)
        alert('📴 You are offline. Entry saved locally and will sync when you\'re back online!')
        resetForm()
        setShowOfflineMessage(true)
        setTimeout(() => setShowOfflineMessage(false), 5000)
      } catch (error) {
        alert('Failed to save offline: ' + error.message)
      }
      setSubmitting(false)
      return
    }

    if (editingEntry) {
      try {
        const response = await fetch(`/api/entries/${editingEntry._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (data.success) {
          onSubmit(formData)
          resetForm()
        } else {
          alert(data.error || 'Something went wrong')
        }
      } catch (err) {
        try {
          await saveOfflineEntry(formData)
          alert('📴 Network error. Entry saved offline and will sync later.')
          resetForm()
        } catch (offlineErr) {
          alert('Failed to save: ' + offlineErr.message)
        }
      }
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        onSubmit(formData)
        resetForm()
      } else {
        throw new Error(data.error || 'Something went wrong')
      }
    } catch (err) {
      try {
        await saveOfflineEntry(formData)
        alert('📴 Network error. Entry saved offline and will sync when you\'re back online.')
        resetForm()
        setShowOfflineMessage(true)
        setTimeout(() => setShowOfflineMessage(false), 5000)
      } catch (offlineErr) {
        alert('Failed to save: ' + offlineErr.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {offlineMode && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
          <LuWifiOff className="w-5 h-5" />
          <span className="font-medium">You're offline. Entries will be saved locally and synced when online.</span>
        </div>
      )}

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
          className="w-full p-3 mb-4 text-black placeholder:text-gray-400 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          disabled={submitting}
        />

        <div className="relative mb-4">
          <textarea
            placeholder="What did you accomplish today?"
            className="w-full p-3 pr-12 border border-gray-300 text-black placeholder:text-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={1000}
            disabled={submitting}
          />
          
          <button
            type="button"
            onClick={() => {
              console.log('🎤 [EntryForm] Opening voice recorder')
              setShowVoiceRecorder(true)
            }}
            disabled={submitting}
            className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50"
            title="Voice to text"
          >
            <LuMic className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
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
                disabled={submitting || uploading}
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg ${
                  submitting || uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'
                } bg-gray-50 transition-colors`}
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <LuUpload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> an image
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={submitting}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors disabled:opacity-50"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex flex-col flex-1">
            <label className="mb-1 font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none text-black bg-white focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
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
              className="p-2 border border-gray-300 rounded-md focus:outline-none text-black bg-white focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
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
          disabled={uploading || submitting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:from-purple-700 hover:to-blue-700 flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : uploading ? (
            <span>Processing Image...</span>
          ) : offlineMode ? (
            <>
              <LuWifiOff className="w-5 h-5" />
              <span>{editingEntry ? "Update Entry (Offline)" : "Save Entry (Offline)"}</span>
            </>
          ) : (
            <span>{editingEntry ? "Update Entry" : "Add Entry"}</span>
          )}
        </button>

        {offlineMode && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Entry will be automatically synced when you're back online
          </p>
        )}
      </form>

      {/* Voice Recorder Modal - Only render when needed */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onTranscript={handleVoiceTranscript}
          onClose={() => {
            console.log('🎤 [EntryForm] Closing voice recorder')
            setShowVoiceRecorder(false)
          }}
        />
      )}
    </>
  )
}