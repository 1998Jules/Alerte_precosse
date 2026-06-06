'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface CarteLeafletMapProps {
  centre: [number, number]
  zoom: number
  fondCarte: string
  geojsonData: any
  domaineCouleur: string
}

const basemaps: Record<string, L.TileLayer> = {
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }),
  satellite: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '&copy; Esri', maxZoom: 18 }
  ),
  dark: L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { attribution: '&copy; CartoDB', maxZoom: 19 }
  ),
}

export default function CarteLeafletMap({ centre, zoom, fondCarte, geojsonData, domaineCouleur }: CarteLeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    const map = L.map(mapRef.current, { center: centre, zoom: zoom, zoomControl: true })
    const basemap = basemaps[fondCarte] || basemaps.osm
    basemap.addTo(map)
    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current
    map.eachLayer((layer) => { if (layer instanceof L.TileLayer) map.removeLayer(layer) })
    const basemap = basemaps[fondCarte] || basemaps.osm
    basemap.addTo(map)
  }, [fondCarte])

  useEffect(() => {
    if (!mapInstanceRef.current || !geojsonData) return
    const map = mapInstanceRef.current
    if (geojsonLayerRef.current) map.removeLayer(geojsonLayerRef.current)

    try {
      const geojsonLayer = L.geoJSON(geojsonData, {
        style: () => ({ color: domaineCouleur, weight: 2, opacity: 0.8, fillColor: domaineCouleur, fillOpacity: 0.3 }),
        pointToLayer: (_feature, latlng) => L.circleMarker(latlng, { radius: 8, fillColor: domaineCouleur, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.8 }),
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const content = Object.entries(feature.properties).filter(([, val]) => val && typeof val !== 'object').map(([key, val]) => `<b>${key}:</b> ${val}`).join('<br/>')
            if (content) layer.bindPopup(`<div style="max-height:200px;overflow-y:auto;">${content}</div>`)
          }
        },
      })
      geojsonLayer.addTo(map)
      geojsonLayerRef.current = geojsonLayer
      if (geojsonData.features?.length > 0 || geojsonData.type === 'Feature') {
        try { map.fitBounds(geojsonLayer.getBounds().pad(0.1)) } catch {}
      }
    } catch (err) { console.error('Erreur rendu GeoJSON:', err) }
  }, [geojsonData, domaineCouleur])

  return <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
}