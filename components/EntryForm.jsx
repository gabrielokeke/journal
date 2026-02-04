"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { LuUpload, LuX, LuWifiOff, LuMic } from 'react-icons/lu'
import { saveOfflineEntry } from '../lib/offlineStorage'
import dynamic from 'next/dynamic'

// Dynamically import components to prevent SSR issues
const VoiceRecorder = dynamic(() => import('./VoiceRecorder'), {
  ssr: false,
  loading: () => <div>Loading voice recorder...</div>
})

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="w-full h-32 border border-gray-300 rounded-lg animate-pulse bg-gray-50"></div>
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
  const [audioData, setAudioData] = useState(null)
  const [audioDuration, setAudioDuration] = useState(null)
  const [audioMimeType, setAudioMimeType] = useState(null)
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
      setAudioData(editingEntry.audioData || null)
      setAudioDuration(editingEntry.audioDuration || null)
      setAudioMimeType(editingEntry.audioMimeType || null)
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
    setAudioData(null)
    setAudioDuration(null)
    setAudioMimeType(null)
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

  // Handle voice recording completion
  const handleVoiceRecording = useCallback((audioInfo) => {
    console.log('🎤 [EntryForm] Received audio recording:', audioInfo)
    setAudioData(audioInfo.audioData)
    setAudioDuration(audioInfo.duration)
    setAudioMimeType(audioInfo.mimeType)
    setShowVoiceRecorder(false)
  }, [])

  // Remove audio recording
  const removeAudio = () => {
    setAudioData(null)
    setAudioDuration(null)
    setAudioMimeType(null)
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    const formData = { 
      title, 
      content, 
      category, 
      mood, 
      image,
      audioData,
      audioDuration,
      audioMimeType
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
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 flex items-center space-x-2 text-sm">
          <LuWifiOff className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="font-medium">You're offline. Entries will be saved locally and synced when online.</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto mb-6"
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
          {editingEntry ? "Edit Entry" : "Add New Entry"}
        </h2>

        {/* Voice Recorder Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(true)}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50"
          >
            <LuMic className="w-5 h-5" />
            <span className="font-medium">Record Voice Note</span>
          </button>
        </div>

        {/* Audio Preview */}
        {audioData && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <LuMic className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Voice Recording {audioDuration && `(${formatDuration(audioDuration)})`}
                </span>
              </div>
              <button
                type="button"
                onClick={removeAudio}
                disabled={submitting}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
            <audio 
              src={audioData} 
              controls 
              className="w-full"
            />
          </div>
        )}

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            placeholder="Give your entry a title..."
            className="w-full p-3 text-sm sm:text-base text-black placeholder:text-gray-400 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            disabled={submitting}
          />
        </div>

        {/* Rich Text Editor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Thoughts
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your thoughts... Use the toolbar to format your text!"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
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
                className={`flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-gray-300 border-dashed rounded-lg ${
                  submitting || uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'
                } bg-gray-50 transition-colors`}
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-purple-600"></div>
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-3 pb-3 sm:pt-5 sm:pb-6">
                    <LuUpload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-gray-400" />
                    <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-500">
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
                className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={submitting}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors disabled:opacity-50 shadow-md"
              >
                <LuX className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Category and Mood */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <div className="flex flex-col flex-1">
            <label className="mb-1.5 text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2.5 border border-gray-300 rounded-md focus:outline-none text-sm sm:text-base text-black bg-white focus:ring-2 focus:ring-purple-500"
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
            <label className="mb-1.5 text-sm font-medium text-gray-700">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="p-2.5 border border-gray-300 rounded-md focus:outline-none text-sm sm:text-base text-black bg-white focus:ring-2 focus:ring-purple-500"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || submitting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-md font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:from-purple-700 hover:to-blue-700 flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : uploading ? (
            <span>Processing Image...</span>
          ) : offlineMode ? (
            <>
              <LuWifiOff className="w-4 h-4 sm:w-5 sm:h-5" />
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

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <VoiceRecorder
              onTranscriptionComplete={handleVoiceRecording}
            />
            <button
              onClick={() => setShowVoiceRecorder(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}