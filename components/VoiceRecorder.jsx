"use client"
import { useState, useEffect, useRef } from 'react'
import { LuMic, LuMicOff, LuStopCircle, LuX, LuCheck, LuAlertCircle } from 'react-icons/lu'
import { motion, AnimatePresence } from 'framer-motion'

export default function VoiceRecorder({ onTranscript, onClose }) {
  console.log('🎤 [VoiceRecorder] Component mounted')
  
  const recognitionRef = useRef(null)
  const isInitializedRef = useRef(false)
  
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Initialize speech recognition ONCE
  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (isInitializedRef.current) {
      console.log('⚠️ [VoiceRecorder] Already initialized, skipping')
      return
    }

    console.log('🎤 [VoiceRecorder] Running initialization effect')
    
    if (typeof window === 'undefined') {
      console.log('❌ [VoiceRecorder] Window is undefined (SSR)')
      return
    }

    console.log('✅ [VoiceRecorder] Window is available')

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.error('❌ [VoiceRecorder] Speech Recognition NOT supported')
      setIsSupported(false)
      return
    }

    console.log('✅ [VoiceRecognition] Speech Recognition IS supported')

    try {
      const recognitionInstance = new SpeechRecognition()
      console.log('✅ [VoiceRecorder] Recognition instance created')
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'

      recognitionInstance.onstart = () => {
        console.log('🎙️ [VoiceRecorder] Recognition started')
        setIsListening(true)
      }

      recognitionInstance.onresult = (event) => {
        console.log('📝 [VoiceRecorder] Got results')
        
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' '
            console.log('✅ [VoiceRecorder] Final:', transcriptPiece)
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript)
        }
      }

      recognitionInstance.onerror = (event) => {
        console.error('❌ [VoiceRecorder] Error:', event.error)
        
        if (event.error === 'not-allowed') {
          alert('❌ Microphone access denied. Please allow microphone access.')
        } else if (event.error === 'no-speech') {
          console.log('⚠️ [VoiceRecorder] No speech detected (this is normal if not speaking)')
        } else if (event.error === 'audio-capture') {
          alert('❌ No microphone found.')
        } else if (event.error === 'network') {
          console.warn('⚠️ [VoiceRecorder] Network error (may work offline in some browsers)')
        }
        
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        console.log('🛑 [VoiceRecorder] Recognition ended')
        setIsListening(false)
      }

      recognitionRef.current = recognitionInstance
      isInitializedRef.current = true
      console.log('✅ [VoiceRecorder] Initialization complete')
      
    } catch (error) {
      console.error('❌ [VoiceRecorder] Init error:', error)
      setIsSupported(false)
      setErrorMessage(error.message)
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 [VoiceRecorder] Cleanup')
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log('Cleanup stop error (safe to ignore):', e)
        }
      }
    }
  }, [])

  // Check microphone permission
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          console.log('✅ [VoiceRecorder] Mic access granted')
          setIsMicrophoneAvailable(true)
          stream.getTracks().forEach(track => track.stop())
        })
        .catch((error) => {
          console.error('❌ [VoiceRecorder] Mic denied:', error)
          setIsMicrophoneAvailable(false)
        })
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

  const handleStartRecording = () => {
    console.log('🎤 [VoiceRecorder] Starting...')
    
    if (!recognitionRef.current) {
      console.error('❌ No recognition instance')
      alert('Speech recognition not ready. Please refresh.')
      return
    }

    try {
      recognitionRef.current.start()
      setIsRecording(true)
      setIsPaused(false)
      console.log('✅ Started')
    } catch (error) {
      console.error('❌ Start error:', error)
      
      // If already started, just update UI
      if (error.message?.includes('already started')) {
        console.log('ℹ️ Already running, updating UI')
        setIsRecording(true)
        setIsPaused(false)
      } else {
        alert(`Failed: ${error.message}`)
      }
    }
  }

  const handlePauseRecording = () => {
    console.log('⏸️ Pausing')
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        setIsPaused(true)
      } catch (e) {
        console.log('Pause error:', e)
      }
    }
  }

  const handleResumeRecording = () => {
    console.log('▶️ Resuming')
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsPaused(false)
      } catch (error) {
        if (error.message?.includes('already started')) {
          setIsPaused(false)
        }
      }
    }
  }

  const handleStopRecording = () => {
    console.log('🛑 Stopping')
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.log('Stop error:', e)
      }
    }
    
    setIsRecording(false)
    setIsPaused(false)
    
    if (transcript.trim()) {
      console.log('✅ Saving transcript')
      onTranscript(transcript)
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      console.log('⚠️ No transcript')
      onClose()
    }
  }

  const handleClearTranscript = () => {
    setTranscript('')
    setRecordingTime(0)
  }

  const handleCancel = () => {
    console.log('❌ Canceling')
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
    setTranscript('')
    onClose()
  }

  if (!isSupported) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LuMic className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">Voice Recording</h3>
                <p className="text-purple-100 text-sm">Speak naturally, we'll transcribe</p>
              </div>
            </div>
            <button onClick={handleCancel} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <LuX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!isMicrophoneAvailable && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
              <LuAlertCircle className="w-5 h-5" />
              <span className="text-sm">Microphone not available. Please check permissions.</span>
            </div>
          )}

          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-6">
              <motion.div
                animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isListening ? Infinity : 0, ease: "easeInOut" }}
                className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  isListening ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                  : isRecording && isPaused ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-br from-purple-500 to-blue-500'
                } shadow-xl`}
              >
                {isListening ? <LuMic className="w-16 h-16 text-white" /> : <LuMicOff className="w-16 h-16 text-white" />}
              </motion.div>
              {isListening && (
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-red-400"
                />
              )}
            </div>

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

            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  disabled={!isMicrophoneAvailable || !recognitionRef.current}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LuMic className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <>
                  {!isPaused ? (
                    <button onClick={handlePauseRecording} className="flex items-center space-x-2 bg-yellow-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-yellow-600 transition-all shadow-lg">
                      <LuMicOff className="w-5 h-5" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button onClick={handleResumeRecording} className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-all shadow-lg">
                      <LuMic className="w-5 h-5" />
                      <span>Resume</span>
                    </button>
                  )}
                  <button onClick={handleStopRecording} className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-all shadow-lg">
                    <LuStopCircle className="w-5 h-5" />
                    <span>Stop & Save</span>
                  </button>
                  {transcript && (
                    <button onClick={handleClearTranscript} className="p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors" title="Clear transcript">
                      <LuX className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

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

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-white/95 flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
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