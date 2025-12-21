"use client"
import { useState, useRef, useEffect } from 'react'
import { FaMicrophone, FaMicrophoneSlash, FaStop, FaTimes, FaCheck, FaExclamationCircle, FaPlay } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function VoiceRecorder({ onTranscript, onClose }) {
  console.log('🎤 [VoiceRecorder] Component mounted')
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission()
    
    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
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

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('✅ [VoiceRecorder] Microphone access granted')
      setIsMicrophoneAvailable(true)
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('❌ [VoiceRecorder] Microphone access denied:', error)
      setIsMicrophoneAvailable(false)
      setErrorMessage(error.message)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    console.log('🎤 [VoiceRecorder] Starting recording...')
    
    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      console.log('✅ [VoiceRecorder] Audio stream obtained')

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4'
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log('📦 [VoiceRecorder] Audio chunk received:', event.data.size, 'bytes')
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log('🛑 [VoiceRecorder] Recording stopped')
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        console.log('✅ [VoiceRecorder] Audio blob created:', audioBlob.size, 'bytes')
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)
      console.log('✅ [VoiceRecorder] Recording started')
      
    } catch (error) {
      console.error('❌ [VoiceRecorder] Error starting recording:', error)
      setErrorMessage(error.message)
      alert(`Failed to start recording: ${error.message}`)
    }
  }

  const pauseRecording = () => {
    console.log('⏸️ [VoiceRecorder] Pausing recording')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  const resumeRecording = () => {
    console.log('▶️ [VoiceRecorder] Resuming recording')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }

  const stopRecording = () => {
    console.log('🛑 [VoiceRecorder] Stopping recording')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const transcribeAudio = async () => {
    if (!audioUrl) return
    
    console.log('🔄 [VoiceRecorder] Starting transcription...')
    setIsTranscribing(true)
    
    try {
      // Create a blob from the audio URL
      const response = await fetch(audioUrl)
      const audioBlob = await response.blob()
      
      // For now, we'll use a placeholder transcription
      // In production, you'd send this to an API like OpenAI Whisper or Deepgram
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const transcription = `[Voice recording from ${new Date().toLocaleString()}]\n\nTranscription feature coming soon! Your audio has been recorded successfully (${formatTime(recordingTime)}).\n\nTo enable transcription, integrate with services like:\n- OpenAI Whisper API\n- Deepgram\n- Google Speech-to-Text\n\nFor now, you can use the recording directly.`
      
      console.log('✅ [VoiceRecorder] Transcription complete')
      onTranscript(transcription)
      setShowSuccess(true)
      
      setTimeout(() => {
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('❌ [VoiceRecorder] Transcription error:', error)
      alert('Failed to transcribe audio. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleSave = () => {
    if (audioUrl) {
      transcribeAudio()
    } else {
      alert('No recording to save')
    }
  }

  const handleCancel = () => {
    console.log('❌ [VoiceRecorder] Canceling')
    
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    // Revoke audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    
    onClose()
  }

  const handleRetry = () => {
    // Revoke old audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    
    setAudioUrl(null)
    setRecordingTime(0)
    audioChunksRef.current = []
  }

  if (!isMicrophoneAvailable) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        >
          <FaExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Microphone Access Required</h3>
          <p className="text-gray-600 mb-4">
            Please allow microphone access to use voice recording.
          </p>
          {errorMessage && (
            <p className="text-sm text-red-600 mb-4">Error: {errorMessage}</p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={checkMicrophonePermission}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
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
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaMicrophone className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">Voice Recording</h3>
                <p className="text-purple-100 text-sm">Record your thoughts with high-quality audio</p>
              </div>
            </div>
            <button onClick={handleCancel} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Recording Interface */}
          <div className="flex flex-col items-center mb-6">
            {/* Animated Microphone Icon */}
            <div className="relative mb-6">
              <motion.div
                animate={{ scale: isRecording && !isPaused ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isRecording && !isPaused ? Infinity : 0, ease: "easeInOut" }}
                className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  isRecording && !isPaused ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                  : isPaused ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                  : audioUrl ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                  : 'bg-gradient-to-br from-purple-500 to-blue-500'
                } shadow-xl`}
              >
                {isRecording && !isPaused ? (
                  <FaMicrophone className="w-16 h-16 text-white" />
                ) : isPaused ? (
                  <FaMicrophoneSlash className="w-16 h-16 text-white" />
                ) : audioUrl ? (
                  <FaCheck className="w-16 h-16 text-white" />
                ) : (
                  <FaMicrophone className="w-16 h-16 text-white" />
                )}
              </motion.div>
              {isRecording && !isPaused && (
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-red-400"
                />
              )}
            </div>

            {/* Status Text */}
            <div className="text-center mb-4">
              <h4 className="text-2xl font-bold text-gray-900 mb-1">
                {isRecording && !isPaused ? '🎙️ Recording...' 
                 : isPaused ? '⏸️ Paused' 
                 : audioUrl ? '✅ Recording Complete'
                 : '🎤 Ready to Record'}
              </h4>
              {(isRecording || audioUrl) && (
                <p className="text-gray-600">
                  Duration: <span className="font-mono font-bold text-purple-600">{formatTime(recordingTime)}</span>
                </p>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {!isRecording && !audioUrl && (
                <button
                  onClick={startRecording}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <FaMicrophone className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              )}

              {isRecording && (
                <>
                  {!isPaused ? (
                    <button 
                      onClick={pauseRecording}
                      className="flex items-center space-x-2 bg-yellow-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-yellow-600 transition-all shadow-lg"
                    >
                      <FaMicrophoneSlash className="w-5 h-5" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button 
                      onClick={resumeRecording}
                      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-all shadow-lg"
                    >
                      <FaMicrophone className="w-5 h-5" />
                      <span>Resume</span>
                    </button>
                  )}
                  <button 
                    onClick={stopRecording}
                    className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-all shadow-lg"
                  >
                    <FaStop className="w-5 h-5" />
                    <span>Stop</span>
                  </button>
                </>
              )}

              {audioUrl && !isRecording && (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={isTranscribing}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCheck className="w-5 h-5" />
                    <span>{isTranscribing ? 'Transcribing...' : 'Save Recording'}</span>
                  </button>
                  <button 
                    onClick={handleRetry}
                    disabled={isTranscribing}
                    className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-600 transition-all shadow-lg disabled:opacity-50"
                  >
                    <FaMicrophone className="w-5 h-5" />
                    <span>Record Again</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Audio Playback */}
          {audioUrl && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Preview Recording:</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <audio src={audioUrl} controls className="w-full" />
              </div>
            </div>
          )}

          {/* Tips */}
          {!isRecording && !audioUrl && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for best results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Minimize background noise</li>
                <li>• Hold your device close to your mouth (but not too close)</li>
                <li>• You can pause and resume anytime</li>
                <li>• Your recording will be transcribed automatically</li>
              </ul>
            </div>
          )}

          {/* Success Animation */}
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
                    <FaCheck className="w-24 h-24 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Voice Recording Saved!</h3>
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