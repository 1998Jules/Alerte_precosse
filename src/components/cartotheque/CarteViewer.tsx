// src/components/cartotheque/CarteViewer.tsx
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  X, MapPin, Maximize2, Layers, Info, Calendar, User,
  Tag, ExternalLink, Loader2,
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { useLanguage } from '@/app/contexts/LanguageContext'

// Dynamic imports pour Leaflet (SSR désactivé)
const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
)
const GeoJSON = dynamic(
  () => import('react-leaflet').then(m => m.GeoJSON),
  { ssr: false }
)
const MarkerClusterGroup = dynamic(
  () => import('react-leaflet-cluster'),
  { ssr: false }
)

// Fond de carte
const BASEMAPS: Record<string, { name: string; url: string; attribution: string }> = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
  },
  satellite: {
    name: 'Satellite (ESRI)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  dark: {
    name: 'CartoDB Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB',
  },
}

// Config des couches pour les icônes
const LAYER_ICON_MAP: Record<string, { color: string; iconUrl: string | null }> = {
  hopitaux: { color: '#DC143C', iconUrl: '/icone/hopital.png' },
  jardins: { color: '#96CEB4', iconUrl: '/icone/jardin.png' },
  colleges: { color: '#87CEEB', iconUrl: '/icone/college.png' },
  lycees: { color: '#4682B4', iconUrl: '/icone/lycee.png' },
  peas: { color: '#0077BE', iconUrl: '/icone/pea.png' },
  bornefontaines: { color: '#20B2AA', iconUrl: '/icone/bornefontaine.png' },
  marches: { color: '#FFA07A', iconUrl: '/icone/marche.png' },
  chateaux: { color: '#DDA0DD', iconUrl: '/icone/chateau.png' },
  cantons: { color: '#FF6B6B', iconUrl: null },
  communes: { color: '#4ECDC4', iconUrl: null },
  routes: { color: '#45B7D1', iconUrl: null },
  terrains: { color: '#387c38', iconUrl: null },
  cooperatives: { color: '#FF8C00', iconUrl: null },
  magasins: { color: '#9370DB', iconUrl: null },
}

interface CarteTheematique {
  id: number
  titre: string
  description: string
  domaine_nom?: string | null
  domaine_couleur?: string | null
  domaine_icone?: string | null
  type_carte: string
  auteur: string
  source: string
  mots_cles: string
  date_creation: string
  geojson_url?: string
  geojson_file_url?: string
  couches_associees?: string[]
  centre_lat?: number
  centre_lng?: number
  zoom_default?: number
  fond_carte?: string
}

interface CarteViewerProps {
  carte: CarteTheematique
  open: boolean
  onClose: () => void
}

export default function CarteViewer({ carte, open, onClose }: CarteViewerProps) {
  const { t } = useLanguage()
  const [basemap, setBasemap] = useState<string>(carte.fond_carte || 'osm')
  const [loadingGeojson, setLoadingGeojson] = useState(false)
  const [geojsonData, setGeojsonData] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showBasemapPanel, setShowBasemapPanel] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(true)

  // Charger les données GeoJSON
  useEffect(() => {
    if (!open) return

    const loadGeojsonData = async () => {
      setLoadingGeojson(true)
      try {
        // Si la carte a des couches associées, on charge depuis l'API géoportail
        if (carte.couches_associees && carte.couches_associees.length > 0) {
          const res = await fetch('/api/geoportal')
          const data = await res.json()

          if (data.success && data.layers) {
            // Filtrer uniquement les couches associées à cette carte
            const layersObj = data.layers
            let allFeatures: any[] = []

            // Handle both array and object formats
            if (Array.isArray(layersObj)) {
              for (const layer of layersObj) {
                if (carte.couches_associees.includes(layer.id) && layer.data?.features) {
                  allFeatures = [...allFeatures, ...layer.data.features]
                }
              }
            } else if (typeof layersObj === 'object') {
              for (const [key, layer] of Object.entries(layersObj)) {
                if (carte.couches_associees.includes(key) && (layer as any)?.data?.features) {
                  allFeatures = [...allFeatures, ...(layer as any).data.features]
                }
              }
            }

            setGeojsonData({
              type: 'FeatureCollection',
              features: allFeatures,
            })
          }
        }
        // Si la carte a une URL GeoJSON externe
        else if (carte.geojson_url) {
          try {
            const res = await fetch(carte.geojson_url)
            const data = await res.json()
            setGeojsonData(data)
          } catch {
            // Si CORS bloque, essayer via le proxy Next.js
            const res = await fetch(`/api/geoportal`)
            const data = await res.json()
            if (data.layers) {
              const layersObj = data.layers
              let allFeatures: any[] = []
              if (typeof layersObj === 'object' && !Array.isArray(layersObj)) {
                allFeatures = Object.values(layersObj).flatMap((l: any) => l.data?.features || [])
              }
              setGeojsonData({ type: 'FeatureCollection', features: allFeatures })
            }
          }
        }
        // Si la carte a un fichier GeoJSON
        else if (carte.geojson_file_url) {
          const res = await fetch(carte.geojson_file_url)
          const data = await res.json()
          setGeojsonData(data)
        }
      } catch (err) {
        console.error('Erreur chargement GeoJSON:', err)
      } finally {
        setLoadingGeojson(false)
      }
    }

    loadGeojsonData()
  }, [open, carte])

  // Réinitialiser à la fermeture
  useEffect(() => {
    if (!open) {
      setGeojsonData(null)
      setIsFullscreen(false)
    }
  }, [open])

  const center = {
    lat: carte.centre_lat || 8.20150,
    lng: carte.centre_lng || 1.16599,
  }
  const zoom = carte.zoom_default || 12

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${isFullscreen ? 'max-w-full w-full h-screen' : 'max-w-6xl'} p-0 gap-0 overflow-hidden`}>
        <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[80vh]'}`}>
          {/* Panneau latéral d'informations */}
          {showInfoPanel && (
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 p-6">
              {/* En-tête */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 pr-2">{carte.titre}</h2>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Domaine */}
              {carte.domaine_nom && (
                <Badge
                  className="mb-4"
                  style={{
                    backgroundColor: `${carte.domaine_couleur || '#10b981'}20`,
                    color: carte.domaine_couleur || '#10b981',
                    borderColor: `${carte.domaine_couleur || '#10b981'}40`,
                  }}
                >
                  {carte.domaine_nom}
                </Badge>
              )}

              {/* Description */}
              <div className="mb-4">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('cartotheque.detail.description')}
                </Label>
                <p className="text-sm text-gray-700 mt-1">
                  {carte.description || t('cartotheque.no.description')}
                </p>
              </div>

              {/* Métadonnées */}
              <div className="space-y-3 mb-4">
                {carte.auteur && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{carte.auteur}</span>
                  </div>
                )}
                {carte.source && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{carte.source}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(carte.date_creation).toLocaleDateString('fr-FR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
                {carte.mots_cles && (
                  <div className="flex items-start gap-2 text-sm">
                    <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {carte.mots_cles.split(',').map((mot, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{mot.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Couches associées */}
              {carte.couches_associees && carte.couches_associees.length > 0 && (
                <div className="mb-4">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('cartotheque.detail.layers')}
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {carte.couches_associees.map((couche) => {
                      const config = LAYER_ICON_MAP[couche]
                      return (
                        <Badge
                          key={couche}
                          variant="secondary"
                          className="text-xs"
                          style={config ? {
                            backgroundColor: `${config.color}20`,
                            color: config.color,
                          } : {}}
                        >
                          {couche}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Type de carte */}
              <div className="mb-4">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('cartotheque.detail.type')}
                </Label>
                <p className="text-sm text-gray-700 mt-1 capitalize">
                  {carte.type_carte === 'dynamique' ? t('cartotheque.type.dynamic') :
                   carte.type_carte === 'url_externe' ? t('cartotheque.type.external') :
                   carte.type_carte === 'fichier' ? t('cartotheque.type.file') :
                   t('cartotheque.type.empty')}
                </p>
              </div>

              {/* Statistiques */}
              {geojsonData && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">
                    {geojsonData.features?.length || 0} {t('cartotheque.detail.features')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Zone de la carte */}
          <div className="flex-1 relative">
            {loadingGeojson ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600">{t('cartotheque.loading.map')}</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={[center.lat, center.lng]}
                zoom={zoom}
                className="w-full h-full"
                style={{ minHeight: '400px' }}
              >
                <TileLayer
                  url={BASEMAPS[basemap]?.url || BASEMAPS.osm.url}
                  attribution={BASEMAPS[basemap]?.attribution || BASEMAPS.osm.attribution}
                />

                {/* Affichage des données GeoJSON */}
                {geojsonData && geojsonData.features && geojsonData.features.length > 0 && (
                  <GeoJSON
                    key={JSON.stringify(geojsonData).slice(0, 50)}
                    data={geojsonData}
                    style={() => ({
                      color: carte.domaine_couleur || '#10b981',
                      weight: 2,
                      fillColor: carte.domaine_couleur || '#10b981',
                      fillOpacity: 0.3,
                    })}
                    pointToLayer={(feature, latlng) => {
                      // Utiliser les icônes personnalisées si disponibles
                      const coucheId = carte.couches_associees?.[0] || ''
                      const config = LAYER_ICON_MAP[coucheId]
                      const L = require('leaflet')

                      if (config?.iconUrl) {
                        return L.marker(latlng, {
                          icon: L.divIcon({
                            html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
                              <img src="${config.iconUrl}" alt="icon" style="width:24px;height:24px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2));"/>
                            </div>`,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                            className: '',
                          }),
                        })
                      }

                      return L.marker(latlng, {
                        icon: L.divIcon({
                          html: `<div style="width:16px;height:16px;background:${config?.color || carte.domaine_couleur || '#10b981'};border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>`,
                          iconSize: [20, 20],
                          iconAnchor: [10, 10],
                          className: '',
                        }),
                      })
                    }}
                    onEachFeature={(feature, layer) => {
                      if (feature.properties) {
                        const props = Object.entries(feature.properties)
                          .filter(([k]) => !['geom', 'geometry'].includes(k))
                          .map(([k, v]) => `<b>${k}:</b> ${v}`)
                          .join('<br/>')
                        layer.bindPopup(`<div style="max-width:250px">${props}</div>`)
                      }
                    }}
                  />
                )}
              </MapContainer>
            )}

            {/* Contrôles de la carte */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowBasemapPanel(!showBasemapPanel)}
                className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
              >
                <Layers className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowInfoPanel(!showInfoPanel)}
                className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>

            {/* Sélecteur de fond de carte */}
            {showBasemapPanel && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] w-48">
                <h3 className="font-semibold text-sm mb-2">{t('cartotheque.detail.basemap')}</h3>
                {Object.entries(BASEMAPS).map(([key, bm]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                    <input
                      type="radio"
                      checked={basemap === key}
                      onChange={() => setBasemap(key)}
                    />
                    <span>{bm.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
