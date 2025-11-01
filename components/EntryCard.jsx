//component/EntryCard.jsx
import { useState } from 'react'
import { LuWifiOff } from 'react-icons/lu'

export default function EntryCard({ entry, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const moodEmojis = {
    1: "😢",
    2: "😞",
    3: "😐",
    4: "😊",
    5: "🎉",
  }

  const categoryColors = {
    Work: "bg-blue-100 text-blue-800",
    Personal: "bg-green-100 text-green-800",
    Health: "bg-red-100 text-red-800",
    Learning: "bg-purple-100 text-purple-800",
    Creative: "bg-pink-100 text-pink-800",
    Social: "bg-yellow-100 text-yellow-800",
    Other: "bg-gray-100 text-gray-800",
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEdit = () => {
    if (entry.offline) {
      alert('⚠️ Cannot edit offline entries. Please wait for sync or delete and recreate.')
      return
    }
    if (isOffline) {
      alert('⚠️ You need to be online to edit entries.')
      return
    }
    onEdit()
  }

  const handleDelete = async () => {
    if (entry.offline) {
      if (!confirm('Delete this offline entry? It hasn\'t been synced yet.')) return
    } else {
      if (isOffline) {
        alert('⚠️ You need to be online to delete entries.')
        return
      }
      if (!confirm('Are you sure you want to delete this entry?')) return
    }

    setIsDeleting(true)
    try {
      await onDelete()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow overflow-hidden relative ${
      entry.offline ? 'border-2 border-orange-300' : ''
    }`}>
      {/* Offline Badge */}
      {entry.offline && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-md">
            <LuWifiOff className="w-3 h-3" />
            <span>Pending Sync</span>
          </div>
        </div>
      )}

      {/* Image section - only show if image exists */}
      {entry.image && (
        <div className="relative w-full">
          <img
            src={entry.image}
            alt={entry.title}
            className="w-full h-auto object-contain max-h-96"
            onError={(e) => {
              // Hide image if it fails to load
              e.target.parentElement.style.display = 'none'
            }}
          />
          {/* Optional gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
      )}
      
      {/* Content section */}
      <div className="p-5">
        <div className="mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">{entry.title}</h2>
        </div>
        
        <p className="mt-2 text-gray-700 leading-relaxed">{entry.content}</p>

        <div className="flex items-center mt-4 space-x-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              categoryColors[entry.category] || categoryColors.Other
            }`}
          >
            {entry.category}
          </span>

          <span className="flex items-center gap-1 text-sm text-gray-700">
            Mood: <span className="text-lg">{moodEmojis[entry.mood] || "😐"}</span>
          </span>
        </div>

        <div className="mt-4 flex justify-between items-center pt-4">
          <div className="space-x-3">
            <button
              onClick={handleEdit}
              disabled={entry.offline || isOffline || isDeleting}
              className={`${
                entry.offline || isOffline || isDeleting
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800 cursor-pointer'
              } font-semibold transition-colors`}
              title={
                entry.offline 
                  ? 'Cannot edit offline entries' 
                  : isOffline 
                  ? 'Need internet to edit' 
                  : 'Edit entry'
              }
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`${
                isDeleting
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-600 hover:text-red-800 cursor-pointer'
              } font-semibold transition-colors`}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
          
          {/* Show image indicator if there's an image */}
          <div className="flex items-center space-x-2">
            {entry.image && (
              <div className="flex items-center text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">Image</span>
              </div>
            )}
            
            {/* Show offline indicator for offline entries */}
            {entry.offline && (
              <div className="flex items-center text-orange-500">
                <LuWifiOff className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Not Synced</span>
              </div>
            )}
          </div>
        </div>

        {/* Date at the bottom */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {formatDate(entry.createdAt)}
            </span>
            
            {/* Additional offline info */}
            {entry.offline && (
              <span className="text-xs text-orange-600 font-medium">
                Will sync when online
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}