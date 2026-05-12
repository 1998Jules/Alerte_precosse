'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, Users, Building, TreePine, Droplets, Plus, Edit, Trash2, Save, X, Eye, BarChart3, Settings, Database, RefreshCw, Cloud, Thermometer } from 'lucide-react'

interface AdminData {
  alerts: any[]
  marketPrices: any[]
  infrastructures: any[]
  crops: any[]
  communalInfos: any[]
  projects: any[]
  dashboardStats: any
  weatherData: any
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [adminData, setAdminData] = useState<AdminData>({
    alerts: [],
    marketPrices: [],
    infrastructures: [],
    crops: [],
    communalInfos: [],
    projects: [],
    dashboardStats: null,
    weatherData: null
  })
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'alerts', label: 'Alertes', icon: AlertTriangle },
    { id: 'market', label: 'Prix du marché', icon: TrendingUp },
    { id: 'infrastructures', label: 'Infrastructures', icon: Building },
    { id: 'crops', label: 'Agriculture', icon: TreePine },
    { id: 'water', label: 'Eau', icon: Droplets },
    { id: 'infos', label: 'Infos communales', icon: Users },
    { id: 'projects', label: 'Projets', icon: Settings }
  ]

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [alertsRes, marketRes, infraRes, cropsRes, infosRes, projectsRes, statsRes, weatherRes] = await Promise.all([
        fetch('/api/admin/alerts'),
        fetch('/api/admin/market-prices'),
        fetch('/api/admin/infrastructures'),
        fetch('/api/admin/crops'),
        fetch('/api/admin/communal-infos'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/dashboard-stats'),
        fetch('/api/weather')
      ])

      const [alerts, marketPrices, infrastructures, crops, communalInfos, projects, dashboardStats, weather] = await Promise.all([
        alertsRes.json(),
        marketRes.json(),
        infraRes.json(),
        cropsRes.json(),
        infosRes.json(),
        projectsRes.json(),
        statsRes.json(),
        weatherRes.json()
      ])

      setAdminData({
        alerts: alerts.data || [],
        marketPrices: marketPrices.data || [],
        infrastructures: infrastructures.data || [],
        crops: crops.data || [],
        communalInfos: communalInfos.data || [],
        projects: projects.data || [],
        dashboardStats: dashboardStats.data,
        weatherData: weather.success ? weather.data : null
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (type: string, data: any) => {
    try {
      // Gérer le cas spécial de la météo
      if (data.type === 'weather') {
        const response = await fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            temperature: data.temperature,
            humidity: data.humidity,
            rainfall: data.rainfall,
            forecast: data.forecast
          })
        })

        if (response.ok) {
          await fetchAllData()
          setEditingItem(null)
          setShowForm(false)
        }
        return
      }

      // Gérer le cas spécial des alertes
      if (data.type === 'alert') {
        const alertData = {
          title: data.title,
          description: data.description,
          type: data.alertType, // Convertir alertType en type
          level: data.level,
          location: data.location,
          status: data.status || 'ACTIVE'
        }

        const response = await fetch('/api/admin/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertData)
        })

        if (response.ok) {
          await fetchAllData()
          setEditingItem(null)
          setShowForm(false)
        }
        return
      }

      // Mapper les noms d'onglets vers les routes API correctes
      const routeMap: { [key: string]: string } = {
        'market': 'market-prices',
        'alerts': 'alerts',
        'infrastructures': 'infrastructures', 
        'crops': 'crops',
        'infos': 'communal-infos',
        'projects': 'projects'
      }
      
      const apiType = routeMap[type] || type
      const endpoint = `/api/admin/${apiType}`
      const method = data.id ? 'PUT' : 'POST'
      const url = data.id ? `${endpoint}/${data.id}` : endpoint

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchAllData()
        setEditingItem(null)
        setShowForm(false)
      } else {
        console.error('Save failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return

    try {
      // Mapper les noms d'onglets vers les routes API correctes
      const routeMap: { [key: string]: string } = {
        'market': 'market-prices',
        'alerts': 'alerts',
        'infrastructures': 'infrastructures', 
        'crops': 'crops',
        'infos': 'communal-infos',
        'projects': 'projects'
      }
      
      const apiType = routeMap[type] || type
      const response = await fetch(`/api/admin/${apiType}/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAllData()
      } else {
        console.error('Delete failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  }

  const renderDashboardStats = () => {
    if (!adminData.dashboardStats) return null

    const stats = adminData.dashboardStats
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Population</p>
              <p className="text-3xl font-bold">{stats.population?.toLocaleString()}</p>
              <p className="text-sm text-blue-100">{stats.households?.toLocaleString()} ménages</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Projets</p>
              <p className="text-3xl font-bold">{stats.projects}</p>
              <p className="text-sm text-green-100">{stats.activeProjects} actifs</p>
            </div>
            <Settings className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Infrastructures</p>
              <p className="text-3xl font-bold">{stats.infrastructures}</p>
              <p className="text-sm text-yellow-100">{stats.operationalInfra} opérationnelles</p>
            </div>
            <Building className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Superficie</p>
              <p className="text-3xl font-bold">{stats.totalArea} km²</p>
              <p className="text-sm text-purple-100">{stats.density} hab/km²</p>
            </div>
            <Database className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>
    )
  }

  const renderAlertsTable = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Alertes ({adminData.alerts.length})</h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle alerte
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {adminData.alerts.map((alert: any) => (
              <tr key={alert.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                  <div className="text-sm text-gray-500">{alert.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {alert.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    alert.level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    alert.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    alert.status === 'RESOLVED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingItem({ ...alert, type: 'alert' })}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete('alerts', alert.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderMarketPricesTable = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Prix du marché ({adminData.marketPrices.length})</h3>
        <button
          onClick={() => {
            setEditingItem({ 
              type: 'market',
              product: '',
              category: '',
              price: 0,
              currency: 'FCFA',
              unit: 'kg',
              trend: '0%',
              market: '',
              availability: 'Bonne'
            })
            setShowForm(true)
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau prix
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tendance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marché</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponibilité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {adminData.marketPrices.map((price: any) => (
              <tr key={price.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{price.product}</div>
                  <div className="text-sm text-gray-500">{price.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{price.price} {price.currency}</div>
                  <div className="text-sm text-gray-500">par {price.unit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    price.trend.startsWith('+') ? 'bg-red-100 text-red-800' :
                    price.trend.startsWith('-') ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {price.trend}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {price.market}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    price.availability === 'Bonne' ? 'bg-green-100 text-green-800' :
                    price.availability === 'Limitée' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {price.availability}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(price.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingItem({ ...price, type: 'market' })}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete('market-prices', price.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Panneau d'Administration</h2>
          <p className="text-gray-600 mt-1">Gérez toutes les données de la commune</p>
        </div>
        <button
          onClick={fetchAllData}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'dashboard' && (
          <div>
            {renderDashboardStats()}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Dernières alertes</h3>
                <div className="space-y-2">
                  {adminData.alerts.slice(0, 5).map((alert: any) => (
                    <div key={alert.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          alert.level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Derniers prix du marché</h3>
                <div className="space-y-2">
                  {adminData.marketPrices.slice(0, 5).map((price: any) => (
                    <div key={price.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{price.product}</p>
                          <p className="text-sm text-gray-600">{price.market}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{price.price} {price.currency}</p>
                          <p className={`text-sm ${
                            price.trend.startsWith('+') ? 'text-red-600' :
                            price.trend.startsWith('-') ? 'text-green-600' :
                            'text-gray-600'
                          }`}>
                            {price.trend}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && renderAlertsTable()}
        {activeTab === 'market' && renderMarketPricesTable()}

        {activeTab === 'infrastructures' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Infrastructures ({adminData.infrastructures.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminData.infrastructures.map((infra: any) => (
                <div key={infra.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{infra.name}</h4>
                  <p className="text-sm text-gray-600">{infra.type}</p>
                  <p className="text-sm text-gray-500">{infra.location}</p>
                  <div className="mt-2 flex justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      infra.status === 'OPERATIONAL' ? 'bg-green-100 text-green-800' :
                      infra.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {infra.status}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingItem(infra)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('infrastructures', infra.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'crops' && (
          <div className="space-y-6">
            {/* Weather Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Gestion Météo</h3>
                <button
                  onClick={() => {
                    setEditingItem({ type: 'weather', ...adminData.weatherData })
                    setShowForm(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier la météo
                </button>
              </div>
              
              {adminData.weatherData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Thermometer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Température</p>
                    <p className="text-2xl font-bold text-blue-600">{adminData.weatherData.temperature}°C</p>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 rounded-lg">
                    <Droplets className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Humidité</p>
                    <p className="text-2xl font-bold text-cyan-600">{adminData.weatherData.humidity}%</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <Cloud className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Pluviométrie</p>
                    <p className="text-2xl font-bold text-indigo-600">{adminData.weatherData.rainfall}mm</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TreePine className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Dernière mise à jour</p>
                    <p className="text-sm font-bold text-purple-600">{new Date(adminData.weatherData.lastUpdate).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Aucune donnée météo disponible</p>
                </div>
              )}
              
              {adminData.weatherData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Prévisions</h4>
                  <p className="text-gray-700">{adminData.weatherData.forecast}</p>
                </div>
              )}
            </div>

            {/* Crops Management */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Cultures ({adminData.crops.length})</h3>
                <button
                  onClick={() => {
                    setEditingItem({ type: 'crop' })
                    setShowForm(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle culture
                </button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminData.crops.map((crop: any) => (
                    <div key={crop.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{crop.name}</h4>
                          <p className="text-sm text-gray-600">{crop.type}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem({ ...crop, type: 'crop' })
                              setShowForm(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete('crops', crop.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{crop.area}</p>
                      <p className="text-sm text-gray-500">{crop.areaHa} ha - {crop.farmers} agriculteurs</p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          crop.healthStatus === 'GOOD' ? 'bg-green-100 text-green-800' :
                          crop.healthStatus === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {crop.healthStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {['water', 'infos', 'projects'].includes(activeTab) && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === 'water' && 'Gestion de l\'Eau'}
                {activeTab === 'infos' && 'Informations Communales'}
                {activeTab === 'projects' && 'Gestion des Projets'}
              </h3>
              <p className="text-gray-600">Cette section sera bientôt disponible</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem.type === 'weather' ? 'Modifier la météo' :
                 editingItem.type === 'crop' ? (editingItem.id ? 'Modifier la culture' : 'Nouvelle culture') :
                 `Modifier ${editingItem.name || editingItem.title || editingItem.product}`}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <EditForm item={editingItem} onSave={(data) => handleSave(activeTab, data)} onCancel={() => setEditingItem(null)} />
          </div>
        </div>
      )}

      {/* Modal pour créer un nouvel élément */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem?.type === 'weather' ? 'Modifier la météo' :
                 editingItem?.type === 'crop' ? (editingItem?.id ? 'Modifier la culture' : 'Nouvelle culture') :
                 activeTab === 'alerts' && 'Nouvelle alerte'}
                {activeTab === 'market' && 'Nouveau prix du marché'}
                {activeTab === 'infrastructures' && 'Nouvelle infrastructure'}
                {activeTab === 'crops' && 'Nouvelle culture'}
                {activeTab === 'infos' && 'Nouvelle information communale'}
                {activeTab === 'projects' && 'Nouveau projet'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <EditForm 
              item={editingItem || { 
                type: activeTab === 'crops' ? 'crop' : 
                       activeTab === 'alerts' ? 'alert' : 
                       activeTab === 'weather' ? 'weather' : null 
              }} 
              onSave={(data) => handleSave(activeTab, data)} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

function EditForm({ item, onSave, onCancel }: { 
  item: any
  onSave: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(() => {
    // Pré-remplir les données pour les alertes
    if (item.type === 'alert') {
      return {
        ...item,
        alertType: item.type || '', // Stocker le type d'alerte dans alertType
        title: item.title || '',
        description: item.description || '',
        level: item.level || '',
        location: item.location || '',
        status: item.status || 'ACTIVE'
      }
    }
    
    // Pré-remplir les données pour les prix du marché
    if (item.type === 'market') {
      return {
        ...item,
        product: item.product || '',
        category: item.category || '',
        price: item.price || 0,
        currency: item.currency || 'FCFA',
        unit: item.unit || 'kg',
        trend: item.trend || '0%',
        market: item.market || '',
        availability: item.availability || 'Bonne'
      }
    }
    
    return item
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
      {/* Weather Form */}
      {item.type === 'weather' && (
        <>
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
        </>
      )}

      {/* Crop Form */}
      {item.type === 'crop' && (
        <>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="CEREAL">Céréales</option>
                <option value="TUBER">Tubercules</option>
                <option value="VEGETABLE">Légumes</option>
                <option value="FRUIT">Fruits</option>
                <option value="LEGUME">Légumineuses</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (ha)</label>
              <input
                type="number"
                value={formData.areaHa}
                onChange={(e) => handleChange('areaHa', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.1"
                required
              />
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
                placeholder="Ex: Nord, Sud, Est..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'agriculteurs</label>
              <input
                type="number"
                value={formData.farmers}
                onChange={(e) => handleChange('farmers', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saison actuelle</label>
              <input
                type="text"
                value={formData.currentSeason}
                onChange={(e) => handleChange('currentSeason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Hivernage 2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rendement attendu</label>
              <input
                type="text"
                value={formData.expectedYield}
                onChange={(e) => handleChange('expectedYield', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 3 tonnes/ha"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Santé</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine action</label>
            <input
              type="text"
              value={formData.nextAction}
              onChange={(e) => handleChange('nextAction', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Fertilisation - 15 jours"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </>
      )}

      {/* Alert Form */}
      {item.type === 'alert' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'alerte</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'alerte</label>
              <select
                value={formData.alertType || ''}
                onChange={(e) => handleChange('alertType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="PRICE">Prix</option>
                <option value="DROUGHT">Sécheresse</option>
                <option value="FLOOD">Inondation</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="HEALTH">Santé</option>
                <option value="SECURITY">Sécurité</option>
                <option value="WEATHER">Météo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'alerte</label>
              <select
                value={formData.level || ''}
                onChange={(e) => handleChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner un niveau</option>
                <option value="LOW">Faible</option>
                <option value="MEDIUM">Moyen</option>
                <option value="HIGH">Élevé</option>
                <option value="CRITICAL">Critique</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Centre-ville, Zone nord, Marché central..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={formData.status || 'ACTIVE'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Résolue</option>
              <option value="ARCHIVED">Archivée</option>
            </select>
          </div>
        </>
      )}

      {/* Market Price Form */}
      {item.type === 'market' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
              <input
                type="text"
                value={formData.product || ''}
                onChange={(e) => handleChange('product', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ex: Riz, Maïs, Manioc..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ex: Céréales, Légumes, Fruits..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <select
                value={formData.currency || 'FCFA'}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <select
                value={formData.unit || 'kg'}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="kg">kg</option>
                <option value="tonne">tonne</option>
                <option value="pièce">pièce</option>
                <option value="sac">sac (50kg)</option>
                <option value="litre">litre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marché</label>
              <input
                type="text"
                value={formData.market || ''}
                onChange={(e) => handleChange('market', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ex: Marché central, Grand marché..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tendance</label>
              <input
                type="text"
                value={formData.trend || ''}
                onChange={(e) => handleChange('trend', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ex: +15%, -5%, 0%"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
            <select
              value={formData.availability || 'Bonne'}
              onChange={(e) => handleChange('availability', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Bonne">Bonne</option>
              <option value="Limitée">Limitée</option>
              <option value="Faible">Faible</option>
            </select>
          </div>
        </>
      )}

      {/* Dynamic form fields based on item type */}
      {item.title && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </>
      )}

      {item.product && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) => handleChange('product', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ex: Céréales, Légumes, Fruits..."
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <select
                value={formData.currency || 'FCFA'}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <select
                value={formData.unit || 'kg'}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="kg">kg</option>
                <option value="tonne">tonne</option>
                <option value="pièce">pièce</option>
                <option value="sac">sac (50kg)</option>
                <option value="litre">litre</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tendance</label>
              <input
                type="text"
                value={formData.trend}
                onChange={(e) => handleChange('trend', e.target.value)}
                placeholder="ex: +15%, -5%, 0%"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marché</label>
              <input
                type="text"
                value={formData.market || ''}
                onChange={(e) => handleChange('market', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ex: Marché central, Grand marché..."
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
            <select
              value={formData.availability || 'Bonne'}
              onChange={(e) => handleChange('availability', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Bonne">Bonne</option>
              <option value="Limitée">Limitée</option>
              <option value="Faible">Faible</option>
            </select>
          </div>
        </>
      )}

      {item.name && !item.product && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </>
      )}

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
          Enregistrer
        </button>
      </div>
    </form>
  )
}

function CreateForm({ type, onSave, onCancel }: { 
  type: string
  onSave: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Formulaire pour les alertes */}
      {type === 'alerts' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'alerte</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type || ''}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="PRICE">Prix</option>
                <option value="DROUGHT">Sécheresse</option>
                <option value="FLOOD">Inondation</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="HEALTH">Santé</option>
                <option value="SECURITY">Sécurité</option>
                <option value="WEATHER">Météo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select
                value={formData.level || ''}
                onChange={(e) => handleChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="LOW">Faible</option>
                <option value="MEDIUM">Moyen</option>
                <option value="HIGH">Élevé</option>
                <option value="CRITICAL">Critique</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Marché central, Zone nord, etc."
            />
          </div>
        </>
      )}

      {/* Formulaire pour les prix du marché */}
      {type === 'market' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
              <input
                type="text"
                value={formData.product || ''}
                onChange={(e) => handleChange('product', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <input
                type="text"
                value={formData.unit || ''}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: kg, litre, unité"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marché</label>
              <input
                type="text"
                value={formData.market || ''}
                onChange={(e) => handleChange('market', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Céréales, Légumes, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
              <select
                value={formData.availability || ''}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="Bonne">Bonne</option>
                <option value="Limitée">Limitée</option>
                <option value="Élevée">Élevée</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualité</label>
              <select
                value={formData.quality || ''}
                onChange={(e) => handleChange('quality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Bonne">Bonne</option>
                <option value="Excellente">Excellente</option>
                <option value="Moyenne">Moyenne</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tendance</label>
              <input
                type="text"
                value={formData.trend || ''}
                onChange={(e) => handleChange('trend', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: +15%, -5%, 0%"
              />
            </div>
          </div>
        </>
      )}

      {/* Formulaire pour les infrastructures */}
      {type === 'infrastructures' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'infrastructure</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type || ''}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="EDUCATION">Éducation</option>
                <option value="HEALTH">Santé</option>
                <option value="WATER">Eau</option>
                <option value="ROAD">Route</option>
                <option value="SPORTS">Sports</option>
                <option value="ADMIN">Administration</option>
                <option value="MARKET">Marché</option>
                <option value="ENERGY">Énergie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={formData.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="OPERATIONAL">Opérationnel</option>
                <option value="MAINTENANCE">En maintenance</option>
                <option value="OUT_OF_SERVICE">Hors service</option>
                <option value="PLANNED">Planifié</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
            <input
              type="text"
              value={formData.responsible || ''}
              onChange={(e) => handleChange('responsible', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </>
      )}

      {/* Message par défaut pour les autres types */}
      {!['alerts', 'market', 'infrastructures'].includes(type) && (
        <div className="text-center py-8 text-gray-500">
          <p>Le formulaire pour {type} n'est pas encore implémenté.</p>
          <p className="text-sm">Cette fonctionnalité sera bientôt disponible.</p>
        </div>
      )}

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
          Créer
        </button>
      </div>
    </form>
  )
}