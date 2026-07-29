'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Loader2,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Calendar,
  Filter,
  Table,
  BarChart3,
  PieChart,
  TrendingUp,
  Award,
  Activity
} from 'lucide-react'

import GeoportalMap, { MapLayer, MapFeature } from './GeoportalMap'

/* ================= LAYER CONFIG ================= */

const LAYER_CONFIG = [
  { id: 'cantons', name: 'Cantons', url: 'http://localhost:8000/geojson/cantons/', icon: <MapPin className="h-4 w-4" />, iconUrl: null, color: '#FF6B6B', type: 'polygon' as const, category: 'administratif', description: 'Limites des cantons administratifs' },
  { id: 'communes', name: 'Communes', url: 'http://localhost:8000/geojson/commune/', icon: <Home className="h-4 w-4" />, iconUrl: null, color: '#4ECDC4', type: 'polygon' as const, category: 'administratif', description: 'Limites des communes' },
  { id: 'routes', name: 'Routes', url: 'http://localhost:8000/geojson/routes/', icon: <Route className="h-4 w-4" />, iconUrl: null, color: '#45B7D1', type: 'line' as const, category: 'infrastructure', description: 'Réseau routier principal' },
  { id: 'terrains', name: 'Terrains / Stades', url: 'http://localhost:8000/geojson/terrain/', icon: <Trees className="h-4 w-4" />, iconUrl: null, color: '#387c38', type: 'polygon' as const, category: 'infrastructure', description: 'Terrains et stades' },
  { id: 'hopitaux', name: 'Hôpitaux', url: 'http://localhost:8000/geojson/hopitale/', icon: null, iconUrl: '/icone/hopital.png', color: '#DC143C', type: 'point' as const, category: 'sante', description: 'Établissements hospitaliers' },
  { id: 'jardins', name: 'Jardins', url: 'http://localhost:8000/geojson/jardin/', icon: null, iconUrl: '/icone/jardin.png', color: '#96CEB4', type: 'point' as const, category: 'education', description: "Jardins d'enfants" },
  { id: 'colleges', name: 'Collèges', url: 'http://localhost:8000/geojson/college/', icon: null, iconUrl: '/icone/college.png', color: '#87CEEB', type: 'point' as const, category: 'education', description: 'Collèges' },
  { id: 'lycees', name: 'Lycées', url: 'http://localhost:8000/geojson/lycee/', icon: null, iconUrl: '/icone/lycee.png', color: '#4682B4', type: 'point' as const, category: 'education', description: 'Lycées' },
  { id: 'peas', name: 'Forages PEA', url: 'http://localhost:8000/geojson/Point_eau/', icon: null, iconUrl: '/icone/pea.png', color: '#0077BE', type: 'point' as const, category: 'hydrologie', description: "Forages et points d'eau PEA" },
  { id: 'bornefontaines', name: 'Bornes fontaines', url: 'http://localhost:8000/geojson/bornefontaine/', icon: null, iconUrl: '/icone/bornefontaine.png', color: '#20B2AA', type: 'point' as const, category: 'hydrologie', description: 'Bornes fontaines publiques' },
  { id: 'marches', name: 'Marchés', url: 'http://localhost:8000/geojson/Marches/', icon: null, iconUrl: '/icone/marche.png', color: '#FFA07A', type: 'point' as const, category: 'economie', description: 'Marchés publics' },
  { id: 'cooperatives', name: 'Coopératives', url: 'http://localhost:8000/geojson/cooperative/', icon: <Users className="h-4 w-4" />, iconUrl: null, color: '#FF8C00', type: 'point' as const, category: 'economie', description: 'Coopératives agricoles' },
  { id: 'magasins', name: 'Magasins / Intrants', url: 'http://localhost:8000/geojson/magasin/', icon: <Store className="h-4 w-4" />, iconUrl: null, color: '#9370DB', type: 'point' as const, category: 'economie', description: "Magasins d'intrants agricoles" },
  { id: 'chateaux', name: 'Châteaux', url: 'http://localhost:8000/geojson/chateau/', icon: null, iconUrl: '/icone/chateau.png', color: '#DDA0DD', type: 'point' as const, category: 'patrimoine', description: 'Châteaux et monuments' }
]

/* ================= LAYER ICON ================= */

const LayerIcon = ({ layer }: { layer: any }) => {
  if (layer.iconUrl) {
    return (
      <div className="relative h-4 w-4">
        <Image src={layer.iconUrl} alt={layer.name} fill style={{ objectFit: 'contain' }} sizes="16px" />
      </div>
    )
  }
  return layer.icon || <MapPin className="h-4 w-4" />
}

/* ================= CATEGORIES ================= */

const CATEGORIES = [
  { id: 'administratif', name: 'Administratif', icon: <Building className="h-4 w-4" />, color: '#6366f1', description: 'Limites administratives et territoires' },
  { id: 'infrastructure', name: 'Infrastructure', icon: <Route className="h-4 w-4" />, color: '#f59e0b', description: 'Routes, bâtiments et équipements' },
  { id: 'sante', name: 'Santé', icon: <Hospital className="h-4 w-4" />, color: '#ef4444', description: 'Établissements de santé' },
  { id: 'education', name: 'Éducation', icon: <School className="h-4 w-4" />, color: '#10b981', description: 'Écoles et établissements éducatifs' },
  { id: 'hydrologie', name: 'Hydrologie', icon: <Droplets className="h-4 w-4" />, color: '#06b6d4', description: 'Ressources en eau et hydrographie' },
  { id: 'economie', name: 'Économie', icon: <ShoppingBag className="h-4 w-4" />, color: '#8b5cf6', description: 'Marchés, commerces et activités' },
  { id: 'patrimoine', name: 'Patrimoine', icon: <MapPin className="h-4 w-4" />, color: '#f97316', description: 'Monuments et sites historiques' }
]

/* ================= DAYS OF WEEK ================= */

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const DAY_COLORS: Record<string, string> = {
  'Lundi': '#ef4444', 'Mardi': '#f97316', 'Mercredi': '#eab308',
  'Jeudi': '#22c55e', 'Vendredi': '#06b6d4', 'Samedi': '#3b82f6', 'Dimanche': '#8b5cf6'
}

function normalizeDay(rawValue: any): string | null {
  if (!rawValue) return null
  const value = String(rawValue).trim()
  if (!value) return null
  const lower = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const DAY_MAPPING: Record<string, string> = {
    'lundi': 'Lundi', 'lun': 'Lundi', 'lun.': 'Lundi', 'lu': 'Lundi', 'monday': 'Lundi', 'mon': 'Lundi', 'mon.': 'Lundi', '1': 'Lundi',
    'mardi': 'Mardi', 'mar': 'Mardi', 'mar.': 'Mardi', 'tuesday': 'Mardi', 'tue': 'Mardi', 'tue.': 'Mardi', 'tu': 'Mardi', '2': 'Mardi',
    'mercredi': 'Mercredi', 'mer': 'Mercredi', 'mer.': 'Mercredi', 'me': 'Mercredi', 'wednesday': 'Mercredi', 'wed': 'Mercredi', 'wed.': 'Mercredi', '3': 'Mercredi',
    'jeudi': 'Jeudi', 'jeu': 'Jeudi', 'jeu.': 'Jeudi', 'thursday': 'Jeudi', 'thu': 'Jeudi', 'thu.': 'Jeudi', 'th': 'Jeudi', '4': 'Jeudi',
    'vendredi': 'Vendredi', 'ven': 'Vendredi', 'ven.': 'Vendredi', 'friday': 'Vendredi', 'fri': 'Vendredi', 'fri.': 'Vendredi', '5': 'Vendredi',
    'samedi': 'Samedi', 'sam': 'Samedi', 'sam.': 'Samedi', 'saturday': 'Samedi', 'sat': 'Samedi', 'sat.': 'Samedi', '6': 'Samedi',
    'dimanche': 'Dimanche', 'dim': 'Dimanche', 'dim.': 'Dimanche', 'di': 'Dimanche', 'sunday': 'Dimanche', 'sun': 'Dimanche', 'sun.': 'Dimanche', '7': 'Dimanche', '0': 'Dimanche',
  }
  if (DAY_MAPPING[lower]) return DAY_MAPPING[lower]
  for (const [key, dayName] of Object.entries(DAY_MAPPING)) {
    if (key.length >= 3 && lower.includes(key)) return dayName
  }
  return null
}

function getUniqueDayValues(features: any[]): string[] {
  const values = new Set<string>()
  features.forEach(f => {
    const raw = f?.properties?.jour
    if (raw) values.add(String(raw).trim())
  })
  return Array.from(values).sort()
}

// ✅ Normalisation des noms de cantons (pour comparaison robuste)
function normalizeCantonName(name: any): string {
  if (!name) return ''
  let value = String(name).trim()
  // Supprimer les préfixes courants : "Canton de", "Canton d'", "Canton du"
  value = value.replace(/^canton\s+(de\s+|d['’]|du\s+|des\s+|le\s+|la\s+|les\s+)/i, '')
  // Supprimer les accents et mettre en minuscules
  value = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  // Supprimer les espaces multiples
  value = value.replace(/\s+/g, ' ').trim()
  return value
}

// ✅ Récupère le nom du canton depuis une feature (essaie plusieurs champs)
function getFeatureCanton(feature: any): string {
  return feature?.properties?.canton_nom ||
         feature?.properties?.canton ||
         feature?.properties?.nom_canton ||
         feature?.properties?.canton_nom_ ||
         feature?.properties?.nom ||
         ''
}

// ✅ Récupère les valeurs uniques de cantons dans une couche (pour debug)
function getUniqueCantonValues(features: any[]): string[] {
  const values = new Set<string>()
  features.forEach(f => {
    const canton = getFeatureCanton(f)
    if (canton) values.add(String(canton).trim())
  })
  return Array.from(values).sort()
}

/* ================= ICON PRELOADER ================= */

const IconPreloader = () => {
  useEffect(() => {
    LAYER_CONFIG.forEach(layer => {
      if (layer.iconUrl) fetch(layer.iconUrl).catch(() => {})
    })
  }, [])
  return null
}

/* ================= MAIN COMPONENT ================= */

export default function GeoPortal() {
  const [layers, setLayers] = useState<MapLayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)

  const [panelCollapsed, setPanelCollapsed] = useState(false)

  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const [marketDayFilter, setMarketDayFilter] = useState<string | null>(null)
  const [showMarketFilter, setShowMarketFilter] = useState(false)

  // ✅ Statistiques par canton
  const [showCantonStats, setShowCantonStats] = useState(false)
  const [selectedCanton, setSelectedCanton] = useState<string>('')

  /* ----- Charger les couches ----- */
  useEffect(() => {
    const loadLayers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/geoportal')
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        const data = await response.json()
        let layersArray: MapLayer[] = []
        if (data?.success && Array.isArray(data.layers)) {
          layersArray = data.layers.map((layer: any) => {
            const config = LAYER_CONFIG.find(c => c.id === layer.id)
            return {
              id: layer.id || String(Math.random()),
              name: layer.name || 'Couche sans nom',
              visible: false,
              opacity: layer.opacity || 0.7,
              color: layer.color || config?.color || '#ff3355',
              type: config?.type || 'polygon',
              iconUrl: config?.iconUrl || null,
              category: config?.category || 'administratif',
              description: config?.description || '',
              data: layer.data || { type: 'FeatureCollection', features: [] }
            }
          })
        } else if (data?.success && data.layers && typeof data.layers === 'object') {
          layersArray = Object.entries(data.layers).map(([key, layer]: [string, any]) => {
            const config = LAYER_CONFIG.find(c => c.id === key)
            return {
              id: key,
              name: layer.name || key.charAt(0).toUpperCase() + key.slice(1),
              visible: false,
              opacity: layer.opacity || 0.7,
              color: config?.color || '#33ff66',
              type: config?.type || 'polygon',
              iconUrl: config?.iconUrl || null,
              category: config?.category || 'administratif',
              description: config?.description || '',
              data: layer.data || { type: 'FeatureCollection', features: [] }
            }
          })
        }
        setLayers(layersArray)
      } catch (err: any) {
        console.error('Erreur chargement couches:', err)
        setError(err.message)
        setLayers([])
      } finally {
        setLoading(false)
      }
    }
    loadLayers()
  }, [])

  /* ----- Recherche ----- */
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`http://localhost:8000/geoportail/api/search/?q=${encodeURIComponent(searchQuery)}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setSearchResults(data.results || [])
      } catch (e) {
        console.error('Erreur recherche:', e)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (!target.closest('[data-search-result]')) setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))
  }
  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l))
  }
  const handleFeatureClick = (feature: MapFeature) => setSelectedFeature(feature)

  const handleSearchResultClick = (result: any) => {
    if (!result.geometry) return
    const feature: MapFeature = {
      type: 'Feature',
      geometry: result.geometry,
      properties: result.properties || { name: result.label }
    }
    setSelectedFeature(feature)
    const layerId = result.layer_id
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: true } : l))
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const getLayerConfig = (layerId: string) => LAYER_CONFIG.find(c => c.id === layerId)

  /* ----- Filtre marchés ----- */
  const marchesLayer = layers.find(l => l.id === 'marches')
  const allMarches = marchesLayer?.data?.features || []

  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    DAYS_OF_WEEK.forEach(d => counts[d] = 0)
    const otherValues: string[] = []
    allMarches.forEach(feature => {
      const rawJour = feature.properties?.jour
      const normalized = normalizeDay(rawJour)
      if (normalized && DAYS_OF_WEEK.includes(normalized)) counts[normalized]++
      else if (rawJour && String(rawJour).trim()) otherValues.push(String(rawJour).trim())
    })
    return { counts, other: otherValues.length, otherValues: Array.from(new Set(otherValues)), total: allMarches.length }
  }, [allMarches])

  const uniqueRawValues = useMemo(() => getUniqueDayValues(allMarches), [allMarches])

  const displayLayers = useMemo(() => {
    if (!marketDayFilter) return layers
    return layers.map(l => {
      if (l.id !== 'marches') return l
      const filteredFeatures = (l.data?.features || []).filter(feature => {
        const normalized = normalizeDay(feature.properties?.jour)
        return normalized === marketDayFilter
      })
      return { ...l, data: { type: 'FeatureCollection' as const, features: filteredFeatures } }
    })
  }, [layers, marketDayFilter])

  const handleDayFilterClick = (day: string | null) => {
    setMarketDayFilter(prev => prev === day ? null : day)
    if (day) {
      setLayers(prev => prev.map(l => l.id === 'marches' ? { ...l, visible: true } : l))
    }
  }

  /* ----- ✅ STATISTIQUES PAR CANTON ----- */

  const cantonsList = useMemo(() => {
    const cantonsLayer = layers.find(l => l.id === 'cantons')
    const names = (cantonsLayer?.data?.features || [])
      .map(f => getFeatureCanton(f))
      .filter(Boolean)
    return Array.from(new Set(names)).sort((a, b) => String(a).localeCompare(String(b)))
  }, [layers])

  // Calcul des stats par canton (avec normalisation robuste des noms)
  const cantonStats = useMemo(() => {
    if (!selectedCanton) return null
    const stats: Array<{
      id: string
      name: string
      color: string
      icon: any
      iconUrl: string | null
      count: number
      total: number
      category: string
      sampleValues: string[]
    }> = []

    const normalizedSelected = normalizeCantonName(selectedCanton)

    LAYER_CONFIG.forEach(config => {
      if (['cantons', 'communes', 'routes'].includes(config.id)) return
      const layer = layers.find(l => l.id === config.id)
      if (!layer?.data?.features) return

      // ✅ Matching avec normalisation (gère "Canton de Bassar" vs "Bassar" vs "BASSAR")
      const matched = layer.data.features.filter(f => {
        const featureCanton = getFeatureCanton(f)
        return normalizeCantonName(featureCanton) === normalizedSelected
      })

      const sampleValues = getUniqueCantonValues(layer.data.features).slice(0, 15)

      stats.push({
        id: config.id,
        name: config.name,
        color: config.color,
        icon: config.icon,
        iconUrl: config.iconUrl,
        count: matched.length,
        total: layer.data.features.length,
        category: config.category,
        sampleValues
      })
    })
    return stats
  }, [layers, selectedCanton])

  const cantonTotal = useMemo(() => {
    if (!cantonStats) return 0
    return cantonStats.reduce((acc, s) => acc + s.count, 0)
  }, [cantonStats])

  const cantonCategoryStats = useMemo(() => {
    if (!cantonStats) return []
    const byCat: Record<string, { count: number; color: string; name: string; icon: any }> = {}
    cantonStats.forEach(s => {
      if (!byCat[s.category]) {
        const cat = CATEGORIES.find(c => c.id === s.category)
        byCat[s.category] = { count: 0, color: cat?.color || '#999', name: cat?.name || s.category, icon: cat?.icon }
      }
      byCat[s.category].count += s.count
    })
    return Object.entries(byCat).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.count - a.count)
  }, [cantonStats])

  const averagePerCanton = useMemo(() => {
    if (cantonsList.length === 0 || !cantonStats) return 0
    const totalEntities = cantonStats.reduce((acc, s) => acc + s.total, 0)
    return totalEntities / cantonsList.length
  }, [cantonsList, cantonStats])

  const ranking = useMemo(() => {
    if (!selectedCanton || cantonsList.length === 0) return null
    const idx = cantonsList.indexOf(selectedCanton)
    return { position: idx + 1, total: cantonsList.length }
  }, [selectedCanton, cantonsList])

  const kpis = useMemo(() => {
    if (!cantonStats) return []
    const get = (ids: string[]) => cantonStats.filter(s => ids.includes(s.id)).reduce((a, s) => a + s.count, 0)
    return [
      { label: 'Hôpitaux', value: get(['hopitaux']), color: '#DC143C', icon: <Hospital className="h-5 w-5" /> },
      { label: 'Marchés', value: get(['marches']), color: '#FFA07A', icon: <ShoppingBag className="h-5 w-5" /> },
      { label: 'Écoles', value: get(['jardins', 'colleges', 'lycees']), color: '#10b981', icon: <School className="h-5 w-5" /> },
      { label: "Points d'eau", value: get(['peas', 'bornefontaines']), color: '#0077BE', icon: <Droplets className="h-5 w-5" /> }
    ]
  }, [cantonStats])

  const donutData = useMemo(() => {
    if (!cantonStats) return []
    const sorted = [...cantonStats].filter(s => s.count > 0).sort((a, b) => b.count - a.count)
    const top5 = sorted.slice(0, 5)
    const autres = sorted.slice(5).reduce((a, s) => a + s.count, 0)
    const data = top5.map(s => ({ label: s.name, value: s.count, color: s.color }))
    if (autres > 0) data.push({ label: 'Autres', value: autres, color: '#9ca3af' })
    return data
  }, [cantonStats])

  return (
    <div className="space-y-6">
      <IconPreloader />

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between flex-wrap gap-4 relative z-[1200]">
        <div>
          <h1 className="text-3xl font-bold">Géoportail</h1>
          <p className="text-muted-foreground">Carte interactive des données géographiques communales</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={searchContainerRef}>
            <button
              onClick={() => { setShowSearch(!showSearch); if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100) }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm font-medium">Rechercher</span>
            </button>
            {showSearch && (
              <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[2000] overflow-hidden">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input ref={searchInputRef} type="text" placeholder="Marché, hôpital, commune, école..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-10" />
                    {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />}
                    {searchQuery && !searching && (
                      <button onClick={() => { setSearchQuery(''); setSearchResults([]); searchInputRef.current?.focus() }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, idx) => (
                      <button key={`${result.layer_id}-${result.id}-${idx}`} data-search-result="true" onClick={() => handleSearchResultClick(result)} className="w-full flex items-center justify-between p-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors text-left">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{result.label}</div>
                          {result.sublabel && <div className="text-xs text-muted-foreground truncate">{result.sublabel}</div>}
                        </div>
                        <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">{result.layer_name}</Badge>
                      </button>
                    ))
                  ) : searchQuery.length >= 2 && !searching ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Aucun résultat pour "{searchQuery}"</p>
                    </div>
                  ) : !searching && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Tapez au moins 2 caractères pour rechercher</p>
                      <p className="text-xs mt-1">Marchés, hôpitaux, écoles, communes...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-sm text-muted-foreground">
              {loading ? 'Chargement...' : error ? 'Erreur' : layers.length > 0 ? `${layers.length} couches` : 'Aucune couche'}
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
              <p className="text-sm text-red-700">{error}</p>
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
              <p className="text-sm text-blue-700">Récupération des données depuis l'API Django...</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== ✅ STATISTIQUES PAR CANTON ===== */}
      {cantonsList.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
          <CardHeader>
            <button onClick={() => setShowCantonStats(!showCantonStats)} className="w-full flex items-center justify-between group">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Statistiques par canton
                {selectedCanton && (
                  <Badge className="ml-2 bg-purple-600 text-white">{selectedCanton}</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">{cantonsList.length} cantons</Badge>
                {showCantonStats ? <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" /> : <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />}
              </div>
            </button>
          </CardHeader>

          {showCantonStats && (
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-white rounded-lg border border-purple-100">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Sélectionnez un canton :</span>
                </div>
                <select
                  value={selectedCanton}
                  onChange={(e) => setSelectedCanton(e.target.value)}
                  className="flex-1 w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">— Choisir un canton —</option>
                  {cantonsList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {selectedCanton && ranking && (
                  <Badge variant="outline" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Position {ranking.position} / {ranking.total}
                  </Badge>
                )}
              </div>

              {!selectedCanton ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Sélectionnez un canton pour afficher ses statistiques détaillées</p>
                </div>
              ) : (
                <>
                  {/* ✅ Panneau de debug si tout est à 0 */}
                  {cantonTotal === 0 && cantonStats && (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-amber-900 mb-2">
                            ⚠️ Aucune entité trouvée pour ce canton
                          </h3>
                          <p className="text-sm text-amber-800 mb-3">
                            Le canton <strong>"{selectedCanton}"</strong> a été sélectionné, mais aucune couche
                            ne contient d'entité avec cette valeur. Voici les valeurs de canton réellement
                            trouvées dans chaque couche :
                          </p>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {cantonStats.map(stat => (
                              <div key={stat.id} className="bg-white rounded border border-amber-200 p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-gray-700">{stat.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {stat.sampleValues.length} valeur(s) • {stat.total} entités
                                  </Badge>
                                </div>
                                {stat.sampleValues.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {stat.sampleValues.map((v, i) => (
                                      <span
                                        key={i}
                                        className={`text-xs px-2 py-0.5 rounded border ${
                                          normalizeCantonName(v) === normalizeCantonName(selectedCanton)
                                            ? 'bg-green-100 text-green-900 border-green-400 font-semibold'
                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}
                                      >
                                        "{v}"
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">
                                    Aucune valeur de canton trouvée (champ manquant ?)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-amber-700 mt-3">
                            💡 Les valeurs en <span className="bg-green-100 text-green-900 px-1 rounded font-semibold">vert</span> correspondent
                            au canton sélectionné après normalisation. Si aucune valeur n'est verte, c'est que les
                            noms de cantons sont différents entre la couche "Cantons" et les autres couches.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ✅ Total général + KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div className="col-span-2 md:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wide opacity-80">Total entités</span>
                        <Activity className="h-4 w-4 opacity-80" />
                      </div>
                      <div className="text-4xl font-bold">{cantonTotal}</div>
                      <div className="text-xs opacity-80 mt-1">dans le canton de {selectedCanton}</div>
                    </div>

                    {kpis.map(kpi => (
                      <div key={kpi.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}20`, color: kpi.color }}>
                            {kpi.icon}
                          </div>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                        <div className="text-xs text-gray-600 mt-1">{kpi.label}</div>
                      </div>
                    ))}
                  </div>

                  {cantonTotal > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Comparaison avec la moyenne des cantons</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Canton sélectionné</span>
                            <span className="font-semibold text-purple-700">{cantonTotal} entités</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (cantonTotal / Math.max(cantonTotal, averagePerCanton)) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Moyenne par canton</span>
                            <span className="font-semibold text-gray-700">{averagePerCanton.toFixed(1)} entités</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"
                              style={{ width: `${Math.min(100, (averagePerCanton / Math.max(cantonTotal, averagePerCanton)) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {cantonTotal > averagePerCanton ? (
                            <span className="text-green-600 font-medium">
                              ↑ {((cantonTotal / averagePerCanton - 1) * 100).toFixed(0)}% au-dessus de la moyenne
                            </span>
                          ) : cantonTotal < averagePerCanton ? (
                            <span className="text-orange-600 font-medium">
                              ↓ {((1 - cantonTotal / averagePerCanton) * 100).toFixed(0)}% en dessous de la moyenne
                            </span>
                          ) : (
                            <span className="text-blue-600 font-medium">≈ Égal à la moyenne</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Détail par couche</span>
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {cantonStats?.filter(s => s.count > 0).sort((a, b) => b.count - a.count).map(stat => {
                          const maxCount = Math.max(...(cantonStats?.map(s => s.count) || [1]), 1)
                          const pct = (stat.count / maxCount) * 100
                          const sharePct = stat.total > 0 ? (stat.count / stat.total) * 100 : 0
                          return (
                            <div key={stat.id} className="group">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                                  <span className="font-medium text-gray-700">{stat.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{stat.count}</span>
                                  <span className="text-gray-400 text-xs">/ {stat.total}</span>
                                  <Badge variant="outline" className="text-xs">{sharePct.toFixed(0)}%</Badge>
                                </div>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all group-hover:opacity-80"
                                  style={{ width: `${pct}%`, backgroundColor: stat.color }}
                                />
                              </div>
                            </div>
                          )
                        })}
                        {cantonStats?.every(s => s.count === 0) && (
                          <div className="text-center py-6 text-sm text-gray-500">
                            Aucune entité trouvée pour ce canton
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <PieChart className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Répartition par couche</span>
                      </div>
                      {donutData.length > 0 ? (
                        <div className="flex flex-col items-center">
                          <svg width="200" height="200" viewBox="0 0 200 200" className="mb-3">
                            {(() => {
                              const total = donutData.reduce((a, d) => a + d.value, 0)
                              let cumulative = 0
                              const radius = 70
                              const cx = 100, cy = 100
                              const strokeWidth = 30
                              return donutData.map((d, i) => {
                                const pct = d.value / total
                                const startAngle = cumulative * 2 * Math.PI - Math.PI / 2
                                const endAngle = (cumulative + pct) * 2 * Math.PI - Math.PI / 2
                                cumulative += pct
                                const x1 = cx + radius * Math.cos(startAngle)
                                const y1 = cy + radius * Math.sin(startAngle)
                                const x2 = cx + radius * Math.cos(endAngle)
                                const y2 = cy + radius * Math.sin(endAngle)
                                const largeArc = pct > 0.5 ? 1 : 0
                                const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
                                return (
                                  <path
                                    key={i}
                                    d={path}
                                    fill="none"
                                    stroke={d.color}
                                    strokeWidth={strokeWidth}
                                    strokeLinecap="round"
                                  >
                                    <title>{d.label}: {d.value} ({(pct * 100).toFixed(1)}%)</title>
                                  </path>
                                )
                              })
                            })()}
                            <text x="100" y="95" textAnchor="middle" className="text-3xl font-bold fill-gray-900">{cantonTotal}</text>
                            <text x="100" y="115" textAnchor="middle" className="text-xs fill-gray-500">entités</text>
                          </svg>
                          <div className="grid grid-cols-2 gap-2 w-full text-xs">
                            {donutData.map((d, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                                <span className="text-gray-700 truncate flex-1">{d.label}</span>
                                <span className="font-semibold text-gray-900">{d.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-sm text-gray-500">
                          <PieChart className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                          Aucune donnée à afficher
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Synthèse par thématique</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {CATEGORIES.map(cat => {
                        const stat = cantonCategoryStats.find(s => s.id === cat.id)
                        const count = stat?.count || 0
                        return (
                          <div
                            key={cat.id}
                            className="text-center p-3 rounded-lg border-2 transition-all hover:shadow-md"
                            style={{ borderColor: count > 0 ? cat.color : '#e5e7eb' }}
                          >
                            <div
                              className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white"
                              style={{ backgroundColor: count > 0 ? cat.color : '#d1d5db' }}
                            >
                              {cat.icon}
                            </div>
                            <div className="text-xl font-bold" style={{ color: count > 0 ? cat.color : '#9ca3af' }}>
                              {count}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{cat.name}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* ===== FILTRE MARCHÉS PAR JOUR ===== */}
      {marchesLayer && allMarches.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <button onClick={() => setShowMarketFilter(!showMarketFilter)} className="w-full flex items-center justify-between group">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
                Filtre des marchés par jour
                {marketDayFilter && <Badge className="ml-2 bg-orange-600 text-white">{marketDayFilter}</Badge>}
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">{allMarches.length} marchés au total</Badge>
                {showMarketFilter ? <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" /> : <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />}
              </div>
            </button>
          </CardHeader>

          {showMarketFilter && (
            <CardContent className="space-y-4">
              {dayCounts.total > 0 && Object.values(dayCounts.counts).every(c => c === 0) && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-amber-900 mb-2">⚠️ Aucun jour reconnu dans les données</h3>
                      <p className="text-sm text-amber-800 mb-2">
                        Le champ <code className="bg-amber-100 px-1 rounded">jour</code> existe mais ses valeurs ne correspondent pas aux jours de la semaine attendus.
                      </p>
                      <p className="text-xs text-amber-700 mb-2"><strong>Valeurs trouvées ({uniqueRawValues.length} uniques) :</strong></p>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        {uniqueRawValues.map((v, i) => (
                          <span key={i} className="text-xs bg-amber-100 text-amber-900 px-2 py-1 rounded border border-amber-300">"{v}"</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sélectionnez un jour pour filtrer les marchés :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleDayFilterClick(null)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${marketDayFilter === null ? 'bg-gray-800 text-white border-gray-800 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                    Tous les jours<span className="ml-2 text-xs opacity-75">({allMarches.length})</span>
                  </button>
                  {DAYS_OF_WEEK.map(day => {
                    const count = dayCounts.counts[day]
                    const isActive = marketDayFilter === day
                    const color = DAY_COLORS[day]
                    return (
                      <button
                        key={day}
                        onClick={() => handleDayFilterClick(day)}
                        disabled={count === 0}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 flex items-center gap-2 ${isActive ? 'text-white shadow-md' : count === 0 ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                        style={isActive ? { backgroundColor: color, borderColor: color } : {}}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? 'white' : color }} />
                        {day}<span className="text-xs opacity-75">({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Table className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Résumé par jour de marché</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left p-3 font-medium text-gray-700">Jour</th>
                        <th className="text-center p-3 font-medium text-gray-700">Nombre</th>
                        <th className="text-right p-3 font-medium text-gray-700">%</th>
                        <th className="text-left p-3 font-medium text-gray-700">Répartition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS_OF_WEEK.map(day => {
                        const count = dayCounts.counts[day]
                        const pct = allMarches.length > 0 ? (count / allMarches.length) * 100 : 0
                        const color = DAY_COLORS[day]
                        const isActive = marketDayFilter === day
                        return (
                          <tr key={day} onClick={() => count > 0 && handleDayFilterClick(day)} className={`border-b last:border-b-0 transition-colors ${isActive ? 'bg-orange-50' : count > 0 ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50'}`}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-medium">{day}</span>
                                {isActive && <Badge className="bg-orange-600 text-white text-xs">Actif</Badge>}
                              </div>
                            </td>
                            <td className="p-3 text-center"><span className={`font-bold ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{count}</span></td>
                            <td className="p-3 text-right text-gray-600">{pct.toFixed(1)}%</td>
                            <td className="p-3">
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden min-w-[100px]">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {dayCounts.other > 0 && (
                        <tr className="border-b bg-gray-50">
                          <td className="p-3"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400" /><span className="font-medium">Autres</span></div></td>
                          <td className="p-3 text-center font-bold">{dayCounts.other}</td>
                          <td className="p-3 text-right text-gray-600">{((dayCounts.other / allMarches.length) * 100).toFixed(1)}%</td>
                          <td className="p-3"><div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden"><div className="h-full bg-gray-400 rounded-full" style={{ width: `${(dayCounts.other / allMarches.length) * 100}%` }} /></div></td>
                        </tr>
                      )}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="p-3">Total</td>
                        <td className="p-3 text-center">{allMarches.length}</td>
                        <td className="p-3 text-right">100%</td>
                        <td className="p-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ===== LAYOUT PRINCIPAL ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <button onClick={() => setPanelCollapsed(!panelCollapsed)} className="w-full flex items-center justify-between group">
              <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" />Couches thématiques</CardTitle>
              <div className="flex items-center gap-2">
                {!panelCollapsed && layers.length > 0 && <Badge variant="secondary" className="text-xs">{layers.filter(l => l.visible).length}/{layers.length}</Badge>}
                {panelCollapsed ? <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-transform" /> : <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-transform" />}
              </div>
            </button>
          </CardHeader>

          {!panelCollapsed && (
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {loading ? 'Chargement des couches...' : error ? 'Erreur de chargement' : layers.length > 0 ? `Explorez les ${layers.length} couches disponibles` : 'Aucune couche disponible'}
              </div>
              {layers.length > 0 ? (
                CATEGORIES.map((category) => {
                  const categoryLayers = layers.filter(l => {
                    if (category.id === 'administratif') return ['cantons', 'communes'].includes(l.id)
                    if (category.id === 'infrastructure') return ['routes', 'terrains'].includes(l.id)
                    if (category.id === 'sante') return ['hopitaux'].includes(l.id)
                    if (category.id === 'education') return ['jardins', 'colleges', 'lycees'].includes(l.id)
                    if (category.id === 'hydrologie') return ['peas', 'bornefontaines'].includes(l.id)
                    if (category.id === 'economie') return ['marches', 'cooperatives', 'magasins'].includes(l.id)
                    if (category.id === 'patrimoine') return ['chateaux'].includes(l.id)
                    return false
                  })
                  const visibleLayersCount = categoryLayers.filter(l => l.visible).length
                  const isExpanded = expandedCategories[category.id]
                  if (categoryLayers.length === 0) return null
                  return (
                    <div key={category.id} className="border rounded-lg overflow-hidden">
                      <button onClick={() => toggleCategory(category.id)} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                          <div className="flex items-center gap-2">{category.icon}<span className="text-sm font-medium text-left">{category.name}</span></div>
                        </div>
                        <div className="flex items-center gap-2">
                          {visibleLayersCount > 0 && <Badge variant="secondary" className="text-xs">{visibleLayersCount}</Badge>}
                          <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t bg-gray-50">
                          {categoryLayers.map((layer) => {
                            const config = getLayerConfig(layer.id)
                            const featureCount = layer.id === 'marches' && marketDayFilter
                              ? (layer.data?.features || []).filter(f => normalizeDay(f.properties?.jour) === marketDayFilter).length
                              : layer.data?.features?.length || 0
                            return (
                              <div key={layer.id} className="flex items-center justify-between p-3 hover:bg-gray-100 transition-colors border-b last:border-b-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: layer.color }} />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium flex items-center gap-2">
                                      {layer.name}
                                      {layer.id === 'marches' && marketDayFilter && <Badge className="bg-orange-600 text-white text-xs">{marketDayFilter}</Badge>}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {featureCount} entités
                                      {layer.id === 'marches' && marketDayFilter && featureCount !== (layer.data?.features?.length || 0) && <span className="text-orange-600 ml-1">(sur {layer.data?.features?.length || 0})</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {config && <div className="mr-2"><LayerIcon layer={config} /></div>}
                                  <Switch checked={layer.visible} onCheckedChange={() => toggleLayer(layer.id)} disabled={loading} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (!loading && !error && <div className="text-center py-4 text-gray-500"><p>Aucune couche disponible pour le moment.</p></div>)}
            </CardContent>
          )}
        </Card>

        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <GeoportalMap
                center={{ lat: 8.20150, lng: 1.16599 }}
                zoom={13}
                layers={displayLayers}
                onFeatureClick={handleFeatureClick}
                selectedFeature={selectedFeature}
                className="h-[600px]"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedFeature && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Détails de l'entité</CardTitle>
              <button onClick={() => setSelectedFeature(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(selectedFeature.properties || {}).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-sm font-medium">{key}</Label>
                  <div className="text-sm text-gray-600">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}