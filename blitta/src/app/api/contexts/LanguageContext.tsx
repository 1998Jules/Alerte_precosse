'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'fr' | 'kab' | 'ewe'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('fr')

  // Charger la langue depuis localStorage au démarrage
  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage') as Language
    if (savedLang && ['fr', 'kab', 'ewe'].includes(savedLang)) {
      setLanguage(savedLang)
    }
  }, [])

  // Sauvegarder la langue dans localStorage
  useEffect(() => {
    localStorage.setItem('selectedLanguage', language)
  }, [language])

  // Traductions simplifiées pour commencer
  const t = (key: string, params?: Record<string, string>): string => {
    const translations = {
      fr: {
        'dashboard.title': 'Tableau de bord',
        'dashboard.subtitle': 'Plateforme de gestion communale',
        'menu.dashboard': 'Tableau de bord',
        'menu.alerts': 'Alertes',
        'menu.geoportal': 'Géoportail',
        'menu.infrastructures': 'Infrastructures',
        'menu.agriculture': 'Agriculture',
        'menu.water': 'Eau',
        'menu.sports': 'Sports & Loisirs',
        'menu.admin': 'Administration',
        'menu.adminPanel': 'Panneau Admin',
        'alert.active': 'Alertes actives',
        'alert.report': 'Signaler une alerte',
        'alert.critical': 'Critique',
        'alert.high': 'Élevé',
        'alert.medium': 'Moyen',
        'alert.low': 'Faible',
        'alert.flood': 'Inondation',
        'alert.fire': 'Incendie',
        'alert.drought': 'Sécheresse',
        'alert.price': 'Prix du marché',
        'search.placeholder': 'Rechercher...',
        'chatbot.title': 'Assistant',
        'chatbot.welcome': 'Bonjour! Je suis votre assistant d\'alerte. Comment puis-je vous aider?',
        'language.fr': 'Français',
        'language.kab': 'Kabye',
        'language.ewe': 'Ewe',
        'population': 'Population',
        'projects.active': 'Projets actifs',
        'infrastructures': 'Infrastructures',
        'market.prices': 'Prix du marché',
        'button.search': 'Rechercher',
        'button.filter': 'Filtrer',
        'no.results': 'Aucun résultat trouvé'
      },
      kab: {
        'dashboard.title': 'Tɔm nɛ ɖeɖe',
        'dashboard.subtitle': 'Sɔɔlɔtɔɔ ɖe taa nɛ',
        'menu.dashboard': 'Tɔm nɛ ɖeɖe',
        'menu.alerts': 'Sɔɔlɔtɔɔ',
        'menu.geoportal': 'Tɛɛtɛ nɛ',
        'menu.infrastructures': 'Ɖeɖe nɛ',
        'menu.agriculture': 'Ɖeɖe nɛ ɖe tɔɔ',
        'menu.water': 'Tsi',
        'menu.sports': 'Ɖeɖe nɛ ɖe tɔɔ ɖe tɔɔ',
        'alert.active': 'Sɔɔlɔtɔɔ ɖe taa',
        'alert.report': 'Ɖeɖee nɛ ɖe sɔɔlɔtɔɔ',
        'search.placeholder': 'Ɖeɖee nɛ...',
        'chatbot.title': 'Wɔlɔɔ',
        'chatbot.welcome': 'M̀ ba tɔɔ! Ḿ nɛ wɔlɔɔ ɖe sɔɔlɔtɔɔ nɛ. M̀ ba taa nɛ ɖoɖo?'
      },
      ewe: {
        'dashboard.title': 'Dɔwɔƒe ƒe Agbalẽ',
        'dashboard.subtitle': 'Dukɔa ƒe Dɔwɔƒe ƒe Dɔwɔƒe',
        'menu.dashboard': 'Dɔwɔƒe ƒe Agbalẽ',
        'menu.alerts': 'Agbagbaɖoɖo',
        'menu.geoportal': 'Anyigba ƒe Agbalẽ',
        'menu.infrastructures': 'Dɔwɔƒewo',
        'menu.agriculture': 'Agbledede',
        'menu.water': 'Tsi',
        'menu.sports': 'Dɔwɔƒe kple Dzidzɔkpɔkpɔ',
        'alert.active': 'Agbagbaɖoɖo siwo le dɔwɔwɔ',
        'alert.report': 'Ɖe agbagbaɖoɖo ɖe edzi',
        'search.placeholder': 'Dii eme...',
        'chatbot.title': 'Kpekpeɖeŋula',
        'chatbot.welcome': 'Woé zɔ! Nyè nye wò agbagbaɖoɖo ƒe kpekpeɖeŋula. Aleke mate ŋu akpe ɖe wò ŋu?'
      }
    }

    let translation = translations[language][key] || translations.fr[key] || key
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value)
      })
    }
    
    return translation
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}