// src/app/api/weather/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function mapWeatherIcon(code: number): string {
  if (code >= 200 && code < 600) return 'cloud-rain'
  if (code >= 600 && code < 700) return 'cloud'
  if (code >= 700 && code < 800) return 'cloud'
  if (code === 800) return 'sun'
  if (code > 800) return 'cloud-sun'
  return 'cloud-sun'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Lecture dynamique des coordonnées
  const LAT = searchParams.get('lat') || process.env.NEXT_PUBLIC_DEFAULT_LAT || '8.6'
  const LON = searchParams.get('lon') || process.env.NEXT_PUBLIC_DEFAULT_LON || '1.2'
  const API_KEY = process.env.OPENWEATHER_API_KEY

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&lang=fr&appid=${API_KEY}`
   // src/app/api/weather/route.ts - CHANGEZ cette ligne :
const response = await fetch(url, { cache: 'no-store' }) // AU LIEU DE { next: { revalidate: 600 } }


    
    if (!response.ok) throw new Error('Erreur API OpenWeather')
    
    const data = await response.json()

    const formattedData = {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      rainfall: data.rain ? (data.rain['1h'] || 0) : 0,
      windSpeed: Math.round(data.wind.speed * 3.6),
      pressure: data.main.pressure,
      uvIndex: 0,
      forecast: data.weather[0].description,
      icon: mapWeatherIcon(data.weather[0].id),
      lastUpdate: new Date().toISOString()
    }

    // Sauvegarde DB (seulement les champs autorisés par Prisma)
    try {
      await db.weather.upsert({
        where: { id: 'latest' },
        update: { 
          temperature: formattedData.temperature,
          humidity: formattedData.humidity,
          rainfall: formattedData.rainfall,
          forecast: formattedData.forecast,
          lastUpdate: formattedData.lastUpdate
        },
        create: { 
          id: 'latest',
          temperature: formattedData.temperature,
          humidity: formattedData.humidity,
          rainfall: formattedData.rainfall,
          forecast: formattedData.forecast,
          lastUpdate: formattedData.lastUpdate
        }
      })
    } catch (dbError) {
      console.warn('DB save failed:', dbError)
    }

    return NextResponse.json({ success: true, data: formattedData })
    } catch (error) {
    console.error('Erreur Fetch OpenWeather:', error)
    
    // On vérifie si la requête concernait des coordonnées précises ou par défaut
    const hasSpecificCoords = searchParams.get('lat') && searchParams.get('lon')
    
    // Si c'était les coordonnées par défaut (pas de ?lat=...), on peut utiliser le fallback DB
    if (!hasSpecificCoords) {
      try {
        const lastWeather = await db.weather.findFirst({ orderBy: { createdAt: 'desc' } })
        if (lastWeather) return NextResponse.json({ success: true, data: lastWeather })
      } catch (dbError) { 
        console.warn('DB fallback failed:', dbError) 
      }
    }

    // Si c'était une zone spécifique et que l'API a échoué (ex: limite d'appels),
    // on renvoie une erreur pour ne pas écraser les bonnes données avec de fausses données statiques !
    return NextResponse.json({ 
      success: false, 
      error: 'Limite d\'appels API atteinte ou erreur réseau. Veuillez réessayer dans quelques secondes.' 
    }, { status: 429 }) // 429 = Too Many Requests
  }
}

export async function POST(request: NextRequest) {
  try {
    const { temperature, humidity, rainfall, forecast } = await request.json()
    const weather = await db.weather.create({ data: { temperature, humidity, rainfall, forecast } })
    return NextResponse.json({ success: true, data: weather })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}