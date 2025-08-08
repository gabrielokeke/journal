import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LuX, 
  LuCamera, 
  LuUser, 
  LuMail, 
  LuPalette,
  LuBell,
  LuLock,
  LuSave,
  LuUpload
} from 'react-icons/lu'
import React from 'react'

const themes = {
  purple: 'from-purple-600 to-blue-600',
  blue: 'from-blue-600 to-cyan-600',
  green: 'from-green-600 to-emerald-600',
  pink: 'from-pink-600 to-rose-600',
  orange: 'from-orange-600 to-red-600',
  dark: 'from-gray-800 to-gray-900'
}

export default function ProfileEditModal({ isOpen, onClose, onSave }) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Profile data state
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    profilePicture: '',
    theme: 'purple',
    notifications: {
      writingReminders: false,
      reminderTime: '20:00',
      weeklyReports: true
    },
    privacy: {
      profileVisible: true,
      statsVisible: true
    },
    preferences: {
      defaultCategory: 'Personal',
      defaultMood: 3,
      entriesPerPage: 10
    }
  })

  useEffect(() => {
    if (isOpen && user) {
      fetchUserProfile()
    }
  }, [isOpen, user])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      
      if (data.success && data.data) {
        setProfileData(prev => ({
          ...prev,
          ...data.data
        }))
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
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
      setProfileData(prev => ({
        ...prev,
        profilePicture: e.target.result
      }))
      setUploading(false)
    }
    
    reader.onerror = () => {
      alert('Error reading file')
      setUploading(false)
    }
    
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()
      
      if (data.success) {
        onSave(data.data)
        onClose()
      } else {
        alert(data.error || 'Failed to update profile')
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${themes[profileData.theme]} px-6 py-4 text-white`}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  {profileData.profilePicture ? (
                    <img
                      src={profileData.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-r ${themes[profileData.theme]} flex items-center justify-center text-white text-2xl font-bold`}>
                      {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  ) : (
                    <LuCamera className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Profile Picture</h3>
                <p className="text-sm text-gray-600">Upload a custom profile picture (max 5MB)</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LuUser className="inline w-4 h-4 mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder={user?.firstName || 'Enter username'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={30}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LuMail className="inline w-4 h-4 mr-2" />
                  Email (from Clerk)
                </label>
                <input
                  type="text"
                  value={user?.emailAddresses[0]?.emailAddress}
                  disabled
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us a bit about yourself..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/150 characters</p>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <LuPalette className="inline w-4 h-4 mr-2" />
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(themes).map(([theme, gradient]) => (
                  <button
                    key={theme}
                    onClick={() => handleInputChange('theme', theme)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      profileData.theme === theme ? 'border-purple-500' : 'border-gray-200'
                    }`}
                  >
                    <div className={`w-full h-8 bg-gradient-to-r ${gradient} rounded mb-2`}></div>
                    <p className="text-sm capitalize font-medium">{theme}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <LuBell className="inline w-5 h-5 mr-2" />
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Writing Reminders</p>
                    <p className="text-sm text-gray-600">Get reminded to write daily</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.notifications.writingReminders}
                      onChange={(e) => handleNestedChange('notifications', 'writingReminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {profileData.notifications.writingReminders && (
                  <div className="ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Time</label>
                    <input
                      type="time"
                      value={profileData.notifications.reminderTime}
                      onChange={(e) => handleNestedChange('notifications', 'reminderTime', e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Weekly Reports</p>
                    <p className="text-sm text-gray-600">Get weekly mood and writing summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.notifications.weeklyReports}
                      onChange={(e) => handleNestedChange('notifications', 'weeklyReports', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <LuLock className="inline w-5 h-5 mr-2" />
                Privacy
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Profile Visible</p>
                    <p className="text-sm text-gray-600">Allow others to see your profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.privacy.profileVisible}
                      onChange={(e) => handleNestedChange('privacy', 'profileVisible', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || uploading}
                className={`px-6 py-2 bg-gradient-to-r ${themes[profileData.theme]} text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center space-x-2`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <LuSave className="w-4 h-4" />
                )}
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}