'use client'

import { useState } from 'react'
import { TreePine, Droplets, Sun, TrendingUp, AlertTriangle, Calendar, MapPin, Users, Filter, Search, Plus, Edit, Eye, Download, Cloud, Thermometer } from 'lucide-react'

interface Crop {
  id: string
  name: string
  type: 'cereal' | 'tuber' | 'vegetable' | 'fruit' | 'legume'
  area: string
  areaHa: number
  farmers: number
  currentSeason: string
  expectedYield: string
  status: 'growing' | 'harvesting' | 'planted' | 'preparing'
  healthStatus: 'good' | 'warning' | 'critical'
  lastUpdate: string
  nextAction: string
  irrigation: boolean
  fertilizer: string
  challenges: string[]
  opportunities: string[]
  coordinates?: { lat: number; lng: number }
}

interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  forecast: string
  lastUpdate: string
}

export default function AgricultureManagement() {
  const [activeTab, setActiveTab] = useState('crops')
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: 'Maïs',
      type: 'cereal',
      area: 'Zone Nord',
      areaHa: 1200,
      farmers: 85,
      currentSeason: 'Saison des pluies 2024',
      expectedYield: '3.2 t/ha',
      status: 'growing',
      healthStatus: 'warning',
      lastUpdate: '2024-01-15',
      nextAction: 'Fertilisation - 15 jours',
      irrigation: true,
      fertilizer: 'NPK 15-15-15',
      challenges: ['Sécheresse modérée', 'Ravageurs (chenilles)'],
      opportunities: ['Prix élevé au marché', 'Demande forte'],
      coordinates: { lat: 8.88, lng: 0.79 }
    },
    {
      id: '2',
      name: 'Mil',
      type: 'cereal',
      area: 'Zone Est',
      areaHa: 800,
      farmers: 65,
      currentSeason: 'Saison des pluies 2024',
      expectedYield: '1.8 t/ha',
      status: 'growing',
      healthStatus: 'good',
      lastUpdate: '2024-01-14',
      nextAction: 'Désherbage - 10 jours',
      irrigation: false,
      fertilizer: 'Fumier organique',
      challenges: ['Faibles précipitations'],
      opportunities: ['Culture résistante', 'Marché local stable'],
      coordinates: { lat: 8.87, lng: 0.82 }
    },
    {
      id: '3',
      name: 'Igname',
      type: 'tuber',
      area: 'Zone Centre',
      areaHa: 600,
      farmers: 45,
      currentSeason: 'Saison sèche 2024',
      expectedYield: '15 t/ha',
      status: 'harvesting',
      healthStatus: 'good',
      lastUpdate: '2024-01-16',
      nextAction: 'Récolte - En cours',
      irrigation: true,
      fertilizer: 'Compost',
      challenges: ['Main d\'œuvre limitée'],
      opportunities: ['Prix excellent', 'Stockage possible'],
      coordinates: { lat: 8.86, lng: 0.78 }
    },
    {
      id: '4',
      name: 'Tomates',
      type: 'vegetable',
      area: 'Zone maraîchère Sud',
      areaHa: 50,
      farmers: 25,
      currentSeason: 'Toute l\'année',
      expectedYield: '25 t/ha',
      status: 'growing',
      healthStatus: 'critical',
      lastUpdate: '2024-01-15',
      nextAction: 'Traitement phyto - Urgent',
      irrigation: true,
      fertilizer: 'Engrais liquide',
      challenges: ['Maladies fongiques', 'Araignées rouges'],
      opportunities: ['Marché urbain proche', 'Rotation possible'],
      coordinates: { lat: 8.85, lng: 0.76 }
    },
    {
      id: '5',
      name: 'Niébé',
      type: 'legume',
      area: 'Zone Ouest',
      areaHa: 300,
      farmers: 35,
      currentSeason: 'Saison des pluies 2024',
      expectedYield: '0.8 t/ha',
      status: 'planted',
      healthStatus: 'good',
      lastUpdate: '2024-01-12',
      nextAction: 'Semis - Terminé',
      irrigation: false,
      fertilizer: 'Fixation azote naturelle',
      challenges: ['Prédateurs (insectes)'],
      opportunities: ['Enrichissement sol', 'Double culture'],
      coordinates: { lat: 8.89, lng: 0.75 }
    }
  ])

  const [weatherData] = useState<WeatherData>({
    temperature: 32,
    humidity: 65,
    rainfall: 45,
    forecast: 'Pluies modérées prévues dans 3-4 jours',
    lastUpdate: '2024-01-16 14:30'
  })

  const cropTypes = [
    { id: 'all', name: 'Toutes les cultures', icon: TreePine, color: 'gray' },
    { id: 'cereal', name: 'Céréales', icon: TreePine, color: 'yellow' },
    { id: 'tuber', name: 'Tubercules', icon: TreePine, color: 'orange' },
    { id: 'vegetable', name: 'Légumes', icon: TreePine, color: 'green' },
    { id: 'fruit', name: 'Fruits', icon: TreePine, color: 'red' },
    { id: 'legume', name: 'Légumineuses', icon: TreePine, color: 'purple' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing': return 'bg-green-100 text-green-800'
      case 'harvesting': return 'bg-yellow-100 text-yellow-800'
      case 'planted': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <TrendingUp className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      default: return <TreePine className="w-4 h-4" />
    }
  }

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'Bonne'
      case 'warning': return 'Attention'
      case 'critical': return 'Critique'
      default: return status
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'growing': return 'En croissance'
      case 'harvesting': return 'En récolte'
      case 'planted': return 'Planté'
      case 'preparing': return 'Préparation'
      default: return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cereal': return 'bg-yellow-100 text-yellow-800'
      case 'tuber': return 'bg-orange-100 text-orange-800'
      case 'vegetable': return 'bg-green-100 text-green-800'
      case 'fruit': return 'bg-red-100 text-red-800'
      case 'legume': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.area.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || crop.type === selectedType
    return matchesSearch && matchesType
  })

  const stats = {
    totalArea: crops.reduce((sum, crop) => sum + crop.areaHa, 0),
    totalFarmers: crops.reduce((sum, crop) => sum + crop.farmers, 0),
    goodHealth: crops.filter(crop => crop.healthStatus === 'good').length,
    warningHealth: crops.filter(crop => crop.healthStatus === 'warning').length,
    criticalHealth: crops.filter(crop => crop.healthStatus === 'critical').length,
    irrigated: crops.filter(crop => crop.irrigation).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion Agricole</h2>
          <p className="text-gray-600 mt-1">Suivi des cultures, méteo et recommandations agricoles</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Exporter
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4 inline mr-2" />
            Nouvelle culture
          </button>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Cloud className="w-5 h-5 mr-2" />
              Météo Agricole
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4" />
                <div>
                  <p className="text-sm opacity-90">Température</p>
                  <p className="text-xl font-bold">{weatherData.temperature}°C</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4" />
                <div>
                  <p className="text-sm opacity-90">Humidité</p>
                  <p className="text-xl font-bold">{weatherData.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4" />
                <div>
                  <p className="text-sm opacity-90">Pluviométrie</p>
                  <p className="text-xl font-bold">{weatherData.rainfall}mm</p>
                </div>
              </div>
              <div>
                <p className="text-sm opacity-90">Prévisions</p>
                <p className="text-sm font-medium">{weatherData.forecast}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Dernière mise à jour</p>
            <p className="text-sm">{weatherData.lastUpdate}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Surface totale</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalArea} ha</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TreePine className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agriculteurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFarmers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Santé bonne</p>
              <p className="text-2xl font-bold text-green-600">{stats.goodHealth}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec irrigation</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.irrigated}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Droplets className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'crops', label: 'Cultures' },
            { id: 'weather', label: 'Météo' },
            { id: 'recommendations', label: 'Recommandations' },
            { id: 'calendar', label: 'Calendrier' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Crops Tab */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une culture..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
                  />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {cropTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{filteredCrops.length} culture{filteredCrops.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Crops Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCrops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(crop.type)}`}>
                      <TreePine className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(crop.type)}`}>
                          {cropTypes.find(t => t.id === crop.type)?.name}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(crop.status)}`}>
                          {getStatusText(crop.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getHealthStatusColor(crop.healthStatus)}`}>
                          {getHealthStatusIcon(crop.healthStatus)}
                          <span className="ml-1">{getHealthStatusText(crop.healthStatus)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedCrop(crop)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{crop.area}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{crop.farmers} agriculteurs</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <TreePine className="w-4 h-4" />
                    <span>{crop.areaHa} ha</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Rendement: {crop.expectedYield}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Saison actuelle</p>
                  <p className="text-sm text-gray-600">{crop.currentSeason}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Prochaine action</p>
                  <p className="text-sm text-orange-600 font-medium">{crop.nextAction}</p>
                </div>

                {crop.challenges.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-red-700 mb-1">Défis</p>
                    <div className="flex flex-wrap gap-1">
                      {crop.challenges.map((challenge, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          {challenge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {crop.opportunities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Opportunités</p>
                    <div className="flex flex-wrap gap-1">
                      {crop.opportunities.map((opportunity, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {opportunity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other tabs would be implemented similarly */}
      {activeTab !== 'crops' && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'weather' && 'Météo Détaillée'}
              {activeTab === 'recommendations' && 'Recommandations Agricoles'}
              {activeTab === 'calendar' && 'Calendrier Agricole'}
            </h3>
            <p className="text-gray-600">Cette section est en cours de développement</p>
          </div>
        </div>
      )}
    </div>
  )
}