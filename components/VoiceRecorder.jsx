"use client"
import { useState, useEffect } from 'react'
import { LuMic, LuMicOff, LuStopCircle, LuX, LuCheck, LuAlertCircle } from 'react-icons/lu'
import { motion, AnimatePresence } from 'framer-motion'

export default function VoiceRecorder({ onTranscript, onClose }) {
  console.log('🎤 [VoiceRecorder] Component mounted')
  
  const [recognition, setRecognition] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Initialize speech recognition
  useEffect(() => {
    console.log('🎤 [VoiceRecorder] Running initialization effect')
    
    if (typeof window === 'undefined') {
      console.log('❌ [VoiceRecorder] Window is undefined (SSR)')
      return
    }

    console.log('✅ [VoiceRecorder] Window is available')

    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.error('❌ [VoiceRecorder] Speech Recognition NOT supported in this browser')
      console.log('Browser info:', {
        userAgent: navigator.userAgent,
        hasSpeechRecognition: !!window.SpeechRecognition,
        hasWebkitSpeechRecognition: !!window.webkitSpeechRecognition
      })
      setIsSupported(false)
      return
    }

    console.log('✅ [VoiceRecognition] Speech Recognition IS supported')

    try {
      const recognitionInstance = new SpeechRecognition()
      console.log('✅ [VoiceRecorder] Recognition instance created successfully')
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'
      
      console.log('✅ [VoiceRecorder] Recognition configured:', {
        continuous: recognitionInstance.continuous,
        interimResults: recognitionInstance.interimResults,
        lang: recognitionInstance.lang
      })

      recognitionInstance.onstart = () => {
        console.log('🎙️ [VoiceRecorder] Recognition started')
        setIsListening(true)
      }

      recognitionInstance.onresult = (event) => {
        console.log('📝 [VoiceRecorder] Got results, event:', {
          resultIndex: event.resultIndex,
          resultsLength: event.results.length
        })
        
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' '
            console.log('✅ [VoiceRecorder] Final transcript piece:', transcriptPiece)
          } else {
            interimTranscript += transcriptPiece
            console.log('⏳ [VoiceRecorder] Interim transcript piece:', transcriptPiece)
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            const newText = prev + finalTranscript
            console.log('📝 [VoiceRecorder] Updated transcript:', newText)
            return newText
          })
        }
      }

      recognitionInstance.onerror = (event) => {
        console.error('❌ [VoiceRecorder] Recognition error:', {
          error: event.error,
          message: event.message,
          type: event.type
        })
        
        const errorMsg = `Speech recognition error: ${event.error}`
        setErrorMessage(errorMsg)
        
        if (event.error === 'not-allowed') {
          alert('❌ Microphone access denied. Please allow microphone access in your browser settings.')
        } else if (event.error === 'no-speech') {
          console.log('⚠️ [VoiceRecorder] No speech detected')
        } else if (event.error === 'audio-capture') {
          alert('❌ No microphone found. Please connect a microphone and try again.')
        } else if (event.error === 'network') {
          alert('❌ Network error occurred. Speech recognition may not work offline.')
        }
        
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        console.log('🛑 [VoiceRecorder] Recognition ended')
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
      console.log('✅ [VoiceRecorder] Recognition instance saved to state')
      
    } catch (error) {
      console.error('❌ [VoiceRecorder] Error creating recognition instance:', error)
      setIsSupported(false)
      setErrorMessage(error.message)
    }
  }, [])

  // Check microphone permission
  useEffect(() => {
    console.log('🎤 [VoiceRecorder] Checking microphone permissions')
    
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      console.log('✅ [VoiceRecorder] Navigator.mediaDevices available')
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          console.log('✅ [VoiceRecorder] Microphone access granted', stream)
          setIsMicrophoneAvailable(true)
          // Stop the stream immediately, we just needed to check permissions
          stream.getTracks().forEach(track => track.stop())
        })
        .catch((error) => {
          console.error('❌ [VoiceRecorder] Microphone access denied:', error)
          setIsMicrophoneAvailable(false)
        })
    } else {
      console.warn('⚠️ [VoiceRecorder] Navigator.mediaDevices not available')
    }
  }, [])

  // Recording timer
  useEffect(() => {
    let interval
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = async () => {
    console.log('🎤 [VoiceRecorder] handleStartRecording called')
    
    if (!recognition) {
      console.error('❌ [VoiceRecorder] No recognition instance available')
      alert('Speech recognition not initialized. Please refresh the page.')
      return
    }

    try {
      console.log('🎤 [VoiceRecorder] Starting recognition...')
      recognition.start()
      setIsRecording(true)
      setIsPaused(false)
      console.log('✅ [VoiceRecorder] Recognition started successfully')
    } catch (error) {
      console.error('❌ [VoiceRecorder] Error starting recognition:', error)
      alert(`Failed to start recording: ${error.message}`)
    }
  }

  const handlePauseRecording = () => {
    console.log('⏸️ [VoiceRecorder] Pausing recording')
    if (recognition) {
      recognition.stop()
      setIsPaused(true)
      console.log('✅ [VoiceRecorder] Recording paused')
    }
  }

  const handleResumeRecording = async () => {
    console.log('▶️ [VoiceRecorder] Resuming recording')
    if (recognition) {
      try {
        recognition.start()
        setIsPaused(false)
        console.log('✅ [VoiceRecorder] Recording resumed')
      } catch (error) {
        console.error('❌ [VoiceRecorder] Error resuming:', error)
      }
    }
  }

  const handleStopRecording = () => {
    console.log('🛑 [VoiceRecorder] Stopping recording')
    console.log('📝 [VoiceRecorder] Final transcript:', transcript)
    
    if (recognition) {
      recognition.stop()
    }
    
    setIsRecording(false)
    setIsPaused(false)
    
    if (transcript.trim()) {
      console.log('✅ [VoiceRecorder] Calling onTranscript with:', transcript)
      onTranscript(transcript)
      setShowSuccess(true)
      setTimeout(() => {
        console.log('✅ [VoiceRecorder] Closing modal')
        onClose()
      }, 1500)
    } else {
      console.log('⚠️ [VoiceRecorder] No transcript, closing immediately')
      onClose()
    }
  }

  const handleClearTranscript = () => {
    console.log('🗑️ [VoiceRecorder] Clearing transcript')
    setTranscript('')
    setRecordingTime(0)
  }

  const handleCancel = () => {
    console.log('❌ [VoiceRecorder] Canceling recording')
    if (recognition) {
      recognition.stop()
    }
    setTranscript('')
    onClose()
  }

  // Browser not supported
  if (!isSupported) {
    console.log('⚠️ [VoiceRecorder] Showing unsupported browser message')
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        >
          <LuAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Browser Not Supported</h3>
          <p className="text-gray-600 mb-4">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
          {errorMessage && (
            <p className="text-sm text-red-600 mb-4">Error: {errorMessage}</p>
          )}
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    )
  }

  console.log('🎤 [VoiceRecorder] Rendering main interface')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LuMic className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">Voice Recording</h3>
                <p className="text-purple-100 text-sm">Speak naturally, we'll transcribe</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm font-semibold">Error: {errorMessage}</p>
            </div>
          )}

          {/* Microphone Status */}
          {!isMicrophoneAvailable && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
              <LuAlertCircle className="w-5 h-5" />
              <span className="text-sm">Microphone not available. Please check permissions.</span>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex flex-col items-center mb-6">
            {/* Animated Mic Icon */}
            <div className="relative mb-6">
              <motion.div
                animate={{
                  scale: isListening ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isListening ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  isListening 
                    ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                    : isRecording && isPaused
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                } shadow-xl`}
              >
                {isListening ? (
                  <LuMic className="w-16 h-16 text-white" />
                ) : (
                  <LuMicOff className="w-16 h-16 text-white" />
                )}
              </motion.div>

              {/* Pulse Animation */}
              {isListening && (
                <motion.div
                  animate={{
                    scale: [1, 2],
                    opacity: [0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-full bg-red-400"
                />
              )}
            </div>

            {/* Status Text */}
            <div className="text-center mb-4">
              <h4 className="text-2xl font-bold text-gray-900 mb-1">
                {isListening ? '🎙️ Listening...' : isPaused ? '⏸️ Paused' : '🎤 Ready to Record'}
              </h4>
              {isRecording && (
                <p className="text-gray-600">
                  Recording time: <span className="font-mono font-bold text-purple-600">{formatTime(recordingTime)}</span>
                </p>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  disabled={!isMicrophoneAvailable || !recognition}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LuMic className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <>
                  {!isPaused ? (
                    <button
                      onClick={handlePauseRecording}
                      className="flex items-center space-x-2 bg-yellow-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-yellow-600 transition-all shadow-lg"
                    >
                      <LuMicOff className="w-5 h-5" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeRecording}
                      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-all shadow-lg"
                    >
                      <LuMic className="w-5 h-5" />
                      <span>Resume</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleStopRecording}
                    className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-all shadow-lg"
                  >
                    <LuStopCircle className="w-5 h-5" />
                    <span>Stop & Save</span>
                  </button>

                  {transcript && (
                    <button
                      onClick={handleClearTranscript}
                      className="p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                      title="Clear transcript"
                    >
                      <LuX className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Transcript:</label>
                <span className="text-xs text-gray-500">{transcript.split(' ').length} words</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-gray-900 whitespace-pre-wrap">{transcript}</p>
              </div>
            </div>
          )}

          {/* Tips */}
          {!isRecording && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for best results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Minimize background noise</li>
                <li>• You can pause and resume anytime</li>
                <li>• Say "period" or "comma" for punctuation</li>
                <li>• Works best with Chrome or Edge browser</li>
              </ul>
            </div>
          )}

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-white/95 flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <LuCheck className="w-24 h-24 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Voice Note Saved!</h3>
                  <p className="text-gray-600">Adding to your entry...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}