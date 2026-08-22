// src/app/api/weather/field-forecast/route.ts
// Prévision météo à 14 jours pour un champ (lat/lon = centroïde du champ).
// Utilise Open-Meteo (gratuit, sans clé API, jusqu'à 16 jours de prévision).
import { NextResponse } from 'next/server'

export interface FieldForecastDay {
  date: string
  tempMax: number | null
  tempMin: number | null
  precipitation: number | null
  precipProbability: number | null
  et0: number | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json(
      { success: false, error: 'Paramètres lat et lon requis' },
      { status: 400 }
    )
  }

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration` +
      `&timezone=auto&forecast_days=14`

    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`Erreur API Open-Meteo: ${response.status}`)
    }

    const data = await response.json()

    const daily: FieldForecastDay[] = data.daily.time.map((date: string, i: number) => ({
      date,
      tempMax: data.daily.temperature_2m_max?.[i] ?? null,
      tempMin: data.daily.temperature_2m_min?.[i] ?? null,
      precipitation: data.daily.precipitation_sum?.[i] ?? null,
      precipProbability: data.daily.precipitation_probability_max?.[i] ?? null,
      et0: data.daily.et0_fao_evapotranspiration?.[i] ?? null,
    }))

    return NextResponse.json({ success: true, data: daily })
  } catch (error) {
    console.error('Erreur Open-Meteo (field-forecast):', error)
    return NextResponse.json(
      { success: false, error: 'Impossible de récupérer la prévision météo à 14 jours' },
      { status: 500 }
    )
  }
}