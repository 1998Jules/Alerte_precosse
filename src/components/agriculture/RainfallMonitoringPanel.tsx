'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, CloudRain, Droplets, Gauge, Loader2 } from 'lucide-react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface RainfallMonitoringPanelProps {
  fieldId: string
  token: string | null
}

interface MonitoringResponse {
  maintenant?: {
    total_24h_mm?: number
    total_mm?: number
    flood_level_now?: string
  }
  tendance_recente?: {
    drought_30d?: { spi?: number; pnp?: number; classification?: string }
    drought_90d?: { spi?: number; pnp?: number; classification?: string }
  }
  a_venir?: {
    daily?: Array<{
      date: string
      precipitation_mm?: number | null
      precipitation_probability?: number | null
      t_max?: number | null
      t_min?: number | null
    }>
    total_precipitation_mm?: number
    flood_forecast?: { level?: string; max_3day_cumulative_mm?: number }
    drought_forecast?: { level?: string; max_consecutive_dry_days?: number }
  }
  alerte_synthese?: {
    inondation?: string
    secheresse?: string
  }
}

const formatDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
}

const value = (number: number | null | undefined, suffix = '') =>
  number === null || number === undefined ? '—' : `${number}${suffix}`

export default function RainfallMonitoringPanel({ fieldId, token }: RainfallMonitoringPanelProps) {
  const [data, setData] = useState<MonitoringResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fieldId) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('http://127.0.0.1:8000/agriculture/api/field-realtime-status/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
          body: JSON.stringify({ champ_id: Number(fieldId), forecast_days: 15 }),
        })
        const result = await response.json()
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Impossible de charger les données pluie')
        }
        setData(result)
      } catch (err) {
        setData(null)
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fieldId, token])

  const forecast = useMemo(
    () => (data?.a_venir?.daily || []).slice(0, 15).map((day) => ({
      ...day,
      label: formatDate(day.date),
      pluie: day.precipitation_mm || 0,
      chance: day.precipitation_probability || 0,
      tmin: day.t_min,
      tmax: day.t_max,
    })),
    [data]
  )

  if (loading) {
    return <div className="flex items-center gap-2 rounded-lg bg-white p-6 text-gray-600 shadow"><Loader2 className="h-5 w-5 animate-spin" /> Chargement pluie et prévisions…</div>
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Erreur pluie : {error}</div>
  }

  if (!data) return null

  const now = data.maintenant || {}
  const recent = data.tendance_recente || {}
  const future = data.a_venir || {}
  const alertFlood = data.alerte_synthese?.inondation && data.alerte_synthese.inondation !== 'normal' && data.alerte_synthese.inondation !== 'inconnu'
  const alertDrought = data.alerte_synthese?.secheresse && data.alerte_synthese.secheresse !== 'normal' && data.alerte_synthese.secheresse !== 'inconnu'

  return (
    <section className="space-y-4 rounded-xl bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800"><CloudRain className="h-5 w-5 text-blue-600" /> Pluie quasi temps réel et prévisions</h3>
        <span className="text-xs text-slate-500">Fenêtre prévisionnelle : 15 jours</span>
      </div>

      {(alertFlood || alertDrought) && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> Alerte climatique</div>
          {alertFlood && <p>Inondation : {data.alerte_synthese?.inondation}</p>}
          {alertDrought && <p>Sécheresse : {data.alerte_synthese?.secheresse}</p>}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <Metric icon={<Droplets className="h-4 w-4" />} label="Cumul 24 h" value={value(now.total_24h_mm, ' mm')} />
        <Metric icon={<Droplets className="h-4 w-4" />} label="Cumul 72 h" value={value(now.total_mm, ' mm')} />
        <Metric icon={<Gauge className="h-4 w-4" />} label="SPI 30 jours" value={value(recent.drought_30d?.spi)} />
        <Metric icon={<Gauge className="h-4 w-4" />} label="SPI 90 jours" value={value(recent.drought_90d?.spi)} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-white p-3 shadow-sm"><p className="text-xs text-slate-500">Cumul prévu 15 jours</p><p className="text-xl font-bold text-blue-700">{value(future.total_precipitation_mm, ' mm')}</p></div>
        <div className="rounded-lg bg-white p-3 shadow-sm"><p className="text-xs text-slate-500">Pic pluie sur 3 jours</p><p className="text-xl font-bold text-indigo-700">{value(future.flood_forecast?.max_3day_cumulative_mm, ' mm')}</p></div>
        <div className="rounded-lg bg-white p-3 shadow-sm"><p className="text-xs text-slate-500">Série sèche maximale</p><p className="text-xl font-bold text-orange-700">{value(future.drought_forecast?.max_consecutive_dry_days, ' jours')}</p></div>
      </div>

      <div className="h-[360px] rounded-lg bg-white p-3 shadow-sm">
        <h4 className="mb-2 font-semibold text-slate-700">Prévisions pluie et températures</h4>
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart data={forecast} margin={{ top: 8, right: 18, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis yAxisId="rain" orientation="left" label={{ value: 'Pluie (mm)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="temp" orientation="right" label={{ value: '°C', angle: 90, position: 'insideRight' }} />
            <Tooltip formatter={(item: number, name: string) => [name === 'chance' ? `${item}%` : item, name === 'pluie' ? 'Pluie' : name === 'chance' ? 'Probabilité' : name === 'tmin' ? 'T° min' : 'T° max']} />
            <Legend />
            <Bar yAxisId="rain" dataKey="pluie" name="Pluie (mm)" fill="#38bdf8" radius={[3, 3, 0, 0]} />
            <Line yAxisId="temp" type="monotone" dataKey="tmax" name="T° max" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line yAxisId="temp" type="monotone" dataKey="tmin" name="T° min" stroke="#2563eb" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {forecast.map((day) => (
          <div key={day.date} className="rounded-lg border bg-white p-3 shadow-sm">
            <p className="font-semibold text-slate-700">{day.date}</p>
            <p className="text-sm text-red-600">{value(day.tmax, '°')} / <span className="text-blue-600">{value(day.tmin, '°')}</span></p>
            <p className="mt-1 text-sm font-medium text-sky-700">{value(day.pluie, ' mm')}</p>
            <p className="text-xs text-slate-500">{value(day.chance, '%')} chance</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Metric({ icon, label, value: metricValue }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-lg bg-white p-3 shadow-sm"><div className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</div><p className="mt-1 text-xl font-bold text-slate-800">{metricValue}</p></div>
}
