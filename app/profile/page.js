"use client"
// app/profile/page.js
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { 
  LuUser, 
  LuMail, 
  LuCalendarDays, 
  LuFileText, 
  LuTrendingUp,
  LuArrowLeft,
  LuAward,
  LuFlame,
  LuDownload
} from 'react-icons/lu'
import {FaEdit} from 'react-icons/fa'
import Link from 'next/link'
import CustomUserProfile from '../../components/CustomUserProfile'
import ProfileEditModal from '../../components/ProfileEditModal'

const containerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const themes = {
  purple: 'from-purple-600 to-blue-600',
  blue: 'from-blue-600 to-cyan-600',
  green: 'from-green-600 to-emerald-600',
  pink: 'from-pink-600 to-rose-600',
  orange: 'from-orange-600 to-red-600',
  dark: 'from-gray-800 to-gray-900'
}

const achievementNames = {
  first_entry: 'First Entry',
  ten_entries: '10 Entries',
  fifty_entries: '50 Entries',
  hundred_entries: '100 Entries',
  week_streak: '7-Day Streak',
  month_streak: '30-Day Streak'
}

export default function ProfilePage() {
  const { user } = useUser()
  const [entries, setEntries] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch entries and profile data
      const [entriesResponse, profileResponse] = await Promise.all([
        fetch('/api/entries'),
        fetch('/api/user/profile')
      ])
      
      const entriesData = await entriesResponse.json()
      const profileData = await profileResponse.json()
      
      if (entriesData.success) {
        setEntries(entriesData.data)
      }
      
      if (profileData.success) {
        setProfile(profileData.data)
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = (updatedProfile) => {
    setProfile(updatedProfile)
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/user/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Calculate stats
  const totalEntries = entries.length
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Calculate mood distribution
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1
    return acc
  }, {})

  const mostCommonMood = Object.entries(moodCounts).reduce(
    (max, [mood, count]) => count > max.count ? { mood: parseInt(mood), count } : max,
    { mood: 3, count: 0 }
  )

  const moodEmojis = { 1: '😢', 2: '😞', 3: '😐', 4: '😊', 5: '🎉' }

  const currentTheme = profile?.theme || 'purple'
  const currentGradient = themes[currentTheme]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <LuArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Journal</span>
              </Link>
            </div>
            <CustomUserProfile />
          </div>
        </div>
      </nav>

      <motion.div 
        initial="hidden" 
        animate="show" 
        variants={containerVariant}
        className="max-w-4xl mx-auto p-6"
      >
        {/* Profile Header */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className={`bg-gradient-to-r ${currentGradient} px-2 lg:px-8 py-12 text-white relative`}>
            <div className="flex items-start lg:justify-start justify-center space-x-3 lg:space-x-6">
              {/* Profile Picture */}
              <div className="lg:w-24 lg:h-24 w-16 h-16 rounded-full overflow-hidden border-4 border-white/30">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-bold lg:text-3xl text-xl">
                    {profile?.username?.charAt(0) || user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="lg:text-3xl text-xl font-bold mb-2">
                  {profile?.username || user.firstName || 'Welcome!'}
                  {profile?.username && user.firstName && (
                    <span className="text-purple-200 text-lg ml-2">({user.firstName})</span>
                  )}
                </h1>
                <p className="text-purple-100 text-sm lg:text-lg">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
                {profile?.bio && (
                  <p className="text-purple-200 text-sm lg:text-base mt-2 max-w-md">
                    {profile.bio}
                  </p>
                )}
                <p className="text-purple-200 text-sm lg:text-base mt-1">
                  Member since {memberSince}
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="p-8">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentGradient} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <LuFileText className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{totalEntries}</h3>
                <p className="text-gray-600">Total Entries</p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentGradient} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-2xl">{moodEmojis[mostCommonMood.mood]}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Most Common</h3>
                <p className="text-gray-600">Mood</p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentGradient} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <LuFlame className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {profile?.streak?.current || 0}
                </h3>
                <p className="text-gray-600">Day Streak</p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentGradient} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <LuAward className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {profile?.achievements?.length || 0}
                </h3>
                <p className="text-gray-600">Achievements</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements Section */}
        {profile?.achievements?.length > 0 && (
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg px-4 lg:px-8 py-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <LuAward className="inline w-6 h-6 mr-2" />
              Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {profile.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    {achievementNames[achievement.name] || achievement.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Account Information */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg py-8 px-4 lg:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="lg:text-2xl text-xl font-bold text-gray-900">Account Information</h2>
            <div className="flex space-x-3">
              <button
                onClick={exportData}
                className={`flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50`}
                title="Export your data"
              >
                <LuDownload className="w-5 h-5" />
                <span className="font-medium hidden sm:block">Export</span>
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className={`flex items-center space-x-2 bg-gradient-to-r ${currentGradient} text-white hover:opacity-90 transition-opacity px-4 py-2 rounded-lg`}
              >
                <FaEdit className="w-4 h-4" />
                <span className="font-medium">Edit Profile</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${currentGradient} rounded-full flex items-center justify-center`}>
                <LuUser className="text-white text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Display Name</p>
                <p className="text-gray-900 font-medium">
                  {profile?.username || user.firstName || 'Not set'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <LuMail className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email Address</p>
                <p className="text-gray-900 text-[12px] lg:text-base font-medium">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <LuCalendarDays className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Member Since</p>
                <p className="text-gray-900 font-medium">{memberSince}</p>
              </div>
            </div>

            {profile?.bio && (
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                  <LuUser className="text-gray-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Bio</p>
                  <p className="text-gray-900 font-medium">{profile.bio}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg px-4 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading activity...</p>
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-4">
              {entries.slice(0, 5).map((entry, index) => (
                <div key={entry._id} className="flex items-center space-x-4 py-4 px-2 lg:p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{moodEmojis[entry.mood]}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{entry.title}</h4>
                    <p className="text-gray-600 text-sm">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.image && (
                      <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden">
                        <img src={entry.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                      {entry.category}
                    </span>
                  </div>
                </div>
              ))}
              
              {entries.length > 5 && (
                <div className="text-center pt-4">
                  <Link 
                    href="/"
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View all {entries.length} entries →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <LuFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No entries yet. Start journaling to see your activity here!</p>
              <Link 
                href="/"
                className={`inline-block mt-4 bg-gradient-to-r ${currentGradient} text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity`}
              >
                Create Your First Entry
              </Link>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProfileSave}
      />
    </div>
  )}