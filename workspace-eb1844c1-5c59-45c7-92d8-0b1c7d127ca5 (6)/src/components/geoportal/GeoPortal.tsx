'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Layers, 
  MapPin, 
  School, 
  Droplets, 
  ShoppingBag, 
  Home, 
  Hospital,
  Building,
  Trees,
  Route,
  Users,
  Store,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

import GeoportalMap, { MapLayer } from './GeoportalMap'

// Configuration des couches avec URLs Django
const LAYER_CONFIG = [
  {
    id: 'cantons',
    name: 'Cantons',
    url: 'http://localhost:8000/geojson/cantons/',
    icon: <MapPin className="h-4 w-4" />,
    color: '#FF6B6B',
    type: 'polygon' as const,
    category: 'administratif',
    description: 'Limites des cantons administratifs'
  },
  {
    id: 'communes',
    name: 'Communes',
    url: 'http://localhost:8000/geojson/commune/',
    icon: <Home className="h-4 w-4" />,
    color: '#4ECDC4',
    type: 'polygon' as const,
    category: 'administratif',
    description: 'Limites des communes'
  },
  {
    id: 'routes',
    name: 'Routes',
    url: 'http://localhost:8000/geojson/routes/',
    icon: <Route className="h-4 w-4" />,
    color: '#45B7D1',
    type: 'line' as const,
    category: 'infrastructure',
    description: 'Réseau routier principal'
  },
  {
    id: 'terrains',
    name: 'Terrains / Stades',
    url: 'http://localhost:8000/geojson/terrain/',
    icon: <Trees className="h-4 w-4" />,
    color: '#228B22',
    type: 'polygon' as const,
    category: 'infrastructure',
    description: 'Terrains et stades'
  },
  {
    id: 'hopitaux',
    name: 'Hôpitaux',
    url: 'http://localhost:8000/geojson/hopitale/',
    icon: <Hospital className="h-4 w-4" />,
    color: '#DC143C',
    type: 'point' as const,
    category: 'sante',
    description: 'Établissements hospitaliers'
  },
  {
    id: 'jardins',
    name: 'Jardins',
    url: 'http://localhost:8000/geojson/jardin/',
    icon: <School className="h-4 w-4" />,
    color: '#96CEB4',
    type: 'point' as const,
    category: 'education',
    description: 'Jardins d\'enfants'
  },
  {
    id: 'colleges',
    name: 'Collèges',
    url: 'http://localhost:8000/geojson/college/',
    icon: <School className="h-4 w-4" />,
    color: '#87CEEB',
    type: 'point' as const,
    category: 'education',
    description: 'Collèges'
  },
  {
    id: 'lycees',
    name: 'Lycées',
    url: 'http://localhost:8000/geojson/lycee/',
    icon: <School className="h-4 w-4" />,
    color: '#4682B4',
    type: 'point' as const,
    category: 'education',
    description: 'Lycées'
  },
  {
    id: 'peas',
    name: 'Forages PEA',
    url: 'http://localhost:8000/geojson/Point_eau/',
    icon: <Droplets className="h-4 w-4" />,
    color: '#0077BE',
    type: 'point' as const,
    category: 'hydrologie',
    description: 'Forages et points d\'eau PEA'
  },
  {
    id: 'bornes',
    name: 'Bornes fontaines',
    url: 'http://localhost:8000/geojson/bornefontaine/',
    icon: <Droplets className="h-4 w-4" />,
    color: '#20B2AA',
    type: 'point' as const,
    category: 'hydrologie',
    description: 'Bornes fontaines publiques'
  },
  {
    id: 'marches',
    name: 'Marchés',
    url: 'http://localhost:8000/geojson/Marches/',
    icon: <ShoppingBag className="h-4 w-4" />,
    color: '#FFA07A',
    type: 'point' as const,
    category: 'economie',
    description: 'Marchés publics'
  },
  {
    id: 'cooperatives',
    name: 'Coopératives',
    url: 'http://localhost:8000/geojson/cooperative/',
    icon: <Users className="h-4 w-4" />,
    color: '#FF8C00',
    type: 'point' as const,
    category: 'economie',
    description: 'Coopératives agricoles'
  },
  {
    id: 'magasins',
    name: 'Magasins / Intrants',
    url: 'http://localhost:8000/geojson/magasin/',
    icon: <Store className="h-4 w-4" />,
    color: '#9370DB',
    type: 'point' as const,
    category: 'economie',
    description: 'Magasins d\'intrants agricoles'
  },
  {
    id: 'chateaux',
    name: 'Châteaux',
    url: 'http://localhost:8000/geojson/chateau/',
    icon: <Building className="h-4 w-4" />,
    color: '#DDA0DD',
    type: 'point' as const,
    category: 'patrimoine',
    description: 'Châteaux et monuments'
  }
]

// Catégories thématiques
const CATEGORIES = [
  {
    id: 'administratif',
    name: 'Administratif',
    icon: <Building className="h-4 w-4" />,
    color: '#6366f1',
    description: 'Limites administratives et territoires'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: <Route className="h-4 w-4" />,
    color: '#f59e0b',
    description: 'Routes, bâtiments et équipements'
  },
  {
    id: 'sante',
    name: 'Santé',
    icon: <Hospital className="h-4 w-4" />,
    color: '#ef4444',
    description: 'Établissements de santé'
  },
  {
    id: 'education',
    name: 'Éducation',
    icon: <School className="h-4 w-4" />,
    color: '#10b981',
    description: 'Écoles et établissements éducatifs'
  },
  {
    id: 'hydrologie',
    name: 'Hydrologie',
    icon: <Droplets className="h-4 w-4" />,
    color: '#06b6d4',
    description: 'Ressources en eau et hydrographie'
  },
  {
    id: 'economie',
    name: 'Économie',
    icon: <ShoppingBag className="h-4 w-4" />,
    color: '#8b5cf6',
    description: 'Marchés, commerces et activités'
  },
  {
    id: 'patrimoine',
    name: 'Patrimoine',
    icon: <MapPin className="h-4 w-4" />,
    color: '#f97316',
    description: 'Monuments et sites historiques'
  }
]

export default function GeoPortal() {
  const [layers, setLayers] = useState<MapLayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [selectedFeature, setSelectedFeature] = useState<any>(null)

  // Charger les couches depuis l'API Next.js (qui les récupère de Django)
  useEffect(() => {
    const loadLayers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Loading layers from Next.js API...')
        const response = await fetch('/api/geoportail')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Erreur lors du chargement des couches')
        }
        
        console.log(`✅ Loaded ${data.layers?.length || 0} layers from Django`)
        setLayers(data.layers || [])
        
      } catch (error) {
        console.error('❌ Error loading layers:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadLayers()
  }, [])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleLayer = async (layerId: string) => {
    setLayers(prev => 
      prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l)
    )
  }

  const handleFeatureClick = (feature: any) => {
    console.log('Feature clicked:', feature);
    setSelectedFeature(feature);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Géoportail</h1>
          <p className="text-muted-foreground">
            Carte interactive des données géographiques communales
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Statut de chargement */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              loading ? 'bg-yellow-500 animate-pulse' : 
              error ? 'bg-red-500' : 'bg-green-500'
            }`} />
            <span className="text-sm text-muted-foreground">
              {loading ? 'Chargement...' : 
               error ? 'Erreur' : 
               layers.length > 0 ? `${layers.length} couches` : 'Aucune couche'}
            </span>
          </div>
          
          <Badge variant="outline" className="text-sm">
            <Layers className="h-3 w-3 mr-1" />
            {layers.filter(l => l.visible).length} actives
          </Badge>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-4 h-4 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <p className="text-sm text-red-700">
                {error}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Vérifiez que votre serveur Django est en cours d'exécution sur <code>http://localhost:8000</code> et que les CORS sont configurés.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Chargement des couches</h3>
              <p className="text-sm text-blue-700">
                Récupération des données depuis l'API Django...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* PANNEAU DE GAUCHE - Contrôle des couches */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Couches thématiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {loading ? 'Chargement des couches...' : 
               error ? 'Erreur de chargement' :
               `Explorez les ${layers.length} couches disponibles`}
            </div>
            
            {layers.length > 0 && CATEGORIES.map((category) => {
              const categoryLayers = layers.filter(l => {
                // Déterminer la catégorie en fonction de l'ID de la couche
                if (category.id === 'administratif') return ['cantons', 'communes'].includes(l.id);
                if (category.id === 'infrastructure') return ['routes', 'terrains'].includes(l.id);
                if (category.id === 'sante') return ['hopitaux'].includes(l.id);
                if (category.id === 'education') return ['jardins', 'colleges', 'lycees'].includes(l.id);
                if (category.id === 'hydrologie') return ['peas', 'bornes'].includes(l.id);
                if (category.id === 'economie') return ['marches', 'cooperatives', 'magasins'].includes(l.id);
                if (category.id === 'patrimoine') return ['chateaux'].includes(l.id);
                return false;
              });
              
              const visibleLayersCount = categoryLayers.filter(l => l.visible).length;
              const isExpanded = expandedCategories[category.id];
              
              if (categoryLayers.length === 0) return null;
              
              return (
                <div key={category.id} className="border rounded-lg overflow-hidden">
                  {/* En-tête de catégorie */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span className="text-sm font-medium text-left">
                          {category.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {visibleLayersCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {visibleLayersCount}
                        </Badge>
                      )}
                      <div className={`transform transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  
                  {/* Description de la catégorie */}
                  <div className="px-3 pb-2">
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  
                  {/* Couches de la catégorie */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50">
                      {categoryLayers.map((layer) => (
                        <div key={layer.id} className="flex items-center justify-between p-3 hover:bg-gray-100 transition-colors border-b last:border-b-0">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: layer.color }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{layer.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {layer.data?.features?.length || 0} entités
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={layer.visible}
                              onCheckedChange={() => toggleLayer(layer.id)}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* CARTE */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <GeoportalMap
                center={{ lat: 8.3201, lng: 1.04757 }}
                zoom={10}
                layers={layers}
                onFeatureClick={handleFeatureClick}
                className="h-[600px]"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PANNEAU D'INFORMATIONS SUR L'ENTITÉ SÉLECTIONNÉE */}
      {selectedFeature && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Détails de l'entité</CardTitle>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(selectedFeature.properties || {}).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-sm font-medium">{key}</Label>
                  <div className="text-sm text-gray-600">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}