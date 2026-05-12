'use client'

import { useState, useEffect } from 'react'
import { TreePine, Droplets, Sun, TrendingUp, AlertTriangle, Calendar, MapPin, Users, Filter, Search, Plus, Edit, Eye, Download, Cloud, Thermometer, X, Save } from 'lucide-react'

interface Crop {
  id: string
  name: string
  type: string
  area: string
  areaHa: number
  farmers: number
  currentSeason: string
  expectedYield: string
  status: string
  healthStatus: string
  lastUpdate: string
  nextAction: string
  irrigation: boolean
  fertilizer: string
  challenges: string
  opportunities: string
  latitude?: number
  longitude?: number
  createdAt: string
  updatedAt: string
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
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null)

  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 32,
    humidity: 65,
    rainfall: 45,
    forecast: 'Pluies modérées prévues dans 3-4 jours',
    lastUpdate: '2024-01-16 14:30'
  })
  const [showWeatherForm, setShowWeatherForm] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)

  const cropTypes = [
    { id: 'all', name: 'Toutes les cultures', icon: TreePine, color: 'gray' },
    { id: 'CEREAL', name: 'Céréales', icon: TreePine, color: 'yellow' },
    { id: 'TUBER', name: 'Tubercules', icon: TreePine, color: 'orange' },
    { id: 'VEGETABLE', name: 'Légumes', icon: TreePine, color: 'green' },
    { id: 'FRUIT', name: 'Fruits', icon: TreePine, color: 'red' },
    { id: 'LEGUME', name: 'Légumineuses', icon: TreePine, color: 'purple' }
  ]

  // Charger les cultures et la météo depuis l'API
  useEffect(() => {
    fetchCrops()
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    try {
      const response = await fetch('/api/weather')
      const result = await response.json()
      
      if (result.success) {
        setWeatherData({
          temperature: result.data.temperature,
          humidity: result.data.humidity,
          rainfall: result.data.rainfall,
          forecast: result.data.forecast,
          lastUpdate: new Date(result.data.lastUpdate).toLocaleString('fr-FR')
        })
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
    }
  }

  const handleSaveWeather = async (weatherData: any) => {
    try {
      setWeatherLoading(true)
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weatherData)
      })

      if (response.ok) {
        await fetchWeather()
        setShowWeatherForm(false)
      }
    } catch (error) {
      console.error('Error saving weather:', error)
    } finally {
      setWeatherLoading(false)
    }
  }

  const fetchCrops = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/crops')
      const result = await response.json()
      
      if (result.success) {
        // Transformer les données pour correspondre au format attendu
        const transformedCrops = result.data.map((crop: any) => {
          try {
            return {
              ...crop,
              type: crop.type.toLowerCase(),
              status: crop.status.toLowerCase(),
              healthStatus: crop.healthStatus.toLowerCase(),
              challenges: Array.isArray(crop.challenges) ? crop.challenges : (crop.challenges ? JSON.parse(crop.challenges) : []),
              opportunities: Array.isArray(crop.opportunities) ? crop.opportunities : (crop.opportunities ? JSON.parse(crop.opportunities) : []),
              lastUpdate: new Date(crop.updatedAt).toLocaleDateString('fr-FR')
            }
          } catch (parseError) {
            console.error('Error parsing crop data:', parseError, crop)
            return {
              ...crop,
              type: crop.type.toLowerCase(),
              status: crop.status.toLowerCase(),
              healthStatus: crop.healthStatus.toLowerCase(),
              challenges: [],
              opportunities: [],
              lastUpdate: new Date(crop.updatedAt).toLocaleDateString('fr-FR')
            }
          }
        })
        setCrops(transformedCrops)
      }
    } catch (error) {
      console.error('Error fetching crops:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCrop = async (cropData: any) => {
    try {
      const method = cropData.id ? 'PUT' : 'POST'
      const url = cropData.id ? `/api/admin/crops/${cropData.id}` : '/api/admin/crops'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cropData)
      })

      if (response.ok) {
        await fetchCrops()
        setShowForm(false)
        setEditingCrop(null)
      }
    } catch (error) {
      console.error('Error saving crop:', error)
    }
  }

  const handleDeleteCrop = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette culture ?')) return

    try {
      const response = await fetch(`/api/admin/crops/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCrops()
      }
    } catch (error) {
      console.error('Error deleting crop:', error)
    }
  }

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
    const matchesType = selectedType === 'all' || crop.type === selectedType.toLowerCase()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
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
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Nouvelle culture
          </button>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center">
                <Cloud className="w-5 h-5 mr-2" />
                Météo Agricole
              </h3>
              <button
                onClick={() => setShowWeatherForm(true)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <Edit className="w-3 h-3 mr-1" />
                Modifier
              </button>
            </div>
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
          <div className="text-right ml-4">
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
                    <button 
                      onClick={() => setEditingCrop(crop)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
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

      {/* Create/Edit Modal */}
      {(showForm || editingCrop) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCrop ? 'Modifier la culture' : 'Nouvelle culture'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingCrop(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CropForm 
              crop={editingCrop} 
              onSave={handleSaveCrop} 
              onCancel={() => {
                setShowForm(false)
                setEditingCrop(null)
              }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CropForm({ crop, onSave, onCancel }: { 
  crop: Crop | null
  onSave: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(crop || {
    name: '',
    type: '',
    area: '',
    areaHa: 0,
    farmers: 0,
    currentSeason: '',
    expectedYield: '',
    status: 'PLANTED',
    healthStatus: 'GOOD',
    nextAction: '',
    irrigation: false,
    fertilizer: '',
    challenges: [],
    opportunities: [],
    latitude: 0,
    longitude: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la culture</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de culture</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Sélectionner...</option>
            <option value="CEREAL">Céréale</option>
            <option value="TUBER">Tubercule</option>
            <option value="VEGETABLE">Légume</option>
            <option value="FRUIT">Fruit</option>
            <option value="LEGUME">Légumineuse</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
          <input
            type="text"
            value={formData.area}
            onChange={(e) => handleChange('area', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: Zone Nord"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (ha)</label>
          <input
            type="number"
            value={formData.areaHa}
            onChange={(e) => handleChange('areaHa', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'agriculteurs</label>
          <input
            type="number"
            value={formData.farmers}
            onChange={(e) => handleChange('farmers', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Saison actuelle</label>
          <input
            type="text"
            value={formData.currentSeason}
            onChange={(e) => handleChange('currentSeason', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: Saison des pluies 2024"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rendement attendu</label>
          <input
            type="text"
            value={formData.expectedYield}
            onChange={(e) => handleChange('expectedYield', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: 3.5 t/ha"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="PLANTED">Planté</option>
            <option value="GROWING">En croissance</option>
            <option value="HARVESTING">En récolte</option>
            <option value="PREPARING">Préparation</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">État de santé</label>
          <select
            value={formData.healthStatus}
            onChange={(e) => handleChange('healthStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="GOOD">Bonne</option>
            <option value="WARNING">Attention</option>
            <option value="CRITICAL">Critique</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation</label>
          <select
            value={formData.irrigation ? 'true' : 'false'}
            onChange={(e) => handleChange('irrigation', e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine action</label>
        <input
          type="text"
          value={formData.nextAction}
          onChange={(e) => handleChange('nextAction', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ex: Fertilisation - 15 jours"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Engrais</label>
        <input
          type="text"
          value={formData.fertilizer}
          onChange={(e) => handleChange('fertilizer', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ex: NPK 15-15-15"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4 inline mr-2" />
          {crop ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  )

  // Weather Form Component
  const WeatherForm = () => {
    const [formData, setFormData] = useState({
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      rainfall: weatherData.rainfall,
      forecast: weatherData.forecast
    })

    const handleChange = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleSaveWeather(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Température (°C)</label>
            <input
              type="number"
              value={formData.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="-50"
              max="60"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Humidité (%)</label>
            <input
              type="number"
              value={formData.humidity}
              onChange={(e) => handleChange('humidity', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pluviométrie (mm)</label>
          <input
            type="number"
            value={formData.rainfall}
            onChange={(e) => handleChange('rainfall', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prévisions</label>
          <textarea
            value={formData.forecast}
            onChange={(e) => handleChange('forecast', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            maxLength={500}
            placeholder="Décrivez les prévisions météo pour les prochains jours..."
            required
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => setShowWeatherForm(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={weatherLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 inline mr-2" />
            {weatherLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    )
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
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Nouvelle culture
          </button>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center">
                <Cloud className="w-5 h-5 mr-2" />
                Météo Agricole
              </h3>
              <button
                onClick={() => setShowWeatherForm(true)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <Edit className="w-3 h-3 mr-1" />
                Modifier
              </button>
            </div>
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
          <div className="text-right ml-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Superficie</p>
                    <p className="font-semibold">{crop.area} ({crop.areaHa} ha)</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Agriculteurs</p>
                    <p className="font-semibold">{crop.farmers}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Saison</p>
                    <p className="font-semibold">{crop.currentSeason}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rendement attendu</p>
                    <p className="font-semibold">{crop.expectedYield}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-600">Irrigation</p>
                      <p className="font-semibold">{crop.irrigation ? 'Oui' : 'Non'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Prochaine action</p>
                      <p className="font-semibold">{crop.nextAction}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dernière mise à jour</p>
                      <p className="font-semibold">{crop.lastUpdate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Tab */}
      {activeTab === 'weather' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Météo Détaillée</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Thermometer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Température</p>
              <p className="text-2xl font-bold text-blue-600">{weatherData.temperature}°C</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <Droplets className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Humidité</p>
              <p className="text-2xl font-bold text-cyan-600">{weatherData.humidity}%</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <Cloud className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pluviométrie</p>
              <p className="text-2xl font-bold text-indigo-600">{weatherData.rainfall}mm</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Sun className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Dernière mise à jour</p>
              <p className="text-sm font-bold text-purple-600">{weatherData.lastUpdate}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Prévisions</h4>
            <p className="text-gray-700">{weatherData.forecast}</p>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations Agricoles</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800">Irrigation</h4>
              <p className="text-green-700">Avec l'humidité actuelle de {weatherData.humidity}%, il est recommandé d'irriguer les cultures sensibles à la sécheresse.</p>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-800">Fertilisation</h4>
              <p className="text-blue-700">La température actuelle de {weatherData.temperature}°C est idéale pour l'absorption des engrais.</p>
            </div>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
              <h4 className="font-semibold text-yellow-800">Surveillance</h4>
              <p className="text-yellow-700">Surveiller les ravageurs avec les conditions météo actuelles.</p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendrier Agricole</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Cette semaine</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Plantation de tomates</li>
                <li>• Fertilisation des céréales</li>
                <li>• Inspection des systèmes d'irrigation</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Ce mois-ci</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Récolte des pommes de terre</li>
                <li>• Préparation des champs pour la prochaine saison</li>
                <li>• Maintenance des équipements</li>
              </ul>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Prochaine saison</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Planification des cultures d'hiver</li>
                <li>• Achat des semences</li>
                <li>• Formation des agriculteurs</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Crop Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCrop ? 'Modifier la culture' : 'Nouvelle culture'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingCrop(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CropForm 
              crop={editingCrop} 
              onSave={handleSaveCrop}
              onCancel={() => {
                setShowForm(false)
                setEditingCrop(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Weather Form Modal */}
      {showWeatherForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modifier la météo</h3>
              <button
                onClick={() => setShowWeatherForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <WeatherForm />
          </div>
        </div>
      )}
    </div>
  )
}