'use client'

import { useState } from 'react'
import { MapPin, Wrench, AlertTriangle, CheckCircle, Clock, Users, Calendar, Filter, Search, Edit, Trash2, Plus, Eye, Download, Upload } from 'lucide-react'

interface Infrastructure {
  id: string
  name: string
  type: 'education' | 'health' | 'water' | 'road' | 'sports' | 'admin'
  status: 'operational' | 'maintenance' | 'out_of_service' | 'planned'
  location: string
  capacity?: string
  users?: number
  lastMaintenance?: string
  nextMaintenance?: string
  responsible: string
  budget?: string
  description: string
  coordinates?: { lat: number; lng: number }
  images?: number
  documents?: number
}

export default function InfrastructureManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<Infrastructure | null>(null)

  const [infrastructures, setInfrastructures] = useState<Infrastructure[]>([
    {
      id: '1',
      name: 'Mairie de Blitta 2 Agbandi',
      type: 'admin',
      status: 'operational',
      location: 'Avenue principale',
      responsible: 'M. Koné',
      description: 'Bâtiment administratif principal abritant les services municipaux',
      coordinates: { lat: 8.8667, lng: 0.7833 },
      images: 5,
      documents: 12
    },
    {
      id: '2',
      name: 'École primaire centrale',
      type: 'education',
      status: 'operational',
      location: 'Quartier Centre',
      capacity: '400 élèves',
      users: 385,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      responsible: 'Mme Traoré',
      budget: '2M FCFA/an',
      description: 'École primaire publique avec 8 salles de classe',
      images: 8,
      documents: 15
    },
    {
      id: '3',
      name: 'Centre de santé principal',
      type: 'health',
      status: 'operational',
      location: 'Quartier Nord',
      capacity: '150 patients/jour',
      users: 120,
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-02-05',
      responsible: 'Dr. Bamba',
      budget: '8M FCFA/an',
      description: 'Centre de santé avec maternité et urgences',
      images: 6,
      documents: 20
    },
    {
      id: '4',
      name: 'Puits n°3 - Adjamé',
      type: 'water',
      status: 'out_of_service',
      location: 'Quartier Adjamé',
      capacity: '3000L/jour',
      users: 500,
      lastMaintenance: '2023-12-15',
      nextMaintenance: '2024-01-20',
      responsible: 'M. Ouattara',
      budget: '500K FCFA',
      description: 'Puits communautaire en panne de pompe',
      images: 3,
      documents: 8
    },
    {
      id: '5',
      name: 'Stade municipal',
      type: 'sports',
      status: 'maintenance',
      location: 'Zone Est',
      capacity: '1000 spectateurs',
      users: 150,
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-01-25',
      responsible: 'M. Kouassi',
      budget: '1.5M FCFA/an',
      description: 'Stade de football avec piste d\'athlétisme',
      images: 10,
      documents: 5
    },
    {
      id: '6',
      name: 'Route principale Nord-Sud',
      type: 'road',
      status: 'operational',
      location: 'Axis Nord-Sud',
      responsible: 'Service des travaux',
      budget: '15M FCFA',
      description: 'Route principale bitumée de 8km',
      images: 12,
      documents: 8
    }
  ])

  const infrastructureTypes = [
    { id: 'all', name: 'Toutes', icon: MapPin, color: 'gray' },
    { id: 'education', name: 'Éducation', icon: MapPin, color: 'blue' },
    { id: 'health', name: 'Santé', icon: MapPin, color: 'red' },
    { id: 'water', name: 'Eau', icon: MapPin, color: 'cyan' },
    { id: 'road', name: 'Routes', icon: MapPin, color: 'yellow' },
    { id: 'sports', name: 'Sports', icon: MapPin, color: 'green' },
    { id: 'admin', name: 'Admin', icon: MapPin, color: 'purple' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out_of_service': return 'bg-red-100 text-red-800 border-red-200'
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-4 h-4" />
      case 'maintenance': return <Wrench className="w-4 h-4" />
      case 'out_of_service': return <AlertTriangle className="w-4 h-4" />
      case 'planned': return <Clock className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'Opérationnel'
      case 'maintenance': return 'En maintenance'
      case 'out_of_service': return 'Hors service'
      case 'planned': return 'Planifié'
      default: return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'education': return 'bg-blue-100 text-blue-800'
      case 'health': return 'bg-red-100 text-red-800'
      case 'water': return 'bg-cyan-100 text-cyan-800'
      case 'road': return 'bg-yellow-100 text-yellow-800'
      case 'sports': return 'bg-green-100 text-green-800'
      case 'admin': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredInfrastructures = infrastructures.filter(infra => {
    const matchesSearch = infra.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         infra.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || infra.type === selectedType
    return matchesSearch && matchesType
  })

  const stats = {
    total: infrastructures.length,
    operational: infrastructures.filter(i => i.status === 'operational').length,
    maintenance: infrastructures.filter(i => i.status === 'maintenance').length,
    outOfService: infrastructures.filter(i => i.status === 'out_of_service').length,
    planned: infrastructures.filter(i => i.status === 'planned').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Infrastructures</h2>
          <p className="text-gray-600 mt-1">Suivi et maintenance de toutes les infrastructures communales</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Exporter
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4 inline mr-2" />
            Nouvelle infrastructure
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Opérationnelles</p>
              <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hors service</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfService}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planifiées</p>
              <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une infrastructure..."
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
              {infrastructureTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{filteredInfrastructures.length} infrastructure{filteredInfrastructures.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Infrastructure List */}
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {filteredInfrastructures.map((infra) => (
            <div key={infra.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(infra.type)}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{infra.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(infra.type)}`}>
                        {infrastructureTypes.find(t => t.id === infra.type)?.name}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(infra.status)}`}>
                        {getStatusIcon(infra.status)}
                        <span className="ml-1">{getStatusText(infra.status)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{infra.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{infra.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{infra.responsible}</span>
                </div>
                {infra.capacity && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Capacité: {infra.capacity}</span>
                  </div>
                )}
                {infra.budget && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="font-medium">Budget: {infra.budget}</span>
                  </div>
                )}
                {infra.lastMaintenance && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Dernière maintenance: {infra.lastMaintenance}</span>
                  </div>
                )}
                {infra.nextMaintenance && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Prochaine maintenance: {infra.nextMaintenance}</span>
                  </div>
                )}
              </div>

              {(infra.images || infra.documents) && (
                <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  {infra.images && (
                    <span className="flex items-center space-x-1">
                      <Upload className="w-4 h-4" />
                      <span>{infra.images} image{infra.images > 1 ? 's' : ''}</span>
                    </span>
                  )}
                  {infra.documents && (
                    <span className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{infra.documents} document{infra.documents > 1 ? 's' : ''}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}