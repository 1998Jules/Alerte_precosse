// lib/weather-cron.ts
import cron from 'node-cron';
import { db } from './db';
import { WeatherService } from './weather-service';

const weatherService = new WeatherService();

// Exécuter toutes les 30 minutes
export function startWeatherCron() {
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 Mise à jour automatique de la météo...', new Date().toISOString());
    
    try {
      const realWeather = await weatherService.fetchRealTimeWeather();
      
      const weather = await db.weather.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      if (weather) {
        await db.weather.update({
          where: { id: weather.id },
          data: {
            temperature: realWeather.temperature,
            humidity: realWeather.humidity,
            rainfall: realWeather.rainfall,
            forecast: realWeather.forecast,
            windSpeed: realWeather.windSpeed,
            pressure: realWeather.pressure,
            icon: realWeather.icon
          }
        });
        console.log('✅ Météo mise à jour avec succès');
      } else {
        await db.weather.create({
          data: {
            temperature: realWeather.temperature,
            humidity: realWeather.humidity,
            rainfall: realWeather.rainfall,
            forecast: realWeather.forecast,
            windSpeed: realWeather.windSpeed,
            pressure: realWeather.pressure,
            icon: realWeather.icon
          }
        });
        console.log('✅ Première météo créée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour météo:', error);
    }
  });
  
  console.log('⏰ Cron job météo démarré (toutes les 30 minutes)');
}