'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapContainer, TileLayer, GeoJSON, LayersControl, useMap,
} from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Layers, Calendar, Download, MapPin, RefreshCw, AlertTriangle, X,
  Sun, Droplet, Thermometer, Activity, Play,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// URL du backend Django
const API_BASE = 'http://127.0.0.1:8000/agriculture';

// Palette commune pour VCI / TCI / VHI / NCWSI (0-100, rouge → vert)
const DROUGHT_PALETTE_GRADIENT =
  'linear-gradient(to right, #a50026, #d73027, #f46d43, #fdae61, #fee08b, #d9ef8b, #a6d96a, #66bd63, #1a9850, #006837)';

const DROUGHT_INDICES = [
  { id: 'vci',   name: 'VCI',   label: 'Vegetation Condition Index',  description: 'Stress végétal (NDVI vs historique)', icon: Activity,    color: '#16a34a' },
  { id: 'tci',   name: 'TCI',   label: 'Temperature Condition Index', description: 'Stress thermique (LST vs historique)', icon: Thermometer, color: '#dc2626' },
  { id: 'vhi',   name: 'VHI',   label: 'Vegetation Health Index',     description: 'Combinaison VCI + TCI (50/50)', icon: Sun,           color: '#d97706' },
  { id: 'ncwsi', name: 'NCWSI', label: 'Normalized Condition Water Stress Index', description: 'Stress hydrique NDVI/LST normalisé', icon: Droplet, color: '#2563eb' },
] as const;

type IndexType = typeof DROUGHT_INDICES[number]['id'];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS: string[] = [];
for (let y = 2010; y <= CURRENT_YEAR; y++) YEAR_OPTIONS.push(String(y));

function classifyDrought(value: number): { label: string; color: string } {
  if (value < 10)  return { label: 'Sécheresse extrême',  color: 'bg-red-700 text-white' };
  if (value < 20)  return { label: 'Sécheresse sévère',   color: 'bg-red-500 text-white' };
  if (value < 30)  return { label: 'Sécheresse modérée',   color: 'bg-orange-500 text-white' };
  if (value < 40)  return { label: 'Sécheresse légère',    color: 'bg-yellow-400 text-yellow-900' };
  if (value <= 60) return { label: 'Condition normale',    color: 'bg-green-500 text-white' };
  return { label: 'Condition favorable', color: 'bg-green-700 text-white' };
}

function ZoomControl() {
  const map = useMap();
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white p-1 rounded shadow border border-gray-300 flex flex-col">
      <button onClick={() => map.zoomIn()} className="p-1 hover:bg-gray-100 text-gray-600 font-bold w-8 h-8 flex items-center justify-center" title="Zoom avant">+</button>
      <button onClick={() => map.zoomOut()} className="p-1 hover:bg-gray-100 text-gray-600 font-bold w-8 h-8 flex items-center justify-center border-t border-gray-200" title="Zoom arrière">−</button>
    </div>
  );
}

export default function DroughtIndicesPanel() {
  const [viewMode, setViewMode] = useState<'admin' | 'field'>('admin');
  const [zoneType, setZoneType] = useState<'region' | 'prefecture' | 'commune'>('region');
  const [zoneId, setZoneId] = useState<string>('');
  const [availableZones, setAvailableZones] = useState<any[]>([]);
  const [mapGeoJson, setMapGeoJson] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(false);

  const [availableFields, setAvailableFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [selectedField, setSelectedField] = useState<any>(null);
  const [fieldSearchTerm, setFieldSearchTerm] = useState<string>('');

  const [indexType, setIndexType] = useState<IndexType>('vhi');
  // IMPORTANT : aucune année pré-sélectionnée — l'utilisateur doit choisir.
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  // mapYear : dynamique, basé sur les années sélectionnées ; null si vide.
  const computedMapYear = selectedYears.length > 0
    ? String(Math.max(...selectedYears.map((y) => parseInt(y, 10))))
    : null;
  const [mapYear, setMapYear] = useState<string | null>(null); // mise à jour après un calcul réussi

  const [timeseriesData, setTimeseriesData] = useState<any[]>([]);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AbortController pour permettre l'annulation d'une requête en cours
  const abortRef = useRef<AbortController | null>(null);

  const loadMapData = useCallback(async (type: 'region' | 'prefecture' | 'commune') => {
    setMapLoading(true);
    setAvailableZones([]);
    setMapGeoJson(null);
    const url =
      type === 'region' ? `${API_BASE}/api/regions/` :
      type === 'prefecture' ? `${API_BASE}/api/prefectures/` :
      `${API_BASE}/api/communes/`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMapGeoJson(data);
        const zones = (data.features || []).map((f: any) => ({
          id: String(f.id),
          name: f.properties.region || f.properties.prefecture || f.properties.commune || 'Inconnu',
          type,
        }));
        setAvailableZones(zones);
      }
    } catch (e) {
      console.error('Erreur chargement zones:', e);
    } finally {
      setMapLoading(false);
    }
  }, []);

  const loadFields = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/champs/geojson/`);
      if (res.ok) {
        const data = await res.json();
        setAvailableFields(data.features || []);
      }
    } catch (e) {
      console.error('Erreur chargement champs:', e);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'admin') loadMapData(zoneType);
    else loadFields();
  }, [viewMode, zoneType, loadMapData, loadFields]);

  const handleSelectField = (id: string) => {
    setSelectedFieldId(id);
    const field = availableFields.find((f: any) => String(f.id) === id);
    setSelectedField(field || null);
  };

  // Valide si l'utilisateur peut lancer un calcul
  const canExecute =
    !loading &&
    selectedYears.length > 0 &&
    ((viewMode === 'admin' && zoneId !== '') || (viewMode === 'field' && selectedFieldId !== ''));

  // Bouton Exécuter : lance explicitement le calcul
  const handleExecute = async () => {
    if (!canExecute) return;

    // Annuler une éventuelle requête précédente en cours
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setTimeseriesData([]);
    setMapUrl(null);
    setDownloadUrl(null);
    setMapYear(null);

    try {
      const years = selectedYears.map((y) => parseInt(y, 10));
      const endpoint =
        viewMode === 'admin'
          ? `${API_BASE}/api/drought-indices/`
          : `${API_BASE}/api/field-drought-indices/`;

      const body: any = { years, index_type: indexType };
      if (viewMode === 'admin') {
        body.zone_type = zoneType;
        body.zone_id = parseInt(zoneId, 10);
      } else {
        body.champ_id = parseInt(selectedFieldId, 10);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const result = await res.json();

      if (result.success) {
        setTimeseriesData(result.data || []);
        setMapUrl(result.map_url || null);
        setDownloadUrl(result.download_url || null);
        if (result.map_year) setMapYear(String(result.map_year));
      } else {
        setError(result.error || 'Erreur inconnue');
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError('Calcul annulé par l\'utilisateur.');
      } else {
        console.error(e);
        setError(`Erreur réseau : ${e.message || e}`);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  // Bouton Annuler : stoppe la requête en cours
  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setLoading(false);
  };

  // Si l'utilisateur change de zone/champ/indice/années pendant qu'un calcul est en cours,
  // on annule le calcul en cours pour éviter les conflits d'état.
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const handleDownloadCSV = () => {
    if (!timeseriesData.length) return alert('Aucune donnée à télécharger — lancez d\'abord un calcul.');
    const header = 'Annee;Mois;Indice;Valeur\n';
    const rows = timeseriesData.map((r) =>
      `${r.year};${r.month};${indexType.toUpperCase()};${r.value}\n`
    ).join('');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${indexType.toUpperCase()}_${viewMode === 'admin' ? zoneType + '_' + zoneId : 'champ_' + selectedFieldId}.csv`;
    link.click();
  };

  const handleDownloadGeoTIFF = () => {
    if (!downloadUrl) return alert('Lancez d\'abord un calcul pour générer le GeoTIFF.');
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${indexType.toUpperCase()}_${mapYear || computedMapYear || 'unknown'}.tif`;
    link.target = '_blank';
    link.click();
  };

  const latestYear = mapYear ? parseInt(mapYear, 10) : (computedMapYear ? parseInt(computedMapYear, 10) : CURRENT_YEAR);
  const latestYearData = timeseriesData.filter((d) => d.year === latestYear);
  const meanValue = latestYearData.length > 0
    ? latestYearData.reduce((s, d) => s + (d.value || 0), 0) / latestYearData.length
    : null;
  const minMonth = latestYearData.length > 0
    ? latestYearData.reduce((m, d) => (d.value < m.value ? d : m), latestYearData[0])
    : null;

  const activeIndex = DROUGHT_INDICES.find((i) => i.id === indexType)!;

  // Année affichée sur le bouton GeoTIFF : dynamique, basée sur les sélections
  const geotiffButtonLabel = `GeoTIFF ${mapYear || computedMapYear || ''}`.trim();

  return (
    <div className="space-y-6">
      {/* Header + boutons */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Suivi Historique de la Sécheresse
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Indices VCI, TCI, VHI et NCWSI basés sur MODIS (MOD13A2 NDVI + MOD11A2 LST).
              Période de référence : 2010 → {CURRENT_YEAR}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!loading ? (
              <button
                onClick={handleExecute}
                disabled={!canExecute}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
                title="Lancer le calcul des indices"
              >
                <Play className="w-4 h-4 mr-1" /> Exécuter
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center"
                title="Annuler le calcul en cours"
              >
                <X className="w-4 h-4 mr-1" /> Annuler
              </button>
            )}
            <button
              onClick={handleDownloadCSV}
              disabled={!timeseriesData.length}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 text-sm flex items-center"
              title="Télécharger les données CSV"
            >
              <Download className="w-4 h-4 mr-1" /> CSV
            </button>
            <button
              onClick={handleDownloadGeoTIFF}
              disabled={!downloadUrl}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm flex items-center"
              title={downloadUrl ? `Télécharger la carte GeoTIFF ${mapYear || computedMapYear}` : 'Lancez d\'abord un calcul'}
            >
              <Download className="w-4 h-4 mr-1" /> {geotiffButtonLabel || 'GeoTIFF'}
            </button>
          </div>
        </div>

        {/* Message d'aide si pas exécutable */}
        {!canExecute && !loading && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            {viewMode === 'admin' && !zoneId && 'Sélectionnez une zone administrative. '}
            {viewMode === 'field' && !selectedFieldId && 'Sélectionnez un champ. '}
            {selectedYears.length === 0 && 'Sélectionnez au moins une année. '}
            Puis cliquez sur « Exécuter ».
          </div>
        )}
      </div>

      {/* Stats si données */}
      {meanValue !== null && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">Indice moyen {latestYear}</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">{meanValue.toFixed(1)}</span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${classifyDrought(meanValue).color}`}>
              {classifyDrought(meanValue).label}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">Mois le plus sec {latestYear}</p>
            {minMonth && (
              <>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-bold text-red-600">{minMonth.value.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">en {minMonth.month_name}</span>
                </div>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${classifyDrought(minMonth.value).color}`}>
                  {classifyDrought(minMonth.value).label}
                </span>
              </>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">Indice sélectionné</p>
            <div className="flex items-center mt-1">
              <activeIndex.icon className="w-7 h-7 mr-2" style={{ color: activeIndex.color }} />
              <div>
                <p className="font-bold text-gray-900">{activeIndex.name}</p>
                <p className="text-xs text-gray-500">{activeIndex.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start">
          <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-orange-800">Avertissement</p>
            <p className="text-orange-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('admin')}
                className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${viewMode === 'admin' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Vue Administrative
              </button>
              <button
                onClick={() => setViewMode('field')}
                className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${viewMode === 'field' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Mes Champs
              </button>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <label className="block text-xs font-medium text-gray-500 mb-2">Indice de sécheresse</label>
            <div className="grid grid-cols-2 gap-2">
              {DROUGHT_INDICES.map((idx) => (
                <button
                  key={idx.id}
                  onClick={() => setIndexType(idx.id)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center space-y-1 ${
                    indexType === idx.id
                      ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-500 ring-offset-1 shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={idx.description}
                >
                  <idx.icon className="w-4 h-4" style={{ color: idx.color }} />
                  <span>{idx.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">{activeIndex.description}</p>
          </div>

          {viewMode === 'admin' ? (
            <>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center text-xs">
                  <Layers className="w-4 h-4 mr-2" /> Niveau administratif
                </h4>
                <div className="grid grid-cols-3 gap-1 bg-gray-200 p-1 rounded-lg">
                  {(['region', 'prefecture', 'commune'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setZoneType(t); setZoneId(''); }}
                      className={`py-1 px-2 text-xs font-medium rounded-md capitalize transition-all ${zoneType === t ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-xs font-medium text-gray-500 mb-1">Zone sélectionnée</label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full text-sm border-gray-300 rounded"
                >
                  <option value="">-- Choisissez une {zoneType} --</option>
                  {availableZones.map((z: any) => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-700 text-xs mb-2">Mes Parcelles</h4>
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="Chercher par propriétaire..."
                  value={fieldSearchTerm}
                  onChange={(e) => setFieldSearchTerm(e.target.value)}
                  className="pl-3 pr-3 py-1.5 border border-gray-200 rounded text-sm w-full focus:ring-1 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <select
                value={selectedFieldId}
                onChange={(e) => handleSelectField(e.target.value)}
                className="w-full text-sm border-gray-300 rounded bg-white"
              >
                <option value="">-- Sélectionner un champ --</option>
                {availableFields
                  .filter((f: any) =>
                    f.properties.proprietaire &&
                    f.properties.proprietaire.toLowerCase().includes(fieldSearchTerm.toLowerCase())
                  )
                  .map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.properties.nom} ({f.properties.proprietaire})
                    </option>
                  ))}
              </select>
              {selectedFieldId && selectedField && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-3">
                  <p className="text-xs text-blue-800 font-semibold">Info Champ</p>
                  <p className="text-xs text-blue-600 mt-1">Culture: {selectedField.properties.type_culture}</p>
                  <p className="text-xs text-blue-600 mt-1">Propriétaire: {selectedField.properties.proprietaire}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700 flex items-center text-xs">
                <Calendar className="w-4 h-4 mr-2" /> Années à analyser
              </h4>
              {selectedYears.length > 0 && (
                <button
                  onClick={() => setSelectedYears([])}
                  className="text-[10px] text-gray-500 hover:text-red-600"
                  title="Tout désélectionner"
                >
                  Effacer
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {YEAR_OPTIONS.slice().reverse().map((year) => {
                const checked = selectedYears.includes(year);
                return (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYears((prev) =>
                        prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
                      );
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      checked ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              {selectedYears.length === 0
                ? 'Aucune année sélectionnée — cliquez pour ajouter.'
                : `${selectedYears.length} année(s) sélectionnée(s).`}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-700 mb-2 text-xs">
              {activeIndex.name} — {activeIndex.label}
            </h4>
            <div className="h-3 w-full rounded mb-1" style={{ background: DROUGHT_PALETTE_GRADIENT }} />
            <div className="flex justify-between text-[10px] text-gray-500 font-medium">
              <span>0 (sec)</span>
              <span>50</span>
              <span>100 (humide)</span>
            </div>
            <div className="mt-2 space-y-1 text-[10px] text-gray-500">
              <div className="flex items-center"><span className="w-3 h-3 bg-red-700 rounded mr-2" /> 0–10 : extrême</div>
              <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded mr-2" /> 10–20 : sévère</div>
              <div className="flex items-center"><span className="w-3 h-3 bg-orange-500 rounded mr-2" /> 20–30 : modérée</div>
              <div className="flex items-center"><span className="w-3 h-3 bg-yellow-400 rounded mr-2" /> 30–40 : légère</div>
              <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded mr-2" /> 40–100 : normale</div>
            </div>
          </div>
        </div>

        {/* Zone principale : carte + graphique */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="rounded-lg overflow-hidden border border-gray-300 shadow-md relative" style={{ height: '500px', zIndex: 0 }}>
            {mapLoading ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Chargement de la couche {zoneType}…</p>
                </div>
              </div>
            ) : (
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
                    <TileLayer
                      url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                      maxZoom={20}
                      subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    />
                  </LayersControl.BaseLayer>

                  {mapUrl && mapYear && (
                    <LayersControl.Overlay name={`🛰️ ${activeIndex.name} (${mapYear})`} checked>
                      <TileLayer
                        key={`${indexType}-${mapYear}-${mapUrl}`}
                        url={mapUrl}
                        attribution="MODIS (MOD13A2 + MOD11A2) — Google Earth Engine"
                        opacity={0.85}
                      />
                    </LayersControl.Overlay>
                  )}
                </LayersControl>

                {viewMode === 'admin' && mapGeoJson && (
                  <GeoJSON
                    key={zoneType}
                    data={mapGeoJson}
                    style={(feature) => {
                      const isSelected = feature ? String(feature.id) === zoneId : false;
                      return {
                        color: isSelected ? '#f97316' : '#ffffff',
                        weight: isSelected ? 3 : 1,
                        fillColor: isSelected ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                        fillOpacity: 1,
                      };
                    }}
                    onEachFeature={(feature, layer) => {
                      layer.on({
                        click: () => {
                          if (feature) setZoneId(String(feature.id));
                        },
                      });
                    }}
                  />
                )}

                {viewMode === 'field' && availableFields.map((field: any) => (
                  <GeoJSON
                    key={field.id}
                    data={field.geometry}
                    style={{
                      color: String(field.id) === selectedFieldId ? '#ef4444' : '#3b82f6',
                      weight: String(field.id) === selectedFieldId ? 3 : 2,
                      fillColor: String(field.id) === selectedFieldId ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                      fillOpacity: 1,
                    }}
                    onEachFeature={(_, layer) => {
                      layer.bindPopup(`<b>${field.properties.nom}</b><br>${field.properties.type_culture}`);
                      layer.on({ click: () => handleSelectField(String(field.id)) });
                    }}
                  />
                ))}
              </MapContainer>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>
              {loading ? 'Calcul en cours…' :
                mapUrl ? `${activeIndex.name} — moyenne annuelle ${mapYear}` :
                viewMode === 'admin'
                  ? (zoneId ? 'Cliquez sur « Exécuter » pour calculer les indices' : 'Sélectionnez une zone')
                  : (selectedFieldId ? 'Cliquez sur « Exécuter » pour calculer les indices' : 'Sélectionnez un champ')}
            </p>
            <p className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              Mode: {viewMode === 'admin' ? zoneType.toUpperCase() : 'CHAMPS'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-orange-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-orange-600" />
                  Évolution mensuelle — {activeIndex.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Comparaison interannuelle. Plus la valeur est basse, plus la sécheresse est marquée.
                </p>
              </div>
              {loading && (
                <div className="flex items-center text-orange-600 text-sm">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Calcul en cours…
                </div>
              )}
            </div>

            {loading && (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Calcul des indices de sécheresse…</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Earth Engine agrège les données MODIS — cliquez sur « Annuler » pour stopper.
                  </p>
                </div>
              </div>
            )}

            {!loading && timeseriesData.length > 0 && (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeseriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month_name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} label={{ value: activeIndex.name, angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value: any) => [value, activeIndex.name]}
                      labelFormatter={(label) => `Mois : ${label}`}
                    />
                    <Legend />
                    {Array.from(new Set(timeseriesData.map((d) => d.year))).sort().map((year) => {
                      const isMax = mapYear && year === parseInt(mapYear, 10);
                      return (
                        <Line
                          key={year}
                          type="monotone"
                          dataKey="value"
                          stroke={isMax ? '#f97316' : '#9ca3af'}
                          strokeWidth={isMax ? 3 : 1}
                          name={`Année ${year}`}
                          data={timeseriesData.filter((d) => d.year === year)}
                          dot={{ r: 3 }}
                          connectNulls={false}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {!loading && timeseriesData.length === 0 && !error && (
              <div className="h-32 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg bg-gray-50">
                <div className="text-center">
                  {viewMode === 'admin'
                    ? 'Sélectionnez une zone et au moins une année, puis cliquez sur « Exécuter »'
                    : 'Sélectionnez un champ et au moins une année, puis cliquez sur « Exécuter »'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
