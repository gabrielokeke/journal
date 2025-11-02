"use client"
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { LuArrowLeft, LuBarChart3 } from 'react-icons/lu'
import Link from 'next/link'
import CustomUserProfile from '../../components/CustomUserProfile'
import AnalyticsDashboard from '../../components/AnalyticsDashboard'
import OnlineStatus from '../../components/OnlineStatus'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function AnalyticsPage() {
  const { user } = useUser()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/entries')
      const data = await response.json()
      if (data.success) {
        setEntries(data.data)
        setError('')
      } else {
        setError(data.error || 'Failed to fetch entries')
      }
    } catch (err) {
      setError('Failed to fetch entries: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <OnlineStatus />

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

      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeInUp}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <LuBarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your journaling journey and insights</p>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your analytics...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeInUp}
          >
            <AnalyticsDashboard entries={entries} />
          </motion.div>
        )}
      </main>
    </div>
  )
}