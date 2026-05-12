'use client'

import { useState } from 'react'
import { Users, Building, Activity, TrendingUp, MapPin, Phone, Mail, Calendar, Edit, Save, X, Plus, Search, Filter, Download, Upload } from 'lucide-react'

interface CommunalInfo {
  id: string
  category: string
  title: string
  content: string
  lastUpdated: string
  author: string
  status: 'published' | 'draft' | 'archived'
  priority: 'low' | 'medium' | 'high'
  attachments?: number
  views?: number
}

export default function CommunalManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const [communalData, setCommunalData] = useState<CommunalInfo[]>([
    {
      id: '1',
      category: 'population',
      title: 'Recensement de la population 2024',
      content: 'La population de la commune de Blitta 2 Agbandi est estimée à 12,450 habitants, avec une croissance annuelle de 2.3%.',
      lastUpdated: '2024-01-15',
      author: 'M. Koné',
      status: 'published',
      priority: 'high',
      views: 245
    },
    {
      id: '2',
      category: 'infrastructure',
      title: 'État des infrastructures scolaires',
      content: '12 établissements scolaires opérationnels sur 13 au total. Le collège municipal est en cours de rénovation.',
      lastUpdated: '2024-01-14',
      author: 'Mme Traoré',
      status: 'published',
      priority: 'medium',
      views: 189,
      attachments: 3
    },
    {
      id: '3',
      category: 'health',
      title: 'Rapport mensuel de santé',
      content: 'Le centre de santé principal a enregistré 1,245 consultations ce mois-ci. La campagne de vaccination est en cours.',
      lastUpdated: '2024-01-13',
      author: 'Dr. Bamba',
      status: 'published',
      priority: 'high',
      views: 156,
      attachments: 2
    },
    {
      id: '4',
      category: 'projects',
      title: 'Avancement des projets 2024',
      content: '24 projets en cours dont 8 dans la phase finale. Le nouveau marché devrait être opérationnel en juin 2024.',
      lastUpdated: '2024-01-12',
      author: 'M. Ouattara',
      status: 'draft',
      priority: 'high',
      views: 312,
      attachments: 5
    },
    {
      id: '5',
      category: 'finance',
      title: 'Budget annuel 2024',
      content: 'Budget total de 250M FCFA alloué aux infrastructures, 80M à l\'éducation et 60M à la santé.',
      lastUpdated: '2024-01-10',
      author: 'M. Kouassi',
      status: 'published',
      priority: 'high',
      views: 428,
      attachments: 8
    }
  ])

  const categories = [
    { id: 'all', name: 'Toutes', icon: Activity },
    { id: 'population', name: 'Population', icon: Users },
    { id: 'infrastructure', name: 'Infrastructures', icon: Building },
    { id: 'health', name: 'Santé', icon: Activity },
    { id: 'projects', name: 'Projets', icon: TrendingUp },
    { id: 'finance', name: 'Finances', icon: TrendingUp }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredData = communalData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleEdit = (id: string) => {
    setEditingItem(editingItem === id ? null : id)
  }

  const handleSave = (id: string, newData: Partial<CommunalInfo>) => {
    setCommunalData(prev => prev.map(item => 
      item.id === id ? { ...item, ...newData, lastUpdated: new Date().toISOString().split('T')[0] } : item
    ))
    setEditingItem(null)
  }

  const handleDelete = (id: string) => {
    setCommunalData(prev => prev.filter(item => item.id !== id))
  }

  const handleCreate = (newItem: Omit<CommunalInfo, 'id' | 'lastUpdated'>) => {
    const item: CommunalInfo = {
      ...newItem,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0],
      views: 0
    }
    setCommunalData(prev => [item, ...prev])
    setShowNewForm(false)
  }

  const stats = {
    total: communalData.length,
    published: communalData.filter(item => item.status === 'published').length,
    draft: communalData.filter(item => item.status === 'draft').length,
    highPriority: communalData.filter(item => item.priority === 'high').length,
    totalViews: communalData.reduce((sum, item) => sum + (item.views || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Informations Communales</h2>
          <p className="text-gray-600 mt-1">Gérez toutes les données et informations de la commune</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Exporter
          </button>
          <button 
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Nouvelle information
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble' },
            { id: 'list', label: 'Liste complète' },
            { id: 'analytics', label: 'Analytiques' },
            { id: 'archive', label: 'Archives' }
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publiées</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.published}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Brouillons</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Priorité haute</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.highPriority}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vues totales</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg shadow">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{filteredData.length} résultat{filteredData.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Data List */}
          <div className="divide-y divide-gray-200">
            {filteredData.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                {editingItem === item.id ? (
                  <EditForm item={item} onSave={handleSave} onCancel={() => setEditingItem(null)} />
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {item.status === 'published' ? 'Publié' : item.status === 'draft' ? 'Brouillon' : 'Archivé'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority === 'high' ? 'Haute' : item.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{item.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {item.lastUpdated}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {item.author}
                        </span>
                        {item.views && (
                          <span className="flex items-center">
                            <Activity className="w-4 h-4 mr-1" />
                            {item.views} vues
                          </span>
                        )}
                        {item.attachments && (
                          <span className="flex items-center">
                            <Upload className="w-4 h-4 mr-1" />
                            {item.attachments} pièce{item.attachments > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
            <div className="space-y-3">
              {categories.slice(1).map(cat => {
                const count = communalData.filter(item => item.category === cat.id).length
                const percentage = communalData.length > 0 ? (count / communalData.length) * 100 : 0
                return (
                  <div key={cat.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <cat.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de consultation</h3>
            <div className="space-y-4">
              {communalData
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 5)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{item.views || 0}</p>
                      <p className="text-xs text-gray-500">vues</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* New Item Modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une nouvelle information</h3>
            <NewForm onSubmit={handleCreate} onCancel={() => setShowNewForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

function EditForm({ item, onSave, onCancel }: { 
  item: CommunalInfo
  onSave: (id: string, data: Partial<CommunalInfo>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    title: item.title,
    content: item.content,
    status: item.status,
    priority: item.priority,
    category: item.category
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(item.id, formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="population">Population</option>
            <option value="infrastructure">Infrastructures</option>
            <option value="health">Santé</option>
            <option value="projects">Projets</option>
            <option value="finance">Finances</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' | 'archived' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
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

function NewForm({ onSubmit, onCancel }: { 
  onSubmit: (data: Omit<CommunalInfo, 'id' | 'lastUpdated'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft' as 'published' | 'draft' | 'archived',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'population',
    author: 'Utilisateur actuel'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="population">Population</option>
            <option value="infrastructure">Infrastructures</option>
            <option value="health">Santé</option>
            <option value="projects">Projets</option>
            <option value="finance">Finances</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
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
          <Plus className="w-4 h-4 inline mr-2" />
          Créer
        </button>
      </div>
    </form>
  )
}