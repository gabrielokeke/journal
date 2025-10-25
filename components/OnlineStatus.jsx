/* ===== components/OnlineStatus.js ===== */
"use client"
import { useState, useEffect } from 'react'
import { LuWifi, LuWifiOff } from 'react-icons/lu'
import { motion, AnimatePresence } from 'framer-motion'

export default function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      // Hide the online message after 3 seconds
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't show anything if online and showStatus is false
  if (isOnline && !showStatus) return null

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 ${
            isOnline 
              ? 'bg-green-500' 
              : 'bg-red-500'
          } text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50`}
        >
          {isOnline ? (
            <>
              <LuWifi className="w-5 h-5" />
              <span className="font-medium">Back Online</span>
            </>
          ) : (
            <>
              <LuWifiOff className="w-5 h-5" />
              <span className="font-medium">Offline Mode</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}