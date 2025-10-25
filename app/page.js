"use client"
//app/page.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { LuPenLine, LuLock, LuTrendingUp } from 'react-icons/lu'
import CustomUserProfile from '../components/CustomUserProfile'
import EntryForm from '../components/EntryForm'
import EntryCard from '../components/EntryCard'

const containerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Home() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingEntry, setEditingEntry] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

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

  const handleSubmit = async (formData) => {
    try {
      const method = editingEntry ? 'PUT' : 'POST'
      const url = editingEntry ? `/api/entries/${editingEntry._id}` : '/api/entries'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccessMessage(editingEntry ? 'Entry updated!' : 'Entry created!')
        setEditingEntry(null)
        fetchEntries()
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Error submitting entry: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        fetchEntries()
      } else {
        setError(data.error || 'Failed to delete entry')
      }
    } catch (err) {
      setError('Error deleting entry: ' + err.message)
    }
  }

  return (
    <>
      <Head>
        <title>Daily Journal - Your Personal Space</title>
      </Head>

      {/* Landing page for non-authenticated users */}
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          {/* Navigation */}
          <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <h1 className="lg:text-4xl text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Daily Journal
                  </h1>
                </div>
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <Link
                    href="/sign-in"
                    className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 duration-500 lg:px-3 px-2 py-2 rounded-md text-sm font-medium transform transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white lg:px-4 px-2 py-2 rounded-md text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <motion.div 
            initial="hidden" 
            animate="show" 
            variants={containerVariant}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Your thoughts deserve a
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {' '}beautiful home
                </span>
              </h1>
              <p className="text-xl text-center text-gray-600 mb-8 max-w-3xl mx-auto">
                Capture your daily experiences, track your moods, and reflect on your journey. 
                A private, secure space that's entirely yours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Journaling Today
                </Link>
                <Link
                  href="/sign-in"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  I Already Have an Account
                </Link>
              </div>
            </motion.div>

            {/* Features Section */}
            <motion.div 
              variants={containerVariant} 
              className="mt-20 grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <LuPenLine className="text-white text-2xl" />,
                  title: "Write Freely",
                  description: "Express your thoughts without limits. Add titles, content, and track your daily moods.",
                },
                {
                  icon: <LuLock className="text-white text-2xl" />,
                  title: "Completely Private",
                  description: "Your entries are encrypted and only visible to you. No one else can access your thoughts.",
                },
                {
                  icon: <LuTrendingUp className="text-white text-2xl" />,
                  title: "Track Your Journey",
                  description: "Monitor your moods, categorize entries, and see your personal growth over time.",
                },
              ].map(({ icon, title, description }, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className="bg-white/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    {icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-600">{description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </SignedOut>

      {/* Dashboard for authenticated users */}
      <SignedIn>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation for logged in users */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  My Journal
                </h1>
                <CustomUserProfile />
              </div>
            </div>
          </nav>

          <main className="max-w-4xl mx-auto p-6">
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6"
                >
                  {successMessage}
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial="hidden" animate="show" variants={containerVariant}>
              <motion.div variants={fadeInUp}>
                <EntryForm onSubmit={handleSubmit} editingEntry={editingEntry} />
              </motion.div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading your entries...</p>
                </div>
              ) : (
                <motion.div className="space-y-6 mt-8">
                  {entries.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center py-12 bg-white rounded-lg shadow-sm"
                    >
                      <p className="text-gray-600 text-lg">No entries yet. Start writing your first entry above!</p>
                    </motion.div>
                  ) : (
                    entries.map((entry) => (
                      <motion.div
                        key={entry._id}
                        variants={fadeInUp}
                        initial="hidden"
                        animate="show"
                      >
                        <EntryCard
                          entry={entry}
                          onEdit={() => setEditingEntry(entry)}
                          onDelete={() => handleDelete(entry._id)}
                        />
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </motion.div>
          </main>
        </div>
      </SignedIn>
    </>
  )
}