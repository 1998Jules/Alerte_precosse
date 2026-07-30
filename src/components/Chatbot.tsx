'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Bot,
  User,
  Leaf,
  CloudSun,
  Bell,
  MapPin,
  Trash2,
  Sparkles,
  MessageSquare,
  X,
  ChevronUp,
} from 'lucide-react'

// ============================================================
// Types
// ============================================================

interface AlertData {
  id: string
  title: string
  description: string
  type: string
  level: string
  status: string
  location?: string
  time?: string
}

interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  forecast: string
  lastUpdate: string
  windSpeed: number
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  category?: string
  liveData?: boolean
  intent?: string
}

interface QuickQuestion {
  id: string
  text: string
  icon: React.ReactNode
  category: string
}

// ============================================================
// Données constantes
// ============================================================

const quickQuestions: QuickQuestion[] = [
  { id: 'q1', text: 'Météo actuelle', icon: <CloudSun className="w-4 h-4" />, category: 'meteo' },
  { id: 'q2', text: 'Prévisions météo 5 jours', icon: <CloudSun className="w-4 h-4" />, category: 'meteo' },
  { id: 'q3', text: 'Cultures en cours', icon: <Leaf className="w-4 h-4" />, category: 'agriculture' },
  { id: 'q4', text: 'Alertes actives', icon: <Bell className="w-4 h-4" />, category: 'alerte' },
  { id: 'q5', text: 'Prix du marché', icon: <MapPin className="w-4 h-4" />, category: 'commune' },
  { id: 'q6', text: 'NDVI champ de M. ATOKOU', icon: <Sparkles className="w-4 h-4" />, category: 'agriculture' },
  { id: 'q7', text: 'Statistiques commune', icon: <MapPin className="w-4 h-4" />, category: 'commune' },
]

const categoryColors: Record<string, string> = {
  agriculture: 'bg-green-100 text-green-800',
  meteo: 'bg-blue-100 text-blue-800',
  alerte: 'bg-red-100 text-red-800',
  commune: 'bg-purple-100 text-purple-800',
  general: 'bg-gray-100 text-gray-800',
}

const categoryLabels: Record<string, string> = {
  agriculture: '🌾 Agriculture',
  meteo: '🌤️ Météo',
  alerte: '🚨 Alerte',
  commune: '🏘️ Commune',
  general: 'ℹ️ Général',
}

function formatMarkdown(text: string): string {
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')
  return formatted
}

// ============================================================
// Composant Chatbot
// ============================================================

interface ChatbotProps {
  alerts?: AlertData[]
  weatherData?: WeatherData
}

export default function Chatbot({ alerts = [], weatherData }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Bonjour ! Je suis **AgriBot**, votre assistant IA pour le système **SysLAP - Alerte Précoce** au Togo 🇹🇬<br /><br />Je peux vous aider sur :<br />🌾 **Agriculture** : cultures, parcelles, saisons, rendements<br />🌤️ **Météo** : conditions actuelles et prévisions<br />🚨 **Alertes** : sécheresse, inondation, prix du marché<br />🏘️ **Commune** : infrastructures, population, projets<br /><br />Posez-moi une question ou cliquez sur une suggestion ci-dessous !`,
      sender: 'bot',
      timestamp: new Date(),
      category: 'general',
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session-${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen, scrollToBottom])

  // Focus input quand le chatbot s'ouvre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
          category: data.category || 'general',
          liveData: data.hasLiveData || false,
          intent: data.intent || undefined,
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          text: `❌ Erreur : ${data.error || 'Impossible de traiter votre demande.'}`,
          sender: 'bot',
          timestamp: new Date(),
          category: 'general',
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: '❌ Erreur de connexion. Vérifiez votre connexion et réessayez.',
        sender: 'bot',
        timestamp: new Date(),
        category: 'general',
      }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, sessionId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputText)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputText)
    }
  }

  const clearConversation = async () => {
    try {
      await fetch(`/api/chatbot?sessionId=${sessionId}`, { method: 'DELETE' })
      setMessages([{
        id: 'welcome-reset',
        text: '🔄 Conversation réinitialisée. Comment puis-je vous aider ?',
        sender: 'bot',
        timestamp: new Date(),
        category: 'general',
      }])
    } catch { /* silencieux */ }
  }

  const handleQuickQuestion = (q: QuickQuestion) => {
    sendMessage(q.text)
  }

  // Compteur d'alertes actives pour le badge
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length

  return (
    <>
      {/* ============ BOUTON FLOTTANT ============ */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/30 hover:shadow-2xl hover:shadow-green-600/40 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          title="Ouvrir AgriBot"
        >
          <MessageSquare className="w-6 h-6 group-hover:hidden" />
          <Bot className="w-6 h-6 hidden group-hover:block" />
          {/* Badge alertes */}
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {activeAlertsCount}
            </span>
          )}
        </button>
      )}

      {/* ============ FENÊTRE DE CHAT ============ */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">

          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">AgriBot IA</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-[10px] text-green-100">En ligne — SysLAP</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearConversation}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Nouvelle conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Zone météo rapide */}
          {weatherData && weatherData.temperature > 0 && (
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100 px-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-blue-700 font-medium">
                    🌡️ {weatherData.temperature}°C
                  </span>
                  <span className="text-blue-600">
                    💧 {weatherData.humidity}%
                  </span>
                  {weatherData.windSpeed > 0 && (
                    <span className="text-blue-500">
                      💨 {weatherData.windSpeed} km/h
                    </span>
                  )}
                </div>
                <span className="text-blue-400 text-[10px] truncate max-w-[120px]">
                  {weatherData.forecast}
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-2.5 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                  message.sender === 'bot'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}>
                  {message.sender === 'bot'
                    ? <Bot className="w-3.5 h-3.5 text-white" />
                    : <User className="w-3.5 h-3.5 text-white" />
                  }
                </div>

                {/* Message */}
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                    message.sender === 'bot'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-green-600 text-white'
                  }`}
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(message.text) }}
                  />
                  <div className={`flex items-center gap-1.5 mt-1 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[9px] text-gray-400">
                      {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === 'bot' && message.category && (
                      <div className="flex items-center gap-1">
                        {message.liveData && (
                          <span className="text-[9px] px-1 py-0 h-3.5 bg-green-100 text-green-700 rounded font-medium flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                            Live
                          </span>
                        )}
                        <span className={`text-[9px] px-1 py-0 h-3.5 rounded font-medium ${categoryColors[message.category] || ''}`}>
                          {categoryLabels[message.category] || message.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          {messages.length <= 2 && (
            <div className="flex-shrink-0 border-t border-gray-100 px-3 py-2">
              <div className="flex flex-wrap gap-1">
                {quickQuestions.map(q => (
                  <button
                    key={q.id}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-green-50 hover:text-green-700 text-gray-600 transition-colors flex items-center gap-1.5"
                  >
                    {q.icon}
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-gray-200 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/40 transition-all min-h-[38px] max-h-[80px]"
                rows={1}
                style={{ height: 'auto' }}
                onInput={e => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 80) + 'px'
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-[38px] h-[38px] rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                {isLoading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
