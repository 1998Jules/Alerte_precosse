import { NextResponse } from 'next/server'

const TOGO_REGIONS = [
  { nom: 'Maritime', capitale: 'Lomé', lat: 6.1319, lon: 1.2228 },
  { nom: 'Plateaux', capitale: 'Atakpamé', lat: 7.5317, lon: 1.1325 },
  { nom: 'Centrale', capitale: 'Sokodé', lat: 9.0407, lon: 1.1400 },
  { nom: 'Kara', capitale: 'Kara', lat: 9.5514, lon: 1.1528 },
  { nom: 'Savanes', capitale: 'Dapaong', lat: 10.8606, lon: 0.1803 },
]

function mapWeatherIcon(code: number): string {
  if (code >= 200 && code < 300) return 'thunderstorm'
  if (code >= 300 && code < 400) return 'drizzle'
  if (code >= 500 && code < 600) return 'rain'
  if (code >= 600 && code < 700) return 'snow'
  if (code >= 700 && code < 800) return 'fog'
  if (code === 800) return 'sun'
  if (code > 800) return 'cloud-sun'
  return 'cloud'
}

function getEmojiIcon(code: number): string {
  if (code >= 200 && code < 300) return '⛈️'
  if (code >= 300 && code < 400) return '🌦️'
  if (code >= 500 && code < 600) return '🌧️'
  if (code >= 600 && code < 700) return '🌨️'
  if (code >= 700 && code < 800) return '🌫️'
  if (code === 800) return '☀️'
  if (code === 801) return '🌤️'
  if (code === 802) return '⛅'
  if (code >= 803) return '☁️'
  return '🌤️'
}

function getIconColor(code: number): string {
  if (code >= 200 && code < 300) return '#7c3aed'
  if (code >= 300 && code < 500) return '#3b82f6'
  if (code >= 500 && code < 600) return '#1d4ed8'
  if (code >= 600 && code < 700) return '#6b7280'
  if (code >= 700 && code < 800) return '#9ca3af'
  if (code === 800) return '#f59e0b'
  if (code > 800) return '#64748b'
  return '#64748b'
}

export async function GET() {
  const API_KEY = process.env.OPENWEATHER_API_KEY

  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Clé API OpenWeather non configurée' },
      { status: 500 }
    )
  }

  try {
    const results = await Promise.all(
      TOGO_REGIONS.map(async (region) => {
        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${region.lat}&lon=${region.lon}&units=metric&lang=fr&appid=${API_KEY}`
          const res = await fetch(url, { cache: 'no-store' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          return {
            nom: region.nom,
            capitale: region.capitale,
            lat: region.lat,
            lon: region.lon,
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6),
            pressure: data.main.pressure,
            weatherCode: data.weather[0].id,
            description: data.weather[0].description,
            icon: mapWeatherIcon(data.weather[0].id),
            emoji: getEmojiIcon(data.weather[0].id),
            iconColor: getIconColor(data.weather[0].id),
          }
        } catch (err) {
          console.error(`Erreur météo ${region.nom}:`, err)
          return {
            nom: region.nom,
            capitale: region.capitale,
            lat: region.lat,
            lon: region.lon,
            temperature: null,
            humidity: null,
            windSpeed: null,
            pressure: null,
            weatherCode: null,
            description: 'Indisponible',
            icon: 'cloud',
            emoji: '❓',
            iconColor: '#9ca3af',
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: results,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erreur globale régions:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de récupération des données régionales' },
      { status: 500 }
    )
  }
}
