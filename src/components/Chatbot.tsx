'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { MessageSquare, Send, X, Bot, Mic, MicOff, CloudRain, Droplets, Wind, Thermometer, Sun } from 'lucide-react'
import VoiceRecognition from './VoiceRecognition'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  forecast: string
  windSpeed?: number
  lastUpdate: string
}

interface ChatbotProps {
  alerts?: any[]
  weatherData?: WeatherData
  weatherForecast?: any[]
}

export default function Chatbot({ alerts = [], weatherData, weatherForecast }: ChatbotProps) {
  const { t, speechLanguage } = useLanguage()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chatbot.welcome') || "Bonjour ! Je suis votre assistant agricole. Je peux vous donner la météo actuelle ou les alertes en cours.",
      sender: 'bot',
      timestamp: new Date(),
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showVoicePanel, setShowVoicePanel] = useState(true)
  const [isConversationMode, setIsConversationMode] = useState(false)
  const [textToSpeak, setTextToSpeak] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Utilisation d'une ref pour accéder aux données météo les plus récentes
  // même si le state du composant ne déclenche pas un re-render immédiat
  const weatherDataRef = useRef<WeatherData | undefined>(weatherData)

  // Mise à jour de la ref dès que weatherData change (venant du parent)
  useEffect(() => {
    weatherDataRef.current = weatherData
  }, [weatherData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Synthèse vocale si le mode conversation est actif
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.sender === 'bot' && isConversationMode) {
      setTimeout(() => {
        setTextToSpeak(lastMessage.text)
      }, 500)
    }
  }, [messages, isConversationMode])

  const getBotResponse = async (userMessage: string): Promise<string> => {
    setIsTyping(true)
    // Simulation d'un délai de réflexion
    await new Promise(resolve => setTimeout(resolve, 800))

    const msg = userMessage.toLowerCase()
    const currentWeather = weatherDataRef.current

    // --- LOGIQUE MÉTÉO ---
    const weatherKeywords = ['température', 'météo', 'il fait', 'dehors', 'pleut', 'vent', 'prévision', 'aujourd\'hui', 'temps', 'chaud', 'froid', 'humidité', 'pluie']
    
    if (weatherKeywords.some(keyword => msg.includes(keyword))) {
      
      // Si les données météo ne sont pas encore chargées
      if (!currentWeather) {
        return "Je n'ai pas encore reçu les données météo du système. Veuillez patienter que le capteur se synchronise."
      }

      // Réponses spécifiques
      if (msg.includes('température') || msg.includes('il fait') || msg.includes('chaud') || msg.includes('froid')) {
        return `🌡️ Actuellement, il fait **${currentWeather.temperature}°C**.`
      }
      
      if (msg.includes('vent')) {
        return `💨 Le vent souffle à environ **${currentWeather.windSpeed || 0} km/h**.`
      }

      if (msg.includes('pluie') || msg.includes('humidité')) {
        return `💧 Taux d'humidité : **${currentWeather.humidity}%**.\nPrécipitations récentes : **${currentWeather.rainfall}mm**.\n${currentWeather.forecast}`
      }

      // Réponse globale météo
      let response = `🌤️ **Météo Actuelle** :\n`
      response += `• Température : ${currentWeather.temperature}°C\n`
      response += `• Humidité : ${currentWeather.humidity}%\n`
      if (currentWeather.windSpeed) response += `• Vent : ${currentWeather.windSpeed} km/h\n`
      if (currentWeather.rainfall > 0) response += `• Pluie : ${currentWeather.rainfall}mm\n`
      response += `\n📝 Prévision : ${currentWeather.forecast}`
      return response
    }

    // --- LOGIQUE ALERTES ---
    const stopWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'pour', 'avec', 'dans', 'sur', 'a', 'est', 'sont', 'il', 'y', 'quoi', 'comment', 'où', 'qui']
    const keywords = msg.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word))

    if (keywords.length === 0) {
      return "Pourriez-vous reformuler avec des mots clés précis ? (ex: météo, alerte, inondation, température)"
    }

    // Recherche de la meilleure alerte correspondante
    let bestMatch = null
    let maxScore = 0

    alerts.forEach((alert: any) => {
      let typeText = alert.type
      if (alert.type === 'flood') typeText += ' inondation eau pluie'
      if (alert.type === 'drought') typeText += ' sécheresse chaleur canicule température'
      if (alert.type === 'price') typeText += ' marché prix argent coût'
      if (alert.type === 'fire') typeText += ' incendie feu brûler'

      const fullAlertText = `${alert.title} ${alert.description} ${typeText} ${alert.location || ''} ${alert.level}`.toLowerCase()

      let score = 0
      keywords.forEach(keyword => {
        if (fullAlertText.includes(keyword)) score++
      })

      if (score > maxScore) {
        maxScore = score
        bestMatch = alert
      }
    })

    if (bestMatch && maxScore > 0) {
      return `⚠️ **Info Alerte** : ${bestMatch.title}\n\n${bestMatch.description}`
    }

    // Réponse générique
    if (keywords.some(k => ['tout', 'alerte', 'situation', 'danger'].includes(k))) {
      const count = alerts.length
      if (count === 0) return "Il n'y a actuellement aucune alerte enregistrée dans le système."
      return `Il y a ${count} alerte(s) au total. La météo est actuellement de ${currentWeather?.temperature}°C. Dites-moi un sujet (ex: 'météo', 'eau') pour en savoir plus.`
    }

    return "Je n'ai pas trouvé d'information précise correspondant à votre demande. Essayez de demander 'Quelle température' ou 'Quelles alertes'."
  }

  const handleSendMessage = async (textToSend?: string) => {
    const finalText = textToSend || inputText
    if (!finalText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: finalText,
      sender: 'user',
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setTextToSpeak(null)

    // Appel à la logique de réponse
    const botResponse = await getBotResponse(finalText)
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, botMessage])
    setIsTyping(false)
  }

  const handleVoiceInput = (text: string, isFinal: boolean) => {
    setInputText(text)
    if (isFinal && isConversationMode) {
      handleSendMessage(text)
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-all duration-300"
          aria-label="Ouvrir le chat"
        >
          {isConversationMode ? <Mic className="w-6 h-6 text-white animate-pulse" /> : <MessageSquare className="w-6 h-6 text-white" />}
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-5 h-5" />
              <div>
                <span className="font-bold">Assistant Agricole</span>
                <p className="text-[10px] opacity-80">Connecté à l'API Météo</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsConversationMode(!isConversationMode)}
                className={`p-2 rounded-full transition-colors ${isConversationMode ? 'bg-white text-green-700' : 'hover:bg-white/20'}`}
                title={isConversationMode ? "Désactiver le vocal" : "Mode Conversation"}
              >
                {isConversationMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice Panel */}
          {showVoicePanel && (
            <div className="p-3 border-b bg-gray-50">
              <VoiceRecognition
                onVoiceInput={handleVoiceInput}
                textToSpeak={textToSpeak}
                language={speechLanguage}
                isConversationMode={isConversationMode}
              />
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm whitespace-pre-line ${
                  message.sender === 'user' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  {/* Icône météo si le message contient des données météo */}
                  {message.text.includes('Météo') && message.sender === 'bot' && (
                    <div className="flex items-center space-x-1 mb-1 text-blue-600 font-bold">
                      <CloudRain className="w-4 h-4" />
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-gray-400 ml-2">
                <div className="animate-bounce">●</div>
                <div className="animate-bounce delay-100">●</div>
                <div className="animate-bounce delay-200">●</div>
                <span className="ml-1">Analyse des données...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white rounded-b-2xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ex: Quelle température ?"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                disabled={isConversationMode}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}