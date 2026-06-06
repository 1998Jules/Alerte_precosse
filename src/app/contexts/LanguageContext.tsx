'use client'

import React, { createContext, useContext, useState } from 'react'

type Language = 'fr' | 'kab' | 'ewe'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  speechLanguage: string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

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
    'dashboard.title': "Vue d'ensemble",
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

    // === CARTOTHÈQUE ===
    'menu.cartotheque': 'Cartothèque',
    'cartotheque.title': 'Cartothèque',
    'cartotheque.subtitle': 'Découvrez et explorez les cartes thématiques de la commune',
    'cartotheque.publish': 'Publier une carte',
    'cartotheque.search': 'Rechercher une carte...',
    'cartotheque.all': 'Tous',
    'cartotheque.published': 'cartes publiées',
    'cartotheque.domains': 'domaines',
    'cartotheque.maps.singular': 'carte publiée',
    'cartotheque.maps.plural': 'cartes publiées',
    'cartotheque.no.results': 'Aucune carte trouvée',
    'cartotheque.no.results.search': 'Aucun résultat pour cette recherche',
    'cartotheque.no.results.domain': "Aucune carte dans ce domaine",
    'cartotheque.empty': "La cartothèque est vide. Publiez votre première carte !",
    'cartotheque.empty.desc': "Publiez votre première carte thématique pour commencer !",
    'cartotheque.no.description': 'Aucune description',
    'cartotheque.loading': 'Chargement des cartes...',
    'cartotheque.loading.desc': 'Veuillez patienter pendant le chargement...',
    'cartotheque.error': 'Erreur de chargement',
    'cartotheque.view': 'Voir',
    'cartotheque.search.for': 'Recherche de',
    'cartotheque.type.dynamic': 'Dynamique',
    'cartotheque.type.external': 'URL externe',
    'cartotheque.type.file': 'Fichier',
    'cartotheque.type.empty': 'Sans données',
    'cartotheque.viewer.info': 'Informations',
    'cartotheque.viewer.layers': 'Couches',
    'cartotheque.viewer.description': 'Description',
    'cartotheque.viewer.author': 'Auteur',
    'cartotheque.viewer.source': 'Source',
    'cartotheque.viewer.keywords': 'Mots-clés',
    'cartotheque.viewer.associated_layers': 'Couches associées',
    'cartotheque.viewer.extent': 'Emprise',
    'cartotheque.viewer.no_layers': 'Aucune couche associée',
    'cartotheque.viewer.loading_geojson': 'Chargement des données géographiques...',

    // === CARTOTHÈQUE - DÉTAIL CARTE ===
    'cartotheque.detail.description': 'Description',
    'cartotheque.detail.layers': 'Couches associées',
    'cartotheque.detail.type': 'Type de carte',
    'cartotheque.detail.features': 'entités',
    'cartotheque.detail.basemap': 'Fond de carte',
    'cartotheque.loading.map': 'Chargement de la carte...',

    // === FORMULAIRE CARTE ===
    'cartotheque.form.title': 'Publier une carte',
    'cartotheque.form.titre': 'Titre de la carte',
    'cartotheque.form.titre.placeholder': 'Ex: Carte des établissements de santé',
    'cartotheque.form.description': 'Description',
    'cartotheque.form.description.placeholder': 'Décrivez le contenu et l\'objectif de cette carte...',
    'cartotheque.form.domain': 'Domaine',
    'cartotheque.form.domain.placeholder': 'Sélectionner un domaine',
    'cartotheque.form.status': 'Statut',
    'cartotheque.form.status.draft': 'Brouillon',
    'cartotheque.form.status.published': 'Publié',
    'cartotheque.form.author': 'Auteur',
    'cartotheque.form.author.placeholder': 'Nom de l\'auteur',
    'cartotheque.form.source': 'Source',
    'cartotheque.form.source.placeholder': 'Ex: INSED, DGSC',
    'cartotheque.form.keywords': 'Mots-clés',
    'cartotheque.form.keywords.placeholder': 'santé, hôpitaux, centres de santé',
    'cartotheque.form.thumbnail': 'Vignette (image)',
    'cartotheque.form.datasource': 'Source de données',
    'cartotheque.form.datasource.layers': 'Couches du géoportail',
    'cartotheque.form.datasource.url': 'URL GeoJSON',
    'cartotheque.form.datasource.file': 'Fichier GeoJSON',
    'cartotheque.form.mapconfig': 'Configuration de la carte',
    'cartotheque.form.basemap': 'Fond de carte',
    'cartotheque.form.submit': 'Enregistrer',
    'cartotheque.form.submitting': 'Enregistrement...',
    'cartotheque.form.save': 'Enregistrer',
    'cartotheque.form.saving': 'Enregistrement...',
    'cartotheque.form.cancel': 'Annuler',
    'cartotheque.form.success': 'Carte publiée avec succès !',
    'cartotheque.form.error': 'Erreur lors de la publication',
  },
  kab: {
    'dashboard.title': 'Cɔnaʊ nɛ lɔŋ kpaʊ taba',
    'dashboard.subtitle': 'Sɔɔlɔtɔɔ ɖe taa nɛ',
    'menu.dashboard': 'Cɔnaʊ nɛ lɔŋ kpaʊ taba',
    'menu.alerts': 'Kɩlaʋ',
    'menu.geoportal': 'Tɛtʊ mɛndɛŋ',
    'menu.infrastructures': 'Ɖeɖe nɛ',
    'menu.agriculture': 'Haɖaʋ tɔm',
    'menu.water': 'Lɩm',
    'menu.sports': 'Alewa',
    'alert.active': 'Kpaagbaa lɔŋ kpaʊ',
    'alert.report': 'Ɖeɖee nɛ ɖe sɔɔlɔtɔɔ',
    'search.placeholder': 'Ɖeɖee nɛ...',
    'chatbot.title': 'Wɔlɔɔ',
    'chatbot.welcome': 'M̀ ba tɔɔ! Ḿ nɛ wɔlɔɔ ɖe sɔɔlɔtɔɔ nɛ. M̀ ba taa nɛ ɖoɖo?',

    // === CARTOTHÈQUE ===
    'menu.cartotheque': 'Kaatɩ tɔm kɛdɛŋ',
    'cartotheque.title': 'Kaatɩ tɔm kɛdɛŋ',
    'cartotheque.subtitle': 'Ɖeɖee kaatɩ tɔm kɛdɛŋ nɛ kɩcɛyʊ taa',
    'cartotheque.publish': 'Kɩkɛ kaatɩ',
    'cartotheque.search': 'Ɖeɖee kaatɩ...',
    'cartotheque.all': 'Paa',
    'cartotheque.maps.singular': 'kaatɩ',
    'cartotheque.maps.plural': 'kaatɩ waa',
    'cartotheque.no.results': 'Kaatɩ ɖeɛ ɖoɖo',
    'cartotheque.empty': 'Kaatɩ tɔm kɛdɛŋ ko kɛkɛ. Kɩkɛ kaatɩ kɩdɛ!',
    'cartotheque.empty.desc': 'Kɩkɛ kaatɩ kɩdɛ nɛ ɖɩtaɩ!',
    'cartotheque.no.description': 'Ɖeɖee nɛ ɖoɖo',
    'cartotheque.loading': 'Kaatɩ nɛ ɖɩtaɩ...',
    'cartotheque.loading.desc': 'Lɛɣɩ nɛ kaatɩ ɖɩtaɩ...',
    'cartotheque.error': 'Kɩlaʋ ɖɩtaɩ',
    'cartotheque.view': 'Kpɔ',
    'cartotheque.search.for': 'Ɖeɖee',
    'cartotheque.type.dynamic': 'Tɩŋtɩŋ',
    'cartotheque.type.external': 'URL kɩdɛŋ',
    'cartotheque.type.file': 'Fasɩ',
    'cartotheque.type.empty': 'Ɖeɖee nɛ ɖoɖo',

    // === CARTOTHÈQUE - DÉTAIL CARTE ===
    'cartotheque.detail.description': 'Ɖeɖee nɛ',
    'cartotheque.detail.layers': 'Kpasɩ kɩɖɛŋ',
    'cartotheque.detail.type': 'Kaatɩ tɩŋtɩŋ kʊ',
    'cartotheque.detail.features': 'ɖeɖee nɛ',
    'cartotheque.detail.basemap': 'Kaatɩ tɩŋtɩŋ',
    'cartotheque.loading.map': 'Kaatɩ nɛ ɖɩtaɩ...',

    // === FORMULAIRE ===
    'cartotheque.form.title': 'Kɩkɛ kaatɩ',
    'cartotheque.form.titre': 'Kaatɩ yʊ',
    'cartotheque.form.titre.placeholder': 'Ɖeɖee: Kaatɩ nɛ sɔɔlɔtɔɔ yʊ',
    'cartotheque.form.description': 'Ɖeɖee nɛ',
    'cartotheque.form.description.placeholder': 'Ɖeɖee kaatɩ nɛ tɔm kɩdɛŋ...',
    'cartotheque.form.domain': 'Kɩcɛyʊ',
    'cartotheque.form.domain.placeholder': 'Kɩcɛyʊ ɖoɖo',
    'cartotheque.form.status': 'Tɩŋtɩŋ kʊ',
    'cartotheque.form.status.draft': 'Tɩŋtɩŋ kʊ kɛkɛ',
    'cartotheque.form.status.published': 'Kɩkɛ nɛ',
    'cartotheque.form.author': 'Kɩkɛʋ',
    'cartotheque.form.author.placeholder': 'Kɩkɛʋ yʊ',
    'cartotheque.form.source': 'Tɔm kɩdɛŋ',
    'cartotheque.form.source.placeholder': 'Ɖeɖee: INSED, DGSC',
    'cartotheque.form.keywords': 'Kɩlaʋ kpasɩ',
    'cartotheque.form.keywords.placeholder': 'sɔɔlɔtɔɔ, tɛtʊ, kpasɩ',
    'cartotheque.form.thumbnail': 'Kaatɩ nʊ',
    'cartotheque.form.datasource': 'Tɔm kɩdɛŋ kʊ',
    'cartotheque.form.datasource.layers': 'Tɛtʊ mɛndɛŋ kpasɩ',
    'cartotheque.form.datasource.url': 'URL GeoJSON',
    'cartotheque.form.datasource.file': 'Fasɩ GeoJSON',
    'cartotheque.form.mapconfig': 'Kaatɩ tɩŋtɩŋ tɔm',
    'cartotheque.form.basemap': 'Kaatɩ tɩŋtɩŋ',
    'cartotheque.form.submit': 'Kɩkɛ',
    'cartotheque.form.submitting': 'Kɩkɛ nɛ...',
    'cartotheque.form.save': 'Kɩkɛ',
    'cartotheque.form.saving': 'Kɩkɛ nɛ...',
    'cartotheque.form.cancel': 'Kpɩyɛ',
    'cartotheque.form.success': 'Kaatɩ kɩkɛ nɛ!',
    'cartotheque.form.error': 'Kɩlaʋ kɩkɛ',
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
    'population': 'Ƒe ƒuƒoƒoƒe',
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

    // === CARTOTHÈQUE ===
    'menu.cartotheque': 'Nunana ƒe Agbalẽ',
    'cartotheque.title': 'Nunana ƒe Agbalẽ',
    'cartotheque.subtitle': 'Kpɔ nunana ƒe agbalẽwo le dukɔa me',
    'cartotheque.publish': 'Fa nunana ɖe eme',
    'cartotheque.search': 'Dii nunana...',
    'cartotheque.all': 'Ema wo katɛ',
    'cartotheque.maps.singular': 'nunana',
    'cartotheque.maps.plural': 'nunana wo',
    'cartotheque.no.results': 'Nunana maɖe o',
    'cartotheque.empty': 'Nunana ƒe agbalẽ ko. Fa nunana gbãtɔ ɖe eme!',
    'cartotheque.empty.desc': 'Fa nunana gbãtɔ ɖe eme nàdze!',
    'cartotheque.no.description': 'Nufiaɖe o',
    'cartotheque.loading': 'Nunana wo le wɔm...',
    'cartotheque.loading.desc': 'Da aɖaba nunana wo le wɔm...',
    'cartotheque.error': 'Vodada le wɔm',
    'cartotheque.view': 'Kpɔ',
    'cartotheque.search.for': 'Dii',
    'cartotheque.type.dynamic': 'Wɔnɔnɔme',
    'cartotheque.type.external': 'URL esterne',
    'cartotheque.type.file': 'Fail',
    'cartotheque.type.empty': 'Nune o',

    // === CARTOTHÈQUE - DÉTAIL CARTE ===
    'cartotheque.detail.description': 'Nudzɔdzɔ',
    'cartotheque.detail.layers': 'Kpakpe siwo le eme',
    'cartotheque.detail.type': 'Nunana ƒe xexe',
    'cartotheque.detail.features': 'nudzɔdzɔwo',
    'cartotheque.detail.basemap': 'Nunana ƒe xexe',
    'cartotheque.loading.map': 'Nunana le wɔm...',

    // === FORMULAIRE ===
    'cartotheque.form.title': 'Fa nunana ɖe eme',
    'cartotheque.form.titre': 'Nunana ƒe agbalẽ',
    'cartotheque.form.titre.placeholder': 'Ɖeɖee: Nunana le sɔɔlɔtɔɔ me',
    'cartotheque.form.description': 'Nudzɔdzɔ',
    'cartotheque.form.description.placeholder': 'Ɖeɖee nunana ƒe nudzɔdzɔ...',
    'cartotheque.form.domain': 'Dome',
    'cartotheque.form.domain.placeholder': 'Dome tia',
    'cartotheque.form.status': 'Tae',
    'cartotheque.form.status.draft': 'Wɔnɔnɔme',
    'cartotheque.form.status.published': 'Fa ɖe eme',
    'cartotheque.form.author': 'Wɔla',
    'cartotheque.form.author.placeholder': 'Wɔla ƒe agbalẽ',
    'cartotheque.form.source': 'Gɔme',
    'cartotheque.form.source.placeholder': 'Ɖeɖee: INSED, DGSC',
    'cartotheque.form.keywords': 'Nyawo',
    'cartotheque.form.keywords.placeholder': 'sɔɔlɔtɔɔ, dɔwɔnuwo, kpakpe',
    'cartotheque.form.thumbnail': 'Nunana nɔnɔme',
    'cartotheque.form.datasource': 'Gɔme ƒe xexe',
    'cartotheque.form.datasource.layers': 'Geoportal kpakpe',
    'cartotheque.form.datasource.url': 'URL GeoJSON',
    'cartotheque.form.datasource.file': 'Fail GeoJSON',
    'cartotheque.form.mapconfig': 'Nunana ƒe xexe',
    'cartotheque.form.basemap': 'Nunana ƒe xexe',
    'cartotheque.form.submit': 'Da ɖe eme',
    'cartotheque.form.submitting': 'Le da ɖem eme...',
    'cartotheque.form.save': 'Da ɖe eme',
    'cartotheque.form.saving': 'Le da ɖem eme...',
    'cartotheque.form.cancel': 'Kpɛ',
    'cartotheque.form.success': 'Nunana fa ɖe eme!',
    'cartotheque.form.error': 'Vodada le fa eme',
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')

  const getSpeechLanguageCode = (lang: Language): string => {
    switch (lang) {
      case 'kab': return 'kbp-TG'
      case 'ewe': return 'ee-TG'
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
