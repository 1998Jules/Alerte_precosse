'use client'

import React, { createContext, useContext, useState } from 'react'

type Language = 'fr' | 'kab' | 'ewe'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  speechLanguage: string // Code technique pour l'API vocale
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Dictionnaire de traductions
const translations: Record<Language, Record<string, string>> = {
  fr: {
    'SysLAP': 'SysLAP',
    'menu.dashboard': 'Tableau de bord',
    'menu.alerts': 'Alertes',
    'menu.geoportal': 'Géoportail',
    'menu.infrastructures': 'Infrastructures',
    'menu.agriculture': 'Agriculture',
    'menu.water': 'Eau',
    'menu.sports': 'Sports',
    'menu.admin': 'Administration',
    'menu.adminPanel': 'Panneau Admin',
    'search.placeholder': 'Rechercher...',
    'dashboard.title': 'Vue d\'ensemble',
    'population': 'Population',
    'projects.active': 'Projets actifs',
    'alert.active': 'Alertes actives',
    'infrastructures': 'Infrastructures',
    'no.results': 'Aucun résultat',
    'market.prices': 'Prix du marché',
    'button.filter': 'Filtrer',
    'chatbot.welcome': 'Bonjour ! Comment puis-je vous aider ?',
    'footer.rights': 'Tous droits réservés.',
    'commune.name': 'Commune',
    'footer.services': 'Services',
    'footer.resources': 'Ressources',
    'footer.contact': 'Contact',
  },
  kab: {
        'dashboard.title': 'Cɔnaʊ nɛ lɔŋ kpaʊ taba ',
        'dashboard.subtitle': 'Sɔɔlɔtɔɔ ɖe taa nɛ',
        'menu.dashboard': 'Cɔnaʊ nɛ lɔŋ kpaʊ taba ',
        'menu.alerts': '	Kɩlaʋ',
        'menu.geoportal': 'Tɛtʊ mɛndɛŋ',
        'menu.infrastructures': 'Ɖeɖe nɛ',
        'menu.agriculture': 'Haɖaʋ tɔm',
        'menu.water': ' lɩm',
        'menu.sports': 'Alewa',
        'alert.active': 'Kpaagbaa lɔŋ kpaʊ ',
        'alert.report': 'Ɖeɖee nɛ ɖe sɔɔlɔtɔɔ',
        'search.placeholder': 'Ɖeɖee nɛ...',
        'chatbot.title': 'Wɔlɔɔ',
        'chatbot.welcome': 'M̀ ba tɔɔ! Ḿ nɛ wɔlɔɔ ɖe sɔɔlɔtɔɔ nɛ. M̀ ba taa nɛ ɖoɖo?'
      },
  ewe: {
    'SysLAP': 'SysLAP',
    'menu.dashboard': 'Ʋuƒoƒe',
    'menu.alerts': 'Amedzroɖoɖo',
    'menu.geoportal': 'Geoportal',
    'menu.infrastructures': 'Dɔwɔnuwo',
    'menu.agriculture': 'Nuŋɔŋlɔ',
    'menu.water': 'Ga',
    'menu.sports': 'Agbɔ̃yɔyi',
    'menu.admin': 'Dɔwɔƒe',
    'menu.adminPanel': 'Panel Admin',
    'search.placeholder': 'Wᴐe nɔnɔe...',
    'dashboard.title': 'Ʋuƒoƒe gblɔ',
    'population': 'ƒe ƒuƒoƒoƒe',
    'projects.active': 'Dɔwɔɖoewo le wɔdɔe',
    'alert.active': 'Amedzroɖoɖo siwo le wɔdɔe',
    'infrastructures': 'Dɔwɔnuwo',
    'no.results': 'Mede gbe o',
    'market.prices': 'Aƒeƒuɖeƒe',
    'button.filter': 'Ʋu ɖe eŋu',
    'chatbot.welcome': 'Akɔsi ! Medekuku wòe nàwo ?',
    'footer.rights': 'Ɖeƒe gblɔmɔkpɔkpɔ nye ŋutifafa.',
    'commune.name': 'Kɔmuni',
    'footer.services': 'Sɛrvisiwo',
    'footer.resources': 'Nɔnɔme',
    'footer.contact': 'Kɔntak',
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')

  // Mapping des codes langue application -> codes BCP 47 (Navigateur)
  const getSpeechLanguageCode = (lang: Language): string => {
    switch (lang) {
      case 'kab': return 'kbp-TG' // Kabiyè (Togo)
      case 'ewe': return 'ee-TG'  // Ewe (Togo)
      case 'fr': 
      default: return 'fr-FR'
    }
  }

  const value = {
    language,
    setLanguage,
    t: (key: string) => translations[language]?.[key] || key,
    speechLanguage: getSpeechLanguageCode(language)
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}