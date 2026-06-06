'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { Layers, Maximize2, Info } from 'lucide-react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

/* ================= ICON CACHE ================= */

const iconCache = new Map<string, L.DivIcon>()

const createSimpleIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div style="
        width:16px;
        height:16px;
        background:${color};
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 0 4px rgba(0,0,0,0.4);
      "></div>
    `,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

const createCustomIcon = (iconUrl: string, color?: string) => {
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img 
          src="${iconUrl}" 
          alt="icon"
          style="width: 24px; height: 24px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));"
        />
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: 'custom-icon-marker'
  })
}

const getCachedIcon = (iconUrl: string | undefined, color: string) => {
  const key = iconUrl ? `custom-${iconUrl}` : `simple-${color}`

  if (!iconCache.has(key)) {
    iconCache.set(
      key,
      iconUrl ? createCustomIcon(iconUrl, color) : createSimpleIcon(color)
    )
  }

  return iconCache.get(key)!
}

/* ================= DYNAMIC IMPORTS ================= */

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
  type?: 'point' | 'polygon' | 'line'
  iconUrl?: string
  data?: {
    type: 'FeatureCollection'
    features: MapFeature[]
  }
}

interface Props {
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
  dark: {
    name: 'CartoDB Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB'
  }
}

/* ================= COMPONENT ================= */

export default function GeoPortalMap({
  center = { lat: 8.2015, lng: 1.16599 },
  zoom = 12,
  layers = [],
  onFeatureClick,
  className = ''
}: Props) {

  const [basemap, setBasemap] = useState<keyof typeof BASEMAPS>('osm')
  const [showBasemaps, setShowBasemaps] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const pointLayers = layers.filter(l => l.visible && l.data && l.type === 'point')
  const otherLayers = layers.filter(l => l.visible && l.data && l.type !== 'point')

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="w-full h-full min-h-[400px]"
      >
        <MapUpdater center={center} zoom={zoom} />

        <TileLayer
          url={BASEMAPS[basemap].url}
          attribution={BASEMAPS[basemap].attribution}
        />

        {/* ===== POLYGONES & LIGNES ===== */}
        {otherLayers.map(layer => (
          <GeoJSON
            key={layer.id}
            data={layer.data as any}
            style={(feature: any) => {

  /* ================= ROUTES ================= */
  if (layer.type === 'line') {

    const routeType = feature?.properties?.route_type;

    // 🔴 Route nationale revêtue → rouge épais
    if (routeType === 'Route nationale revêtue') {
      return {
        color: '#ff0000',
        weight: 6,
        opacity: 1
      };
    }

    // 🔴⚫ Piste rurale → rouge/noir ligne fine
    if (routeType === 'Piste rurale') {
      return {
        color: '#ece9e9',
        weight: 2,
        opacity: 1,
       
      };
    }

    // ✅ AUTRES ROUTES → on garde TA couleur
    return {
      color: layer.color,
      weight: 3,
      opacity: layer.opacity
    };
  }

  /* ================= POLYGONES ================= */
  if (layer.type === 'polygon') {

    if (layer.id === 'communes') {
      return {
        color: '#000000',
        weight: 2,
        fill: false,
        fillOpacity: 0
      };
    }

    if (layer.id === 'cantons') {
      return {
        color: '#000000',
        weight: 4,
        fill: false,
        fillOpacity: 0
      };
    }

    if (layer.id === 'terrains') {
      return {
        color: '#006400',
        weight: 2,
        fillColor: '#00cc44',
        fillOpacity: 0.7
      };
    }

    // ✅ AUTRES POLYGONES → on garde TA couleur
    return {
      color: layer.color,
      weight: 2,
      fillColor: layer.color,
      fillOpacity: layer.opacity * 0.5
    };
  }

  /* ================= DEFAULT ================= */
  return {
    color: layer.color,
    weight: 1,
    fillOpacity: 0
  };
}}

            onEachFeature={(feature, leafletLayer) => {
              leafletLayer.on('click', () => {
                onFeatureClick?.(feature as MapFeature)
              })

              if (feature.properties) {
                leafletLayer.bindPopup(
                  `<strong>${layer.name}</strong><br/>
                  ${Object.entries(feature.properties)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join('<br/>')}`
                )
              }
            }}
          />
        ))}

        {/* ===== POINTS CLUSTERISÉS ===== */}
        {pointLayers.length > 0 && (
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            maxClusterRadius={50}
          >
            {pointLayers.map(layer => (
              <GeoJSON
                key={layer.id}
                data={layer.data as any}
                pointToLayer={(feature, latlng) =>
                  L.marker(latlng, {
                    icon: getCachedIcon(layer.iconUrl, layer.color),
                    zIndexOffset: 1000
                  })
                }
                onEachFeature={(feature, leafletLayer) => {
                  leafletLayer.on('click', () => {
                    onFeatureClick?.(feature as MapFeature)
                  })

                  if (feature.properties) {

 if (layer.id === 'marches') {
  console.log('Photo URL reçue:', feature.properties.photo_url);
console.log('Marché:', feature.properties.marche_nom);
console.log('Objet complet:', feature.properties);
      const nom = feature.properties.marche_nom || 'Marché';
      const canton = feature.properties.canton_nom || '';
      const jour = feature.properties.jour || '';
      console.log(feature.properties.photo_url);
      const photo = feature.properties.photo_url 
              ? feature.properties.photo_url 
              : 'http://127.0.0.1:8000/media/marches/caption.jpg'; // URL absolue déjà fournie

      leafletLayer.bindPopup(`
        <div style="width:220px">
          <h3 style="font-weight:bold;font-size:16px;margin-bottom:6px">${nom}</h3>

          <img src="${photo}" 
               style="width:100%;border-radius:6px;margin-bottom:6px"/>

          <div><b>Canton:</b> ${canton}</div>
          <div><b>Jour de marché:</b> ${jour}</div>
        </div>
      `);
    } else {

    leafletLayer.bindPopup(
      `<strong>${layer.name}</strong><br/>
      ${Object.entries(feature.properties)
        .map(([k, v]) => `${k}: ${v}`)
        .join('<br/>')}`
    )

  }
}
                }}
              />
            ))}
          </MarkerClusterGroup>
        )}

      </MapContainer>

      {/* ===== CONTROLS ===== */}
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

      {showBasemaps && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] w-64">
          <h3 className="font-semibold mb-3">Fonds de carte</h3>
          {Object.entries(BASEMAPS).map(([key, bm]) => (
            <label key={key} className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="radio"
                checked={basemap === key}
                onChange={() => setBasemap(key as any)}
              />
              <span>{bm.name}</span>
            </label>
          ))}
        </div>
      )}

      {showInfo && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] text-sm w-64">
          <div>Zoom: {zoom}</div>
          <div>Couches visibles: {layers.filter(l => l.visible).length}</div>
        </div>
      )}

    </div>
  )
}
