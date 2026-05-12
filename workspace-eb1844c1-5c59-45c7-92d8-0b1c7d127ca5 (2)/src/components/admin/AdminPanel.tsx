'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, Users, Building, TreePine, Droplets, Plus, Edit, Trash2, Save, X, Eye, BarChart3, Settings, Database, RefreshCw } from 'lucide-react'

interface AdminData {
  alerts: any[]
  marketPrices: any[]
  infrastructures: any[]
  crops: any[]
  communalInfos: any[]
  projects: any[]
  dashboardStats: any
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
    dashboardStats: null
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
      const [alertsRes, marketRes, infraRes, cropsRes, infosRes, projectsRes, statsRes] = await Promise.all([
        fetch('/api/admin/alerts'),
        fetch('/api/admin/market-prices'),
        fetch('/api/admin/infrastructures'),
        fetch('/api/admin/crops'),
        fetch('/api/admin/communal-infos'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/dashboard-stats')
      ])

      const [alerts, marketPrices, infrastructures, crops, communalInfos, projects, dashboardStats] = await Promise.all([
        alertsRes.json(),
        marketRes.json(),
        infraRes.json(),
        cropsRes.json(),
        infosRes.json(),
        projectsRes.json(),
        statsRes.json()
      ])

      setAdminData({
        alerts: alerts.data || [],
        marketPrices: marketPrices.data || [],
        infrastructures: infrastructures.data || [],
        crops: crops.data || [],
        communalInfos: communalInfos.data || [],
        projects: projects.data || [],
        dashboardStats: dashboardStats.data
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (type: string, data: any) => {
    try {
      const endpoint = `/api/admin/${type}`
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
      }
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return

    try {
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAllData()
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
                      onClick={() => setEditingItem(alert)}
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
          onClick={() => setShowForm(true)}
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
                      onClick={() => setEditingItem(price)}
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
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Cultures ({adminData.crops.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminData.crops.map((crop: any) => (
                <div key={crop.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{crop.name}</h4>
                  <p className="text-sm text-gray-600">{crop.area}</p>
                  <p className="text-sm text-gray-500">{crop.areaHa} ha - {crop.farmers} agriculteurs</p>
                  <div className="mt-2 flex justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      crop.healthStatus === 'GOOD' ? 'bg-green-100 text-green-800' :
                      crop.healthStatus === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {crop.healthStatus}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingItem(crop)}
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
                </div>
              ))}
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
              <h3 className="text-lg font-semibold">Modifier {editingItem.name || editingItem.title || editingItem.product}</h3>
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
    </div>
  )
}

function EditForm({ item, onSave, onCancel }: { 
  item: any
  onSave: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(item)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tendance</label>
            <input
              type="text"
              value={formData.trend}
              onChange={(e) => handleChange('trend', e.target.value)}
              placeholder="ex: +15%, -5%, 0%"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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