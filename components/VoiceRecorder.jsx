"use client"
import { useState, useRef, useEffect } from 'react'
import { FaMicrophone, FaMicrophoneSlash, FaCircle, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa'

export default function VoiceRecorder({ onTranscriptionComplete }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        // Convert blob to base64 for storage
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          const base64Audio = reader.result
          if (onTranscriptionComplete) {
            onTranscriptionComplete({
              audioData: base64Audio,
              duration: recordingTime,
              mimeType: 'audio/webm'
            })
          }
        }

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.')
      console.error('Recording error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      const stream = mediaRecorderRef.current.stream
      stream.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setAudioUrl(null)
    audioChunksRef.current = []
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setRecordingTime(0)
    setError('')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FaMicrophone className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-900">Voice Recording</span>
        </div>
        {isRecording && (
          <div className="flex items-center space-x-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
          <FaExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Recording ({formatTime(recordingTime)})
            </span>
            <button
              onClick={resetRecording}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </div>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}

      <div className="flex items-center space-x-2">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
          >
            <FaMicrophone className="w-4 h-4" />
            <span>Start Recording</span>
          </button>
        )}

        {isRecording && (
          <>
            <button
              onClick={pauseRecording}
              className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-all flex items-center justify-center space-x-2"
            >
              {isPaused ? (
                <>
                  <FaMicrophone className="w-4 h-4" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <FaMicrophoneSlash className="w-4 h-4" />
                  <span>Pause</span>
                </>
              )}
            </button>

            <button
              onClick={stopRecording}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center space-x-2"
            >
              <FaCheck className="w-4 h-4" />
              <span>Done</span>
            </button>

            <button
              onClick={cancelRecording}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {isRecording 
          ? 'Recording... Click Done when finished or Pause to take a break'
          : audioUrl 
          ? 'Listen to your recording and click Save Entry when ready'
          : 'Click Start Recording to add a voice note to your entry'
        }
      </p>
    </div>
  )
}