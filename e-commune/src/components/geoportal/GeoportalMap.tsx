'use client'

import { useState, useEffect } from 'react'
import { MapPin, Layers, ZoomIn, ZoomOut, Maximize2, Settings, Info, Navigation, Filter } from 'lucide-react'

interface MapFeature {
  id: string
  type: 'Point' | 'Polygon' | 'LineString'
  properties: Record<string, any>
  geometry: {
    type: string
    coordinates: number[] | number[][]
  }
}

interface MapLayer {
  id: string
  name: string
  visible: boolean
  opacity: number
  color: string
  data?: MapFeature[]
}

interface GeoportalMapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  layers?: MapLayer[]
  onFeatureClick?: (feature: MapFeature) => void
  className?: string
}

export default function GeoportalMap({ 
  center = { lat: 8.8667, lng: 0.7833 }, 
  zoom = 12,
  layers = [],
  onFeatureClick,
  className = ''
}: GeoportalMapProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom)
  const [currentCenter, setCurrentCenter] = useState(center)
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)

  const defaultLayers: MapLayer[] = [
    {
      id: 'administrative',
      name: 'Limites administratives',
      visible: true,
      opacity: 0.8,
      color: '#3B82F6'
    },
    {
      id: 'infrastructures',
      name: 'Infrastructures',
      visible: true,
      opacity: 1,
      color: '#10B981'
    },
    {
      id: 'alertZones',
      name: 'Zones d\'alerte',
      visible: true,
      opacity: 0.6,
      color: '#EF4444'
    },
    {
      id: 'agriculture',
      name: 'Zones agricoles',
      visible: false,
      opacity: 0.7,
      color: '#F59E0B'
    },
    {
      id: 'waterResources',
      name: 'Ressources en eau',
      visible: false,
      opacity: 0.8,
      color: '#06B6D4'
    }
  ]

  const mapLayers = layers.length > 0 ? layers : defaultLayers

  const handleZoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 1, 20))
  }

  const handleZoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 1, 1))
  }

  const handleLayerToggle = (layerId: string) => {
    const layer = mapLayers.find(l => l.id === layerId)
    if (layer) {
      layer.visible = !layer.visible
      setSelectedLayer(layerId)
    }
  }

  const handleFeatureClick = (feature: MapFeature) => {
    setSelectedFeature(feature)
    onFeatureClick?.(feature)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'administration': return '🏛️'
      case 'santé': return '🏥'
      case 'éducation': return '🏫'
      case 'marché': return '🏪'
      case 'eau': return '💧'
      case 'agriculture': return '🌾'
      default: return '📍'
    }
  }

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Carte simulée */}
      <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-green-50 to-blue-50">
        {/* Grille de la carte */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full border-t border-gray-300" style={{ top: `${i * 10}%` }} />
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full border-l border-gray-300" style={{ left: `${i * 10}%` }} />
          ))}
        </div>

        {/* Points d'intérêt simulés */}
        <div className="absolute inset-0 p-8">
          {/* Mairie */}
          <div 
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
            style={{ left: '50%', top: '50%' }}
            onClick={() => handleFeatureClick({
              id: 'mairie',
              type: 'Point',
              properties: { 
                name: 'Mairie de Blitta 2 Agbandi', 
                type: 'administration',
                address: 'Avenue principale',
                phone: '+228 XX XX XX XX',
                hours: 'Lun-Ven: 7h30-16h30'
              },
              geometry: { type: 'Point', coordinates: [0.7833, 8.8667] }
            })}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                🏛️
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow">
                Mairie
              </div>
            </div>
          </div>

          {/* Centre de santé */}
          <div 
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
            style={{ left: '35%', top: '40%' }}
            onClick={() => handleFeatureClick({
              id: 'centre-sante',
              type: 'Point',
              properties: { 
                name: 'Centre de santé principal', 
                type: 'santé',
                capacity: 150,
                services: ['Urgences', 'Maternité', 'Vaccination'],
                phone: '+228 XX XX XX XX'
              },
              geometry: { type: 'Point', coordinates: [0.775, 8.87] }
            })}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                🏥
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow">
                Centre de santé
              </div>
            </div>
          </div>

          {/* École */}
          <div 
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
            style={{ left: '65%', top: '35%' }}
            onClick={() => handleFeatureClick({
              id: 'ecole',
              type: 'Point',
              properties: { 
                name: 'École primaire centrale', 
                type: 'éducation',
                students: 400,
                classes: 8,
                director: 'M. Koné'
              },
              geometry: { type: 'Point', coordinates: [0.79, 8.86] }
            })}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                🏫
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow">
                École primaire
              </div>
            </div>
          </div>

          {/* Marché */}
          <div 
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
            style={{ left: '45%', top: '60%' }}
            onClick={() => handleFeatureClick({
              id: 'marche',
              type: 'Point',
              properties: { 
                name: 'Marché central', 
                type: 'marché',
                days: ['Lundi', 'Mercredi', 'Samedi'],
                stalls: 200,
                opening: '5h-18h'
              },
              geometry: { type: 'Point', coordinates: [0.78, 8.86] }
            })}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                🏪
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow">
                Marché
              </div>
            </div>
          </div>

          {/* Zone d'alerte inondation */}
          <div 
            className="absolute border-2 border-red-400 bg-red-200 bg-opacity-30 rounded-lg cursor-pointer hover:bg-opacity-50 transition-all"
            style={{ 
              left: '20%', 
              top: '70%', 
              width: '25%', 
              height: '20%' 
            }}
            onClick={() => handleFeatureClick({
              id: 'zone-inondation',
              type: 'Polygon',
              properties: { 
                name: 'Zone à risque d\'inondation', 
                alertType: 'flood',
                level: 'low',
                area: '12km²',
                population: 1500,
                description: 'Zone sud près du fleuve'
              },
              geometry: { 
                type: 'Polygon', 
                coordinates: [[0.76, 8.85], [0.78, 8.85], [0.78, 8.87], [0.76, 8.87], [0.76, 8.85]] 
              }
            })}
          >
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
              ⚠️ Zone inondation
            </div>
          </div>

          {/* Zone de sécheresse */}
          <div 
            className="absolute border-2 border-yellow-400 bg-yellow-200 bg-opacity-30 rounded-lg cursor-pointer hover:bg-opacity-50 transition-all"
            style={{ 
              left: '70%', 
              top: '20%', 
              width: '25%', 
              height: '25%' 
            }}
            onClick={() => handleFeatureClick({
              id: 'zone-secheresse',
              type: 'Polygon',
              properties: { 
                name: 'Zone de sécheresse', 
                alertType: 'drought',
                level: 'medium',
                area: '25km²',
                population: 3200,
                description: 'Zone agricole nord'
              },
              geometry: { 
                type: 'Polygon', 
                coordinates: [[0.79, 8.87], [0.82, 8.87], [0.82, 8.89], [0.79, 8.89], [0.79, 8.87]] 
              }
            })}
          >
            <div className="absolute top-2 left-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium">
              🌵 Zone sécheresse
            </div>
          </div>
        </div>

        {/* Contrôles de la carte */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom avant"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom arrière"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Plein écran"
          >
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Couches"
          >
            <Layers className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Informations"
          >
            <Info className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Panneau des couches */}
        {showLayerPanel && (
          <div className="absolute top-4 left-4 w-64 bg-white rounded-lg shadow-xl p-4 z-10">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Couches cartographiques
            </h3>
            <div className="space-y-2">
              {mapLayers.map((layer) => (
                <label key={layer.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => handleLayerToggle(layer.id)}
                    className="rounded text-green-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">{layer.name}</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${layer.opacity * 100}%`,
                          backgroundColor: layer.color 
                        }}
                      />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Panneau d'informations */}
        {showInfo && (
          <div className="absolute bottom-4 left-4 w-64 bg-white rounded-lg shadow-xl p-4 z-10">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Informations
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Centre:</span>
                <span className="font-medium">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Zoom:</span>
                <span className="font-medium">{currentZoom}</span>
              </div>
              <div className="flex justify-between">
                <span>Superficie:</span>
                <span className="font-medium">276 km²</span>
              </div>
              <div className="flex justify-between">
                <span>Population:</span>
                <span className="font-medium">12,450 hab.</span>
              </div>
              <div className="flex justify-between">
                <span>Densité:</span>
                <span className="font-medium">45 hab/km²</span>
              </div>
            </div>
          </div>
        )}

        {/* Popup de feature sélectionnée */}
        {selectedFeature && (
          <div className="absolute bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl p-4 z-10">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">{selectedFeature.properties.name}</h3>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {Object.entries(selectedFeature.properties).map(([key, value]) => {
                if (key === 'name') return null
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="font-medium text-gray-900">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Echelle de la carte */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-3 py-2">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <div className="w-16 h-1 bg-gray-800"></div>
            <span>{Math.round(1000 / currentZoom)} m</span>
          </div>
        </div>

        {/* Rose des vents */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2">
          <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-700">
            <div className="relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">N</div>
              <Navigation className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}