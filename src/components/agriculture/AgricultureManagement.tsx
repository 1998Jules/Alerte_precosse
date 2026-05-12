'use client';

import { useState, useEffect, useCallback } from 'react'
import {
  TreePine, Droplets, Sun, TrendingUp, AlertTriangle, Calendar, MapPin,
  Users, Filter, Search, Plus, Edit, Eye, Download, Cloud, Thermometer,
  X, Save, Clock, Wind, Umbrella, SunDim, CloudRain, CloudSun, CheckCircle,
  CalendarDays, Sprout, ShieldAlert, RefreshCw, Layers
} from 'lucide-react'
import { MapContainer, TileLayer, GeoJSON, useMap, FeatureGroup, LayersControl } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'

import L from 'leaflet'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import 'leaflet/dist/leaflet.css'
import Chatbot from '../Chatbot'

// ========== Interfaces ==========
interface Crop {
  id: string
  name: string
  type: string
  area: string
  areaHa: number
  farmers: number
  currentSeason: string
  expectedYield: string
  status: string
  healthStatus: string
  lastUpdate: string
  nextAction: string
  irrigation: boolean
  fertilizer: string
  challenges: string[]
  opportunities: string[]
  latitude?: number
  longitude?: number
  createdAt: string
  updatedAt: string
}

interface WeatherData {
  id?: string
  temperature: number
  humidity: number
  rainfall: number
  forecast: string
  lastUpdate: string
  windSpeed?: number
  uvIndex?: number
  pressure?: number
}

interface WeatherForecast {
  id: string
  date: string
  day: string
  temperature: { max: number; min: number }
  condition: string
  precipitation: number
  icon: string
}

interface Recommendation {
  id: string
  type: 'irrigation' | 'fertilization' | 'pest_control' | 'harvest' | 'planting'
  cropId?: string
  cropName?: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed' | 'in_progress'
  date: string
  deadline?: string
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  type: 'planting' | 'harvest' | 'maintenance' | 'fertilization' | 'irrigation' | 'inspection'
  startDate: string
  endDate: string
  location: string
  crops: string[]
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

// ========== Composant Helper Zoom ==========
function ZoomControl() {
  const map = useMap()
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white p-1 rounded shadow border border-gray-300 flex flex-col">
      <button onClick={() => map.zoomIn()} className="p-1 hover:bg-gray-100 text-gray-600 font-bold w-8 h-8 flex items-center justify-center" title="Zoom avant">+</button>
      <button onClick={() => map.zoomOut()} className="p-1 hover:bg-gray-100 text-gray-600 font-bold w-8 h-8 flex items-center justify-center border-t border-gray-200" title="Zoom arrière">-</button>
    </div>
  )
}

// ========== COMPOSANT : BANDE CALENDRIER (TIMELINE) ==========
interface FieldTimelineStripProps {
  data: any[];
  activeMapUrl: string | null;
  onSelectDate: (url: string) => void;
}

const FieldTimelineStrip = ({ data, activeMapUrl, onSelectDate }: FieldTimelineStripProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-gray-700 flex items-center">
          <CalendarDays className="w-4 h-4 mr-2 text-green-600" />
          Images Disponibles
        </h4>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{data.length} passages satellite</span>
      </div>
      
      <div className="flex space-x-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-300">
        {data.map((item, idx) => {
          const isActive = activeMapUrl === item.map_url;
          const dateObj = new Date(item.date);
          const dateStr = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(item.map_url)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg border transition-all duration-200 group ${
                isActive 
                  ? 'bg-green-600 border-green-600 text-white shadow-lg transform scale-105' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50'
              }`}
              title={`Date: ${item.date} | NDVI: ${item.ndvi}`}
            >
              <span className="text-[10px] font-bold mb-1">{dateStr}</span>
              <div 
                className={`w-2 h-2 rounded-full transition-colors ${
                  item.ndvi > 0.6 ? 'bg-green-500' : item.ndvi > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                } ${isActive ? 'bg-white' : ''}`}
              ></div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
        <span>Plus ancien</span>
        <span>Plus récent &rarr;</span>
      </div>
    </div>
  );
};

// ========== COMPOSANT : SÉLECTEUR D'INDICE SPECTRAL ==========
const IndexSelector = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const indices = [
    { id: 'ndvi', name: 'NDVI', description: 'Végétation', color: 'bg-green-100 text-green-800', icon: '🌿' },
    { id: 'evi', name: 'EVI', description: 'Végétation amélioré', color: 'bg-emerald-100 text-emerald-800', icon: '🌱' },
    { id: 'ndwi', name: 'NDWI', description: 'Eau/Humidité', color: 'bg-blue-100 text-blue-800', icon: '💧' },
    { id: 'msavi', name: 'MSAVI', description: 'Sol nu', color: 'bg-amber-100 text-amber-800', icon: '🏜️' }
  ];

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm mb-3">
      <label className="block text-xs font-medium text-gray-500 mb-2">Indice spectral</label>
      <div className="grid grid-cols-2 gap-2">
        {indices.map((idx) => (
          <button
            key={idx.id}
            onClick={() => onChange(idx.id)}
            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1 ${
              value === idx.id 
                ? `${idx.color} ring-2 ring-offset-1 ring-green-500 shadow-sm` 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={idx.description}
          >
            <span>{idx.icon}</span>
            <span>{idx.name}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-2 text-center">
        {indices.find(i => i.id === value)?.description}
      </p>
    </div>
  );
};

// ========== Composant Modal Ajout Champ ==========
function AddFieldModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
  const [formData, setFormData] = useState({ nom: '', proprietaire: '', type_culture: '', date_semi: '' })
  const [drawnGeometry, setDrawnGeometry] = useState<any>(null)

  const _onCreated = (e: any) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    setDrawnGeometry(geojson);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawnGeometry) { alert("Veuillez dessiner le champ sur la carte !"); return; }
    const payload = { ...formData, geom: drawnGeometry };
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/champs/create/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) { alert("Champ ajouté avec succès !"); onSave(); onClose(); }
      else { alert("Erreur lors de l'ajout du champ"); }
    } catch (err) { console.error(err); alert("Erreur de connexion au serveur"); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Dessiner un nouveau champ</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 p-6 bg-white overflow-y-auto border-r border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Nom du champ</label><input type="text" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Ex: Parcelle A" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Propriétaire</label><input type="text" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Nom de l'agriculteur" value={formData.proprietaire} onChange={e => setFormData({ ...formData, proprietaire: e.target.value })} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Type de culture</label><input type="text" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Ex: Maïs" value={formData.type_culture} onChange={e => setFormData({ ...formData, type_culture: e.target.value })} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Date de semis</label><input type="date" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none" value={formData.date_semi} onChange={e => setFormData({ ...formData, date_semi: e.target.value })} /></div>
              <div className="pt-4 border-t mt-4">
                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold shadow-md transition-colors">Enregistrer le champ</button>
                {drawnGeometry && <p className="text-xs text-green-600 mt-3 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Zone géographique détectée avec succès</p>}
              </div>
            </form>
          </div>
          <div className="w-2/3 relative bg-gray-100">
            <MapContainer center={[8.6, 1.2]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FeatureGroup>
                <EditControl position="topright" onCreated={_onCreated} draw={{ polygon: { allowIntersection: false, showArea: true, shapeOptions: { color: '#10b981' } }, rectangle: false, circle: false, marker: false, polyline: false, circlemarker: false }} />
              </FeatureGroup>
            </MapContainer>
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg z-[1000] max-w-sm border-l-4 border-green-500">
              <p className="text-sm font-bold text-gray-800 mb-1">Instructions de dessin :</p>
              <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>Cliquez sur l'icône <span className="font-bold text-green-600">pentagone</span> en haut à droite.</li>
                <li>Dessinez les contours en cliquant pour ajouter des points.</li>
                <li>Double-cliquez sur le dernier point pour fermer.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== Composant Principal ==========
export default function AgricultureManagement() {
  const OPENWEATHER_API_KEY='947f9f56349e37e86784c5f031cda332'; 

  const [activeTab, setActiveTab] = useState('crops')
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null)

  const [selectedIndexType, setSelectedIndexType] = useState<string>('ndvi');

  const [hourlyForecast, setHourlyForecast] = useState<any[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 32, humidity: 65, rainfall: 45,
    forecast: 'Pluies modérées prévues dans 3-4 jours',
    lastUpdate: new Date().toLocaleString('fr-FR'),
    windSpeed: 12, uvIndex: 7, pressure: 1013
  })

  const [weatherCoords, setWeatherCoords] = useState({
    lat: '8.32',
    lon: '0.9797',
    name: 'Par défaut (Togo)',
    lastUpdated: 0 
  })

  const getPolygonCenter = (geometry: any) => {
    let totalLat = 0, totalLon = 0, n = 0;
    let rings = [];
    if (geometry.type === 'Polygon') {
      rings = geometry.coordinates;
    } else if (geometry.type === 'MultiPolygon') {
      rings = geometry.coordinates[0]; 
    }
    const ring = rings[0];
    if (!ring || !Array.isArray(ring)) return { lat: '8.32', lon: '0.9797' };
    ring.forEach((coord: any) => {
      const lon = parseFloat(coord[0]); 
      const lat = parseFloat(coord[1]); 
      if (!isNaN(lon) && !isNaN(lat)) {
        totalLon += lon;
        totalLat += lat;
        n++;
      }
    });
    if (n === 0) return { lat: '8.32', lon: '0.9797' }; 
    return { lat: (totalLat / n).toFixed(4), lon: (totalLon / n).toFixed(4) };
  }

  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([
    { id: '1', date: '2024-01-17', day: "Aujourd'hui", temperature: { max: 32, min: 24 }, condition: 'Partiellement nuageux', precipitation: 20, icon: 'cloud-sun' },
    { id: '2', date: '2024-01-18', day: 'Demain', temperature: { max: 31, min: 23 }, condition: 'Pluies légères', precipitation: 60, icon: 'cloud-rain' },
    { id: '3', date: '2024-01-19', day: 'Jeu', temperature: { max: 30, min: 22 }, condition: 'Pluies modérées', precipitation: 80, icon: 'cloud-rain' },
    { id: '4', date: '2024-01-20', day: 'Ven', temperature: { max: 33, min: 24 }, condition: 'Ensoleillé', precipitation: 10, icon: 'sun' },
    { id: '5', date: '2024-01-21', day: 'Sam', temperature: { max: 34, min: 25 }, condition: 'Partiellement nuageux', precipitation: 30, icon: 'cloud-sun' }
  ])

  const [showWeatherForm, setShowWeatherForm] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    { id: '1', type: 'irrigation', cropId: '1', cropName: 'Riz', title: 'Irrigation recommandée', description: 'Irriguer les rizières en raison des températures élevées', priority: 'high', status: 'pending', date: '2024-01-16', deadline: '2024-01-18' },
    { id: '2', type: 'fertilization', cropId: '2', cropName: 'Maïs', title: 'Application d\'engrais', description: 'Appliquer de l\'engrais NPK 15-15-15', priority: 'medium', status: 'pending', date: '2024-01-15', deadline: '2024-01-20' },
    { id: '3', type: 'pest_control', cropId: '3', cropName: 'Tomates', title: 'Surveillance des ravageurs', description: 'Surveiller les chenilles et mildiou', priority: 'high', status: 'in_progress', date: '2024-01-14' },
    { id: '4', type: 'harvest', cropId: '4', cropName: 'Haricots', title: 'Récolte proche', description: 'Préparer la récolte pour la semaine prochaine', priority: 'medium', status: 'pending', date: '2024-01-13', deadline: '2024-01-25' },
    { id: '5', type: 'planting', cropId: '5', cropName: 'Oignons', title: 'Plantation recommandée', description: 'Conditions idéales pour la plantation d\'oignons', priority: 'low', status: 'pending', date: '2024-01-12' }
  ])

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Plantation de maïs', description: 'Plantation dans la zone nord', type: 'planting', startDate: '2024-01-20', endDate: '2024-01-22', location: 'Zone Nord', crops: ['Maïs', 'Sorgho'], status: 'scheduled' },
    { id: '2', title: 'Fertilisation des rizières', description: 'Application d\'engrais azoté', type: 'fertilization', startDate: '2024-01-18', endDate: '2024-01-18', location: 'Zone Sud', crops: ['Riz'], status: 'in_progress' },
    { id: '3', title: 'Inspection des systèmes d\'irrigation', description: 'Vérification et maintenance', type: 'inspection', startDate: '2024-01-22', endDate: '2024-01-24', location: 'Toutes zones', crops: ['Toutes cultures'], status: 'scheduled' },
    { id: '4', title: 'Récolte des haricots', description: 'Récolte précoce', type: 'harvest', startDate: '2024-01-25', endDate: '2024-01-28', location: 'Zone Est', crops: ['Haricots', 'Niébé'], status: 'scheduled' },
    { id: '5', title: 'Formation sur la lutte antiparasitaire', description: 'Formation pour les agriculteurs', type: 'maintenance', startDate: '2024-01-19', endDate: '2024-01-19', location: 'Centre communautaire', crops: [], status: 'scheduled' }
  ])

  const [selectedLayer, setSelectedLayer] = useState('ndvi')
  const [mapClickInfo, setMapClickInfo] = useState<{ lat: number; lng: number; values: any } | null>(null)
  const [ndviTiles, setNdviTiles] = useState<{ [key: string]: string }>({})
  const [selectedYear, setSelectedYear] = useState('2024')
  const [mapGeoJson, setMapGeoJson] = useState<any>(null)
  const [mapLoading, setMapLoading] = useState(true)
  const [clippedMapUrl, setClippedMapUrl] = useState<string | null>(null);
  const [ndviDownloadUrl, setNdviDownloadUrl] = useState<string | null>(null);

  const [analysisConfig, setAnalysisConfig] = useState({
    zoneType: 'region', zoneId: '', selectedYears: ['2023', '2024']
  })
  const [availableZones, setAvailableZones] = useState<any[]>([])
  const [timeseriesData, setTimeseriesData] = useState<any[]>([])

  const [viewMode, setViewMode] = useState<'admin' | 'field'>('admin');
  const [userFields, setUserFields] = useState<any[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [selectedField, setSelectedField] = useState<any>(null);
  const [fieldNdviData, setFieldNdviData] = useState<any[]>([])
  const [showAddFieldModal, setShowAddFieldModal] = useState(false)
  const [fieldMapUrl, setFieldMapUrl] = useState<string | null>(null)
  const [fieldSearchTerm, setFieldSearchTerm] = useState<string>('')
  const [loadingChart, setLoadingChart] = useState(false)

  // ========== ÉTATS POUR LA COMPARAISON D'INDICES ==========
  const [compareMode, setCompareMode] = useState(false);
  const [availableIndices, setAvailableIndices] = useState([
    { id: 'ndvi', name: 'NDVI', color: '#10b981', enabled: true },
    { id: 'evi', name: 'EVI', color: '#f59e0b', enabled: false },
    { id: 'ndwi', name: 'NDWI', color: '#3b82f6', enabled: false },
    { id: 'msavi', name: 'MSAVI', color: '#ef4444', enabled: false }
  ]);
  const [comparisonData, setComparisonData] = useState<{ [key: string]: any[] }>({});
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const cropTypes = [
    { id: 'all', name: 'Toutes les cultures', icon: TreePine, color: 'gray' },
    { id: 'CEREAL', name: 'Céréales', icon: TreePine, color: 'yellow' },
    { id: 'TUBER', name: 'Tubercules', icon: TreePine, color: 'orange' },
    { id: 'VEGETABLE', name: 'Légumes', icon: TreePine, color: 'green' },
    { id: 'FRUIT', name: 'Fruits', icon: TreePine, color: 'red' },
    { id: 'LEGUME', name: 'Légumineuses', icon: TreePine, color: 'purple' }
  ]

  // 1. Chargement initial
  useEffect(() => {
    fetchCrops()
    fetchWeather()
    fetchWeatherForecast()
    fetchRecommendations()
    fetchCalendarEvents()
    fetchNdviTiles()
    fetchUserFields()
  }, [])

  // 2. Charger données carte Admin
  useEffect(() => {
    if (activeTab === 'explorer' && viewMode === 'admin') {
      loadMapData(analysisConfig.zoneType);
    }
  }, [activeTab, analysisConfig.zoneType, viewMode]);

  // 3. Déclencher calcul Admin
  useEffect(() => {
    if (activeTab === 'explorer' && viewMode === 'admin' && analysisConfig.zoneId && analysisConfig.selectedYears.length > 0) {
      handleGenerateTimeseries();
    }
  }, [analysisConfig.zoneId, analysisConfig.selectedYears]);

  // 4. Rafraîchir les données quand l'indice sélectionné change (Mode Champ simple)
  useEffect(() => {
    if (viewMode === 'field' && selectedFieldId && !compareMode) {
      handleSelectField(selectedFieldId);
    }
  }, [selectedIndexType, compareMode]);

  // ========== FONCTIONS ==========
  const fetchNdviTiles = async () => {
    try {
      const tilesRes = await fetch('http://127.0.0.1:8000/agriculture/api/ndvi-tiles/')
      if (tilesRes.ok) setNdviTiles(await tilesRes.json())
    } catch (error) { console.error("Erreur tuiles:", error) }
  }

  const loadMapData = async (type: string) => {
    setMapLoading(true); setAvailableZones([]); setMapGeoJson(null);
    let url = type === 'region' ? 'http://127.0.0.1:8000/agriculture/api/regions/' :
      type === 'prefecture' ? 'http://127.0.0.1:8000/agriculture/api/prefectures/' :
        'http://127.0.0.1:8000/agriculture/api/communes/';
    try {
      const geoRes = await fetch(url);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        setMapGeoJson(geoData);
        const zones = (geoData.features || []).map((f: any) => ({
          id: String(f.id),
          name: f.properties.region || f.properties.prefecture || f.properties.commune || 'Inconnu',
          type: type
        }));
        setAvailableZones(zones);
      }
    } catch (error) { console.error("Erreur chargement carte:", error); }
    finally { setMapLoading(false); }
  };

  const handleGenerateTimeseries = async () => {
    if (!analysisConfig.zoneId) return;
    setLoadingChart(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/agriculture/api/ndvi-timeseries/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_type: analysisConfig.zoneType, zone_id: analysisConfig.zoneId, years: analysisConfig.selectedYears.map(y => parseInt(y)) })
      })
      const result = await response.json()
      if (result.success) {
        setTimeseriesData(result.data)
        setClippedMapUrl(result.map_url || null);
        setNdviDownloadUrl(result.download_url || null);
      }
    } catch (error) { console.error(error); setClippedMapUrl(null); }
    finally { setLoadingChart(false) }
  }

  const fetchUserFields = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/champs/geojson/');
      if (res.ok) setUserFields((await res.json()).features || []);
    } catch (e) { console.error(e); }
  }

  const handleSelectField = async (id: string) => {
    if (!id) return;
    setSelectedFieldId(id);
    const field = userFields.find(f => String(f.id) === id);
    setSelectedField(field || null);
    setLoadingChart(true);
    setFieldMapUrl(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/field-ndvi/', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          champ_id: id,
          index_type: selectedIndexType
        })
      });
      const result = await res.json();
      if (result.success) {
        const data = result.data || [];
        setFieldNdviData(data);
        if (data.length > 0) setFieldMapUrl(data[data.length - 1].map_url);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingChart(false); }
  };

  const handleChartFieldClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setFieldMapUrl(data.activePayload[0].payload.map_url);
    }
  };

  const handleDownloadCSV = () => {
    if (!timeseriesData.length) return alert("Pas de données");
    const csv = ["Année;Mois;NDVI\n", ...timeseriesData.map(r => `${r.year};${r.month};${r.ndvi}\n`)].join('');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NDVI_Admin.csv`;
    link.click();
  }

  // ========== FONCTIONS POUR LA COMPARAISON ==========
  const loadIndicesComparison = async (fieldId: string, indices: string[]) => {
    if (!fieldId || indices.length === 0) return;
    setLoadingComparison(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/field-indices-comparison/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ champ_id: fieldId, indices })
      });
      const result = await res.json();
      if (result.success) {
        setComparisonData(result.data);
      } else {
        console.error('Erreur comparaison', result.error);
        alert('Erreur lors du chargement des indices');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur réseau');
    } finally {
      setLoadingComparison(false);
    }
  };

  const applyComparison = () => {
    const selected = availableIndices.filter(i => i.enabled).map(i => i.id);
    if (selected.length === 0) {
      alert('Sélectionnez au moins un indice');
      return;
    }
    setShowComparisonModal(false);
    setCompareMode(true);
    loadIndicesComparison(selectedFieldId, selected);
  };

  const exitComparison = () => {
    setCompareMode(false);
    setComparisonData({});
    // Recharger les données simples avec l'indice actif
    if (selectedFieldId) handleSelectField(selectedFieldId);
  };

  // ========== FETCH AUTRES DONNÉES ==========
  const fetchWeather = useCallback(async () => {
    console.log('🌤️ Fetching weather for:', weatherCoords.lat, weatherCoords.lon, weatherCoords.name)
    try {
      const response = await fetch(`/api/weather?lat=${weatherCoords.lat}&lon=${weatherCoords.lon}&_t=${Date.now()}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setWeatherData({
            temperature: result.data.temperature,
            humidity: result.data.humidity,
            rainfall: result.data.rainfall,
            forecast: result.data.forecast,
            lastUpdate: new Date(result.data.lastUpdate || Date.now()).toLocaleString('fr-FR'),
            windSpeed: result.data.windSpeed,
            uvIndex: result.data.uvIndex,
            pressure: result.data.pressure
          })
        }
      }
    } catch (error) { console.error('Error fetching weather:', error) }
  }, [weatherCoords.lat, weatherCoords.lon])

  const fetchWeatherForecast = useCallback(async () => {
    console.log('📅 Fetching forecast for:', weatherCoords.lat, weatherCoords.lon)
    try {
      const response = await fetch(`/api/weather/forecast?lat=${weatherCoords.lat}&lon=${weatherCoords.lon}&_t=${Date.now()}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setWeatherForecast(result.data.daily || [])
          setHourlyForecast(result.data.hourly || [])
        }
      }
    } catch (error) { console.error('Error fetching forecast:', error) }
  }, [weatherCoords.lat, weatherCoords.lon])

  useEffect(() => {
    if (weatherCoords.lat && weatherCoords.lon) {
      fetchWeather()
      fetchWeatherForecast()
    }
  }, [fetchWeather, fetchWeatherForecast])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations')
      if (response.ok) {
        const result = await response.json()
        if (result.success) setRecommendations(result.data)
      }
    } catch (error) { console.error('Error fetching recommendations:', error) }
  }

  const fetchCalendarEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events')
      if (response.ok) {
        const result = await response.json()
        if (result.success) setCalendarEvents(result.data)
      }
    } catch (error) { console.error('Error fetching calendar events:', error) }
  }

  const fetchCrops = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/crops')
      const result = await response.json()
      if (result.success) {
        const transformedCrops = result.data.map((crop: any) => ({
          ...crop,
          type: crop.type.toLowerCase(),
          status: crop.status.toLowerCase(),
          healthStatus: crop.healthStatus.toLowerCase(),
          challenges: Array.isArray(crop.challenges) ? crop.challenges : (crop.challenges ? JSON.parse(crop.challenges) : []),
          opportunities: Array.isArray(crop.opportunities) ? crop.opportunities : (crop.opportunities ? JSON.parse(crop.opportunities) : []),
          lastUpdate: new Date(crop.updatedAt).toLocaleDateString('fr-FR')
        }))
        setCrops(transformedCrops)
      }
    } catch (error) { console.error('Error fetching crops:', error) }
    finally { setLoading(false) }
  }

  const handleSaveWeather = async (weatherData: WeatherData) => {
    try {
      setWeatherLoading(true)
      const response = await fetch('/api/weather', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(weatherData) })
      if (response.ok) { await fetchWeather(); setShowWeatherForm(false); alert('Données météo mises à jour !') }
    } catch (error) { console.error('Error saving weather:', error) }
    finally { setWeatherLoading(false) }
  }

  const handleUpdateRecommendationStatus = async (id: string, status: Recommendation['status']) => {
    try {
      const response = await fetch(`/api/recommendations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      if (response.ok) { setRecommendations(prev => prev.map(rec => rec.id === id ? { ...rec, status } : rec)) }
    } catch (error) { console.error('Error updating recommendation:', error) }
  }

  const handleAddCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const response = await fetch('/api/calendar/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event) })
      if (response.ok) { const result = await response.json(); setCalendarEvents(prev => [...prev, result.data]) }
    } catch (error) { console.error('Error adding calendar event:', error) }
  }

  const handleSaveCrop = async (cropData: any) => {
    try {
      const method = cropData.id ? 'PUT' : 'POST'
      const url = cropData.id ? `/api/admin/crops/${cropData.id}` : '/api/admin/crops'
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cropData) })
      if (response.ok) { await fetchCrops(); setShowForm(false); setEditingCrop(null); alert('Culture enregistrée !') }
    } catch (error) { console.error('Error saving crop:', error) }
  }

  const handleDeleteCrop = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette culture ?')) return
    try {
      const response = await fetch(`/api/admin/crops/${id}`, { method: 'DELETE' })
      if (response.ok) { await fetchCrops(); alert('Culture supprimée !') }
    } catch (error) { console.error('Error deleting crop:', error) }
  }

  // ========== HELPERS ==========
  const getStatusColor = (status: string) => { switch (status) { case 'growing': return 'bg-green-100 text-green-800'; case 'harvesting': return 'bg-yellow-100 text-yellow-800'; case 'planted': return 'bg-blue-100 text-blue-800'; default: return 'bg-gray-100 text-gray-800' } }
  const getHealthStatusColor = (status: string) => { switch (status) { case 'good': return 'bg-green-100 text-green-800 border-green-200'; case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; case 'critical': return 'bg-red-100 text-red-800 border-red-200'; default: return 'bg-gray-100 text-gray-800 border-gray-200' } }
  const getHealthStatusIcon = (status: string) => { switch (status) { case 'good': return <TrendingUp className="w-4 h-4" />; case 'warning': return <AlertTriangle className="w-4 h-4" />; case 'critical': return <AlertTriangle className="w-4 h-4" />; default: return <TreePine className="w-4 h-4" /> } }
  const getHealthStatusText = (status: string) => { switch (status) { case 'good': return 'Bonne'; case 'warning': return 'Attention'; case 'critical': return 'Critique'; default: return status } }
  const getStatusText = (status: string) => { switch (status) { case 'growing': return 'En croissance'; case 'harvesting': return 'En récolte'; case 'planted': return 'Planté'; case 'preparing': return 'Préparation'; default: return status } }
  const getTypeColor = (type: string) => { switch (type) { case 'cereal': return 'bg-yellow-100 text-yellow-800'; case 'tuber': return 'bg-orange-100 text-orange-800'; case 'vegetable': return 'bg-green-100 text-green-800'; case 'fruit': return 'bg-red-100 text-red-800'; case 'legume': return 'bg-purple-100 text-purple-800'; default: return 'bg-gray-100 text-gray-800' } }
  const getRecommendationColor = (priority: Recommendation['priority']) => { switch (priority) { case 'high': return 'bg-red-100 text-red-800 border-red-200'; case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; case 'low': return 'bg-green-100 text-green-800 border-green-200' } }
  const getEventTypeColor = (type: CalendarEvent['type']) => { switch (type) { case 'planting': return 'bg-green-100 text-green-800'; case 'harvest': return 'bg-yellow-100 text-yellow-800'; case 'fertilization': return 'bg-blue-100 text-blue-800'; case 'irrigation': return 'bg-cyan-100 text-cyan-800'; case 'inspection': return 'bg-purple-100 text-purple-800'; case 'maintenance': return 'bg-gray-100 text-gray-800'; default: return 'bg-gray-100 text-gray-800' } }
  const getWeatherIcon = (icon: string) => { switch (icon) { case 'sun': return <Sun className="w-6 h-6" />; case 'cloud-sun': return <CloudSun className="w-6 h-6" />; case 'cloud-rain': return <CloudRain className="w-6 h-6" />; case 'cloud': return <Cloud className="w-6 h-6" />; default: return <SunDim className="w-6 h-6" /> } }

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) || crop.area.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || crop.type === selectedType.toLowerCase()
    return matchesSearch && matchesType
  })

  const stats = {
    totalArea: crops.reduce((sum, crop) => sum + crop.areaHa, 0),
    totalFarmers: crops.reduce((sum, crop) => sum + crop.farmers, 0),
    goodHealth: crops.filter(crop => crop.healthStatus === 'good').length,
    warningHealth: crops.filter(crop => crop.healthStatus === 'warning').length,
    criticalHealth: crops.filter(crop => crop.healthStatus === 'critical').length,
    irrigated: crops.filter(crop => crop.irrigation).length
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>

  const getLegendGradient = () => {
    if (selectedIndexType === 'evi') {
      return 'linear-gradient(to right, #000044, #004433, #008822, #00aa44, #00cc00, #66ff00, #ccff00, #ffe611, #ffffbe)';
    }
    return 'linear-gradient(to right, #a50026, #d73027, #f46d43, #fdae61, #fee08b, #d9ef8b, #a6d96a, #66bd63, #1a9850, #006837)';
  };

  const getLegendTitle = () => {
    switch (selectedIndexType) {
      case 'ndvi': return 'Santé Végétation (NDVI)';
      case 'evi': return 'Végétation Amélioré (EVI)';
      case 'ndwi': return 'Humidité (NDWI)';
      case 'msavi': return 'Sol Nu (MSAVI)';
      default: return 'Santé (NDVI)';
    }
  };

  const getLegendDescription = () => {
    switch (selectedIndexType) {
      case 'ndvi': return 'NDVI : Indice de végétation normalisé';
      case 'evi': return 'EVI : Indice amélioré pour zones denses';
      case 'ndwi': return 'NDWI : Détection d\'humidité et eau';
      case 'msavi': return 'MSAVI : Réduction effet du sol';
      default: return '';
    }
  };
  console.log("📤 [Agriculture] Passage de weatherData au Chatbot =", weatherData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion Agricole</h2>
          <p className="text-gray-600 mt-1">Suivi des cultures, météo et recommandations agricoles</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><Download className="w-4 h-4 inline mr-2" />Exporter</button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><Plus className="w-4 h-4 inline mr-2" />Nouvelle culture</button>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center"><Cloud className="w-5 h-5 mr-2" />Météo Agricole</h3>
              <button onClick={() => setShowWeatherForm(true)} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center"><Edit className="w-3 h-3 mr-1" />Modifier</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2"><Thermometer className="w-4 h-4" /><div><p className="text-sm opacity-90">Température</p><p className="text-xl font-bold">{weatherData.temperature}°C</p></div></div>
              <div className="flex items-center space-x-2"><Droplets className="w-4 h-4" /><div><p className="text-sm opacity-90">Humidité</p><p className="text-xl font-bold">{weatherData.humidity}%</p></div></div>
              <div className="flex items-center space-x-2"><Cloud className="w-4 h-4" /><div><p className="text-sm opacity-90">Pluviométrie</p><p className="text-xl font-bold">{weatherData.rainfall}mm</p></div></div>
              <div><p className="text-sm opacity-90">Prévisions</p><p className="text-sm font-medium">{weatherData.forecast}</p></div>
            </div>
          </div>
          <div className="text-right ml-4"><p className="text-sm opacity-75">Dernière mise à jour</p><p className="text-sm">{weatherData.lastUpdate}</p></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Surface totale</p><p className="text-2xl font-bold text-gray-900">{stats.totalArea} ha</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><TreePine className="w-6 h-6 text-green-600" /></div></div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Agriculteurs</p><p className="text-2xl font-bold text-gray-900">{stats.totalFarmers}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div></div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Santé bonne</p><p className="text-2xl font-bold text-green-600">{stats.goodHealth}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-green-600" /></div></div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Avec irrigation</p><p className="text-2xl font-bold text-cyan-600">{stats.irrigated}</p></div><div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center"><Droplets className="w-6 h-6 text-cyan-600" /></div></div></div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[{ id: 'crops', label: 'Cultures' }, { id: 'weather', label: 'Météo' }, { id: 'recommendations', label: 'Recommandations' }, { id: 'calendar', label: 'Calendrier' }, { id: 'explorer', label: 'Observatoire' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{tab.label}</button>
          ))}
        </nav>
      </div>

      {/* ========== ONGLET CULTURES ========== */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Rechercher une culture..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64" /></div>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">{cropTypes.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}</select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600"><span>{filteredCrops.length} culture{filteredCrops.length > 1 ? 's' : ''}</span></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCrops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(crop.type)}`}><TreePine className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(crop.type)}`}>{cropTypes.find(t => t.id === crop.type)?.name}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(crop.status)}`}>{getStatusText(crop.status)}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getHealthStatusColor(crop.healthStatus)}`}>{getHealthStatusIcon(crop.healthStatus)}<span className="ml-1">{getHealthStatusText(crop.healthStatus)}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setSelectedCrop(crop)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => setEditingCrop(crop)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Edit className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2 text-gray-600"><MapPin className="w-4 h-4" /><span>{crop.area}</span></div>
                  <div className="flex items-center space-x-2 text-gray-600"><Users className="w-4 h-4" /><span>{crop.farmers} agriculteurs</span></div>
                  <div className="flex items-center space-x-2 text-gray-600"><TreePine className="w-4 h-4" /><span>{crop.areaHa} ha</span></div>
                  <div className="flex items-center space-x-2 text-gray-600"><TrendingUp className="w-4 h-4" /><span>Rendement: {crop.expectedYield}</span></div>
                </div>
                <div className="mb-4"><p className="text-sm font-medium text-gray-700 mb-1">Saison actuelle</p><p className="text-sm text-gray-600">{crop.currentSeason}</p></div>
                <div className="mb-4"><p className="text-sm font-medium text-gray-700 mb-1">Prochaine action</p><p className="text-sm text-orange-600 font-medium">{crop.nextAction}</p></div>
                {crop.challenges.length > 0 && (<div className="mb-4"><p className="text-sm font-medium text-red-700 mb-1">Défis</p><div className="flex flex-wrap gap-1">{crop.challenges.map((challenge, index) => (<span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{challenge}</span>))}</div></div>)}
                {crop.opportunities.length > 0 && (<div><p className="text-sm font-medium text-green-700 mb-1">Opportunités</p><div className="flex flex-wrap gap-1">{crop.opportunities.map((opportunity, index) => (<span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{opportunity}</span>))}</div></div>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== ONGLET MÉTÉO ========== */}
      {activeTab === 'weather' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Conditions actuelles</h3>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" /> 
                Prévisions pour : <span className="font-bold text-gray-700 ml-1">{weatherCoords.name}</span>
                <span className="text-xs text-gray-400 ml-2 bg-gray-100 px-2 py-0.5 rounded">({weatherCoords.lat}, {weatherCoords.lon})</span>
              </p>
              
              <button onClick={() => setShowWeatherForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"><Edit className="w-4 h-4 mr-2" />Mettre à jour</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4"><div className="flex items-center space-x-2"><Thermometer className="w-5 h-5 text-blue-600" /><div><p className="text-sm text-gray-600">Température</p><p className="text-xl font-bold text-blue-600">{weatherData.temperature}°C</p></div></div></div>
              <div className="bg-cyan-50 rounded-lg p-4"><div className="flex items-center space-x-2"><Droplets className="w-5 h-5 text-cyan-600" /><div><p className="text-sm text-gray-600">Humidité</p><p className="text-xl font-bold text-cyan-600">{weatherData.humidity}%</p></div></div></div>
              <div className="bg-indigo-50 rounded-lg p-4"><div className="flex items-center space-x-2"><Umbrella className="w-5 h-5 text-indigo-600" /><div><p className="text-sm text-gray-600">Pluviométrie</p><p className="text-xl font-bold text-indigo-600">{weatherData.rainfall}mm</p></div></div></div>
              <div className="bg-purple-50 rounded-lg p-4"><div className="flex items-center space-x-2"><Wind className="w-5 h-5 text-purple-600" /><div><p className="text-sm text-gray-600">Vitesse vent</p><p className="text-xl font-bold text-purple-600">{weatherData.windSpeed || 12} km/h</p></div></div></div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg"><h4 className="font-semibold text-gray-900 mb-2">Prévisions actuelles</h4><p className="text-gray-700">{weatherData.forecast}</p></div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution sur la journée</h3>
            
            {hourlyForecast.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                <Cloud className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chargement des données horaires...</p>
                <p className="text-xs mt-1">(Si cela persiste, vérifiez la clé API et le fichier .env.local)</p>
              </div>
            ) : (
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                {hourlyForecast.map((hour, index) => (
                  <div key={index} className="flex-shrink-0 flex flex-col items-center p-3 bg-gray-50 rounded-lg min-w-[80px] hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200">
                    <span className="text-sm font-bold text-gray-800">{hour.time}</span>
                    <div className="my-2 text-blue-500">
                      {getWeatherIcon(hour.icon)}
                    </div>
                    <span className="text-lg font-bold text-gray-900">{hour.temp}°</span>
                    {hour.rain > 0 && (
                      <span className="text-xs text-blue-600 mt-1 flex items-center">
                        <Droplets className="w-3 h-3 mr-1" />{hour.rain}mm
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prévisions sur 5 jours</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {weatherForecast.map((day) => (
                <div key={day.id} className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">{day.day}</p>
                  <p className="text-sm text-gray-500">{day.date}</p>
                  <div className="my-3 flex justify-center">{getWeatherIcon(day.icon)}</div>
                  <div className="flex justify-center space-x-2"><p className="font-bold text-gray-900">{day.temperature.max}°</p><p className="text-gray-500">{day.temperature.min}°</p></div>
                  <p className="text-sm text-gray-600 mt-1">{day.condition}</p>
                  <p className="text-sm text-blue-600 mt-1">{day.precipitation}% précip.</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes météo</h3>
            <div className="space-y-3">
              {weatherData.temperature > 35 && (<div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" /><div><h4 className="font-semibold text-red-800">Alerte canicule</h4><p className="text-red-700 text-sm">Température élevée ({weatherData.temperature}°C) - Risque pour certaines cultures sensibles</p><p className="text-red-600 text-xs mt-1">Recommandation: Augmenter l'irrigation</p></div></div>)}
              {weatherData.rainfall > 50 && (<div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg"><CloudRain className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" /><div><h4 className="font-semibold text-blue-800">Risque de pluies importantes</h4><p className="text-blue-700 text-sm">Précipitations élevées ({weatherData.rainfall}mm) - Surveillance des inondations</p><p className="text-blue-600 text-xs mt-1">Recommandation: Vérifier les systèmes de drainage</p></div></div>)}
              {weatherData.humidity > 70 && (<div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg"><Droplets className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" /><div><h4 className="font-semibold text-yellow-800">Humidité élevée</h4><p className="text-yellow-700 text-sm">Humidité à {weatherData.humidity}% - Risque accru de maladies fongiques</p><p className="text-yellow-600 text-xs mt-1">Recommandation: Traitements préventifs</p></div></div>)}
            </div>
          </div>
        </div>
      )}

      {/* ========== ONGLET RECOMMANDATIONS ========== */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recommandations prioritaires</h3>
              <button onClick={() => alert('Génération en cours...')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"><RefreshCw className="w-4 h-4 mr-2" />Générer</button>
            </div>
            <div className="space-y-4">
              {recommendations.filter(rec => rec.priority === 'high').map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRecommendationColor(rec.priority)}`}>Haute priorité</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${rec.status === 'completed' ? 'bg-green-100 text-green-800' : rec.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{rec.status === 'completed' ? 'Terminé' : rec.status === 'in_progress' ? 'En cours' : 'En attente'}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <p className="text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <div className="ml-4 flex flex-col space-y-2">
                      <button onClick={() => handleUpdateRecommendationStatus(rec.id, 'completed')} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">Terminer</button>
                      <button onClick={() => handleUpdateRecommendationStatus(rec.id, 'in_progress')} className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">En cours</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Toutes les recommandations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${recommendation.type === 'irrigation' ? 'bg-blue-100' : recommendation.type === 'fertilization' ? 'bg-green-100' : recommendation.type === 'pest_control' ? 'bg-red-100' : recommendation.type === 'harvest' ? 'bg-yellow-100' : 'bg-purple-100'}`}>
                      {recommendation.type === 'irrigation' && <Droplets className="w-5 h-5 text-blue-600" />}
                      {recommendation.type === 'fertilization' && <Sprout className="w-5 h-5 text-green-600" />}
                      {recommendation.type === 'pest_control' && <ShieldAlert className="w-5 h-5 text-red-600" />}
                      {recommendation.type === 'harvest' && <TreePine className="w-5 h-5 text-yellow-600" />}
                      {recommendation.type === 'planting' && <Sprout className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRecommendationColor(recommendation.priority)}`}>{recommendation.priority}</span>
                        <button onClick={() => handleUpdateRecommendationStatus(recommendation.id, recommendation.status === 'pending' ? 'in_progress' : 'completed')} className={`px-3 py-1 text-xs rounded ${recommendation.status === 'completed' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>{recommendation.status === 'completed' ? 'Terminé' : recommendation.status === 'in_progress' ? 'Marquer comme terminé' : 'Commencer'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations basées sur la météo</h3>
            <div className="space-y-3">
              {weatherData.temperature > 30 && (<div className="p-4 bg-orange-50 border border-orange-200 rounded-lg"><div className="flex items-center space-x-2 mb-2"><Thermometer className="w-5 h-5 text-orange-600" /><h4 className="font-semibold text-orange-800">Température élevée</h4></div><ul className="space-y-2 text-orange-700"><li>• Augmenter la fréquence d'irrigation</li><li>• Arroser tôt le matin ou tard le soir</li><li>• Surveiller les signes de stress hydrique</li><li>• Protéger les cultures sensibles avec des ombrières</li></ul></div>)}
              {weatherData.rainfall > 40 && (<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg"><div className="flex items-center space-x-2 mb-2"><CloudRain className="w-5 h-5 text-blue-600" /><h4 className="font-semibold text-blue-800">Précipitations importantes</h4></div><ul className="space-y-2 text-blue-700"><li>• Vérifier les systèmes de drainage</li><li>• Éviter l'application d'engrais avant la pluie</li><li>• Surveiller les maladies fongiques</li><li>• Protéger les zones sensibles à l'érosion</li></ul></div>)}
              {weatherData.humidity > 65 && (<div className="p-4 bg-green-50 border border-green-200 rounded-lg"><div className="flex items-center space-x-2 mb-2"><Droplets className="w-5 h-5 text-green-600" /><h4 className="font-semibold text-green-800">Humidité élevée</h4></div><ul className="space-y-2 text-green-700"><li>• Appliquer des fongicides préventifs</li><li>• Assurer une bonne aération des cultures</li><li>• Éviter les tailles et élagages</li><li>• Surveiller mildiou et oïdium</li></ul></div>)}
            </div>
          </div>
        </div>
      )}

      {/* ========== ONGLET CALENDRIER ========== */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div><h3 className="text-lg font-semibold text-gray-900">Calendrier Agricole</h3><p className="text-gray-600 text-sm">Planification des activités agricoles</p></div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><CalendarDays className="w-4 h-4 inline mr-2" />Vue mensuelle</button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4 inline mr-2" />Nouvel événement</button>
              </div>
            </div>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">Janvier 2024</h4>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">Aujourd'hui</button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (<div key={day} className="text-center font-medium text-gray-500 py-2">{day}</div>))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const dateStr = `2024-01-${day.toString().padStart(2, '0')}`
                  const dayEvents = calendarEvents.filter(event => new Date(event.startDate).getDate() === day || new Date(event.endDate).getDate() === day)
                  return (<div key={day} className="border border-gray-200 min-h-24 p-1">
                    <div className="text-right"><span className={`inline-block w-6 h-6 text-center rounded-full ${day === new Date().getDate() ? 'bg-green-100 text-green-800' : 'text-gray-700'}`}>{day}</span></div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map(event => (<div key={event.id} className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}>{event.title}</div>))}
                      {dayEvents.length > 2 && (<div className="text-xs text-gray-500 text-center">+{dayEvents.length - 2} autres</div>)}
                    </div>
                  </div>)
                })}
              </div>
            </div>
            <div><h4 className="font-semibold text-gray-900 mb-4">Événements à venir</h4><div className="space-y-3">
              {calendarEvents.filter(event => new Date(event.startDate) >= new Date()).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 5).map(event => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.type)}`}>{event.type === 'planting' ? 'Plantation' : event.type === 'harvest' ? 'Récolte' : event.type === 'fertilization' ? 'Fertilisation' : event.type === 'irrigation' ? 'Irrigation' : event.type === 'inspection' ? 'Inspection' : 'Maintenance'}</span><span className={`px-2 py-1 text-xs font-medium rounded-full ${event.status === 'completed' ? 'bg-green-100 text-green-800' : event.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : event.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{event.status === 'completed' ? 'Terminé' : event.status === 'in_progress' ? 'En cours' : event.status === 'cancelled' ? 'Annulé' : 'Planifié'}</span></div>
                      <h5 className="font-semibold text-gray-900">{event.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500"><span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{new Date(event.startDate).toLocaleDateString('fr-FR')}{event.startDate !== event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('fr-FR')}`}</span><span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{event.location}</span></div>
                      {event.crops.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">{event.crops.map((crop, index) => (<span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{crop}</span>))}</div>)}
                    </div>
                    <div className="flex space-x-2"><button className="p-2 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button><button className="p-2 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></button></div>
                  </div>
                </div>
              ))}
            </div></div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4"><div className="flex items-center"><Calendar className="w-8 h-8 text-green-600 mr-3" /><div><p className="text-sm text-gray-600">Événements ce mois</p><p className="text-2xl font-bold text-green-600">{calendarEvents.filter(event => new Date(event.startDate).getMonth() === new Date().getMonth()).length}</p></div></div></div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-center"><CheckCircle className="w-8 h-8 text-blue-600 mr-3" /><div><p className="text-sm text-gray-600">À venir cette semaine</p><p className="text-2xl font-bold text-blue-600">{calendarEvents.filter(event => { const eventDate = new Date(event.startDate); const today = new Date(); const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7); return eventDate >= today && eventDate <= nextWeek }).length}</p></div></div></div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"><div className="flex items-center"><AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" /><div><p className="text-sm text-gray-600">En retard</p><p className="text-2xl font-bold text-yellow-600">{calendarEvents.filter(event => new Date(event.startDate) < new Date() && event.status === 'scheduled').length}</p></div></div></div>
            </div>
          </div>
        </div>
      )}

      {/* ========== ONGLET EXPLORATEUR ========== */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Observatoire NDVI & Suivi de Champ</h3>
            {mapLoading ? (
              <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Chargement de la couche {analysisConfig.zoneType}...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* --- 1. BARRE LATÉRALE (SIDEBAR) --- */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => setViewMode('admin')} className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${viewMode === 'admin' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Vue Administrative</button>
                      <button onClick={() => setViewMode('field')} className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${viewMode === 'field' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Mes Champs</button>
                    </div>
                  </div>

                  {viewMode === 'admin' && (
                    <>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center"><Layers className="w-4 h-4 mr-2" />Niveau administratif</h4>
                        <div className="grid grid-cols-3 gap-1 bg-gray-200 p-1 rounded-lg">
                          {['region', 'prefecture', 'commune'].map((type) => (
                            <button key={type} onClick={() => setAnalysisConfig(p => ({ ...p, zoneType: type, zoneId: '' }))} className={`py-1 px-2 text-xs font-medium rounded-md capitalize transition-all ${analysisConfig.zoneType === type ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{type}</button>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Zone sélectionnée</label>
                        <select value={analysisConfig.zoneId} onChange={(e) => setAnalysisConfig(p => ({ ...p, zoneId: e.target.value }))} className="w-full text-sm border-gray-300 rounded">
                          <option value="">-- Choisissez une {analysisConfig.zoneType} --</option>
                          {availableZones.map((z) => (<option key={z.id} value={z.id}>{z.name}</option>))}
                        </select>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center"><Calendar className="w-4 h-4 mr-2" />Période visuelle</h4>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                          {Object.keys(ndviTiles).sort().reverse().map(year => (<option key={year} value={year}>Année {year}</option>))}
                        </select>
                      </div>
                    </>
                  )}

                  {viewMode === 'field' && (
                    <div className="space-y-4">
                      <IndexSelector value={selectedIndexType} onChange={setSelectedIndexType} />
                      
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-700 text-xs">Mes Parcelles</h4>
                          <button onClick={() => setShowAddFieldModal(true)} className="text-green-600 hover:text-green-800"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input 
                            type="text" 
                            placeholder="Chercher par propriétaire..." 
                            value={fieldSearchTerm} 
                            onChange={(e) => setFieldSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-1.5 border border-gray-200 rounded text-sm w-full focus:ring-1 focus:ring-green-500 focus:outline-none" 
                          />
                        </div>
                        <select 
                          value={selectedFieldId} 
                          onChange={(e) => handleSelectField(e.target.value)} 
                          className="w-full text-sm border-gray-300 rounded bg-white"
                        >
                          <option value="">-- Sélectionner un champ --</option>
                          {userFields
                            .filter((f: any) => 
                              f.properties.proprietaire && 
                              f.properties.proprietaire.toLowerCase().includes(fieldSearchTerm.toLowerCase())
                            )
                            .map((f: any) => (
                              <option key={f.id} value={f.id}>{f.properties.nom} ({f.properties.proprietaire})</option>
                            ))}
                        </select>
                      </div>
                      {selectedFieldId && selectedField && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-800 font-semibold">Info Champ</p>
                          <p className="text-xs text-blue-600 mt-1">Date de semis: {selectedField.properties.date_semi}</p>
                          <p className="text-xs text-blue-600 mt-1">Culture: {selectedField.properties.type_culture}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-medium text-gray-700 mb-2 text-xs">{getLegendTitle()}</h4>
                    <div className="h-3 w-full rounded mb-1" style={{ background: getLegendGradient() }}></div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                      <span>Faible</span>
                      <span>Élevé</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2 text-center">{getLegendDescription()}</p>
                  </div>
                </div>

                {/* --- 2. ZONE PRINCIPALE (CARTE + TIMELINE) --- */}
                <div className="lg:col-span-3 flex flex-col space-y-4">
                  
                  {viewMode === 'field' && selectedFieldId && !compareMode && (
                    <FieldTimelineStrip 
                      data={fieldNdviData} 
                      activeMapUrl={fieldMapUrl} 
                      onSelectDate={(url) => setFieldMapUrl(url)} 
                    />
                  )}

                  <div className="rounded-lg overflow-hidden border border-gray-300 shadow-md relative" style={{ height: '600px', zIndex: 0 }}>
                    <MapContainer center={[8.6, 1.2]} zoom={viewMode === 'field' ? 12 : 7} zoomControl={false} style={{ height: '100%', width: '100%', backgroundColor: '#e5e7eb' }}>
                      
                      <ZoomControl />

                      <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Carte Sombre (Dark)">
                          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="OpenStreetMap Standard">
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Google Satellite">
                           <TileLayer url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                           maxZoom={20}
                            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}/>
                        </LayersControl.BaseLayer>

                        <LayersControl.Overlay name="🌥️ Nuages" checked={false}>
                          <TileLayer 
                            url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`} 
                            opacity={0.8} 
                          />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="🌧️ Précipitations" checked={false}>
                          <TileLayer 
                            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`} 
                            opacity={0.6} 
                          />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="🌡️ Température" checked={false}>
                          <TileLayer 
                            url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`} 
                            opacity={0.6} 
                          />
                        </LayersControl.Overlay>

                        {viewMode === 'field' && fieldMapUrl && !compareMode && (
                          <LayersControl.Overlay name={`🛰️ ${selectedIndexType.toUpperCase()} Champ (Actuel)`} checked={true}>
                             <TileLayer key={fieldMapUrl} url={fieldMapUrl} attribution="Google Earth Engine (Sentinel-2)" opacity={0.8} />
                          </LayersControl.Overlay>
                        )}

                        {viewMode === 'admin' && clippedMapUrl && (
                           <LayersControl.Overlay name="🛰️ NDVI Zoom (Sélection)" checked={true}>
                             <TileLayer key={clippedMapUrl} url={clippedMapUrl} attribution="Google Earth Engine" opacity={0.85} />
                           </LayersControl.Overlay>
                        )}

                        {viewMode === 'admin' && !clippedMapUrl && ndviTiles[selectedYear] && (
                           <LayersControl.Overlay name={`🛰️ NDVI Global ${selectedYear}`} checked={true}>
                             <TileLayer key={selectedYear} url={ndviTiles[selectedYear]} attribution="Google Earth Engine" opacity={0.7} />
                           </LayersControl.Overlay>
                        )}
                      </LayersControl>

                      {viewMode === 'admin' && mapGeoJson && <GeoJSON 
                        key={analysisConfig.zoneType} data={mapGeoJson} 
                        style={(feature) => {
                            const isSelected = String(feature.id) === analysisConfig.zoneId;
                            return { color: isSelected ? "#10b981" : "#ffffff", weight: isSelected ? 3 : 1, fillColor: isSelected ? "rgba(16, 185, 129, 0.2)" : "transparent", fillOpacity: 1 };
                        }}
                        onEachFeature={(feature, layer) => {
                          layer.on({ click: (e) => {
                            const zoneId = String(feature.id);
                            const zoneName = feature.properties.region || feature.properties.prefecture || feature.properties.commune || 'Inconnu';
                            
                            setMapClickInfo({ lat: e.latlng.lat, lng: e.latlng.lng, values: { name: zoneName, type: analysisConfig.zoneType }});
                            setAnalysisConfig(p => ({ ...p, zoneId: zoneId }));
                            
                            if (feature.geometry) {
                              const center = getPolygonCenter(feature.geometry);
                              setWeatherCoords({ 
                                lat: center.lat, 
                                lon: center.lon, 
                                name: zoneName,
                                lastUpdated: Date.now()
                              });
                            }
                          }});
                        }}
                      />}

                      {viewMode === 'field' && userFields.map((field: any) => (
                        <GeoJSON 
                          key={field.id} 
                          data={field.geometry} 
                          style={{ color: String(field.id) === selectedFieldId ? "#ef4444" : "#3b82f6", weight: String(field.id) === selectedFieldId ? 3 : 2, fillColor: String(field.id) === selectedFieldId ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.1)", fillOpacity: 1 }} 
                          onEachFeature={(_, layer) => { 
                            layer.bindPopup(`<b>${field.properties.nom}</b><br>${field.properties.type_culture}`); 
                            layer.on({ click: () => handleSelectField(String(field.id)) }); 
                          }} 
                        />
                      ))}
                    </MapContainer>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <p>{viewMode === 'field' ? (fieldMapUrl ? `Image Satellite (${selectedIndexType.toUpperCase()})` : "Sélectionnez un champ") : (clippedMapUrl ? "Vue Zoomée" : `Vue Globale (${selectedYear})`)}</p>
                    <p>Mode: {viewMode === 'admin' ? analysisConfig.zoneType.toUpperCase() : 'CHAMPS'}</p>
                  </div>
                </div>

                {/* --- 3. GRAPHIQUE ANALYSE TEMPORELLE --- */}
                <div className="mt-6 bg-white rounded-lg shadow p-6 lg:col-span-4 border-t-4 border-green-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        {viewMode === 'field' 
                          ? (compareMode ? 'Comparaison d\'indices' : `Suivi de Santé (${selectedIndexType.toUpperCase()})`)
                          : 'Analyse Temporelle'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {viewMode === 'field' 
                          ? (compareMode ? 'Courbes comparatives NDVI, EVI, NDWI, MSAVI' : 'Historique image par image (Passage ~5 jours)')
                          : 'Comparaison mensuelle du NDVI.'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {viewMode === 'field' && selectedFieldId && !compareMode && (
                        <button
                          onClick={() => setShowComparisonModal(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm flex items-center"
                        >
                          <Layers className="w-4 h-4 mr-2" /> Comparer les indices
                        </button>
                      )}
                      {viewMode === 'field' && compareMode && (
                        <button
                          onClick={exitComparison}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          Quitter comparaison
                        </button>
                      )}
                      {viewMode === 'admin' && (
                        <>
                          <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                            {['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map(year => (
                              <label key={year} className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded" checked={analysisConfig.selectedYears.includes(year)} onChange={(e) => { const newYears = e.target.checked ? [...analysisConfig.selectedYears, year] : analysisConfig.selectedYears.filter(y => y !== year); setAnalysisConfig(p => ({ ...p, selectedYears: newYears })) }} />
                                <span className="ml-2 text-xs text-gray-700 font-medium">{year}</span>
                              </label>
                            ))}
                          </div>
                          <button onClick={handleDownloadCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"><Download className="w-4 h-4 inline mr-2" />CSV</button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {(loadingChart || (viewMode === 'field' && selectedFieldId && loadingComparison)) && (
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-green-600 mx-auto animate-spin mb-2" />
                        <p className="text-sm text-gray-600">Chargement...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Mode comparaison : plusieurs courbes */}
                  {!loadingChart && !loadingComparison && viewMode === 'field' && compareMode && Object.keys(comparisonData).length > 0 && (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 1]} label={{ value: "Valeur de l'indice", angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          {availableIndices.filter(idx => comparisonData[idx.id] && comparisonData[idx.id].length > 0).map(idx => (
                            <Line
                              key={idx.id}
                              type="monotone"
                              data={comparisonData[idx.id]?.map(d => ({ date: d.date, value: d.value })) || []}
                              dataKey="value"
                              name={idx.name}
                              stroke={idx.color}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                      
                    </div>
                  )}

                  {/* Mode simple : une seule courbe (NDVI ou autre indice sélectionné) */}
                  {!loadingChart && !loadingComparison && viewMode === 'field' && !compareMode && fieldNdviData.length > 0 && (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={fieldNdviData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 1]} label={{ value: selectedIndexType.toUpperCase(), angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [value, selectedIndexType.toUpperCase()]} labelFormatter={(label) => `Date: ${label}`} />
                          <Line 
                            type="monotone" 
                            dataKey="ndvi" 
                            stroke="#ef4444" 
                            strokeWidth={2} 
                            dot={{ fill: '#ef4444', r: 4 }} 
                            activeDot={{ r: 6 }} 
                            onMouseMove={handleChartFieldClick}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Mode admin : séries annuelles */}
                  {!loadingChart && viewMode === 'admin' && timeseriesData.length > 0 && (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeseriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month_name" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 1]} label={{ value: "NDVI", angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value, name, props) => [value, `Année ${props.payload.year}`]} labelFormatter={(label) => `Mois: ${label}`} />
                          {Array.from(new Set(timeseriesData.map(d => d.year))).sort().map((year) => (
                            <Line key={year} type="monotone" dataKey="ndvi" stroke={year == selectedYear ? '#10b981' : '#9ca3af'} strokeWidth={year == selectedYear ? 3 : 1} name={`Année ${year}`} data={timeseriesData.filter(d => d.year == year)} dot={{ r: 3 }} connectNulls={false} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {!loadingChart && !loadingComparison && viewMode === 'field' && selectedFieldId && !compareMode && fieldNdviData.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg bg-gray-50">
                      <div className="text-center">Aucune donnée satellite pour ce champ</div>
                    </div>
                  )}

                  {!loadingChart && !loadingComparison && viewMode === 'field' && compareMode && Object.keys(comparisonData).length === 0 && selectedFieldId && (
                    <div className="h-32 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg bg-gray-50">
                      <div className="text-center">Aucune donnée pour les indices sélectionnés</div>
                    </div>
                  )}

                  {!loadingChart && viewMode === 'admin' && (!analysisConfig.zoneId || timeseriesData.length === 0) && (
                    <div className="h-32 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg bg-gray-50">
                      <div className="text-center">Sélectionnez une zone pour voir l'évolution temporelle</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* MODAL DE COMPARAISON */}
      {showComparisonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Comparer les indices</h3>
              <button onClick={() => setShowComparisonModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              {availableIndices.map(idx => (
                <label key={idx.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={idx.enabled}
                    onChange={(e) => {
                      setAvailableIndices(prev =>
                        prev.map(i => i.id === idx.id ? { ...i, enabled: e.target.checked } : i)
                      );
                    }}
                    className="form-checkbox h-5 w-5 text-green-600 rounded"
                  />
                  <span className="text-sm font-medium" style={{ color: idx.color }}>{idx.name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setShowComparisonModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Annuler</button>
              <button onClick={applyComparison} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Appliquer</button>
            </div>
          </div>
        </div>
      )}
      {showAddFieldModal && <AddFieldModal onClose={() => setShowAddFieldModal(false)} onSave={() => { setShowAddFieldModal(false); fetchUserFields(); }} />}
      {(showForm || editingCrop) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">{editingCrop ? 'Modifier la culture' : 'Nouvelle culture'}</h3><button onClick={() => { setShowForm(false); setEditingCrop(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <CropForm crop={editingCrop} onSave={handleSaveCrop} onCancel={() => { setShowForm(false); setEditingCrop(null); }} />
          </div>
        </div>
      )}
      {showWeatherForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Modifier la météo</h3><button onClick={() => setShowWeatherForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <WeatherForm weatherData={weatherData} onSave={handleSaveWeather} onCancel={() => setShowWeatherForm(false)} loading={weatherLoading} />
          </div>
        </div>
      )}
      {/* === LE CHATBOT DOIT ÊTRE ICI (Seulement ici) === */}
      
  {/* === CHATBOT INTÉGRÉ AVEC LES DONNÉES MÉTÉO === */}
      <Chatbot 
        // PAS de 'key' ici pour éviter de reset la conversation à chaque mise à jour météo
        alerts={recommendations} 
        weatherData={weatherData} 
        weatherForecast={weatherForecast} 
      />
    </div>
  )
}

// CropForm Component (inchangé)
function CropForm({ crop, onSave, onCancel }: { crop: Crop | null; onSave: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState(crop || { name: '', type: '', area: '', areaHa: 0, farmers: 0, currentSeason: '', expectedYield: '', status: 'PLANTED', healthStatus: 'GOOD', nextAction: '', irrigation: false, fertilizer: '', challenges: [], opportunities: [], latitude: 0, longitude: 0 })
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData) }
  const handleChange = (field: string, value: any) => { setFormData(prev => ({ ...prev, [field]: value })) }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom de la culture</label><input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Type de culture</label><select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required><option value="">Sélectionner...</option><option value="CEREAL">Céréale</option><option value="TUBER">Tubercule</option><option value="VEGETABLE">Légume</option><option value="FRUIT">Fruit</option><option value="LEGUME">Légumineuse</option></select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Zone</label><input type="text" value={formData.area} onChange={(e) => handleChange('area', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ex: Zone Nord" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Superficie (ha)</label><input type="number" value={formData.areaHa} onChange={(e) => handleChange('areaHa', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'agriculteurs</label><input type="number" value={formData.farmers} onChange={(e) => handleChange('farmers', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Saison actuelle</label><input type="text" value={formData.currentSeason} onChange={(e) => handleChange('currentSeason', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ex: Saison des pluies 2024" required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Rendement attendu</label><input type="text" value={formData.expectedYield} onChange={(e) => handleChange('expectedYield', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ex: 3.5 t/ha" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Statut</label><select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required><option value="PLANTED">Planté</option><option value="GROWING">En croissance</option><option value="HARVESTING">En récolte</option><option value="PREPARING">Préparation</option></select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">État de santé</label><select value={formData.healthStatus} onChange={(e) => handleChange('healthStatus', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required><option value="GOOD">Bonne</option><option value="WARNING">Attention</option><option value="CRITICAL">Critique</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Irrigation</label><select value={formData.irrigation ? 'true' : 'false'} onChange={(e) => handleChange('irrigation', e.target.value === 'true')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"><option value="false">Non</option><option value="true">Oui</option></select></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Prochaine action</label><input type="text" value={formData.nextAction} onChange={(e) => handleChange('nextAction', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ex: Fertilisation - 15 jours" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Engrais</label><input type="text" value={formData.fertilizer} onChange={(e) => handleChange('fertilizer', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ex: NPK 15-15-15" /></div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><Save className="w-4 h-4 inline mr-2" />{crop ? 'Mettre à jour' : 'Créer'}</button>
      </div>
    </form>
  )
}

// WeatherForm Component (inchangé)
function WeatherForm({ weatherData, onSave, onCancel, loading }: { weatherData: WeatherData; onSave: (data: WeatherData) => void; onCancel: () => void; loading: boolean }) {
  const [formData, setFormData] = useState(weatherData)
  const handleChange = (field: string, value: any) => { setFormData(prev => ({ ...prev, [field]: value })) }
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData) }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Température (°C)</label><input type="number" value={formData.temperature} onChange={(e) => handleChange('temperature', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="-50" max="60" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Humidité (%)</label><input type="number" value={formData.humidity} onChange={(e) => handleChange('humidity', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" max="100" required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Pluviométrie (mm)</label><input type="number" value={formData.rainfall} onChange={(e) => handleChange('rainfall', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" step="0.1" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Vitesse vent (km/h)</label><input type="number" value={formData.windSpeed || 12} onChange={(e) => handleChange('windSpeed', parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" max="200" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Prévisions</label><textarea value={formData.forecast} onChange={(e) => handleChange('forecast', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} maxLength={500} placeholder="Décrivez les prévisions météo pour les prochains jours..." required /></div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"><Save className="w-4 h-4 inline mr-2" />{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
      
    </form>
  )
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) { return (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>) }
function ChevronRight(props: React.SVGProps<SVGSVGElement>) { return (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>) }