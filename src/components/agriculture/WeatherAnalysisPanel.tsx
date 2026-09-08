'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CloudRain, Droplets, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type WeatherAnalysis = {
  precipitation_complete?: any[]
  spi_observe?: Record<string, any>
  spi_previsionnel?: any
  prevision_15j?: any
  open_meteo_15j?: any
  comparaison_previsions_15j?: any[]
  alerte_finale?: any
}

const API_URL = 'http://127.0.0.1:8000/agriculture/api/field-climate/'

const label = (value: any) => String(value || 'inconnu').replaceAll('_', ' ')
const formatMm = (value: any) => value == null ? '—' : `${Number(value).toFixed(1)} mm`

function normalizeForecastSeries(data: WeatherAnalysis | null) {
  if (!data) return []
  const explicit = Array.isArray(data.comparaison_previsions_15j)
    ? data.comparaison_previsions_15j
    : []
  if (explicit.length) return explicit

  const chirps = Array.isArray(data.prevision_15j?.daily) ? data.prevision_15j.daily : []
  const openMeteo = Array.isArray(data.open_meteo_15j?.daily) ? data.open_meteo_15j.daily : []
  const byDate = new Map<string, any>()
  chirps.forEach((item: any) => byDate.set(item.date, {
    date: item.date,
    chirps_gefs_mm: item.precipitation_mm ?? item.precipitation ?? null,
    open_meteo_mm: null,
  }))
  openMeteo.forEach((item: any) => {
    const current = byDate.get(item.date) || { date: item.date, chirps_gefs_mm: null }
    current.open_meteo_mm = item.precipitation_mm ?? item.precipitation ?? null
    byDate.set(item.date, current)
  })
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function severityClass(level: string) {
  if (level.includes('extreme') || level.includes('severe') || level.includes('elevee')) return 'border-red-300 bg-red-50 text-red-800'
  if (level.includes('moderee') || level.includes('legere')) return 'border-amber-300 bg-amber-50 text-amber-800'
  return 'border-emerald-300 bg-emerald-50 text-emerald-800'
}

export default function WeatherAnalysisPanel({ fieldId }: { fieldId: string }) {
  const [data, setData] = useState<WeatherAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAnalysis = async () => {
    if (!fieldId) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ champ_id: Number(fieldId), years_history: 10 })
      })
      const result = await response.json()
      if (!response.ok || result.success === false) throw new Error(result.error || 'Erreur de chargement')
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Impossible de charger l’analyse Temps')
      setData(null)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAnalysis() }, [fieldId])

  const chartData = useMemo(() => normalizeForecastSeries(data), [data])
  const alert = data?.alerte_finale || {}
  const spi30 = data?.spi_observe?.['30'] || {}
  const spi90 = data?.spi_observe?.['90'] || {}
  const spi15 = data?.spi_previsionnel || {}
  const trend = alert.tendance || 'inconnu'

  if (!fieldId) return <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">Sélectionnez un champ pour afficher l’analyse Temps.</div>
  if (loading) return <div className="bg-white rounded-xl border p-12 text-center"><RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-green-600" /><p className="text-sm text-gray-600">Calcul des tendances CHIRPS et des prévisions…</p></div>
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700"><p className="font-semibold">Données Temps indisponibles</p><p className="text-sm mt-1">{error}</p><button onClick={loadAnalysis} className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded text-sm">Réessayer</button></div>

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border-l-4 p-5 ${severityClass(alert.niveau || 'normal')}`}>
        <div className="flex justify-between items-start gap-3">
          <div><p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Alerte finale — évolution 15 jours</p><h3 className="text-2xl font-bold capitalize mt-1">{label(alert.niveau)}</h3><p className="text-sm mt-1">Tendance : <b>{label(trend)}</b></p></div>
          <AlertTriangle className="w-7 h-7" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['SPI 30 jours', spi30.spi, label(spi30.alert)],
          ['SPI 90 jours', spi90.spi, label(spi90.alert)],
          ['SPI prévisionnel', spi15.spi, label(spi15.risk)],
          ['Pluie prévue 15j', formatMm(alert.total_15j_mm ?? data?.prevision_15j?.total_precipitation_mm), 'CHIRPS3-GEFS']
        ].map(([title, value, subtitle]) => <div key={title} className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">{title}</p><p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p><p className="text-[11px] text-gray-500 capitalize mt-1">{subtitle}</p></div>)}
      </div>

      <div className="bg-white rounded-xl border p-5">
        <div className="flex justify-between items-start mb-4"><div><h3 className="font-semibold text-gray-900">Comparaison des prévisions de pluie</h3><p className="text-xs text-gray-500 mt-1">Open-Meteo versus CHIRPS3-GEFS — 15 jours</p></div><CloudRain className="w-5 h-5 text-green-600" /></div>
        <div className="h-[310px] w-full">
          {chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="date" tickFormatter={(date) => date?.slice(5)} tick={{ fontSize: 11 }} /><YAxis unit=" mm" tick={{ fontSize: 11 }} /><Tooltip formatter={(value: any, name: any) => [`${value ?? '—'} mm`, name === 'chirps_gefs_mm' ? 'CHIRPS3-GEFS' : 'Open-Meteo']} /><Legend formatter={(value) => value === 'chirps_gefs_mm' ? 'CHIRPS3-GEFS' : 'Open-Meteo'} /><Line type="monotone" dataKey="chirps_gefs_mm" name="chirps_gefs_mm" stroke="#15803d" strokeWidth={3} dot={{ r: 3 }} connectNulls /><Line type="monotone" dataKey="open_meteo_mm" name="open_meteo_mm" stroke="#2563eb" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls /></LineChart></ResponsiveContainer> : <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucune prévision comparative disponible</div>}
        </div>
        {chartData.length > 0 && (
          <div className="mt-4 overflow-x-auto border rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">CHIRPS3-GEFS</th><th className="px-3 py-2">Open-Meteo</th></tr>
              </thead>
              <tbody>
                {chartData.map((day: any) => <tr key={day.date} className="border-t"><td className="px-3 py-2 font-medium">{day.date}</td><td className="px-3 py-2 text-green-700">{formatMm(day.chirps_gefs_mm)}</td><td className="px-3 py-2 text-blue-700">{formatMm(day.open_meteo_mm)}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><Droplets className="w-4 h-4 text-amber-600" />Détails sécheresse</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span>SPI prévisionnel</span><b>{spi15.spi ?? '—'}</b></div><div className="flex justify-between"><span>Alerte</span><b className="capitalize">{label(alert.alerte_secheresse)}</b></div><div className="flex justify-between"><span>Jours secs consécutifs</span><b>{alert.max_jours_secs_consecutifs ?? '—'}</b></div></div></div>
        <div className="bg-white rounded-xl border p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" />Détails pluie / inondation</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span>Maximum sur 3 jours</span><b>{formatMm(alert.max_3j_mm)}</b></div><div className="flex justify-between"><span>Alerte</span><b className="capitalize">{label(alert.alerte_inondation)}</b></div><div className="flex justify-between"><span>Évolution</span><b className="capitalize">{label(trend)}</b></div></div></div>
      </div>
    </div>
  )
}
