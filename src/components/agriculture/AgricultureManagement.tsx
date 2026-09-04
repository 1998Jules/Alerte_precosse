'use client';

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  TreePine, Droplets, Sun, TrendingUp, TrendingDown, AlertTriangle, Calendar, MapPin,
  Users, Filter, Search, Plus, Edit, Eye, Download, Cloud, Thermometer,
  X, Save, Clock, Wind, Umbrella, SunDim, CloudRain, CloudSun, CheckCircle,
  CalendarDays, Sprout, ShieldAlert, RefreshCw, Layers, Trash2,
  AlertCircle, Activity, ArrowDownRight, ArrowUpRight, Zap, Bell
} from 'lucide-react'
import { MapContainer, TileLayer, GeoJSON, useMap, FeatureGroup, LayersControl } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'

import L from 'leaflet'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea, ComposedChart, Bar } from 'recharts'

import 'leaflet/dist/leaflet.css'
import Chatbot from '../Chatbot'
import DroughtIndicesPanel from './DroughtIndicesPanel'

// ========== CONFIGURATION DES VARIÉTÉS ==========
const CROP_VARIETIES_CONFIG: { [key: string]: { name: string; duration: number }[] } = {
  'Maïs': [
    { name: 'TZEE', duration: 90 },
    { name: 'Ikenne', duration: 95 },
    { name: 'Obatempa', duration: 100 },
    { name: 'Sotubaka', duration: 110 },
    { name: 'ACR', duration: 120 }
  ],
  'Riz': [
    { name: 'IR64', duration: 110 },
    { name: 'NERICA', duration: 90 },
    { name: 'WITA', duration: 120 }
  ],
  'Niébé': [
    { name: 'KVx', duration: 60 },
    { name: 'IT97K', duration: 65 }
  ],
  'Manioc': [
    { name: 'Borgou', duration: 365 },
    { name: 'Agric', duration: 365 }
  ],
  'Sorgho': [
    { name: 'S35', duration: 110 },
    { name: 'CSV', duration: 100 }
  ]
};

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

interface CropCalendarItem {
  id: number;
  name: string;
  variety?: string;       
  duration_days?: number; 
  crop_type: string; 
  sowing_start: number;
  sowing_end: number;
  weeding_start: number;
  weeding_end: number;
  harvest_start: number;
  harvest_end: number;
  other_activities?: string;
}

interface SimulationResult {
  crop_name: string;
  current_day: number;
  total_days: number;
  progress: number;
  stage: string;
  icon: string;
  actions: string[];
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

interface RegionWeatherData {
  nom: string; capitale: string; lat: number; lon: number;
  temperature: number | null; humidity: number | null; windSpeed: number | null;
  pressure: number | null; weatherCode: number | null; description: string;
  icon: string; emoji: string; iconColor: string;
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
  anomalyDates?: string[];
}

const FieldTimelineStrip = ({ data, activeMapUrl, onSelectDate, anomalyDates = [] }: FieldTimelineStripProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-gray-700 flex items-center">
          <CalendarDays className="w-4 h-4 mr-2 text-green-600" />
          Images Disponibles
        </h4>
        <div className="flex items-center space-x-2">
          {anomalyDates.length > 0 && (
            <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full font-semibold flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {anomalyDates.length} anomalie{anomalyDates.length > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{data.length} passages satellite</span>
        </div>
      </div>
      
      <div className="flex space-x-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-300">
        {data.map((item, idx) => {
          const isActive = activeMapUrl === item.map_url;
          const dateObj = new Date(item.date);
          const dateStr = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          const isAnomaly = anomalyDates.includes(item.date);
          const isCritical = isAnomaly && (item.ndvi < 0.3);
          
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(item.map_url)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg border transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-green-600 border-green-600 text-white shadow-lg transform scale-105' 
                  : isCritical
                    ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                    : isAnomaly
                      ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50'
              }`}
              title={`Date: ${item.date} | NDVI: ${item.ndvi}${isAnomaly ? ' | ⚠ Anomalie détectée' : ''}`}
            >
              <span className="text-[10px] font-bold mb-1">{dateStr}</span>
              <div 
                className={`w-2 h-2 rounded-full transition-colors ${
                  item.ndvi > 0.6 ? 'bg-green-500' : item.ndvi > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                } ${isActive ? 'bg-white' : ''}`}
              ></div>
              {isAnomaly && !isActive && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                  !
                </span>
              )}
            </button>
          );
        })}
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

// ========== CONFIGURATION DES SEUILS D'ANOMALIE PAR INDICE ==========
const INDEX_THRESHOLDS: { [key: string]: {
  critical: number;
  warning: number;
  dropThreshold: number;
  dropAbsolute: number;
  riseThreshold: number;
  riseAbsolute: number;
  unit: string;
  goodRange: string;
}} = {
  ndvi:   { critical: 0.30, warning: 0.45, dropThreshold: 0.20, dropAbsolute: 0.10, riseThreshold: 0.20, riseAbsolute: 0.10, unit: 'NDVI',   goodRange: '0.5 – 0.8' },
  evi:    { critical: 0.20, warning: 0.35, dropThreshold: 0.20, dropAbsolute: 0.08, riseThreshold: 0.20, riseAbsolute: 0.08, unit: 'EVI',    goodRange: '0.4 – 0.8' },
  ndwi:   { critical: 0.20, warning: 0.30, dropThreshold: 0.20, dropAbsolute: 0.08, riseThreshold: 0.20, riseAbsolute: 0.08, unit: 'NDWI',   goodRange: '0.3 – 0.6' },
  msavi:  { critical: 0.30, warning: 0.45, dropThreshold: 0.20, dropAbsolute: 0.10, riseThreshold: 0.20, riseAbsolute: 0.10, unit: 'MSAVI',  goodRange: '0.4 – 0.7' }
};

// ========== INTERFACE ANOMALIE ==========
interface IndexAnomaly {
  id: string;
  type: 'drop' | 'rise' | 'outlier' | 'critical_threshold' | 'continuous_decline' | 'below_average' | 'variation';
  severity: 'critical' | 'warning' | 'info';
  date: string;
  label: string;
  message: string;
  value?: number;
  previousValue?: number;
  previousDate?: string;
  variationPct?: number;
  direction?: 'up' | 'down';
  suggestion: string;
  indexType: string;
}

// ========== FONCTION : DÉTECTION D'ANOMALIES ==========
function detectIndexAnomalies(
  data: any[],
  indexKey: string,
  options?: { baseline?: number }
): IndexAnomaly[] {
  if (!data || data.length < 2) return [];

  const thresholds = INDEX_THRESHOLDS[indexKey.toLowerCase()] || INDEX_THRESHOLDS.ndvi;
  const anomalies: IndexAnomaly[] = [];

  const validPoints = data
    .map((d, i) => ({ date: d.date || `Point ${i+1}`, value: Number(d[indexKey]), raw: d }))
    .filter(p => !isNaN(p.value) && p.value !== null);

  if (validPoints.length < 2) return [];

  const values = validPoints.map(p => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;

  let declineStreak = 0;
  for (let i = 0; i < validPoints.length; i++) {
    const point = validPoints[i];
    const prev = i > 0 ? validPoints[i - 1] : null;

    if (point.value < thresholds.critical) {
      anomalies.push({
        id: `${indexKey}-crit-${i}`,
        type: 'critical_threshold',
        severity: 'critical',
        date: point.date,
        label: 'Seuil critique',
        message: `${thresholds.unit} = ${point.value.toFixed(3)} (sous le seuil critique ${thresholds.critical}). Végétation en stress sévère.`,
        value: point.value,
        suggestion: 'Irrigation d\'urgence, vérifier l\'état sanitaire, envisager une intervention immédiate.',
        indexType: indexKey
      });
    } else if (point.value < thresholds.warning) {
      anomalies.push({
        id: `${indexKey}-warn-${i}`,
        type: 'critical_threshold',
        severity: 'warning',
        date: point.date,
        label: 'Sous le seuil d\'alerte',
        message: `${thresholds.unit} = ${point.value.toFixed(3)} (sous ${thresholds.warning}). Végétation affaiblie.`,
        value: point.value,
        suggestion: 'Surveiller l\'irrigation et les intrants, planifier une inspection de terrain.',
        indexType: indexKey
      });
    }

    if (prev) {
      const delta = point.value - prev.value;
      const relVariation = Math.abs(delta) / Math.max(prev.value, 0.001);
      const variationPct = (delta / Math.max(prev.value, 0.001)) * 100;

      if (delta < 0 && relVariation >= thresholds.dropThreshold && Math.abs(delta) >= thresholds.dropAbsolute) {
        const severity: IndexAnomaly['severity'] = relVariation >= 0.35 ? 'critical' : 'warning';
        anomalies.push({
          id: `${indexKey}-drop-${i}`,
          type: 'drop',
          severity,
          date: point.date,
          label: relVariation >= 0.35 ? 'Baisse critique' : 'Baisse significative',
          message: `${thresholds.unit} en baisse de ${(relVariation * 100).toFixed(1)}% par rapport à ${prev.value.toFixed(3)} (le ${prev.date}) — valeur courante : ${point.value.toFixed(3)}.`,
          value: point.value,
          previousValue: prev.value,
          previousDate: prev.date,
          variationPct: -relVariation * 100,
          direction: 'down',
          suggestion: severity === 'critical'
            ? 'Chute critique : identifier la cause (sécheresse, maladie, intrusion, image défectueuse).'
            : 'Surveiller l\'évolution sur les prochains passages, vérifier l\'irrigation et l\'état sanitaire.',
          indexType: indexKey
        });
      }

      if (delta > 0 && relVariation >= thresholds.riseThreshold && Math.abs(delta) >= thresholds.riseAbsolute) {
        const severity: IndexAnomaly['severity'] = relVariation >= 0.35 ? 'warning' : 'info';
        anomalies.push({
          id: `${indexKey}-rise-${i}`,
          type: 'rise',
          severity,
          date: point.date,
          label: relVariation >= 0.35 ? 'Hausse marquée' : 'Hausse significative',
          message: `${thresholds.unit} en hausse de ${(relVariation * 100).toFixed(1)}% par rapport à ${prev.value.toFixed(3)} (le ${prev.date}) — valeur courante : ${point.value.toFixed(3)}.`,
          value: point.value,
          previousValue: prev.value,
          previousDate: prev.date,
          variationPct: relVariation * 100,
          direction: 'up',
          suggestion: severity === 'warning'
            ? 'Hausse inhabituelle : vérifier la qualité de l\'image satellite (nuages, ombres) ou confirmer par une visite terrain.'
            : 'Amélioration détectée : poursuivre les pratiques actuelles et surveiller la stabilité.',
          indexType: indexKey
        });
      }

      if (relVariation >= 0.10 && relVariation < thresholds.dropThreshold) {
        const alreadyAlerted = anomalies.some(a => a.id.endsWith(`-${i}`) && (a.type === 'drop' || a.type === 'rise'));
        if (!alreadyAlerted) {
          anomalies.push({
            id: `${indexKey}-variation-${i}`,
            type: 'variation',
            severity: 'info',
            date: point.date,
            label: delta > 0 ? 'Légère hausse' : 'Légère baisse',
            message: `${thresholds.unit} ${delta > 0 ? 'en légère hausse' : 'en légère baisse'} de ${(relVariation * 100).toFixed(1)}% par rapport à ${prev.value.toFixed(3)} (le ${prev.date}) — valeur courante : ${point.value.toFixed(3)}.`,
            value: point.value,
            previousValue: prev.value,
            previousDate: prev.date,
            variationPct: variationPct,
            direction: delta > 0 ? 'up' : 'down',
            suggestion: 'Variation modérée : à conserver sous surveillance pour confirmer la tendance.',
            indexType: indexKey
          });
        }
      }

      if (delta < 0) declineStreak++;
      else declineStreak = 0;

      if (declineStreak >= 3) {
        const startPoint = validPoints[i - declineStreak];
        anomalies.push({
          id: `${indexKey}-decline-${i}`,
          type: 'continuous_decline',
          severity: 'warning',
          date: point.date,
          label: `Déclin continu (${declineStreak + 1} pts)`,
          message: `${thresholds.unit} en baisse continue sur ${declineStreak + 1} passages consécutifs — de ${startPoint.value.toFixed(3)} (le ${startPoint.date}) à ${point.value.toFixed(3)} (le ${point.date}), soit ${(((startPoint.value - point.value) / Math.max(startPoint.value, 0.001)) * 100).toFixed(1)}% de perte cumulée.`,
          value: point.value,
          previousValue: startPoint.value,
          previousDate: startPoint.date,
          variationPct: -(((startPoint.value - point.value) / Math.max(startPoint.value, 0.001)) * 100),
          direction: 'down',
          suggestion: 'Tendance négative persistante : vérifier l\'apport en eau, les nuisibles et l\'état du sol.',
          indexType: indexKey
        });
      }
    }

    if (stdDev > 0) {
      const z = Math.abs((point.value - mean) / stdDev);
      const lowerFence = q1 - 1.5 * iqr;
      if (z > 2 || point.value < lowerFence) {
        const alreadyAlerted = anomalies.some(a => a.id.endsWith(`-${i}`) && (a.type === 'drop' || a.type === 'rise' || a.type === 'variation' || a.type === 'critical_threshold'));
        if (!alreadyAlerted) {
          anomalies.push({
            id: `${indexKey}-outlier-${i}`,
            type: 'outlier',
            severity: 'info',
            date: point.date,
            label: 'Valeur aberrante',
            message: `${thresholds.unit} = ${point.value.toFixed(3)} (z-score ${z.toFixed(2)}, écart ${Math.abs(point.value - mean).toFixed(3)} par rapport à la moyenne ${mean.toFixed(3)}).`,
            value: point.value,
            previousValue: prev ? prev.value : undefined,
            previousDate: prev ? prev.date : undefined,
            variationPct: prev ? ((point.value - prev.value) / Math.max(prev.value, 0.001)) * 100 : undefined,
            direction: prev ? (point.value > prev.value ? 'up' : 'down') : undefined,
            suggestion: 'Vérifier la qualité de l\'image satellite (nuages, ombres) ou confirmer par une visite terrain.',
            indexType: indexKey
          });
        }
      }
    }

    if (options?.baseline !== undefined) {
      if (point.value < options.baseline - stdDev) {
        anomalies.push({
          id: `${indexKey}-below-avg-${i}`,
          type: 'below_average',
          severity: 'warning',
          date: point.date,
          label: 'Sous la moyenne historique',
          message: `${thresholds.unit} = ${point.value.toFixed(3)} par rapport à la moyenne historique ${options.baseline.toFixed(3)} (−${stdDev.toFixed(2)} σ, soit ${(((options.baseline - point.value) / options.baseline) * 100).toFixed(1)}% sous la référence).`,
          value: point.value,
          previousValue: options.baseline,
          previousDate: 'moyenne historique',
          variationPct: -(((options.baseline - point.value) / options.baseline) * 100),
          direction: 'down',
          suggestion: 'Comparaison inter-annuelle défavorable : renforcer le suivi agronomique.',
          indexType: indexKey
        });
      }
    }
  }

  const priority = { critical: 3, warning: 2, info: 1 };
  const dedupMap = new Map<string, IndexAnomaly>();
  for (const a of anomalies) {
    const key = `${a.date}-${a.indexType}`;
    const existing = dedupMap.get(key);
    if (!existing || priority[a.severity] > priority[existing.severity]) {
      dedupMap.set(key, a);
    }
  }

  return Array.from(dedupMap.values()).sort((a, b) => {
    if (priority[b.severity] !== priority[a.severity]) return priority[b.severity] - priority[a.severity];
    return a.date.localeCompare(b.date);
  });
}

// ========== COMPOSANT : PANNEAU D'ALERTES INDICES ==========
interface IndexAlertsPanelProps {
  anomalies: IndexAnomaly[];
  currentIndex: string;
  onAcknowledge?: () => void;
}

const IndexAlertsPanel = ({ anomalies, currentIndex, onAcknowledge }: IndexAlertsPanelProps) => {
  if (anomalies.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">Aucune anomalie détectée</p>
          <p className="text-xs text-green-700">Les valeurs de l'indice {currentIndex.toUpperCase()} sont dans une plage normale.</p>
        </div>
      </div>
    );
  }

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const warningCount = anomalies.filter(a => a.severity === 'warning').length;
  const infoCount = anomalies.filter(a => a.severity === 'info').length;

  const styles = {
    critical: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: 'text-red-600', Icon: AlertTriangle },
    warning:  { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', icon: 'text-amber-600', Icon: AlertCircle },
    info:     { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', icon: 'text-blue-600', Icon: Activity }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-gray-700" />
          <h4 className="text-sm font-bold text-gray-800">Alertes d'indices ({currentIndex.toUpperCase()})</h4>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          {criticalCount > 0 && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">{criticalCount} critique{criticalCount > 1 ? 's' : ''}</span>}
          {warningCount > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">{warningCount} alerte{warningCount > 1 ? 's' : ''}</span>}
          {infoCount > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">{infoCount} info</span>}
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
        {anomalies.map(a => {
          const s = styles[a.severity];
          const SIcon = s.Icon;
          const DirectionIcon = a.direction === 'up' ? ArrowUpRight : a.direction === 'down' ? ArrowDownRight : null;
          const variationColor = a.direction === 'up' ? 'text-green-600' : a.direction === 'down' ? 'text-red-600' : 'text-gray-600';
          return (
            <div key={a.id} className={`p-3 ${s.bg} border-l-4 ${s.border.replace('border-', 'border-l-')}`}>
              <div className="flex items-start space-x-2">
                <SIcon className={`w-4 h-4 ${s.icon} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-bold ${s.text}`}>{a.label}</p>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{a.date}</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-0.5">{a.message}</p>
                  {a.variationPct !== undefined && a.previousValue !== undefined && (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <div className={`flex items-center px-2 py-0.5 rounded-full bg-white border border-gray-200 ${variationColor}`}>
                        {DirectionIcon && <DirectionIcon className="w-3 h-3 mr-1" />}
                        <span className="text-xs font-bold">
                          {a.variationPct > 0 ? '+' : ''}{a.variationPct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center">
                        <span className="line-through opacity-60">{a.previousValue.toFixed(3)}</span>
                        <span className="mx-1">→</span>
                        <span className="font-bold text-gray-700">{a.value?.toFixed(3)}</span>
                        {a.previousDate && a.previousDate !== 'moyenne historique' && (
                          <span className="ml-1 italic">(vs {a.previousDate})</span>
                        )}
                        {a.previousDate === 'moyenne historique' && (
                          <span className="ml-1 italic">(vs moyenne hist.)</span>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-600 mt-1 italic flex items-start">
                    <Zap className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                    {a.suggestion}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {onAcknowledge && (
        <div className="px-3 py-2 bg-gray-50 border-t flex justify-end">
          <button onClick={onAcknowledge} className="text-xs text-gray-600 hover:text-gray-900 underline">Marquer comme vu</button>
        </div>
      )}
    </div>
  );
};

// ========== COMPOSANT : BANDEAU D'ALERTE GLOBAL ==========
const GlobalAlertBanner = ({ anomalies, indexLabel }: { anomalies: IndexAnomaly[]; indexLabel: string }) => {
  if (anomalies.length === 0) return null;
  const critical = anomalies.filter(a => a.severity === 'critical');
  if (critical.length === 0) return null;

  const lastCritical = critical[0];
  return (
    <div className="bg-red-600 text-white rounded-lg shadow-lg p-3 mb-4 flex items-center space-x-3 animate-pulse">
      <ShieldAlert className="w-6 h-6 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-sm">⚠️ Alerte critique détectée sur l'indice {indexLabel.toUpperCase()}</p>
        <p className="text-xs text-red-100 mt-0.5">
          {critical.length} anomalie{critical.length > 1 ? 's' : ''} critique{critical.length > 1 ? 's' : ''} — Dernière : {lastCritical.label} le {lastCritical.date} ({lastCritical.value?.toFixed(3) || 'N/A'})
        </p>
      </div>
      <Zap className="w-5 h-5 flex-shrink-0 opacity-75" />
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

// ========== COMPOSANT SIMULATEUR DE CROISSANCE ==========
function GrowthSimulator({ calendarData }: { calendarData: CropCalendarItem[] }) {
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [days, setDays] = useState<number>(30);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    if (!selectedCropId) return alert("Sélectionnez une culture");
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/crop-calendar/simulate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendar_id: selectedCropId, day: days })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(data.error);
      }
    } catch (e) { console.error(e); alert("Erreur de simulation"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mt-6">
      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
        <Sprout className="w-5 h-5 text-green-600 mr-2" />
        Simulateur de Croissance
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-xs text-gray-600">Culture & Variété</label>
          <select 
            value={selectedCropId} 
            onChange={e => setSelectedCropId(e.target.value)}
            className="w-full border p-2 rounded text-sm mt-1"
          >
            <option value="">-- Choisir --</option>
            {calendarData.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} {item.variety ? `(${item.variety})` : ''} - {item.duration_days}j
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600">Jours après semis</label>
          <input 
            type="number" 
            value={days} 
            onChange={e => setDays(parseInt(e.target.value) || 0)}
            className="w-full border p-2 rounded text-sm mt-1"
          />
        </div>
        <div>
          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Calcul...' : 'Simuler'}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-green-50 rounded border border-green-200">
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-bold text-green-900 text-lg">{result.icon} {result.stage}</h5>
            <span className="text-sm text-gray-600">{result.current_day} / {result.total_days} jours</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-green-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end"
              style={{ width: `${Math.min(result.progress, 100)}%` }}
            >
              <span className="text-[10px] text-white font-bold px-2">{result.progress}%</span>
            </div>
          </div>

          <h6 className="font-semibold text-gray-800 text-sm mb-2">Actions recommandées :</h6>
          <ul className="list-disc list-inside space-y-1">
            {result.actions.map((action, idx) => (
              <li key={idx} className="text-sm text-gray-700">{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function getWeatherAnimationClass(code: number | null): string {
  if (!code) return 'weather-anim-clear'
  if (code >= 200 && code < 300) return 'weather-anim-storm'
  if (code >= 300 && code < 600) return 'weather-anim-rain'
  if (code >= 600 && code < 700) return 'weather-anim-snow'
  if (code >= 700 && code < 800) return 'weather-anim-fog'
  if (code === 800) return 'weather-anim-clear'
  return 'weather-anim-clouds'
}

function getWeatherParticles(code: number | null): string {
  if (!code) return ''
  if (code >= 200 && code < 300) {
    return `<div class="wp-particles wp-storm"><span></span><span></span><span></span><span></span><span></span><span></span></div>`
  }
  if (code >= 300 && code < 600) {
    return `<div class="wp-particles wp-rain"><span></span><span></span><span></span><span></span><span></span></div>`
  }
  if (code >= 600 && code < 700) {
    return `<div class="wp-particles wp-snow"><span></span><span></span><span></span><span></span></div>`
  }
  if (code === 800) {
    return `<div class="wp-particles wp-sun"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>`
  }
  if (code > 800) {
    return `<div class="wp-particles wp-clouds"><span></span><span></span></div>`
  }
  return ''
}

function RegionWeatherMarkers({ regions }: { regions: RegionWeatherData[] }) {
  const map = useMap()
  const [markers, setMarkers] = useState<L.LayerGroup>(L.layerGroup())

  useEffect(() => {
    markers.clearLayers()
    regions.forEach((r, idx) => {
      if (!r.temperature && r.temperature !== 0) return
      const animClass = getWeatherAnimationClass(r.weatherCode)
      const particles = getWeatherParticles(r.weatherCode)
      const delay = idx * 0.3
      const popupContent = `
        <div class="weather-popup-card">
          <div class="wpc-header" style="background:linear-gradient(135deg, ${r.iconColor}22, ${r.iconColor}44);">
            <div class="wpc-emoji">${r.emoji}</div>
            <div class="wpc-temp">${r.temperature}°C</div>
          </div>
          <div class="wpc-body">
            <div class="wpc-name">${r.nom}</div>
            <div class="wpc-desc">${r.description}</div>
            <div class="wpc-stats">
              <div class="wpc-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                <span>${r.humidity}%</span>
              </div>
              <div class="wpc-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
                <span>${r.windSpeed} km/h</span>
              </div>
              <div class="wpc-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span>${r.pressure || '--'} hPa</span>
              </div>
            </div>
          </div>
          <div class="wpc-footer">📍 ${r.capitale}</div>
        </div>`
      const icon = L.divIcon({
        className: 'region-weather-marker',
        html: `
        <div class="wp-container ${animClass}" style="--glow-color:${r.iconColor};--delay:${delay}s;">
          <div class="wp-ring wp-ring-1"></div>
          <div class="wp-ring wp-ring-2"></div>
          <div class="wp-ring wp-ring-3"></div>
          ${particles}
          <div class="wp-core">
            <div class="wp-emoji">${r.emoji}</div>
          </div>
          <div class="wp-label">${r.temperature}°</div>
        </div>`,
        iconSize: [70, 70],
        iconAnchor: [35, 35],
        popupAnchor: [0, -40],
      })
      const marker = L.marker([r.lat, r.lon], { icon }).bindPopup(popupContent, {
        className: 'region-weather-popup',
        closeButton: false,
        maxWidth: 220,
      })
      markers.addLayer(marker)
    })
    markers.addTo(map)
    return () => { markers.clearLayers() }
  }, [regions, map])

  useEffect(() => {
    return () => { map.removeLayer(markers) }
  }, [map, markers])

  return null
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

  // ========== ÉTATS POUR L'ONGLET "TEMPS" ==========
  const [climateFieldId, setClimateFieldId] = useState<string>('');
  const [climatePrecipitation, setClimatePrecipitation] = useState<any[]>([]);
  const [climateTemperature, setClimateTemperature] = useState<any[]>([]);
  const [climateCentroid, setClimateCentroid] = useState<{ lat: number; lon: number } | null>(null);
  const [loadingClimate, setLoadingClimate] = useState(false);
  const [climateIndexType, setClimateIndexType] = useState<'ndvi' | 'evi' | 'ndwi' | 'msavi'>('ndvi');
  const [climateIndexData, setClimateIndexData] = useState<any[]>([]);
  const [loadingClimateIndex, setLoadingClimateIndex] = useState(false);
  const [forecast14, setForecast14] = useState<any[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // ========== ÉTATS : DÉTECTION AUTOMATIQUE SÉCHERESSE / INONDATION ==========
  const [climateRisk, setClimateRisk] = useState<any>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [creatingAutoAlert, setCreatingAutoAlert] = useState(false);

  // ========== ÉTATS : SUIVI TEMPS RÉEL (GPM IMERG) ==========
  const [climateRealtime, setClimateRealtime] = useState<any>(null);
  const [climateRealtimeStatus, setClimateRealtimeStatus] = useState<any>(null);
  const [forecastRisk, setForecastRisk] = useState<any>(null);
  const [forecastDays] = useState<number>(14);

  // ========== ÉTATS : ANOMALIES D'INDICES ==========
  const [fieldAnomalies, setFieldAnomalies] = useState<IndexAnomaly[]>([]);
  const [adminAnomalies, setAdminAnomalies] = useState<IndexAnomaly[]>([]);
  const [comparisonAnomalies, setComparisonAnomalies] = useState<IndexAnomaly[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // ========== ÉTATS CALENDRIER AGRICOLE ==========
  const [cropCalendarData, setCropCalendarData] = useState<CropCalendarItem[]>([]);
  const [editingCalendarItem, setEditingCalendarItem] = useState<CropCalendarItem | null>(null);
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [calendarFilterType, setCalendarFilterType] = useState('all');

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
    fetchCropCalendar()
  }, [])

  // ========== DÉTECTION AUTOMATIQUE D'ANOMALIES ==========
  useEffect(() => {
    if (!compareMode && fieldNdviData.length > 0 && selectedIndexType) {
      const detected = detectIndexAnomalies(fieldNdviData, selectedIndexType);
      setFieldAnomalies(detected);
      setBannerDismissed(false);
    } else {
      setFieldAnomalies([]);
    }
  }, [fieldNdviData, selectedIndexType, compareMode]);

  useEffect(() => {
    if (timeseriesData.length > 0 && selectedYear) {
      const yearData = timeseriesData.filter(d => String(d.year) === selectedYear);
      const allValues = timeseriesData.map(d => Number(d.ndvi)).filter(v => !isNaN(v));
      const baseline = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : undefined;
      const detected = detectIndexAnomalies(yearData, 'ndvi', { baseline });
      setAdminAnomalies(detected);
      setBannerDismissed(false);
    } else {
      setAdminAnomalies([]);
    }
  }, [timeseriesData, selectedYear]);

  useEffect(() => {
    if (compareMode && Object.keys(comparisonData).length > 0) {
      const allAnomalies: IndexAnomaly[] = [];
      Object.keys(comparisonData).forEach(indexKey => {
        const detected = detectIndexAnomalies(comparisonData[indexKey], indexKey);
        allAnomalies.push(...detected);
      });
      const priority = { critical: 3, warning: 2, info: 1 };
      allAnomalies.sort((a, b) => {
        if (priority[b.severity] !== priority[a.severity]) return priority[b.severity] - priority[a.severity];
        return a.date.localeCompare(b.date);
      });
      setComparisonAnomalies(allAnomalies);
      setBannerDismissed(false);
    } else {
      setComparisonAnomalies([]);
    }
  }, [comparisonData, compareMode]);

  // ========== FONCTIONS CALENDRIER AGRICOLE ==========
  const fetchCropCalendar = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/crop-calendar/');
      const result = await res.json();
      if (result.success) setCropCalendarData(result.data);
    } catch (e) { console.error("Erreur chargement calendrier", e); }
  };

  const handleSaveCalendarItem = async (formData: any) => {
    try {
      const url = editingCalendarItem 
        ? `http://127.0.0.1:8000/agriculture/api/crop-calendar/update/${editingCalendarItem.id}/`
        : 'http://127.0.0.1:8000/agriculture/api/crop-calendar/add/';
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        fetchCropCalendar(); 
        setShowCalendarForm(false);
        setEditingCalendarItem(null);
        alert("Calendrier mis à jour !");
      } else {
        alert("Erreur: " + result.error);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteCalendarItem = async (id: number) => {
    if (!confirm("Supprimer cette culture du calendrier ?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/agriculture/api/crop-calendar/delete/${id}/`, {
        method: 'POST' 
      });
      fetchCropCalendar();
    } catch(e) { console.error(e); }
  };

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

  // 5. Onglet "Temps" : rafraîchir la série d'indice superposée quand elle change
  useEffect(() => {
    if (climateFieldId) {
      fetchClimateIndex(climateFieldId, climateIndexType);
    }
  }, [climateIndexType]);
  
  const [regionWeather, setRegionWeather] = useState<RegionWeatherData[]>([])

  useEffect(() => {
    if (activeTab === 'explorer' && viewMode === 'admin' && analysisConfig.zoneType === 'region') {
      fetch('/api/weather/regions')
        .then(res => res.json())
        .then(json => { if (json.success && json.data) setRegionWeather(json.data) })
        .catch(err => console.error('Erreur meteo regions:', err))
    }
  }, [activeTab, viewMode, analysisConfig.zoneType])

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

  // ========== ONGLET "TEMPS" : FONCTIONS ==========

  const fetchClimateIndex = async (champId: string, indexType: string) => {
    setLoadingClimateIndex(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/field-ndvi/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ champ_id: champId, index_type: indexType })
      });
      const result = await res.json();
      setClimateIndexData(result.success ? (result.data || []) : []);
    } catch (e) {
      console.error('Erreur récupération indice (Temps):', e);
      setClimateIndexData([]);
    } finally {
      setLoadingClimateIndex(false);
    }
  };

  const fetchFieldClimate = async (champId: string) => {
    if (!champId) return;
    setLoadingClimate(true);
    setForecast14([]);
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/field-climate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ champ_id: champId })
      });
      const result = await res.json();
      if (result.success) {
        setClimatePrecipitation(result.precipitation || []);
        setClimateTemperature(result.temperature || []);
        setClimateCentroid(result.centroid || null);

        if (result.centroid?.lat && result.centroid?.lon) {
          fetchForecast14(result.centroid.lat, result.centroid.lon);
        }
      } else {
        setClimatePrecipitation([]);
        setClimateTemperature([]);
        setClimateCentroid(null);
      }
    } catch (e) {
      console.error('Erreur récupération climat champ:', e);
      setClimatePrecipitation([]);
      setClimateTemperature([]);
    } finally {
      setLoadingClimate(false);
    }
  };

  const fetchForecast14 = async (lat: number, lon: number) => {
    setLoadingForecast(true);
    try {
      const res = await fetch(`/api/weather/field-forecast?lat=${lat}&lon=${lon}`);
      const result = await res.json();
      setForecast14(result.success ? (result.data || []) : []);
    } catch (e) {
      console.error('Erreur prévision 14 jours:', e);
      setForecast14([]);
    } finally {
      setLoadingForecast(false);
    }
  };

  const fetchFieldClimateRisk = async (champId: string) => {
    setLoadingRisk(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/field-climate-risk/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ champ_id: champId })
      });
      const result = await res.json();
      setClimateRisk(result.success ? result : null);
    } catch (e) {
      console.error('Erreur calcul risque climatique:', e);
      setClimateRisk(null);
    } finally {
      setLoadingRisk(false);
    }
  };

  // ========== NOUVELLE FONCTION : SUIVI TEMPS RÉEL ==========
  const fetchFieldRealtimeStatus = async (champId: string) => {
    if (!champId) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/agriculture/api/field-realtime-status/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ champ_id: champId, forecast_days: 14 })
      });
      const result = await res.json();
      if (result.success) {
        setClimateRealtimeStatus(result);
        setClimateRealtime(result.maintenant);
        setForecastRisk(result.a_venir);
      } else {
        console.error('Erreur status temps réel:', result.error);
      }
    } catch (e) {
      console.error('Erreur fetchFieldRealtimeStatus:', e);
    }
  };

  // Libellés et couleurs des classifications de risque
  const DROUGHT_LABELS: { [key: string]: { label: string; color: string; level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null } } = {
    secheresse_severe:  { label: 'Sécheresse sévère',  color: 'bg-red-100 text-red-800 border-red-300',       level: 'CRITICAL' },
    secheresse_moderee: { label: 'Sécheresse modérée', color: 'bg-orange-100 text-orange-800 border-orange-300', level: 'HIGH' },
    secheresse_legere:  { label: 'Sécheresse légère',  color: 'bg-amber-100 text-amber-800 border-amber-300', level: 'MEDIUM' },
    normal:              { label: 'Pluviométrie normale', color: 'bg-green-100 text-green-800 border-green-300', level: null },
    excedentaire:        { label: 'Pluviométrie excédentaire', color: 'bg-blue-100 text-blue-800 border-blue-300', level: null },
    inconnu:             { label: 'Indéterminé', color: 'bg-gray-100 text-gray-600 border-gray-300', level: null },
  };
  const FLOOD_LABELS: { [key: string]: { label: string; color: string; level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null } } = {
    inondation_critique: { label: 'Risque d\'inondation critique', color: 'bg-red-100 text-red-800 border-red-300', level: 'CRITICAL' },
    inondation_elevee:   { label: 'Risque d\'inondation élevé', color: 'bg-orange-100 text-orange-800 border-orange-300', level: 'HIGH' },
    inondation_moderee:  { label: 'Risque d\'inondation modéré', color: 'bg-amber-100 text-amber-800 border-amber-300', level: 'MEDIUM' },
    normal:               { label: 'Pas de risque d\'inondation', color: 'bg-green-100 text-green-800 border-green-300', level: null },
    inconnu:              { label: 'Indéterminé', color: 'bg-gray-100 text-gray-600 border-gray-300', level: null },
  };

  // Crée automatiquement une alerte
  const handleCreateAutoAlert = async (kind: 'drought' | 'flood') => {
    if (!climateRisk && !climateRealtimeStatus) return;
    const fieldName = climateRisk?.champ_nom || climateRealtimeStatus?.champ_nom || 'Parcelle';
    let title = '', description = '', type = '', level: string | null = null;

    if (kind === 'drought') {
      const worst = (climateRisk?.drought_30d?.pnp ?? 100) <= (climateRisk?.drought_90d?.pnp ?? 100)
        ? climateRisk?.drought_30d : climateRisk?.drought_90d;
      const info = DROUGHT_LABELS[worst?.classification] || DROUGHT_LABELS.inconnu;
      level = info.level;
      title = `${info.label} détectée — ${fieldName}`;
      description = `Détection automatique (indice PNP, données CHIRPS) : cumul de pluie à ${worst?.pnp || '?'}% de la normale historique (${worst?.current_mm || '?'} mm reçus vs ${worst?.historical_avg_mm || '?'} mm en moyenne).`;
      type = 'DROUGHT';
    } else {
      const floodData = climateRealtimeStatus?.maintenant || climateRisk?.flood_risk;
      const levelKey = floodData?.flood_level_now || floodData?.level || 'inconnu';
      const info = FLOOD_LABELS[levelKey] || FLOOD_LABELS.inconnu;
      level = info.level;
      title = `${info.label} — ${fieldName}`;
      description = `Détection automatique (GPM IMERG / CHIRPS) : ${floodData?.total_24h_mm || floodData?.current_5d_mm || '?'} mm reçus récemment.`;
      type = 'FLOOD';
    }

    if (!level) return;

    setCreatingAutoAlert(true);
    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, type, level,
          location: fieldName,
          latitude: climateRisk?.centroid?.lat || climateRealtimeStatus?.centroid?.lat,
          longitude: climateRisk?.centroid?.lon || climateRealtimeStatus?.centroid?.lon,
        })
      });
      const result = await res.json();
      if (result.success) {
        alert('Alerte créée automatiquement dans le système !');
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (e) {
      console.error(e);
      alert('Erreur de connexion lors de la création de l\'alerte');
    } finally {
      setCreatingAutoAlert(false);
    }
  };

  const handleSelectClimateField = (id: string) => {
    setClimateFieldId(id);
    setClimateRealtime(null);
    setClimateRealtimeStatus(null);
    setForecastRisk(null);
    
    if (id) {
      fetchClimateIndex(id, climateIndexType);
      fetchFieldClimate(id);
      fetchFieldClimateRisk(id);
      fetchFieldRealtimeStatus(id);
    } else {
      setClimateIndexData([]);
      setClimatePrecipitation([]);
      setClimateTemperature([]);
      setClimateCentroid(null);
      setForecast14([]);
      setClimateRisk(null);
    }
  };

  const climateChartData = useMemo(() => {
    const indexByDate: { [date: string]: number } = {};
    climateIndexData.forEach((d: any) => { indexByDate[d.date] = d.ndvi; });
    return climatePrecipitation.map((p: any) => ({
      date: p.date,
      precipitation: p.precipitation,
      index: indexByDate[p.date] !== undefined ? indexByDate[p.date] : null
    }));
  }, [climatePrecipitation, climateIndexData]);

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
    if (selectedFieldId) handleSelectField(selectedFieldId);
  };

  // ========== FETCH AUTRES DONNÉES ==========
  const fetchWeather = useCallback(async () => {
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

  const getCropTypeBadge = (type: string) => {
    switch(type) {
      case 'CEREAL': return 'bg-yellow-100 text-yellow-800';
      case 'TUBERCULE': return 'bg-orange-100 text-orange-800';
      case 'LEGUME': return 'bg-green-100 text-green-800';
      case 'LEGUMINEUSE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Surface totale</p><p className="text-2xl font-bold text-gray-900">{77/*stats.totalArea*/} ha</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><TreePine className="w-6 h-6 text-green-600" /></div></div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Agriculteurs</p><p className="text-2xl font-bold text-gray-900">{12/*stats.totalFarmers*/}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div></div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Santé bonne</p><p className="text-2xl font-bold text-green-600">{stats.goodHealth}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-green-600" /></div></div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Avec irrigation</p><p className="text-2xl font-bold text-cyan-600">{stats.irrigated}</p></div><div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center"><Droplets className="w-6 h-6 text-cyan-600" /></div></div></div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[{ id: 'crops', label: 'Cultures' }, { id: 'weather', label: 'Météo' }, { id: 'recommendations', label: 'Recommandations' }, { id: 'calendar', label: 'Calendrier' }, { id: 'explorer', label: 'Observatoire' }, { id: 'fieldClimate', label: 'Temps' },{ id: 'drought', label: 'Sécheresses' }].map((tab) => (
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
        </div>
      )}

      {/* ========== ONGLET RECOMMANDATIONS ========== */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recommandations prioritaires</h3>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"><RefreshCw className="w-4 h-4 mr-2" />Générer</button>
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
        </div>
      )}

      {/* ========== ONGLET CALENDRIER AGRICOLE ========== */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Calendrier Cultural & Variétés</h3>
                <p className="text-gray-600 text-sm">Gérez les variétés et simulez la croissance.</p>
              </div>
               <div className="flex items-center space-x-2">
                 <button 
                   onClick={() => { setEditingCalendarItem(null); setShowCalendarForm(true); }} 
                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm shadow"
                 >
                   <Plus className="w-4 h-4 mr-2" /> Nouvelle variété
                 </button>
              </div>
            </div>
          </div>

          <GrowthSimulator calendarData={cropCalendarData} />

          <div className="bg-white rounded-lg shadow p-3 border border-gray-200 flex items-center space-x-6 text-xs">
            <div className="flex items-center"><div className="w-4 h-4 rounded bg-green-500 opacity-70 mr-2"></div> Semi</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded bg-blue-500 opacity-70 mr-2"></div> Sarclage</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded bg-orange-500 opacity-70 mr-2"></div> Récolte</div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="flex bg-gray-50 border-b font-semibold text-xs text-gray-600 sticky top-0 z-10">
               <div className="w-48 p-2 border-r flex-shrink-0">Culture / Variété</div>
               <div className="flex-1 flex">
                 {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map(m => (
                   <div key={m} className="flex-1 text-center p-2 border-r last:border-r-0">{m}</div>
                 ))}
               </div>
               <div className="w-20 p-2 border-l flex-shrink-0 text-center">Actions</div>
            </div>

            <div className="divide-y divide-gray-100">
                {cropCalendarData
                  .filter(item => calendarFilterType === 'all' || item.crop_type === calendarFilterType)
                  .length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        Aucune culture définie. Cliquez sur "Nouvelle variété".
                    </div>
                ) : (
                    cropCalendarData
                      .filter(item => calendarFilterType === 'all' || item.crop_type === calendarFilterType)
                      .map(item => (
                        <div key={item.id} className="flex items-center hover:bg-gray-50 transition-colors group">
                           <div className="w-48 p-2 border-r flex-shrink-0 flex flex-col justify-center">
                             <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                                <span className="text-[10px] text-gray-400">{item.duration_days}j</span>
                             </div>
                             <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-bold text-blue-700">{item.variety || 'N/A'}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-center ${getCropTypeBadge(item.crop_type)}`}>
                                  {item.crop_type}
                                </span>
                             </div>
                           </div>
                           
                           <div className="flex-1 relative h-12 flex">
                              {Array.from({length: 12}).map((_, i) => (
                                <div key={i} className="flex-1 border-r border-gray-50 h-full"></div>
                              ))}
                              
                              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                {item.sowing_start && item.sowing_end && (
                                  <rect 
                                    x={`${((item.sowing_start - 1) / 12) * 100}%`} 
                                    y="4" 
                                    width={`${((item.sowing_end - item.sowing_start + 1) / 12) * 100}%`} 
                                    height="8" 
                                    rx="2" 
                                    fill="#22c55e" 
                                    opacity="0.7"
                                  />
                                )}
                                {item.weeding_start && item.weeding_end && (
                                  <rect 
                                    x={`${((item.weeding_start - 1) / 12) * 100}%`} 
                                    y="16" 
                                    width={`${((item.weeding_end - item.weeding_start + 1) / 12) * 100}%`} 
                                    height="8" 
                                    rx="2" 
                                    fill="#3b82f6" 
                                    opacity="0.7"
                                  />
                                )}
                                {item.harvest_start && item.harvest_end && (
                                  <rect 
                                    x={`${((item.harvest_start - 1) / 12) * 100}%`} 
                                    y="28" 
                                    width={`${((item.harvest_end - item.harvest_start + 1) / 12) * 100}%`} 
                                    height="8" 
                                    rx="2" 
                                    fill="#f97316" 
                                    opacity="0.7"
                                  />
                                )}
                              </svg>
                           </div>
                           
                           <div className="w-20 p-2 flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => { setEditingCalendarItem(item); setShowCalendarForm(true); }} 
                               className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                             >
                               <Edit className="w-4 h-4"/>
                             </button>
                             <button 
                               onClick={() => handleDeleteCalendarItem(item.id)} 
                               className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                             >
                               <Trash2 className="w-4 h-4"/>
                             </button>
                           </div>
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>
      )}

      {/* ========== ONGLET EXPLORATEUR ========== */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Observatoire NDVI & Suivi de Champ</h3>

            {!bannerDismissed && viewMode === 'field' && !compareMode && (
              <GlobalAlertBanner anomalies={fieldAnomalies} indexLabel={selectedIndexType} />
            )}
            {!bannerDismissed && viewMode === 'field' && compareMode && (
              <GlobalAlertBanner anomalies={comparisonAnomalies} indexLabel="multi" />
            )}
            {!bannerDismissed && viewMode === 'admin' && (
              <GlobalAlertBanner anomalies={adminAnomalies} indexLabel="ndvi" />
            )}
            {((viewMode === 'field' && !compareMode && fieldAnomalies.some(a => a.severity === 'critical')) ||
              (viewMode === 'field' && compareMode && comparisonAnomalies.some(a => a.severity === 'critical')) ||
              (viewMode === 'admin' && adminAnomalies.some(a => a.severity === 'critical'))) && (
              <div className="flex justify-end -mt-2 mb-2">
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Masquer le bandeau
                </button>
              </div>
            )}
            {mapLoading ? (
              <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Chargement de la couche {analysisConfig.zoneType}...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
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

                  {viewMode === 'field' && !compareMode && (
                    <IndexAlertsPanel
                      anomalies={fieldAnomalies}
                      currentIndex={selectedIndexType}
                    />
                  )}
                  {viewMode === 'field' && compareMode && (
                    <IndexAlertsPanel
                      anomalies={comparisonAnomalies}
                      currentIndex="multi"
                    />
                  )}
                  {viewMode === 'admin' && (
                    <IndexAlertsPanel
                      anomalies={adminAnomalies}
                      currentIndex="ndvi"
                    />
                  )}
                </div>

                
                <div className="lg:col-span-3 flex flex-col space-y-4">
                  
                  {viewMode === 'field' && selectedFieldId && !compareMode && (
                    <FieldTimelineStrip 
                      data={fieldNdviData} 
                      activeMapUrl={fieldMapUrl} 
                      onSelectDate={(url) => setFieldMapUrl(url)}
                      anomalyDates={fieldAnomalies.map(a => a.date)}
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
                      {viewMode === 'admin' && analysisConfig.zoneType === 'region' && regionWeather.length > 0 && (
                        <RegionWeatherMarkers regions={regionWeather} />
                      )}
                    </MapContainer>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <p>{viewMode === 'field' ? (fieldMapUrl ? `Image Satellite (${selectedIndexType.toUpperCase()})` : "Sélectionnez un champ") : (clippedMapUrl ? "Vue Zoomée" : `Vue Globale (${selectedYear})`)}</p>
                    <p>Mode: {viewMode === 'admin' ? analysisConfig.zoneType.toUpperCase() : 'CHAMPS'}</p>
                  </div>
                </div>

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
                  
                  {!loadingChart && !loadingComparison && viewMode === 'field' && compareMode && Object.keys(comparisonData).length > 0 && (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 1]} label={{ value: "Valeur de l'indice", angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <ReferenceArea y1={0} y2={0.3} fill="#ef4444" fillOpacity={0.06} />
                          <ReferenceLine y={0.3} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Seuil critique', position: 'insideBottomRight', fill: '#ef4444', fontSize: 10 }} />
                          {availableIndices.filter(idx => comparisonData[idx.id] && comparisonData[idx.id].length > 0).map(idx => (
                            <Line
                              key={idx.id}
                              type="monotone"
                              data={comparisonData[idx.id]?.map(d => ({ date: d.date, value: d.value })) || []}
                              dataKey="value"
                              name={idx.name}
                              stroke={idx.color}
                              strokeWidth={2}
                              dot={(props: any) => {
                                const { cx, cy, payload, index } = props;
                                const anomaly = comparisonAnomalies.find(a => a.date === payload.date && a.indexType === idx.id);
                                let color = idx.color;
                                let radius = 3;
                                if (anomaly) {
                                  if (anomaly.severity === 'critical') { radius = 6; }
                                  else if (anomaly.severity === 'warning') { radius = 5; }
                                  else { radius = 4; }
                                  return <circle key={`dot-${idx.id}-${index}`} cx={cx} cy={cy} r={radius} fill={color} stroke={anomaly.severity === 'critical' ? '#b91c1c' : anomaly.severity === 'warning' ? '#f59e0b' : '#3b82f6'} strokeWidth={2} />;
                                }
                                return <circle key={`dot-${idx.id}-${index}`} cx={cx} cy={cy} r={radius} fill={color} />;
                              }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {!loadingChart && !loadingComparison && viewMode === 'field' && !compareMode && fieldNdviData.length > 0 && (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={fieldNdviData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 1]} label={{ value: selectedIndexType.toUpperCase(), angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [value, selectedIndexType.toUpperCase()]} labelFormatter={(label) => `Date: ${label}`} />
                          <ReferenceArea y1={0} y2={INDEX_THRESHOLDS[selectedIndexType]?.critical ?? 0.3} fill="#ef4444" fillOpacity={0.08} />
                          <ReferenceLine y={INDEX_THRESHOLDS[selectedIndexType]?.critical ?? 0.3} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critique', position: 'insideBottomRight', fill: '#ef4444', fontSize: 10 }} />
                          <ReferenceLine y={INDEX_THRESHOLDS[selectedIndexType]?.warning ?? 0.45} stroke="#f59e0b" strokeDasharray="2 4" label={{ value: 'Alerte', position: 'insideBottomRight', fill: '#f59e0b', fontSize: 10 }} />
                          <Line 
                            type="monotone" 
                            dataKey="ndvi" 
                            stroke="#ef4444" 
                            strokeWidth={2} 
                            dot={(props: any) => {
                              const { cx, cy, payload, index } = props;
                              const anomaly = fieldAnomalies.find(a => a.date === payload.date);
                              let color = '#ef4444';
                              let radius = 4;
                              if (anomaly) {
                                if (anomaly.severity === 'critical') { color = '#b91c1c'; radius = 6; }
                                else if (anomaly.severity === 'warning') { color = '#f59e0b'; radius = 5; }
                                else { color = '#3b82f6'; radius = 5; }
                              }
                              return <circle key={`dot-${index}`} cx={cx} cy={cy} r={radius} fill={color} stroke="#fff" strokeWidth={1} />;
                            }}
                            activeDot={{ r: 6 }} 
                            onMouseMove={handleChartFieldClick}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {!loadingChart && viewMode === 'admin' && timeseriesData.length > 0 && (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeseriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month_name" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 1]} label={{ value: "NDVI", angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value, name, props) => [value, `Année ${props.payload.year}`]} labelFormatter={(label) => `Mois: ${label}`} />
                          <ReferenceArea y1={0} y2={INDEX_THRESHOLDS.ndvi.critical} fill="#ef4444" fillOpacity={0.08} />
                          <ReferenceLine y={INDEX_THRESHOLDS.ndvi.critical} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critique', position: 'insideBottomRight', fill: '#ef4444', fontSize: 10 }} />
                          <ReferenceLine y={INDEX_THRESHOLDS.ndvi.warning} stroke="#f59e0b" strokeDasharray="2 4" label={{ value: 'Alerte', position: 'insideBottomRight', fill: '#f59e0b', fontSize: 10 }} />
                          {(() => {
                            const allValues = timeseriesData.map(d => Number(d.ndvi)).filter(v => !isNaN(v));
                            if (allValues.length === 0) return null;
                            const baseline = allValues.reduce((a, b) => a + b, 0) / allValues.length;
                            return <ReferenceLine y={baseline} stroke="#6b7280" strokeDasharray="1 3" label={{ value: `Moy. ${baseline.toFixed(2)}`, position: 'insideTopLeft', fill: '#6b7280', fontSize: 9 }} />;
                          })()}
                          {Array.from(new Set(timeseriesData.map(d => d.year))).sort().map((year) => (
                            <Line
                              key={year}
                              type="monotone"
                              dataKey="ndvi"
                              stroke={year == selectedYear ? '#10b981' : '#9ca3af'}
                              strokeWidth={year == selectedYear ? 3 : 1}
                              name={`Année ${year}`}
                              data={timeseriesData.filter(d => d.year == year)}
                              dot={(props: any) => {
                                const { cx, cy, payload, index } = props;
                                if (String(payload.year) !== selectedYear) {
                                  return <circle key={`dot-${year}-${index}`} cx={cx} cy={cy} r={3} fill={year == selectedYear ? '#10b981' : '#9ca3af'} />;
                                }
                                const monthLabel = payload.month_name;
                                const anomaly = adminAnomalies.find(a => a.date === monthLabel || a.date === String(payload.month));
                                let color = '#10b981';
                                let radius = 3;
                                if (anomaly) {
                                  if (anomaly.severity === 'critical') { color = '#b91c1c'; radius = 6; }
                                  else if (anomaly.severity === 'warning') { color = '#f59e0b'; radius = 5; }
                                  else { color = '#3b82f6'; radius = 5; }
                                }
                                return <circle key={`dot-${year}-${index}`} cx={cx} cy={cy} r={radius} fill={color} stroke="#fff" strokeWidth={1} />;
                              }}
                              connectNulls={false}
                            />
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

      {/* ========== ONGLET "TEMPS" ========== */}
      {activeTab === 'fieldClimate' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
              <CloudRain className="w-5 h-5 mr-2 text-blue-600" />
              Suivi Temps Réel & Prévisions
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Conditions actuelles, tendance récente et prévisions pour votre parcelle
            </p>

            {/* Sélecteur de parcelle */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-xs font-medium text-gray-500 mb-1">Parcelle</label>
                <select
                  value={climateFieldId}
                  onChange={(e) => handleSelectClimateField(e.target.value)}
                  className="w-full text-sm border-gray-300 rounded bg-white"
                >
                  <option value="">-- Sélectionner un champ --</option>
                  {userFields.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.properties.nom} ({f.properties.proprietaire})</option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-3">
                <IndexSelector value={climateIndexType} onChange={(v: any) => setClimateIndexType(v)} />
              </div>
            </div>

            {!climateFieldId && (
              <div className="h-32 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg bg-gray-50">
                <div className="text-center">Sélectionnez une parcelle pour voir le suivi en temps réel</div>
              </div>
            )}

            {climateFieldId && (loadingClimate || loadingClimateIndex || loadingRisk) && (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 mx-auto animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Chargement des données...</p>
                </div>
              </div>
            )}

            {climateFieldId && !loadingClimate && !loadingClimateIndex && !loadingRisk && (
              <div className="space-y-6">
                
                {/* ====== 1. BLOC "MAINTENANT" - GPM IMERG TEMPS RÉEL ====== */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
                      Maintenant : Pluie quasi temps réel
                    </h4>
                    <span className="text-xs text-gray-500">GPM IMERG (NASA) • Latence ~4h</span>
                  </div>
                  <div className="p-4">
                    {climateRealtime ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">Cumul 24h</p>
                          <p className="text-2xl font-bold text-blue-600">{climateRealtime.total_24h_mm || 0} mm</p>
                        </div>
                        <div className="bg-cyan-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">Cumul 72h</p>
                          <p className="text-2xl font-bold text-cyan-600">{climateRealtime.total_mm || 0} mm</p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">Dernière obs.</p>
                          <p className="text-sm font-semibold text-indigo-600">{climateRealtime.last_observation || 'N/A'}</p>
                        </div>
                        <div className={`rounded-lg p-3 text-center border-2 ${
                          climateRealtime.flood_level_now === 'inondation_critique' ? 'bg-red-100 border-red-400' :
                          climateRealtime.flood_level_now === 'inondation_elevee' ? 'bg-orange-100 border-orange-400' :
                          climateRealtime.flood_level_now === 'inondation_moderee' ? 'bg-amber-100 border-amber-400' :
                          'bg-green-100 border-green-400'
                        }`}>
                          <p className="text-xs text-gray-600">Niveau d'alerte</p>
                          <p className="text-sm font-bold">
                            {climateRealtime.flood_level_now === 'inondation_critique' && '🚨 Risque critique'}
                            {climateRealtime.flood_level_now === 'inondation_elevee' && '⚠️ Risque élevé'}
                            {climateRealtime.flood_level_now === 'inondation_moderee' && '⚡ Risque modéré'}
                            {climateRealtime.flood_level_now === 'normal' && '✅ Normal'}
                            {climateRealtime.flood_level_now === 'inconnu' && '❓ Indéterminé'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        Données temps réel indisponibles pour le moment
                      </div>
                    )}
                    {climateRealtime?.flood_level_now && climateRealtime.flood_level_now !== 'normal' && climateRealtime.flood_level_now !== 'inconnu' && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleCreateAutoAlert('flood')}
                          disabled={creatingAutoAlert}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 flex items-center"
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          {creatingAutoAlert ? 'Création...' : 'Créer une alerte inondation'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ====== 2. BLOC "TENDANCE RÉCENTE" - CHIRPS PNP 30j/90j ====== */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                      Tendance récente : Risque sécheresse
                    </h4>
                    <span className="text-xs text-gray-500">CHIRPS • Climatologie {climateRisk?.years_history || 10} ans</span>
                  </div>
                  <div className="p-4">
                    {climateRisk ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-3 rounded-lg border ${
                          climateRisk.drought_30d?.classification === 'secheresse_severe' ? 'bg-red-100 border-red-400' :
                          climateRisk.drought_30d?.classification === 'secheresse_moderee' ? 'bg-orange-100 border-orange-400' :
                          climateRisk.drought_30d?.classification === 'secheresse_legere' ? 'bg-amber-100 border-amber-400' :
                          'bg-green-100 border-green-400'
                        }`}>
                          <p className="text-xs font-bold uppercase opacity-70">PNP 30 jours</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xl font-bold">
                              {climateRisk.drought_30d?.pnp !== null ? `${climateRisk.drought_30d?.pnp}%` : 'N/A'}
                            </span>
                            <span className="text-sm">
                              {climateRisk.drought_30d?.classification === 'secheresse_severe' && '🚨 Sécheresse sévère'}
                              {climateRisk.drought_30d?.classification === 'secheresse_moderee' && '⚠️ Sécheresse modérée'}
                              {climateRisk.drought_30d?.classification === 'secheresse_legere' && '⚡ Sécheresse légère'}
                              {climateRisk.drought_30d?.classification === 'normal' && '✅ Normal'}
                              {climateRisk.drought_30d?.classification === 'excedentaire' && '💧 Excédentaire'}
                              {climateRisk.drought_30d?.classification === 'inconnu' && '❓ Indéterminé'}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {climateRisk.drought_30d?.current_mm} mm reçus vs {climateRisk.drought_30d?.historical_avg_mm} mm (moy. hist.)
                          </div>
                        </div>

                        <div className={`p-3 rounded-lg border ${
                          climateRisk.drought_90d?.classification === 'secheresse_severe' ? 'bg-red-100 border-red-400' :
                          climateRisk.drought_90d?.classification === 'secheresse_moderee' ? 'bg-orange-100 border-orange-400' :
                          climateRisk.drought_90d?.classification === 'secheresse_legere' ? 'bg-amber-100 border-amber-400' :
                          'bg-green-100 border-green-400'
                        }`}>
                          <p className="text-xs font-bold uppercase opacity-70">PNP 90 jours</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xl font-bold">
                              {climateRisk.drought_90d?.pnp !== null ? `${climateRisk.drought_90d?.pnp}%` : 'N/A'}
                            </span>
                            <span className="text-sm">
                              {climateRisk.drought_90d?.classification === 'secheresse_severe' && '🚨 Sécheresse sévère'}
                              {climateRisk.drought_90d?.classification === 'secheresse_moderee' && '⚠️ Sécheresse modérée'}
                              {climateRisk.drought_90d?.classification === 'secheresse_legere' && '⚡ Sécheresse légère'}
                              {climateRisk.drought_90d?.classification === 'normal' && '✅ Normal'}
                              {climateRisk.drought_90d?.classification === 'excedentaire' && '💧 Excédentaire'}
                              {climateRisk.drought_90d?.classification === 'inconnu' && '❓ Indéterminé'}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {climateRisk.drought_90d?.current_mm} mm reçus vs {climateRisk.drought_90d?.historical_avg_mm} mm (moy. hist.)
                          </div>
                        </div>

                        <div className="p-3 rounded-lg border bg-gray-50 border-gray-300">
                          <p className="text-xs font-bold uppercase opacity-70">Synthèse</p>
                          <div className="mt-1 space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                              <span>Sécheresse 30j :</span>
                              <span className={`font-bold ${
                                ['secheresse_severe', 'secheresse_moderee', 'secheresse_legere'].includes(climateRisk.drought_30d?.classification) 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}>
                                {climateRisk.drought_30d?.classification === 'secheresse_severe' && '🚨 Critique'}
                                {climateRisk.drought_30d?.classification === 'secheresse_moderee' && '⚠️ Élevé'}
                                {climateRisk.drought_30d?.classification === 'secheresse_legere' && '⚡ Modéré'}
                                {climateRisk.drought_30d?.classification === 'normal' && '✅ Normal'}
                                {climateRisk.drought_30d?.classification === 'excedentaire' && '💧 Excédentaire'}
                                {climateRisk.drought_30d?.classification === 'inconnu' && '❓ N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Sécheresse 90j :</span>
                              <span className={`font-bold ${
                                ['secheresse_severe', 'secheresse_moderee', 'secheresse_legere'].includes(climateRisk.drought_90d?.classification) 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}>
                                {climateRisk.drought_90d?.classification === 'secheresse_severe' && '🚨 Critique'}
                                {climateRisk.drought_90d?.classification === 'secheresse_moderee' && '⚠️ Élevé'}
                                {climateRisk.drought_90d?.classification === 'secheresse_legere' && '⚡ Modéré'}
                                {climateRisk.drought_90d?.classification === 'normal' && '✅ Normal'}
                                {climateRisk.drought_90d?.classification === 'excedentaire' && '💧 Excédentaire'}
                                {climateRisk.drought_90d?.classification === 'inconnu' && '❓ N/A'}
                              </span>
                            </div>
                          </div>
                          {climateRisk.drought_30d?.classification !== 'normal' && climateRisk.drought_30d?.classification !== 'excedentaire' && climateRisk.drought_30d?.classification !== 'inconnu' && (
                            <button
                              onClick={() => handleCreateAutoAlert('drought')}
                              disabled={creatingAutoAlert}
                              className="mt-2 w-full px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center"
                            >
                              <Bell className="w-3 h-3 mr-1" />
                              {creatingAutoAlert ? 'Création...' : 'Créer une alerte sécheresse'}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        Données de tendance récente indisponibles
                      </div>
                    )}
                  </div>
                </div>

                {/* ====== 3. BLOC "À VENIR" - PRÉVISION OPEN-METEO ====== */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 flex items-center">
                      <Umbrella className="w-4 h-4 mr-2 text-purple-500" />
                      À venir : Prévision {forecastDays} jours
                    </h4>
                    <span className="text-xs text-gray-500">Open-Meteo • ECMWF/GFS</span>
                  </div>
                  <div className="p-4">
                    {loadingForecast ? (
                      <div className="h-32 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
                      </div>
                    ) : forecast14.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className={`p-3 rounded-lg border ${
                            forecastRisk?.flood_forecast?.level === 'inondation_critique' ? 'bg-red-100 border-red-400' :
                            forecastRisk?.flood_forecast?.level === 'inondation_elevee' ? 'bg-orange-100 border-orange-400' :
                            forecastRisk?.flood_forecast?.level === 'inondation_moderee' ? 'bg-amber-100 border-amber-400' :
                            'bg-green-100 border-green-400'
                          }`}>
                            <p className="text-xs font-bold uppercase opacity-70">Risque inondation</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-lg font-bold">
                                {forecastRisk?.flood_forecast?.level === 'inondation_critique' && '🚨 Critique'}
                                {forecastRisk?.flood_forecast?.level === 'inondation_elevee' && '⚠️ Élevé'}
                                {forecastRisk?.flood_forecast?.level === 'inondation_moderee' && '⚡ Modéré'}
                                {forecastRisk?.flood_forecast?.level === 'normal' && '✅ Normal'}
                                {forecastRisk?.flood_forecast?.level === 'inconnu' && '❓ Indéterminé'}
                              </span>
                              <span className="text-sm">
                                {forecastRisk?.flood_forecast?.max_3day_cumulative_mm || 0} mm / 3j
                              </span>
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg border ${
                            forecastRisk?.drought_forecast?.level === 'secheresse_severe' ? 'bg-red-100 border-red-400' :
                            forecastRisk?.drought_forecast?.level === 'secheresse_moderee' ? 'bg-orange-100 border-orange-400' :
                            forecastRisk?.drought_forecast?.level === 'secheresse_legere' ? 'bg-amber-100 border-amber-400' :
                            'bg-green-100 border-green-400'
                          }`}>
                            <p className="text-xs font-bold uppercase opacity-70">Risque sécheresse</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-lg font-bold">
                                {forecastRisk?.drought_forecast?.level === 'secheresse_severe' && '🚨 Critique'}
                                {forecastRisk?.drought_forecast?.level === 'secheresse_moderee' && '⚠️ Élevé'}
                                {forecastRisk?.drought_forecast?.level === 'secheresse_legere' && '⚡ Modéré'}
                                {forecastRisk?.drought_forecast?.level === 'normal' && '✅ Normal'}
                                {forecastRisk?.drought_forecast?.level === 'inconnu' && '❓ Indéterminé'}
                              </span>
                              <span className="text-sm">
                                {forecastRisk?.drought_forecast?.max_consecutive_dry_days || 0} j secs
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={forecast14}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                              <YAxis yAxisId="left" label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                              <YAxis yAxisId="right" orientation="right" label={{ value: 'Pluie (mm)', angle: 90, position: 'insideRight' }} />
                              <Tooltip />
                              <Legend />
                              <Bar yAxisId="right" dataKey="precipitation" name="Pluie prévue (mm)" fill="#60a5fa" barSize={8} opacity={0.7} />
                              <Line yAxisId="left" type="monotone" dataKey="tempMax" name="T° max" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                              <Line yAxisId="left" type="monotone" dataKey="tempMin" name="T° min" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="overflow-x-auto mt-2">
                          <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                            {forecast14.map((day: any) => (
                              <div key={day.date} className="flex-shrink-0 w-24 bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-gray-500">{day.date.slice(5)}</p>
                                <p className="text-sm font-semibold text-gray-800">{day.tempMax ?? '-'}° / {day.tempMin ?? '-'}°</p>
                                <p className="text-[10px] text-blue-600 flex items-center justify-center mt-1">
                                  <Droplets className="w-3 h-3 mr-0.5" />{day.precipitation ?? 0} mm
                                </p>
                                {day.precipProbability !== undefined && day.precipProbability !== null && (
                                  <p className="text-[9px] text-gray-400">{day.precipProbability}% chance</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        Prévision météo indisponible pour le moment
                      </div>
                    )}
                  </div>
                </div>

                {/* ====== 4. ALERTE SYNTHÈSE GLOBALE ====== */}
                {climateRealtimeStatus && (
                  <div className={`p-4 rounded-lg border-2 ${
                    climateRealtimeStatus.alerte_synthese?.inondation === 'inondation_critique' ? 'bg-red-100 border-red-500' :
                    climateRealtimeStatus.alerte_synthese?.inondation === 'inondation_elevee' ? 'bg-orange-100 border-orange-500' :
                    climateRealtimeStatus.alerte_synthese?.inondation === 'inondation_moderee' ? 'bg-amber-100 border-amber-500' :
                    climateRealtimeStatus.alerte_synthese?.secheresse === 'secheresse_severe' ? 'bg-red-100 border-red-500' :
                    climateRealtimeStatus.alerte_synthese?.secheresse === 'secheresse_moderee' ? 'bg-orange-100 border-orange-500' :
                    climateRealtimeStatus.alerte_synthese?.secheresse === 'secheresse_legere' ? 'bg-amber-100 border-amber-500' :
                    'bg-green-100 border-green-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ShieldAlert className={`w-6 h-6 ${
                          ['inondation_critique', 'secheresse_severe'].includes(climateRealtimeStatus.alerte_synthese?.inondation) ||
                          ['inondation_critique', 'secheresse_severe'].includes(climateRealtimeStatus.alerte_synthese?.secheresse)
                            ? 'text-red-600' 
                            : ['inondation_elevee', 'secheresse_moderee'].includes(climateRealtimeStatus.alerte_synthese?.inondation) ||
                              ['inondation_elevee', 'secheresse_moderee'].includes(climateRealtimeStatus.alerte_synthese?.secheresse)
                              ? 'text-orange-600'
                              : ['inondation_moderee', 'secheresse_legere'].includes(climateRealtimeStatus.alerte_synthese?.inondation) ||
                                ['inondation_moderee', 'secheresse_legere'].includes(climateRealtimeStatus.alerte_synthese?.secheresse)
                                ? 'text-amber-600'
                                : 'text-green-600'
                        }`} />
                        <div>
                          <p className="font-bold text-gray-800">Synthèse des alertes</p>
                          <p className="text-sm text-gray-700">
                            {climateRealtimeStatus.alerte_synthese?.inondation !== 'normal' && climateRealtimeStatus.alerte_synthese?.inondation !== 'inconnu' && (
                              <span>Inondation: {climateRealtimeStatus.alerte_synthese.inondation} </span>
                            )}
                            {climateRealtimeStatus.alerte_synthese?.secheresse !== 'normal' && climateRealtimeStatus.alerte_synthese?.secheresse !== 'inconnu' && (
                              <span>Sécheresse: {climateRealtimeStatus.alerte_synthese.secheresse}</span>
                            )}
                            {climateRealtimeStatus.alerte_synthese?.inondation === 'normal' && 
                             climateRealtimeStatus.alerte_synthese?.secheresse === 'normal' && 
                             '✅ Aucune alerte critique détectée'}
                            {climateRealtimeStatus.alerte_synthese?.inondation === 'inconnu' && 
                             climateRealtimeStatus.alerte_synthese?.secheresse === 'inconnu' && 
                             '❓ Données insuffisantes pour évaluer le risque'}
                          </p>
                        </div>
                      </div>
                      {climateRealtimeStatus.alerte_synthese && 
                       (climateRealtimeStatus.alerte_synthese.inondation !== 'normal' && climateRealtimeStatus.alerte_synthese.inondation !== 'inconnu') && (
                        <button
                          onClick={() => handleCreateAutoAlert('flood')}
                          disabled={creatingAutoAlert}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          {creatingAutoAlert ? 'Création...' : 'Créer l\'alerte'}
                        </button>
                      )}
                      {climateRealtimeStatus.alerte_synthese && 
                       (climateRealtimeStatus.alerte_synthese.secheresse !== 'normal' && climateRealtimeStatus.alerte_synthese.secheresse !== 'inconnu') && (
                        <button
                          onClick={() => handleCreateAutoAlert('drought')}
                          disabled={creatingAutoAlert}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
                        >
                          {creatingAutoAlert ? 'Création...' : 'Créer l\'alerte'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
{/* ========== ONGLET SÉCHERESSE (VCI / TCI / VHI / NCWSI) ========== */}
      {activeTab === 'drought' && (
        <DroughtIndicesPanel />
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

      {/* MODAL FORMULAIRE CALENDRIER */}
      {showCalendarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="font-bold text-gray-800">{editingCalendarItem ? 'Modifier la culture' : 'Nouvelle culture calendaire'}</h3>
              <button onClick={() => setShowCalendarForm(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              <CropCalendarForm 
                item={editingCalendarItem} 
                onSave={handleSaveCalendarItem} 
                onCancel={() => setShowCalendarForm(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* MODALS EXISTANTS */}
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

      {/* CHATBOT */}
      <Chatbot 
        alerts={recommendations} 
        weatherData={weatherData} 
        weatherForecast={weatherForecast} 
      />
    </div>
  )
}

// --- Composants Formulaire ---

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
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Prévisions</label><textarea value={formData.forecast} onChange={(e) => handleChange('forecast', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} maxLength={500} placeholder="Décrivez les prévisions météo..." required /></div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"><Save className="w-4 h-4 inline mr-2" />{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
    </form>
  )
}

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
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><Save className="w-4 h-4 inline mr-2" />{crop ? 'Mettre à jour' : 'Créer'}</button>
      </div>
    </form>
  )
}

function CropCalendarForm({ item, onSave, onCancel }: { item: CropCalendarItem | null, onSave: (d: any) => void, onCancel: () => void }) {
  const [form, setForm] = useState(item || {
    name: '', variety: '', crop_type: 'CEREAL', duration_days: 90,
    sowing_start: 1, sowing_end: 1, 
    weeding_start: 1, weeding_end: 1, 
    harvest_start: 1, harvest_end: 1,
    other_activities: ''
  });
  
  const months = Array.from({length: 12}, (_, i) => i + 1);
  
  const availableVarieties = form.name ? (CROP_VARIETIES_CONFIG[form.name] || []) : [];

  const handleChange = (field: string, value: any) => {
    let newForm = {...form, [field]: value};
    
    if (field === 'name') {
      newForm.variety = '';
      const varieties = CROP_VARIETIES_CONFIG[value] || [];
      if (varieties.length > 0) {
          newForm.duration_days = varieties[0].duration; 
      }
    }
    
    if (field === 'variety') {
        const selectedVar = availableVarieties.find(v => v.name === value);
        if (selectedVar) {
            newForm.duration_days = selectedVar.duration;
        }
    }
    
    setForm(newForm);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const SelectMonth = ({ label, value, onChange }: any) => (
    <div>
      <label className="text-[10px] text-gray-500">{label}</label>
      <select value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full border rounded p-1.5 text-sm mt-1">
        {months.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-600">Culture</label>
          <input 
            list="crop-list"
            value={form.name} 
            onChange={e => handleChange('name', e.target.value)} 
            className="w-full border p-2 rounded text-sm mt-1" 
            placeholder="Ex: Maïs" 
            required 
          />
          <datalist id="crop-list">
             {Object.keys(CROP_VARIETIES_CONFIG).map(c => <option key={c} value={c}/>)}
          </datalist>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600">Type</label>
          <select value={form.crop_type} onChange={e => handleChange('crop_type', e.target.value)} className="w-full border p-2 rounded text-sm mt-1">
            <option value="CEREAL">Céréale</option>
            <option value="TUBERCULE">Tubercule</option>
            <option value="LEGUME">Légume</option>
            <option value="LEGUMINEUSE">Légumineuse</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="text-xs font-bold text-gray-600">Variété</label>
            <select 
                value={form.variety || ''} 
                onChange={e => handleChange('variety', e.target.value)} 
                className="w-full border p-2 rounded text-sm mt-1 bg-white"
            >
                <option value="">-- Sélectionner --</option>
                {availableVarieties.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                ))}
                {form.variety && !availableVarieties.find(v => v.name === form.variety) && (
                     <option value={form.variety}>{form.variety} (Custom)</option>
                )}
            </select>
            {!form.name && (
                 <input 
                    placeholder="Entrez une variété" 
                    className="w-full border p-2 rounded text-sm mt-1"
                    value={form.variety || ''}
                    onChange={e => handleChange('variety', e.target.value)}
                 />
            )}
        </div>
        <div>
            <label className="text-xs font-bold text-gray-600">Durée Cycle (Jours)</label>
            <input 
                type="number" 
                value={form.duration_days || 90} 
                onChange={e => handleChange('duration_days', parseInt(e.target.value))}
                className="w-full border p-2 rounded text-sm mt-1" 
            />
        </div>
      </div>
      
      <div className="p-3 bg-green-50 rounded border border-green-200">
        <p className="text-xs font-bold text-green-800 mb-2 flex items-center"><Sprout className="w-3 h-3 mr-1"/> Période de Semi</p>
        <div className="grid grid-cols-2 gap-2">
          <SelectMonth label="Début" value={form.sowing_start} onChange={(v:number) => handleChange('sowing_start', v)} />
          <SelectMonth label="Fin" value={form.sowing_end} onChange={(v:number) => handleChange('sowing_end', v)} />
        </div>
      </div>

      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs font-bold text-blue-800 mb-2">🧹 Période de Sarclage</p>
        <div className="grid grid-cols-2 gap-2">
          <SelectMonth label="Début" value={form.weeding_start} onChange={(v:number) => handleChange('weeding_start', v)} />
          <SelectMonth label="Fin" value={form.weeding_end} onChange={(v:number) => handleChange('weeding_end', v)} />
        </div>
      </div>

      <div className="p-3 bg-orange-50 rounded border border-orange-200">
        <p className="text-xs font-bold text-orange-800 mb-2">🌾 Période de Récolte</p>
        <div className="grid grid-cols-2 gap-2">
          <SelectMonth label="Début" value={form.harvest_start} onChange={(v:number) => handleChange('harvest_start', v)} />
          <SelectMonth label="Fin" value={form.harvest_end} onChange={(v:number) => handleChange('harvest_end', v)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Annuler</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded text-sm shadow hover:bg-green-700">Enregistrer</button>
      </div>
    </form>
  );
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) { return (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>) }
function ChevronRight(props: React.SVGProps<SVGSVGElement>) { return (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>) }