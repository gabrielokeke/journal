"use client"
import { useState, useEffect } from 'react'
import { LuX, LuDownload, LuSmartphone } from 'react-icons/lu'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isInStandaloneMode)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Check if user already dismissed - safe localStorage access
    const dismissed = localStorage.getItem('installPromptDismissed')
    
    if (!isInStandaloneMode && !dismissed) {
      // For Android/Desktop - listen for install prompt
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShowPrompt(true)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      // For iOS - show after 3 seconds if not installed
      if (iOS && !isInStandaloneMode) {
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000)
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // For iOS, just show instructions
      if (isIOS) {
        return // Instructions are already visible
      }
      return
    }

    // Show install prompt
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Safe localStorage access
    if (typeof window !== 'undefined') {
      localStorage.setItem('installPromptDismissed', 'true')
    }
  }

  // Don't show if already installed or user dismissed
  if (isStandalone || !showPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <LuX className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <LuSmartphone className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Install Daily Journal
              </h3>
              
              {isIOS ? (
                // iOS Instructions
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Install this app on your iPhone:
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Tap the Share button <span className="inline-block">📤</span></li>
                    <li>Scroll and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                  <p className="text-xs text-gray-500 mt-2">
                    Works offline • Fast loading • Native experience
                  </p>
                </div>
              ) : (
                // Android/Desktop
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Install our app for quick access, offline support, and a better experience!
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleInstall}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      <LuDownload className="w-4 h-4" />
                      <span>Install</span>
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Not Now
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ✓ Works offline ✓ Fast loading ✓ Native experience
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}