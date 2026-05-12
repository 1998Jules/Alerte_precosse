//src/COMPONENTS/LanguageSelector.tsx
'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { Globe, ChevronDown } from 'lucide-react'

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'kab', name: 'Kabye', flag: '🇹🇬' },
  { code: 'ewe', name: 'Ewe', flag: '🇬🇭' },
]

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find(lang => lang.code === language)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium">{currentLang?.flag}</span>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-1 border border-gray-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 ${
                  language === lang.code ? 'bg-green-50 text-green-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <div className="w-2 h-2 bg-green-600 rounded-full ml-auto" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
  
}
