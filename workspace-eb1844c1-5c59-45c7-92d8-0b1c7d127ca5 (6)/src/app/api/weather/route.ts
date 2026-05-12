import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Récupérer la dernière situation météo
    const weather = await db.weather.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!weather) {
      // Retourner des données par défaut si aucune météo n'existe
      return NextResponse.json({
        success: true,
        data: {
          temperature: 32,
          humidity: 65,
          rainfall: 45,
          forecast: 'Pluies modérées prévues dans 3-4 jours',
          lastUpdate: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall,
        forecast: weather.forecast,
        lastUpdate: weather.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { temperature, humidity, rainfall, forecast } = await request.json()

    // Validation des données
    if (typeof temperature !== 'number' || temperature < -50 || temperature > 60) {
      return NextResponse.json(
        { success: false, error: 'Temperature must be between -50 and 60°C' },
        { status: 400 }
      )
    }

    if (typeof humidity !== 'number' || humidity < 0 || humidity > 100) {
      return NextResponse.json(
        { success: false, error: 'Humidity must be between 0 and 100%' },
        { status: 400 }
      )
    }

    if (typeof rainfall !== 'number' || rainfall < 0) {
      return NextResponse.json(
        { success: false, error: 'Rainfall must be positive' },
        { status: 400 }
      )
    }

    if (!forecast || typeof forecast !== 'string' || forecast.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Forecast is required and must be less than 500 characters' },
        { status: 400 }
      )
    }

    // Créer une nouvelle entrée météo
    const weather = await db.weather.create({
      data: {
        temperature,
        humidity,
        rainfall,
        forecast
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: weather.id,
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall,
        forecast: weather.forecast,
        lastUpdate: weather.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating weather:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create weather data' },
      { status: 500 }
    )
  }
}