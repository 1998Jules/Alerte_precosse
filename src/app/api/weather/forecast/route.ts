// src/app/api/weather/forecast/route.ts
import { NextResponse } from 'next/server'

function mapWeatherIcon(code: number): string {
  if (code >= 200 && code < 600) return 'cloud-rain'
  if (code >= 600 && code < 700) return 'cloud'
  if (code >= 700 && code < 800) return 'cloud'
  if (code === 800) return 'sun'
  if (code > 800) return 'cloud-sun'
  return 'cloud-sun'
}

const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Si on envoie ?lat=9.3&lon=1.2, on prend ça. Sinon, on prend le .env par défaut.
  const LAT = searchParams.get('lat') || process.env.NEXT_PUBLIC_DEFAULT_LAT || '8.6'
  const LON = searchParams.get('lon') || process.env.NEXT_PUBLIC_DEFAULT_LON || '1.2'
  const API_KEY = process.env.OPENWEATHER_API_KEY

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&lang=fr&appid=${API_KEY}`
    
// src/app/api/weather/forecast/route.ts - CHANGEZ cette ligne :
const response = await fetch(url, { cache: 'no-store' }) // AU LIEU DE { next: { revalidate: 600 } }
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    
    const data = await response.json()

    // 1. Les 8 premiers éléments = les 24 prochaines heures
    const hourly = data.list.slice(0, 8).map((item: any) => ({
      time: item.dt_txt.split(' ')[1].substring(0, 5),
      temp: Math.round(item.main.temp),
      icon: mapWeatherIcon(item.weather[0].id),
      description: item.weather[0].description,
      rain: item.rain ? item.rain['3h'] : 0
    }))

    // 2. Prévisions quotidiennes
    const dailyMap = new Map<string, any>()
    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0]
      const hour = parseInt(item.dt_txt.split(' ')[1])
      if (hour >= 11 && hour <= 15) dailyMap.set(date, item)
      else if (!dailyMap.has(date)) dailyMap.set(date, item)
    })

    const daily = Array.from(dailyMap.entries()).slice(0, 5).map(([date, item], index) => {
      const dateObj = new Date(date + 'T12:00:00')
      return {
        id: String(index + 1),
        date: date,
        day: index === 0 ? "Aujourd'hui" : index === 1 ? 'Demain' : dayNames[dateObj.getDay()],
        temperature: { max: Math.round(item.main.temp_max), min: Math.round(item.main.temp_min) },
        condition: item.weather[0].description,
        precipitation: Math.round((item.pop || 0) * 100),
        icon: mapWeatherIcon(item.weather[0].id)
      }
    })

    return NextResponse.json({ success: true, data: { hourly, daily } })

  } catch (error) {
    console.error('Erreur forecast:', error)
    return NextResponse.json({ 
      success: true, 
      data: {
        hourly: [{ time: 'Maintenant', temp: 28, icon: 'cloud-sun', description: 'Couvert', rain: 0 }],
        daily: [{ id: '1', date: new Date().toISOString().split('T')[0], day: "Aujourd'hui", temperature: { max: 32, min: 24 }, condition: 'Ensoleillé', precipitation: 10, icon: 'sun' }]
      }
    })
  }
}