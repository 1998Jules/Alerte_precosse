// lib/weather-service.ts
import https from 'https';

export class WeatherService {
  private apiKey: string;
  private lat: string;
  private lon: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    this.lat = process.env.OPENWEATHER_LAT || '8.6';
    this.lon = process.env.OPENWEATHER_LON || '1.2';
  }

  async fetchRealTimeWeather() {
    if (!this.apiKey) {
      console.warn('⚠️ OPENWEATHER_API_KEY non configurée');
      return null;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&units=metric&lang=fr&appid=${this.apiKey}`;
      console.log('🌤️ Appel OpenWeatherMap:', url);
      
      // Créer un agent HTTPS qui ignore les certificats
      const agent = new https.Agent({
        rejectUnauthorized: false,
        requestCert: false,
        agent: false
      });
      
      // Utiliser fetch avec l'agent personnalisé
      const response = await fetch(url, {
        // @ts-ignore
        agent: agent
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || 0,
        forecast: data.weather[0].description,
        windSpeed: Math.round(data.wind.speed),
        pressure: data.main.pressure,
      };
    } catch (error) {
      console.error('❌ Erreur OpenWeatherMap:', error);
      return null;
    }
  }

  async fetchForecast() {
    if (!this.apiKey) {
      return null;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.lat}&lon=${this.lon}&units=metric&lang=fr&appid=${this.apiKey}`;
      
      const agent = new https.Agent({
        rejectUnauthorized: false,
        requestCert: false,
        agent: false
      });
      
      const response = await fetch(url, {
        // @ts-ignore
        agent: agent
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const dailyForecasts = [];
      const daysMap = new Map();
      
      for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!daysMap.has(dateKey) && dailyForecasts.length < 5) {
          daysMap.set(dateKey, true);
          dailyForecasts.push({
            id: dateKey,
            date: dateKey,
            day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            temperature: {
              max: Math.round(item.main.temp_max),
              min: Math.round(item.main.temp_min)
            },
            condition: item.weather[0].description,
            precipitation: Math.round(item.pop * 100),
            icon: item.weather[0].icon
          });
        }
      }
      
      return dailyForecasts;
    } catch (error) {
      console.error('❌ Erreur prévisions:', error);
      return null;
    }
  }
}