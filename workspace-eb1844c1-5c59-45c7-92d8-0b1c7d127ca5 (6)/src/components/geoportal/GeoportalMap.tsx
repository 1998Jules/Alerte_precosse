'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Layers, Maximize2, Info } from 'lucide-react'
import { useMap } from 'react-leaflet'

/* ================= LEAFLET (NO SSR) ================= */

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

/* ================= MAP UPDATER ================= */

function MapUpdater({
  center,
  zoom
}: {
  center: { lat: number; lng: number }
  zoom: number
}) {
  const map = useMap()

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom)
  }, [center, zoom, map])

  return null
}

/* ================= TYPES ================= */

export interface MapFeature {
  type: 'Feature'
  geometry: {
    type: 'Point' | 'Polygon' | 'MultiPolygon' | 'LineString' | 'MultiLineString'
    coordinates: any
  }
  properties: Record<string, any>
}

export interface MapLayer {
  id: string
  name: string
  visible: boolean
  opacity: number
  color: string
  data?: {
    type: 'FeatureCollection'
    features: MapFeature[]
  }
}

interface GeoportalMapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  layers?: MapLayer[]
  onFeatureClick?: (feature: MapFeature) => void
  className?: string
}

/* ================= BASEMAPS ================= */

const BASEMAPS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap'
  },
  satellite: {
    name: 'Satellite (ESRI)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri'
  },
  topo: {
    name: 'Topographique',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap'
  },
  dark: {
    name: 'CartoDB Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB'
  },
  toner: {
    name: 'Toner (NB)',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
    attribution: '© Stamen Design'
  },
  osmfr: {
    name: 'OSM France',
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap France'
  },
  watercolor: {
    name: 'Aquarelle',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
    attribution: '© Stamen Design'
  },
  humanitarian: {
    name: 'Humanitaire',
    url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '© Humanitarian OpenStreetMap Team'
  }
}

/* ================= COMPOSANT ================= */

export default function GeoportalMap({
  center = { lat: 8.3201, lng: 1.04757 }, // Blitta
  zoom = 9,
  layers = [],
  onFeatureClick,
  className = ''
}: GeoportalMapProps) {
  const [basemap, setBasemap] =
    useState<keyof typeof BASEMAPS>('osm')
  const [showBasemaps, setShowBasemaps] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* ================= MAP ================= */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="w-full h-full min-h-[400px]"
      >
        {/* recentrage dynamique */}
        <MapUpdater center={center} zoom={zoom} />

        <TileLayer
          url={BASEMAPS[basemap].url}
          attribution={BASEMAPS[basemap].attribution}
        />

        {/* ================= GEOJSON ================= */}
        {layers
          .filter(layer => layer.visible && layer.data)
          .map(layer => (
            <GeoJSON
              key={layer.id}
              data={layer.data as any}
              style={() => ({
                color: layer.color,
                weight: 2,
                fillOpacity: layer.opacity
              })}
              onEachFeature={(feature, leafletLayer) => {
                leafletLayer.on('click', () => {
                  onFeatureClick?.(feature as MapFeature)
                })
                
                // Ajouter un popup avec les propriétés
                if (feature.properties) {
                  const popupContent = Object.entries(feature.properties)
                    .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                    .join('<br/>')
                  leafletLayer.bindPopup(popupContent)
                }
              }}
            />
          ))}
      </MapContainer>

      {/* ================= CONTROLS ================= */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Plein écran"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowBasemaps(!showBasemaps)}
          className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Changer de fond de carte"
        >
          <Layers className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Informations"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* ================= BASEMAP SWITCHER ================= */}
      {showBasemaps && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] w-64 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-3 text-gray-900">Fonds de carte</h3>
          <div className="space-y-2">
            {Object.entries(BASEMAPS).map(([key, bm]) => (
              <label
                key={key}
                className="flex items-center space-x-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="radio"
                  name="basemap"
                  checked={basemap === key}
                  onChange={() => setBasemap(key as any)}
                  className="text-green-600"
                />
                <span>{bm.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ================= INFO PANEL ================= */}
      {showInfo && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] text-sm w-64">
          <h3 className="font-semibold mb-2 text-gray-900">Informations carte</h3>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Centre:</span>
              <span className="font-mono text-xs">
                {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Zoom:</span>
              <span>{zoom}</span>
            </div>
            <div className="flex justify-between">
              <span>Couches:</span>
              <span>{layers.filter(l => l.visible).length}/{layers.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}