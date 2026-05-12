'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseSpeechRecognitionProps {
  language?: string
  onResult?: (text: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export const useSpeechRecognition = ({
  language = 'fr-FR',
  onResult,
  onError
}: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false // False pour détecter la fin de phrase clairement
      recognitionInstance.interimResults = true
      recognitionInstance.lang = language

      recognitionInstance.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText
          } else {
            interimTranscript += transcriptText
          }
        }

        const fullTranscript = finalTranscript || interimTranscript
        setTranscript(fullTranscript)
        
        if (onResult) {
           onResult(fullTranscript, !!finalTranscript)
        }
      }

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setError(event.error)
        setIsListening(false)
        if (onError) {
          onError(event.error)
        }
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)

      return () => {
        if (recognitionInstance) {
          recognitionInstance.stop()
        }
      }
    } else {
      setError('La reconnaissance vocale n\'est pas supportée par votre navigateur')
    }
  }, [language, onResult, onError])

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('') // Reset transcript au démarrage
      recognition.start()
    }
  }, [recognition, isListening])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition, isListening])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const clearTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    isSupported: typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }
}