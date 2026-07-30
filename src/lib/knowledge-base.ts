// Base de connaissances pour le chatbot Alerte Précoce - Agriculture au Togo
// Générée à partir du dépôt https://github.com/1998Jules/Alerte_precosse

export interface KnowledgeEntry {
  category: 'agriculture' | 'meteo' | 'alerte' | 'commune' | 'general';
  question: string;
  answer: string;
  keywords: string[];
}

export const knowledgeBase: KnowledgeEntry[] = [
  // === AGRICULTURE ===
  {
    category: 'agriculture',
    question: 'Quels types de cultures sont suivis dans le système ?',
    answer: `Le système Alerte Précoce suit plusieurs types de cultures agricoles dans la commune :

**Céréales** : Maïs, mil, sorgho - cultures de base pour la sécurité alimentaire.
**Tubercules** : Igname, manioc, taro - cultures de subsistance importantes.
**Légumes** : Tomates, piments, gombo - cultures maraîchères pour le marché local.
**Fruits** : Mangues, agrumes, papayes - cultures fruitières pour la nutrition et le commerce.
**Légumineuses** : Niébé, arachide, voandzou - importantes pour la fixation de l'azote et la nutrition.

Chaque culture est suivie avec : sa surface (en hectares), le nombre d'agriculteurs, la saison en cours, le rendement attendu, le statut (plantée, en croissance, récolte, préparation), l'état de santé (bon, attention, critique), et les défis/opportunités identifiés.`,
    keywords: ['culture', 'cultures', 'type', 'agricole', 'maïs', 'mil', 'sorgho', 'igname', 'manioc', 'céréale', 'tubercule', 'légume', 'fruit', 'légumineuse']
  },
  {
    category: 'agriculture',
    question: 'Quels sont les statuts de culture dans le système ?',
    answer: `Le système utilise 4 statuts pour suivre le cycle des cultures :

🌱 **PLANTED (Plantée)** : La culture vient d'être semée, les graines sont en germination.
📈 **GROWING (En croissance)** : La culture est en phase végétative, elle se développe normalement.
🌾 **HARVESTING (Récolte)** : La culture est arrivée à maturité, la récolte est en cours.
🔄 **PREPARING (Préparation)** : Le champ est en préparation pour la prochaine saison de culture.

L'état de santé est également suivi : **GOOD** (bon état), **WARNING** (attention - problèmes détectés), **CRITICAL** (critique - intervention urgente nécessaire).`,
    keywords: ['statut', 'status', 'plantée', 'croissance', 'récolte', 'préparation', 'planted', 'growing', 'harvesting', 'preparing', 'santé', 'health']
  },
  {
    category: 'agriculture',
    question: 'Comment fonctionne la gestion agricole dans le système ?',
    answer: `Le module de gestion agricole (AgricultureManagement) permet de :

1. **Suivi des parcelles** : Chaque culture est géolocalisée avec ses coordonnées GPS et sa géométrie GeoJSON, permettant de les visualiser sur la carte du géoportail.

2. **Données de production** : Surface cultivée (hectares), nombre d'agriculteurs impliqués, saison culturale, rendement attendu, état de santé, irrigation, fertilisation.

3. **Suivi de l'irrigation** : Indicateur booléen pour savoir si la parcelle est irriguée ou dépend uniquement de la pluie.

4. **Gestion des intrants** : Type de fertilisant utilisé, défis et opportunités identifiés pour chaque culture.

5. **Planification des actions** : Prochaine action planifiée pour chaque parcelle (traitement, récolte, etc.).

Le système permet également de créer, modifier et supprimer des cultures, avec un suivi en temps réel de leur état.`,
    keywords: ['gestion', 'agricole', 'parcelle', 'production', 'irrigation', 'fertilisant', 'planification', 'GPS', 'géolocalisation']
  },
  {
    category: 'agriculture',
    question: 'Quels défis agricoles sont courants au Togo ?',
    answer: `Les principaux défis agricoles identifiés dans la région du Togo incluent :

**Climatiques** : Irrégularité des pluies, sécheresses fréquentes, inondations pendant la saison des pluies, canicule.

**Phytosanitaires** : Ravageurs (chenilles, criquets), maladies fongiques (mildiou, brûlure), mauvaises herbes envahissantes.

**Structuraux** : Accès limité aux intrants (engrais, pesticides), manque d'équipements agricoles modernes, difficultés d'irrigation, problèmes de stockage après récolte.

**Économiques** : Fluctuation des prix du marché, accès au crédit limité, difficultés de commercialisation.

Le système d'alerte précoce vise à anticiper ces défis en surveillant les conditions météorologiques et l'état des cultures pour alerter les agriculteurs avant que les problèmes ne deviennent critiques.`,
    keywords: ['défi', 'challenge', 'sécheresse', 'inondation', 'ravageur', 'maladie', 'engrais', 'intrant', 'prix', 'crédit']
  },
  // === MÉTÉO ===
  {
    category: 'meteo',
    question: 'Comment fonctionne le service météo du système ?',
    answer: `Le service météo (WeatherService) du système Alerte Précoce fonctionne de la manière suivante :

📡 **Source de données** : OpenWeatherMap API avec coordonnées par défaut centrées sur le Togo (latitude 8.6, longitude 1.2).

🔄 **Mise à jour automatique** : Un cron job s'exécute **toutes les 30 minutes** pour récupérer les données météo en temps réel et les sauvegarder en base de données.

📊 **Données collectées** :
- **Température** : Mesurée en degrés Celsius, arrondie à l'unité.
- **Humidité** : Pourcentage d'humidité relative de l'air.
- **Pluviométrie** : Précipitations des dernières heures (mm).
- **Vitesse du vent** : Mesurée en km/h (convertie depuis m/s).
- **Pression atmosphérique** : En hPa.
- **Prévisions** : Description textuelle des conditions météo.
- **Icône météo** : Code météo pour l'affichage visuel.

💾 **Base de données** : Les données sont stockées via Prisma dans le modèle Weather, avec un fallback en base si l'API est indisponible.`,
    keywords: ['météo', 'température', 'humidité', 'pluie', 'vent', 'pression', 'prévision', 'openweather', 'api', 'cron', 'automatique']
  },
  {
    category: 'meteo',
    question: 'Quelles sont les données météo disponibles ?',
    answer: `Les données météo disponibles en temps réel dans le système sont :

🌡️ **Température** : Température actuelle en °C (ex: 32°C).
💧 **Humidité** : Taux d'humidité relative en % (ex: 75%).
🌧️ **Pluviométrie** : Quantité de pluie tombée en mm.
💨 **Vitesse du vent** : Vitesse du vent en km/h.
📊 **Pression** : Pression atmosphérique en hPa.
🌤️ **Prévisions** : Description des conditions (ex: "ciel dégagé", "averses légères").
🕐 **Dernière mise à jour** : Horodatage de la dernière synchronisation.

Ces données sont automatiquement mises à jour toutes les 30 minutes et sont accessibles via l'API /api/weather. En cas d'indisponibilité de l'API OpenWeatherMap, le système utilise les dernières données sauvegardées en base de données.`,
    keywords: ['données', 'météo', 'température', 'humidité', 'pluviométrie', 'vent', 'pression', 'prévision', 'réel', 'temps']
  },
  // === ALERTE PRÉCOCE ===
  {
    category: 'alerte',
    question: 'Quels types d\'alertes existe-t-il dans le système ?',
    answer: `Le système d'alerte précoce gère **6 types d'alertes** :

💰 **PRICE (Prix)** : Alertes liées à la fluctuation des prix des produits agricoles sur le marché local.

🏜️ **DROUGHT (Sécheresse)** : Alertes lorsque les conditions météorologiques indiquent un risque de sécheresse.

🌊 **FLOOD (Inondation)** : Alertes en cas de risque d'inondation dû aux fortes pluies.

🏗️ **INFRASTRUCTURE** : Alertes sur l'état des infrastructures communales (écoles, routes, hôpitaux).

🏥 **HEALTH (Santé)** : Alertes sanitaires pouvant affecter la communauté agricole.

🔒 **SECURITY (Sécurité)** : Alertes liées à la sécurité des personnes et des biens agricoles.

🌧️ **WEATHER (Météo)** : Alertes météorologiques spécifiques (tempêtes, vents violents, etc.).`,
    keywords: ['type', 'alerte', 'prix', 'sécheresse', 'inondation', 'infrastructure', 'santé', 'sécurité', 'météo', 'price', 'drought', 'flood']
  },
  {
    category: 'alerte',
    question: 'Quels sont les niveaux d\'alerte ?',
    answer: `Le système utilise **4 niveaux de sévérité** pour les alertes :

🟢 **LOW (Faible)** : Situation normale, information à titre indicatif. Pas d'action immédiate requise.

🟡 **MEDIUM (Moyen)** : Situation à surveiller. Les conditions pourraient se dégrader. Il est recommandé de se préparer.

🟠 **HIGH (Élevé)** : Situation préoccupante. Des actions préventives doivent être entreprises rapidement.

🔴 **CRITICAL (Critique)** : Situation d'urgence. Des mesures immédiates sont nécessaires pour protéger les personnes, les cultures et les biens.

Chaque alerte contient : un titre, une description détaillée, le niveau de sévérité, la localisation géographique (coordonnées GPS + zone GeoJSON), le statut (ACTIVE, RESOLVED, ARCHIVED), l'auteur de l'alerte, et la date de création.`,
    keywords: ['niveau', 'sévérité', 'faible', 'moyen', 'élevé', 'critique', 'low', 'medium', 'high', 'critical', 'urgence']
  },
  {
    category: 'alerte',
    question: 'Comment créer une alerte dans le système ?',
    answer: `Pour créer une alerte dans le système Alerte Précoce :

1. **Accéder au module Alertes** depuis le menu principal ou le tableau de bord.
2. **Cliquer sur "Créer une alerte"** pour ouvrir le formulaire de création.
3. **Remplir les champs obligatoires** :
   - **Type d'alerte** : Prix, Sécheresse, Inondation, Infrastructure, Santé, Sécurité, Météo.
   - **Titre** : Un titre court et descriptif pour l'alerte.
   - **Description** : Les détails et les recommandations associées.
   - **Niveau** : Faible, Moyen, Élevé ou Critique.
4. **Ajouter des informations optionnelles** :
   - **Localisation** : Le lieu concerné par l'alerte.
   - **Coordonnées GPS** : Pour la cartographie.
5. **Valider** : L'alerte est créée et visible sur le tableau de bord.

Les alertes sont automatiquement triées par date de création (les plus récentes en premier). Un maximum de 10 alertes est affiché sur le dashboard, mais toutes sont accessibles dans le module dédié.`,
    keywords: ['créer', 'alerte', 'nouvelle', 'formulaire', 'ajouter', 'enregistrer', 'module', 'titre', 'description']
  },
  // === COMMUNE ===
  {
    category: 'commune',
    question: 'Quelles informations communales sont disponibles ?',
    answer: `Le système Alerte Précoce fournit une vue complète de la commune avec :

📊 **Statistiques du tableau de bord** :
- Population : environ 12 450 habitants
- Ménages : environ 2 100
- Projets : 24 projets (16 actifs, 6 complétés)
- Infrastructures : 47 infrastructures (43 opérationnelles)
- Superficie : 276 km²
- Densité : 45 hab/km²

🗺️ **Géoportail** : Carte interactive avec couches thématiques montrant les zones administratives, les zones à risque, les zones agricoles, les ressources en eau, et les infrastructures.

🏫 **Infrastructures** : Éducation (écoles, collèges, lycées), Santé (hôpitaux, centres de santé), Eau (forages, bornes fontaines, châteaux d'eau), Routes, Sports, Administrations, Marchés, Énergie.

📋 **Prix du marché** : Suivi des prix des produits agricoles en FCFA avec tendances (+/-%), disponibilité et qualité.

The système inclut également une **cartothèque** pour publier et explorer des cartes thématiques de la commune.`,
    keywords: ['commune', 'population', 'ménage', 'projet', 'infrastructure', 'superficie', 'densité', 'géoportail', 'carte', 'marché', 'prix']
  },
  {
    category: 'commune',
    question: 'Quels types d\'infrastructures sont gérés ?',
    answer: `Le système gère **8 types d'infrastructures** communales :

🏫 **EDUCATION** : Jardins d'enfants, écoles primaires, collèges, lycées avec leur localisation, capacité, état et responsable.

🏥 **HEALTH (Santé)** : Hôpitaux, centres de santé, dispensaires avec informations sur les services disponibles.

💧 **WATER (Eau)** : Forages (PEA), bornes fontaines, châteaux d'eau - essentiels pour l'approvisionnement en eau potable.

🛣️ **ROAD (Routes)** : Routes communales avec leur type, classification et état.

🏟️ **SPORTS** : Installations sportives de la commune.

🏛️ **ADMIN (Administration)** : Bâtiments administratifs et services publics.

🏪 **MARKET (Marchés)** : Marchés locaux avec jours de marché et localisation.

⚡ **ENERGY (Énergie)** : Infrastructures énergétiques (électricité, éclairage public).

Chaque infrastructure a un statut : **OPÉRATIONNELLE**, **EN MAINTENANCE**, **HORS SERVICE**, ou **PLANIFIÉE**.`,
    keywords: ['infrastructure', 'école', 'hôpital', 'eau', 'route', 'sport', 'administration', 'marché', 'énergie', 'forage', 'santé']
  },
  {
    category: 'commune',
    question: 'Comment fonctionne le géoportail ?',
    answer: `Le géoportail (GeoPortal) est la carte interactive du système Alerte Précoce :

🗺️ **Fonctionnalités principales** :
- Carte interactive avec fond de carte personnalisable.
- Couches thématiques activables/désactivables : zones administratives, zones à risque, zones agricoles, ressources en eau, zones urbaines, zones naturelles.
- Géolocalisation de toutes les entités (cultures, infrastructures, alertes, marchés).
- Dessin et visualisation de zones géographiques complexes (GeoJSON).

📍 **Types de zones géographiques** :
- **ADMINISTRATIVE** : Limites administratives de la commune.
- **RISK_AREA** : Zones à risque (inondation, sécheresse, glissement de terrain).
- **AGRICULTURAL** : Zones de culture et terres agricoles.
- **WATER_RESOURCE** : Points d'eau et cours d'eau.
- **NATURAL** : Zones naturelles protégées.
- **URBAN** : Zones urbanisées.

Le géoportail permet de visualiser spatialement toutes les données du système pour une meilleure prise de décision.`,
    keywords: ['géoportail', 'carte', 'interactive', 'couches', 'thématique', 'géolocalisation', 'zone', 'risque', 'GeoJSON']
  },
  // === LANGUES ===
  {
    category: 'general',
    question: 'Quelles langues sont supportées ?',
    answer: `Le système Alerte Précoce supporte **3 langues** locales du Togo :

🇫🇷 **Français (fr)** : Langue officielle du Togo, utilisée par défaut dans le système.

🇹🇬 **Kabiyè (kab)** : Langue locale parlée dans la région centrale du Togo (région des Plateaux).

🇹🇬 **Ewe (ewe)** : Langue locale parlée dans le sud du Togo (région Maritime).

Le sélecteur de langue est accessible depuis l'interface et toutes les traductions sont gérées via le contexte de langue (LanguageContext). Le chatbot répond dans la langue sélectionnée par l'utilisateur.

La synthèse vocale (TTS) s'adapte également à la langue choisie pour les réponses vocales du chatbot.`,
    keywords: ['langue', 'français', 'kabiyè', 'ewe', 'traduction', 'multilingue', 'togolais']
  },
  {
    category: 'general',
    question: 'Qu\'est-ce que le système Alerte Précoce (SysLAP) ?',
    answer: `**SysLAP - Système Locale d'Alerte Précoce** est une application web complète pour la gestion communale au Togo, conçue pour :

🎯 **Objectif principal** : Anticiper les risques (sécheresse, inondation, épidémies) et informer rapidement les populations et les décideurs pour des actions préventives.

📱 **Fonctionnalités clés** :
- **Tableau de bord** : Vue d'ensemble des indicateurs communaux.
- **Alertes précoces** : Système d'alerte multi-niveaux avec géolocalisation.
- **Météo en temps réel** : Données météorologiques actualisées automatiquement.
- **Gestion agricole** : Suivi des cultures, des parcelles et de la production.
- **Géoportail** : Cartographie interactive des données territoriales.
- **Gestion des infrastructures** : Suivi de l'état des équipements communaux.
- **Prix du marché** : Suivi des prix des produits agricoles.
- **Chatbot IA** : Assistant intelligent pour répondre aux questions.
- **Cartothèque** : Publication et exploration de cartes thématiques.
- **Administration** : Panneau de gestion pour les administrateurs.

🗣️ **Multilingue** : Supporte le français, le Kabiyè et l'Ewe pour une accessibilité maximale.

🔧 **Technologie** : Next.js 16, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL avec PostGIS, OpenWeatherMap API.`,
    keywords: ['syslap', 'système', 'alerte', 'précoce', 'togolais', 'communal', 'application', 'plateforme', 'fonctionnalité']
  },
];

// Fonction pour rechercher dans la base de connaissances
export function searchKnowledge(query: string): KnowledgeEntry[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  return knowledgeBase
    .map(entry => {
      let score = 0;
      // Score basé sur les mots-clés
      for (const keyword of entry.keywords) {
        if (queryLower.includes(keyword)) {
          score += 3;
        }
        for (const word of queryWords) {
          if (keyword.includes(word)) {
            score += 2;
          }
        }
      }
      // Score basé sur la question
      if (entry.question.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      for (const word of queryWords) {
        if (entry.question.toLowerCase().includes(word)) {
          score += 1;
        }
        if (entry.answer.toLowerCase().includes(word)) {
          score += 1;
        }
      }
      return { entry, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.entry);
}

// Obtenir toutes les entrées par catégorie
export function getKnowledgeByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
  return knowledgeBase.filter(entry => entry.category === category);
}

// Obtenir un résumé de toutes les connaissances pour le prompt système
export function getSystemKnowledge(): string {
  const categories = {
    agriculture: knowledgeBase.filter(e => e.category === 'agriculture').map(e => `- ${e.question}: ${e.answer.substring(0, 200)}...`).join('\n'),
    meteo: knowledgeBase.filter(e => e.category === 'meteo').map(e => `- ${e.question}: ${e.answer.substring(0, 200)}...`).join('\n'),
    alerte: knowledgeBase.filter(e => e.category === 'alerte').map(e => `- ${e.question}: ${e.answer.substring(0, 200)}...`).join('\n'),
    commune: knowledgeBase.filter(e => e.category === 'commune').map(e => `- ${e.question}: ${e.answer.substring(0, 200)}...`).join('\n'),
    general: knowledgeBase.filter(e => e.category === 'general').map(e => `- ${e.question}: ${e.answer.substring(0, 200)}...`).join('\n'),
  };

  return `Base de connaissances du système SysLAP - Alerte Précoce (Togo) :

AGRICULTURE:
${categories.agriculture}

MÉTÉO:
${categories.meteo}

ALERTES PRÉCOCE:
${categories.alerte}

COMMUNE:
${categories.commune}

GÉNÉRAL:
${categories.general}`;
}
