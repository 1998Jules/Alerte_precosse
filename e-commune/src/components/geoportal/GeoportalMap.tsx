'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Layers, Maximize2, Info } from 'lucide-react'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import('react-leaflet').then(m => m.GeoJSON), { ssr: false })

interface MapFeature {
  type: 'Feature'
  geometry: { type: 'Point' | 'Polygon' | 'LineString'; coordinates: any }
  properties: Record<string, any>
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

const BASEMAPS = {
  osm: { name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap' },
  satellite: { name: 'Satellite (ESRI)', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '© Esri' },
  topo: { name: 'Topographique', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '© OpenTopoMap' },
  dark: { name: 'CartoDB Sombre', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '© CartoDB' }
}

export default function GeoportalMap({
  center = { lat: 8.32010, lng: 1.04757 },
  zoom = 9,
  layers = [],
  onFeatureClick,
  className = ''
}: GeoportalMapProps) {

  const mapRef = useRef<any>(null)

  const [basemap, setBasemap] = useState<keyof typeof BASEMAPS>('osm')
  const [showBasemaps, setShowBasemaps] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Forcer le centrage exact
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], zoom)
    }
  }, [center, zoom])

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <MapContainer
        whenCreated={map => (mapRef.current = map)}
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="w-full h-full min-h-[400px]"
      >
        <TileLayer url={BASEMAPS[basemap].url} attribution={BASEMAPS[basemap].attribution} />

        {layers.filter(l => l.visible && l.data).map(layer => (
          <GeoJSON
            key={layer.id}
            data={{
              type: 'FeatureCollection',
              features: layer.data?.map(f => {
                // Inverser coords pour Leaflet si point
                if (f.geometry.type === 'Point') {
                  return { ...f, geometry: { ...f.geometry, coordinates: [f.geometry.coordinates[1], f.geometry.coordinates[0]] } }
                }
                // Pour Polygon / LineString, inverser chaque coordonnée
                if (f.geometry.type === 'Polygon') {
                  return { ...f, geometry: { ...f.geometry, coordinates: f.geometry.coordinates.map(ring => ring.map(c => [c[1], c[0]])) } }
                }
                if (f.geometry.type === 'LineString') {
                  return { ...f, geometry: { ...f.geometry, coordinates: f.geometry.coordinates.map(c => [c[1], c[0]]) } }
                }
                return f
              }) ?? []
            }}
            style={{ color: layer.color, weight: 2, fillOpacity: layer.opacity }}
            onEachFeature={(feature, leafletLayer) => {
              leafletLayer.on('click', () => onFeatureClick?.(feature as any))
            }}
          />
        ))}
      </MapContainer>

      {/* BOUTONS */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center">
          <Maximize2 className="w-5 h-5" />
        </button>
        <button onClick={() => setShowBasemaps(!showBasemaps)} className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center">
          <Layers className="w-5 h-5" />
        </button>
        <button onClick={() => setShowInfo(!showInfo)} className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center">
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* SWITCHER BASEMAP */}
      {showBasemaps && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] w-64">
          <h3 className="font-semibold mb-2">Fonds de carte</h3>
          {Object.entries(BASEMAPS).map(([key, bm]) => (
            <label key={key} className="flex items-center space-x-2 text-sm">
              <input type="radio" name="basemap" checked={basemap === key} onChange={() => setBasemap(key as any)} />
              <span>{bm.name}</span>
            </label>
          ))}
        </div>
      )}

      {/* INFO PANEL */}
      {showInfo && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] text-sm w-64">
          <div className="flex justify-between"><span>Centre</span><span>{center.lat}, {center.lng}</span></div>
          <div className="flex justify-between"><span>Zoom</span><span>{zoom}</span></div>
        </div>
      )}
    </div>
  )
}
