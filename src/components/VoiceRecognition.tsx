'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface VoiceRecognitionProps {
  onVoiceInput: (text: string, isFinal: boolean) => void
  textToSpeak?: string | null
  language: string // Peut venir du contexte, mais nous forcerons le Français pour la voix
  isConversationMode?: boolean
}

export default function VoiceRecognition({ 
  onVoiceInput, 
  textToSpeak,
  language, 
  isConversationMode = false 
}: VoiceRecognitionProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  // 1. RECONNAISSANCE VOCALE (STT)
  // On garde le hook pour écouter l'utilisateur
  const {
    isListening,
    transcript,
    toggleListening,
    isSupported
  } = useSpeechRecognition({
    language: 'fr-FR', // On force l'écoute en Français
    onResult: (text, isFinal) => {
      onVoiceInput(text, isFinal)
    }
  })

  // 2. SYNTHÈSE VOCALE (TTS) - Version FRANÇAIS ROBUSTE
  useEffect(() => {
    if (!textToSpeak) return

    // Arrêter toute parole en cours avant de commencer la nouvelle
    window.speechSynthesis.cancel()

    // Création de l'objet de parole
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    
    // FORCER la langue en Français pour garantir que ça fonctionne
    utterance.lang = 'fr-FR'
    utterance.rate = 1.0   // Vitesse normale
    utterance.pitch = 1.0   // Ton normal

    // Sélectionner une voix française si disponible
    const voices = window.speechSynthesis.getVoices()
    
    // On cherche une voix commençant par 'fr' (ex: 'fr-FR', 'fr-CA')
    // Préférence pour une voix spécifique si trouvée, sinon la première française
    const selectedVoice = voices.find(voice => voice.lang.includes('fr-FR')) || voices.find(voice => voice.lang.includes('fr'))
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    // Gestion des événements
    utterance.onstart = () => {
      setIsSpeaking(true)
    }
    
    utterance.onend = () => {
      setIsSpeaking(false)
    }
    
    utterance.onerror = (e) => {
      console.error('Erreur lors de la synthèse vocale:', e)
      setIsSpeaking(false)
    }

    // Lancer la parole
    window.speechSynthesis.speak(utterance)

  }, [textToSpeak])

  // 3. CHARGEMENT DES VOICES AU MONTAGE
  // Certains navigateurs chargent les voix de manière asynchrone
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  // Si le navigateur ne supporte pas la reconnaissance vocale
  if (!isSupported) return null

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      {/* Indicateur d'état (Écoute ou Parole) */}
      <div className="flex items-center gap-2">
        {(isListening || isSpeaking) && (
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSpeaking ? 'bg-green-400' : 'bg-blue-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isSpeaking ? 'bg-green-500' : 'bg-blue-500'}`}></span>
          </span>
        )}
        
        <span className="text-xs font-medium text-gray-600">
          {isSpeaking && <span className="text-green-600">Assistant parle...</span>}
          {isListening && !isSpeaking && <span className="text-blue-600">Vous parlez...</span>}
          {!isListening && !isSpeaking && <span>Mode: Français</span>}
        </span>
      </div>

      {/* Bouton Microphone */}
      <button
        onClick={toggleListening}
        disabled={isSpeaking} // Désactivé pendant que le bot parle pour éviter l'écho
        className={`p-2 rounded-full transition-all duration-200 ${
          isListening 
            ? 'bg-red-100 text-red-600 hover:bg-red-200 scale-105' 
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? "Arrêter l'écoute" : "Parler en Français"}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    </div>
  )
}