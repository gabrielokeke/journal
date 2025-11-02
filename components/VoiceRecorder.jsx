"use client"
import { useState, useEffect } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { LuMic, LuMicOff, LuStopCircle, LuX, LuCheck, LuAlertCircle } from 'react-icons/lu'
import { motion, AnimatePresence } from 'framer-motion'

export default function VoiceRecorder({ onTranscript, onClose }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition()

  useEffect(() => {
    let interval
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  // Check browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        >
          <LuAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Browser Not Supported</h3>
          <p className="text-gray-600 mb-6">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = async () => {
    try {
      await SpeechRecognition.startListening({ 
        continuous: true,
        language: 'en-US'
      })
      setIsRecording(true)
      setIsPaused(false)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to start recording. Please check microphone permissions.')
    }
  }

  const handlePauseRecording = () => {
    SpeechRecognition.stopListening()
    setIsPaused(true)
  }

  const handleResumeRecording = async () => {
    await SpeechRecognition.startListening({ 
      continuous: true,
      language: 'en-US'
    })
    setIsPaused(false)
  }

  const handleStopRecording = () => {
    SpeechRecognition.stopListening()
    setIsRecording(false)
    setIsPaused(false)
    
    if (transcript.trim()) {
      onTranscript(transcript)
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      onClose()
    }
  }

  const handleClearTranscript = () => {
    resetTranscript()
    setRecordingTime(0)
  }

  const handleCancel = () => {
    SpeechRecognition.stopListening()
    resetTranscript()
    onClose()
  }

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
                  scale: listening ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: listening ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  listening 
                    ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                    : isRecording && isPaused
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                } shadow-xl`}
              >
                {listening ? (
                  <LuMic className="w-16 h-16 text-white" />
                ) : (
                  <LuMicOff className="w-16 h-16 text-white" />
                )}
              </motion.div>

              {/* Pulse Animation */}
              {listening && (
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
                {listening ? '🎙️ Listening...' : isPaused ? '⏸️ Paused' : '🎤 Ready to Record'}
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
                  disabled={!isMicrophoneAvailable}
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