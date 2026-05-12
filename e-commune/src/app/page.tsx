'use client'

import { useState } from 'react'
import { AlertTriangle, TrendingUp, Map, Building, Droplets, ThermometerSun, Waves, Home as HomeIcon, Users, Activity, Zap, TreePine, Trophy, Bell, Menu, X, Search, Filter, ChevronRight, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import GeoportalMap from '@/components/geoportal/GeoportalMap'
import CommunalManagement from '@/components/communal/CommunalManagement'
import InfrastructureManagement from '@/components/infrastructure/InfrastructureManagement'
import AgricultureManagement from '@/components/agriculture/AgricultureManagement'

export default function CommuneApp() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const alerts = [
    { id: 1, type: 'price', title: 'Augmentation du prix du maïs', description: 'Le prix du maïs a augmenté de 15% cette semaine', level: 'high', time: 'Il y a 2 heures' },
    { id: 2, type: 'drought', title: 'Risque de sécheresse', description: 'Faibles précipitations prévues pour les 2 prochaines semaines', level: 'medium', time: 'Il y a 5 heures' },
    { id: 3, type: 'flood', title: 'Alerte inondation', description: 'Crue du fleuve surveillée dans la zone sud', level: 'low', time: 'Il y a 1 jour' }
  ]

  const marketPrices = [
    { product: 'Maïs', price: '350 FCFA/kg', trend: '+15%', change: 'up' },
    { product: 'Riz', price: '500 FCFA/kg', trend: '+5%', change: 'up' },
    { product: 'Mil', price: '300 FCFA/kg', trend: '-2%', change: 'down' },
    { product: 'Igname', price: '400 FCFA/kg', trend: '0%', change: 'stable' }
  ]

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: HomeIcon },
    { id: 'alerts', label: 'Alertes', icon: Bell },
    { id: 'geoportal', label: 'Géoportail', icon: Map },
    { id: 'infrastructures', label: 'Infrastructures', icon: Building },
    { id: 'agriculture', label: 'Agriculture', icon: TreePine },
    { id: 'water', label: 'Eau', icon: Droplets },
    { id: 'sports', label: 'Sports & Loisirs', icon: Trophy },
    { id: 'admin', label: 'Administration', icon: Users }
  ]

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800'
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price': return <TrendingUp className="w-5 h-5" />
      case 'drought': return <ThermometerSun className="w-5 h-5" />
      case 'flood': return <Waves className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Commune Blitta 2 Agbandi</h1>
                <p className="text-sm text-gray-600">Plateforme de gestion communale</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button className="relative p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transition-transform duration-300 ease-in-out mt-16 lg:mt-0`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Population</p>
                        <p className="text-3xl font-bold">12,450</p>
                        <p className="text-sm text-blue-100">+2.3% cette année</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Projets actifs</p>
                        <p className="text-3xl font-bold">24</p>
                        <p className="text-sm text-green-100">8 en cours</p>
                      </div>
                      <Activity className="w-8 h-8 text-green-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100">Alertes actives</p>
                        <p className="text-3xl font-bold">3</p>
                        <p className="text-sm text-yellow-100">1 critique</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-yellow-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Infrastructures</p>
                        <p className="text-3xl font-bold">47</p>
                        <p className="text-sm text-purple-100">92% opérationnelles</p>
                      </div>
                      <Building className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>
                </div>

                {/* Recent Alerts */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes récentes</h3>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`border-l-4 p-4 rounded-lg ${getAlertColor(alert.level)}`}>
                        <div className="flex items-start space-x-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <h4 className="font-semibold">{alert.title}</h4>
                            <p className="text-sm opacity-90">{alert.description}</p>
                            <p className="text-xs mt-1 opacity-75">{alert.time}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 opacity-60" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Prices */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Prix du marché</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {marketPrices.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{item.product}</p>
                            <p className="text-xl font-bold text-gray-900">{item.price}</p>
                          </div>
                          <div className={`flex items-center space-x-1 text-sm ${
                            item.change === 'up' ? 'text-red-600' : 
                            item.change === 'down' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {item.change === 'up' && <TrendingUp className="w-4 h-4" />}
                            {item.change === 'down' && <TrendingUp className="w-4 h-4 rotate-180" />}
                            <span>{item.trend}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Centre d'alertes</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Filter className="w-4 h-4 inline mr-2" />
                      Filtrer
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-900">Alerte Critique</h3>
                          <p className="text-red-700">Niveau élevé - Action immédiate requise</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                          <h4 className="font-semibold text-gray-900">Augmentation significative du prix du maïs</h4>
                          <p className="text-gray-600 mt-2">Le prix du maïs a augmenté de 15% cette semaine, atteignant 350 FCFA/kg. Cette augmentation affecte l'accessibilité alimentaire des ménages les plus vulnérables.</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Il y a 2 heures</span>
                            <span>•</span>
                            <span className="text-red-600 font-medium">Action requise</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                          <ThermometerSun className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-yellow-900">Alerte Météo</h3>
                          <p className="text-yellow-700">Surveillance renforcée nécessaire</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                          <h4 className="font-semibold text-gray-900">Risque de sécheresse</h4>
                          <p className="text-gray-600 mt-2">Les prévisions météorologiques indiquent des précipitations faibles pour les deux prochaines semaines. Les agriculteurs sont invités à optimiser l'irrigation.</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Il y a 5 heures</span>
                            <span>•</span>
                            <span className="text-yellow-600 font-medium">Surveillance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Statistiques des alertes</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Alertes critiques</span>
                          <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">1</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Alertes moyennes</span>
                          <span className="bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold">1</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Alertes basses</span>
                          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Infrastructure Management Section */}
          {activeSection === 'infrastructures' && <InfrastructureManagement />}

          {/* Agriculture Management Section */}
          {activeSection === 'agriculture' && <AgricultureManagement />}

          {/* Water Management Section */}
          {activeSection === 'water' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion de l'Eau</h2>
                <p className="text-gray-600 mb-6">Suivi des ressources hydrauliques et gestion de l'eau</p>
                <div className="bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités prévues :</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Suivi des points d'eau (puits, forages, fleuves)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Qualité de l'eau et analyses</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Gestion de l'irrigation agricole</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Alertes sécheresse et inondation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Sports & Leisure Section */}
          {activeSection === 'sports' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sports & Loisirs</h2>
                <p className="text-gray-600 mb-6">Gestion des équipements sportifs et de loisirs</p>
                <div className="bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités prévues :</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Gestion des stades et terrains de sport</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Planning des activités sportives</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Réservations en ligne</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Événements et tournois</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Admin Section */}
          {activeSection === 'admin' && <CommunalManagement />}

          {/* Geoportal Section */}
          {activeSection === 'geoportal' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Géoportail de Blitta 2 Agbandi</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Localisation
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <GeoportalMap 
  key={activeSection}
  center={{ lat: 18.8667, lng: 2.7833 }}
  zoom={12}
  className="h-96 lg:h-[500px]"
  onFeatureClick={(feature) => {
    console.log('Feature clicked:', feature)
  }}
/>

                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-red-600 rounded-full mx-auto mb-2"></div>
                        <p className="text-xs font-medium text-red-900">Zone critique</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-yellow-600 rounded-full mx-auto mb-2"></div>
                        <p className="text-xs font-medium text-yellow-900">Zone surveillée</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-green-600 rounded-full mx-auto mb-2"></div>
                        <p className="text-xs font-medium text-green-900">Zone sécurisée</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2"></div>
                        <p className="text-xs font-medium text-blue-900">Infrastructure</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Couches cartographiques</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-green-600" defaultChecked />
                          <span className="text-sm text-gray-700">Limites administratives</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-green-600" defaultChecked />
                          <span className="text-sm text-gray-700">Infrastructures</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-green-600" defaultChecked />
                          <span className="text-sm text-gray-700">Zones d'alerte</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-green-600" />
                          <span className="text-sm text-gray-700">Zones agricoles</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded text-green-600" />
                          <span className="text-sm text-gray-700">Ressources en eau</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Zones surveillées</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-3 h-3 bg-red-600 rounded-full mt-1"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Zone Sud</p>
                            <p className="text-xs text-gray-600">Risque d'inondation - 12km²</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-3 h-3 bg-yellow-600 rounded-full mt-1"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Zone Centre</p>
                            <p className="text-xs text-gray-600">Sécheresse - 25km²</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-3 h-3 bg-green-600 rounded-full mt-1"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Zone Nord</p>
                            <p className="text-xs text-gray-600">Stable - 18km²</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Commune Blitta 2 Agbandi</h3>
              <p className="text-gray-400 text-sm">Plateforme numérique de gestion communale pour un développement durable.</p>
            </div>
            <div>
              <h4 className="text-md font-medium mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Alertes communales</li>
                <li>Géoportail</li>
                <li>Gestion des infrastructures</li>
                <li>Services administratifs</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-medium mb-3">Ressources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Documentation</li>
                <li>Statistiques</li>
                <li>Rapports annuels</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-medium mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Tél: +228 XX XX XX XX</li>
                <li>Email: mairie@blitta2-agbandi.tg</li>
                <li>Adresse: Blitta 2 Agbandi, Togo</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>© 2024 Commune Blitta 2 Agbandi. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}