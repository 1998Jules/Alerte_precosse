'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { Layers, Maximize2, Info, MapPin, ChevronDown } from 'lucide-react'
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

/* ================= HELPERS FEATURE ================= */

/**
 * Récupère le nom d'une feature en testant plusieurs propriétés courantes.
 * Ordre adapté aux modèles Django fournis :
 *   - Cantons  : champ `canton`
 *   - Commune  : champ `commune`
 *   - Marchés  : `marche_nom`
 *   - Généric  : `nom`, `name`, `libelle`, ...
 */
function getFeatureName(feature: any, fallbackPrefix = 'Entité'): string {
  if (!feature?.properties) return fallbackPrefix
  const p = feature.properties
  return (
    p.canton ||          // modèle Cantons
    p.commune ||         // modèle Commune
    p.marche_nom ||      // modèle marche
    p.nom ||
    p.name ||
    p.libelle ||
    p.label ||
    p.commune_nom ||
    p.nom_commune ||
    p.canton_nom ||
    p.nom_canton ||
    p.denomination ||
    fallbackPrefix
  )
}

/**
 * Récupère un identifiant stable pour une feature.
 * Pour les cantons : `gid` (clé primaire) puis `code_canto`.
 */
function getFeatureId(feature: any, idx: number): string {
  if (!feature?.properties) return String(idx)
  const p = feature.properties
  return String(
    p.gid ||            // PK Cantons
    p.id ||
    p.code_canto ||     // code canton
    p.code ||
    p.code_insee ||
    p.code_commune ||
    p.osm_id ||
    idx
  )
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

/* ================= ZOOM TO FEATURE ================= */
// ✅ Zoome automatiquement sur l'entité sélectionnée

function ZoomToFeature({ feature }: { feature: MapFeature | null }) {
  const map = useMap()

  useEffect(() => {
    if (!feature?.geometry) return

    const geom = feature.geometry

    try {
      if (geom.type === 'Point') {
        const [lng, lat] = geom.coordinates
        map.setView([lat, lng], 17, { animate: true, duration: 1.5 })
      }
      else if (geom.type === 'LineString') {
        const latlngs = geom.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
        const bounds = L.latLngBounds(latlngs as any)
        map.fitBounds(bounds, { padding: [50, 50], animate: true })
      }
      else if (geom.type === 'MultiLineString') {
        const latlngs = geom.coordinates.flat().map(([lng, lat]: [number, number]) => [lat, lng])
        const bounds = L.latLngBounds(latlngs as any)
        map.fitBounds(bounds, { padding: [50, 50], animate: true })
      }
      else if (geom.type === 'Polygon') {
        const latlngs = geom.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng])
        const bounds = L.latLngBounds(latlngs as any)
        map.fitBounds(bounds, { padding: [50, 50], animate: true })
      }
      else if (geom.type === 'MultiPolygon') {
        const latlngs = geom.coordinates.flat(2).map(([lng, lat]: [number, number]) => [lat, lng])
        const bounds = L.latLngBounds(latlngs as any)
        map.fitBounds(bounds, { padding: [50, 50], animate: true })
      }
    } catch (e) {
      console.error('Erreur zoom:', e)
    }
  }, [feature, map])

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
  selectedFeature?: MapFeature | null
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
  selectedFeature,
  className = ''
}: Props) {

  const [basemap, setBasemap] = useState<keyof typeof BASEMAPS>('osm')
  const [showBasemaps, setShowBasemaps] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // ✅ État pour le sélecteur de cantons
  const [showCantons, setShowCantons] = useState(false)
  const [selectedCantonId, setSelectedCantonId] = useState<string>('')

  // ✅ Ferme les autres panneaux quand on en ouvre un
  const openCantonsPanel = (open: boolean) => {
    setShowCantons(open)
    if (open) {
      setShowBasemaps(false)
      setShowInfo(false)
    }
  }
  const openBasemapsPanel = (open: boolean) => {
    setShowBasemaps(open)
    if (open) {
      setShowCantons(false)
      setShowInfo(false)
    }
  }
  const openInfoPanel = (open: boolean) => {
    setShowInfo(open)
    if (open) {
      setShowCantons(false)
      setShowBasemaps(false)
    }
  }

  const pointLayers = layers.filter(l => l.visible && l.data && l.type === 'point')
  const otherLayers = layers.filter(l => l.visible && l.data && l.type !== 'point')

  /* ---------- Liste des cantons (peu importe visibilité) ---------- */
  const cantonsLayer = useMemo(
    () => layers.find(l => l.id === 'cantons' && l.data?.features?.length),
    [layers]
  )

  const cantonOptions = useMemo(() => {
    if (!cantonsLayer?.data?.features) return []
    return cantonsLayer.data.features
      .map((f, idx) => ({
        id: getFeatureId(f, idx),
        name: getFeatureName(f, `Canton ${idx + 1}`),
        feature: f
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }, [cantonsLayer])

  /* ---------- Handler sélection canton (dropdown) ---------- */
  const handleCantonChange = (id: string) => {
    setSelectedCantonId(id)
    const canton = cantonOptions.find(c => c.id === id)
    if (canton && onFeatureClick) {
      // ✅ Déclenche le zoom via ZoomToFeature
      onFeatureClick(canton.feature)
    }
  }

  /* ---------- Synchroniser le dropdown quand une feature est sélectionnée
               (par clic sur la carte, recherche, etc.) ---------- */
  useEffect(() => {
    if (!selectedFeature?.properties) return
    // On ne synchronise que si c'est un canton
    const id = getFeatureId(selectedFeature, -1)
    const name = getFeatureName(selectedFeature, '')
    // Vérifier que c'est bien un canton (id présent dans la liste)
    if (cantonOptions.some(c => c.id === id) || cantonOptions.some(c => c.name === name && name)) {
      const matched = cantonOptions.find(c => c.id === id) ||
                      cantonOptions.find(c => c.name === name)
      if (matched && matched.id !== selectedCantonId) {
        setSelectedCantonId(matched.id)
      }
    }
  }, [selectedFeature, cantonOptions, selectedCantonId])

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>

      {/* ✅ Styles pour les étiquettes des cantons */}
      <style>{`
        .canton-label-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          color: #1e3a8a !important;
          text-shadow:
            -1px -1px 0 #fff,
             1px -1px 0 #fff,
            -1px  1px 0 #fff,
             1px  1px 0 #fff,
             0 0 4px #fff;
          padding: 0 !important;
        }
        .canton-label-tooltip::before {
          display: none !important;
        }
      `}</style>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="w-full h-full min-h-[400px]"
      >
        <MapUpdater center={center} zoom={zoom} />

        {/* ✅ Zoom automatique sur l'entité sélectionnée */}
        <ZoomToFeature feature={selectedFeature || null} />

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

                if (routeType === 'Route nationale revêtue') {
                  return { color: '#ff0000', weight: 6, opacity: 1 };
                }

                if (routeType === 'Piste rurale') {
                  return {
                    color: '#3d2525',
                    weight: 2,
                    opacity: 1,
                    dashArray: '6,4'
                  };
                }

                return {
                  color: layer.color,
                  weight: 3,
                  opacity: layer.opacity
                };
              }

              /* ================= POLYGONES ================= */
              if (layer.type === 'polygon') {
                if (layer.id === 'communes') {
                  return { color: '#000000', weight: 2, fill: false, fillOpacity: 0 };
                }
                if (layer.id === 'cantons') {
                  // ✅ Mettre en évidence le canton sélectionné
                  const featId = getFeatureId(feature, -1)
                  const featName = getFeatureName(feature, '')
                  const isSelected =
                    (selectedCantonId && featId === selectedCantonId) ||
                    (selectedCantonId && cantonOptions.find(c => c.id === selectedCantonId)?.name === featName)
                  if (isSelected) {
                    return {
                      color: '#2563eb',
                      weight: 5,
                      fillColor: '#3b82f6',
                      fillOpacity: 0.25
                    }
                  }
                  return { color: '#000000', weight: 4, fill: false, fillOpacity: 0 };
                }
                if (layer.id === 'terrains') {
                  return {
                    color: '#006400',
                    weight: 2,
                    fillColor: '#00cc44',
                    fillOpacity: 0.7
                  };
                }
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
                // ✅ Ouvrir le popup après le zoom
                setTimeout(() => leafletLayer.openPopup(), 400)
              })

              /* ✅ ÉTIQUETTE PERMANENTE DES CANTONS */
              if (layer.id === 'cantons') {
                const cantonName = getFeatureName(feature, '')
                if (cantonName) {
                  leafletLayer.bindTooltip(cantonName, {
                    permanent: true,
                    direction: 'center',
                    className: 'canton-label-tooltip'
                  })
                }
              }

              if (feature.properties) {
                // ✅ Popup enrichi pour les cantons et communes
                if (layer.id === 'cantons' || layer.id === 'communes') {
                  const nom = getFeatureName(feature, layer.name)
                  leafletLayer.bindPopup(
                    `<strong>${layer.name}</strong><br/>
                    <b>${nom}</b>`
                  )
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
                    // ✅ Ouvrir le popup après le zoom
                    setTimeout(() => leafletLayer.openPopup(), 400)
                  })

                  if (feature.properties) {

                    if (layer.id === 'marches') {
                      const nom = feature.properties.marche_nom || 'Marché';
                      const canton = feature.properties.canton_nom || feature.properties.canton || '';
                      const jour = feature.properties.jour || '';
                      const photo = feature.properties.photo_url
                        ? feature.properties.photo_url
                        : 'http://127.0.0.1:8000/media/marches/caption.jpg';

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
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
          title="Plein écran"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => openBasemapsPanel(!showBasemaps)}
          className={`w-10 h-10 rounded-lg shadow flex items-center justify-center hover:bg-gray-50 ${
            showBasemaps ? 'bg-blue-600 text-white' : 'bg-white'
          }`}
          title="Fonds de carte"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* ✅ Bouton sélecteur de cantons */}
        <button
          onClick={() => openCantonsPanel(!showCantons)}
          className={`w-10 h-10 rounded-lg shadow flex items-center justify-center hover:bg-gray-50 ${
            showCantons || selectedCantonId ? 'bg-blue-600 text-white' : 'bg-white'
          }`}
          title="Sélectionner un canton"
        >
          <MapPin className="w-5 h-5" />
        </button>

        <button
          onClick={() => openInfoPanel(!showInfo)}
          className={`w-10 h-10 rounded-lg shadow flex items-center justify-center hover:bg-gray-50 ${
            showInfo ? 'bg-blue-600 text-white' : 'bg-white'
          }`}
          title="Informations"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* ✅ PANNEAU SÉLECTEUR DE CANTONS */}
      {showCantons && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] w-72">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Sélectionner un canton</h3>
            <button
              onClick={() => setShowCantons(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              title="Fermer"
            >
              ×
            </button>
          </div>

          {cantonOptions.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">
              Aucun canton disponible. Veuillez charger la couche « Cantons ».
            </div>
          ) : (
            <>
              <div className="relative">
                <select
                  value={selectedCantonId}
                  onChange={(e) => handleCantonChange(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Choisir un canton —</option>
                  {cantonOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {selectedCantonId && (
                <div className="mt-3 text-xs text-gray-600">
                  Canton sélectionné :{' '}
                  <span className="font-semibold text-gray-900">
                    {cantonOptions.find(c => c.id === selectedCantonId)?.name}
                  </span>
                </div>
              )}

              <div className="mt-2 text-xs text-gray-400">
                {cantonOptions.length} canton(s) disponible(s) — cliquez aussi directement sur la carte
              </div>
            </>
          )}
        </div>
      )}

      {showBasemaps && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] w-64">
          <h3 className="font-semibold mb-3">Fonds de carte</h3>
          {Object.entries(BASEMAPS).map(([key, bm]) => (
            <label key={key} className="flex items-center space-x-2 text-sm cursor-pointer mb-2">
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
          <div className="font-semibold mb-2">Informations carte</div>
          <div>Zoom: {zoom}</div>
          <div>Couches visibles: {layers.filter(l => l.visible).length}</div>
          <div>Total entités: {layers
            .filter(l => l.visible)
            .reduce((acc, l) => acc + (l.data?.features?.length || 0), 0)}
          </div>
          <div>Cantons: {cantonOptions.length}</div>
        </div>
      )}

    </div>
  )
}
