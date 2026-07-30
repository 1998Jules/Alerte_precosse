// ============================================================
// AgriBot IA - Chatbot SysLAP (Alerte Précoce)
// ============================================================
// CORRECTION : Remplacement de z-ai-web-dev-sdk par appel direct Groq API
// Tout le reste (fetchers, intent, fallbacks) est inchangé.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSystemKnowledge } from '@/lib/knowledge-base';

// ============================================================
// CONFIGURATION
// ============================================================
const DJANGO_API = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000';
const DEFAULT_LAT = process.env.NEXT_PUBLIC_DEFAULT_LAT || '8.6';
const DEFAULT_LON = process.env.NEXT_PUBLIC_DEFAULT_LON || '1.2';

// ============================================================
// CONVERSATION MANAGEMENT
// ============================================================
type ChatRole = 'user' | 'assistant' | 'system';
const conversations = new Map<string, Array<{ role: ChatRole; content: string }>>();
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60000;

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(sessionId);
  if (!record || now > record.resetTime) {
    rateLimiter.set(sessionId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

// ============================================================
// LIVE DATA FETCHERS
// ============================================================

async function fetchLiveWeather(baseUrl: string, lat: string = DEFAULT_LAT, lon: string = DEFAULT_LON) {
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  // 1) OpenWeatherMap en premier
  if (API_KEY) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${API_KEY}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        console.log('[Chatbot] Weather fetched from OpenWeatherMap:', data.weather[0]?.description, Math.round(data.main.temp) + '°C');
        return {
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          rainfall: data.rain?.['1h'] || 0,
          windSpeed: Math.round(data.wind.speed * 3.6),
          pressure: data.main.pressure,
          forecast: data.weather[0].description,
          lastUpdate: new Date().toISOString(),
          source: 'openweathermap',
        };
      } else {
        console.error('[Chatbot] OpenWeatherMap returned status:', response.status);
      }
    } catch (e) {
      console.error('[Chatbot] OpenWeatherMap error:', e);
    }
  } else {
    console.warn('[Chatbot] OPENWEATHER_API_KEY is not set in environment variables');
  }

  // 2) Fallback : API interne /api/weather
  try {
    const fullUrl = `${baseUrl}/api/weather?lat=${lat}&lon=${lon}&_t=${Date.now()}`;
    const res = await fetch(fullUrl, { cache: 'no-store' });
    const json = await res.json();
    if (json.success && json.data) {
      console.log('[Chatbot] Weather fetched from internal API (DB fallback)');
      return {
        temperature: json.data.temperature,
        humidity: json.data.humidity,
        rainfall: json.data.rainfall || 0,
        windSpeed: json.data.windSpeed || null,
        pressure: json.data.pressure || null,
        forecast: json.data.forecast,
        lastUpdate: json.data.lastUpdate || new Date().toISOString(),
        source: 'db',
      };
    }
  } catch (e) {
    console.error('[Chatbot] Weather API fallback error:', e);
  }

  return null;
}

async function fetchWeatherForecast(lat: string = DEFAULT_LAT, lon: string = DEFAULT_LON) {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  if (!API_KEY) return null;

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${API_KEY}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;

    const data = await response.json();
    const dailyMap = new Map<string, boolean>();
    const daily: Array<{ day: string; date: string; max: number; min: number; condition: string; precip: number }> = [];

    for (const item of data.list) {
      const dateKey = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyMap.has(dateKey) && daily.length < 5) {
        dailyMap.set(dateKey, true);
        daily.push({
          day: new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'short' }),
          date: dateKey,
          max: Math.round(item.main.temp_max),
          min: Math.round(item.main.temp_min),
          condition: item.weather[0].description,
          precip: Math.round(item.pop * 100),
        });
      }
    }
    return daily;
  } catch (e) {
    console.error('[Chatbot] Forecast error:', e);
    return null;
  }
}

async function fetchAlerts(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/alerts?_t=${Date.now()}`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (e) {
    console.error('[Chatbot] Alerts API error:', e);
  }
  return null;
}

async function fetchCrops(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/crops?_t=${Date.now()}`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (e) {
    console.error('[Chatbot] Crops API error:', e);
  }
  return null;
}

async function fetchMarketPrices(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/market-prices?_t=${Date.now()}`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success) return json;
  } catch (e) {
    console.error('[Chatbot] Market prices API error:', e);
  }
  return null;
}

async function fetchCommunalData(baseUrl: string) {
  try {
    const [communalRes, statsRes] = await Promise.all([
      fetch(`${baseUrl}/api/communal-data?_t=${Date.now()}`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/admin/dashboard-stats?_t=${Date.now()}`, { cache: 'no-store' }),
    ]);
    const [communalJson, statsJson] = await Promise.all([communalRes.json(), statsRes.json()]);
    return {
      communal: communalJson.success ? communalJson.data : null,
      stats: statsJson.success ? statsJson.data : null,
    };
  } catch (e) {
    console.error('[Chatbot] Communal data API error:', e);
    return { communal: null, stats: null };
  }
}

async function fetchUserFields() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${DJANGO_API}/agriculture/api/champs/geojson/`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      return data.features || [];
    }
  } catch (e: any) {
    console.log('[Chatbot] Django fields API not reachable:', e?.message || 'unknown error');
  }
  return null;
}

/**
 * Récupère le NDVI d'un champ spécifique via Django
 * Django retourne : { success: true, data: [{ date, ndvi, map_url }, ...] }
 * On extrait .data pour retourner un tableau exploitable directement
 */
async function fetchFieldNdvi(champId: string, indexType: string = 'ndvi'): Promise<Array<{date: string; ndvi: number; map_url?: string}> | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${DJANGO_API}/agriculture/api/field-ndvi/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ champ_id: String(champId), index_type: indexType }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(`[Chatbot] Django NDVI API returned ${res.status}`);
      return null;
    }
    const result = await res.json();
    // Django retourne { success: true, data: [...] }
    if (result.success && Array.isArray(result.data)) {
      console.log(`[Chatbot] NDVI data received: ${result.data.length} points for field ${champId}`);
      return result.data;
    }
    // Certains endpoints retournent directement un tableau
    if (Array.isArray(result)) {
      return result;
    }
    console.warn('[Chatbot] Django NDVI returned unexpected format:', typeof result);
    return null;
  } catch (e: any) {
    console.log('[Chatbot] Django NDVI API not reachable:', e?.message || 'unknown error');
  }
  return null;
}

// ============================================================
// INTENT DETECTION
// ============================================================

type Intent =
  | 'weather_now'
  | 'weather_forecast'
  | 'alerts_list'
  | 'crops_list'
  | 'crops_specific'
  | 'market_prices'
  | 'communal_stats'
  | 'ndvi_field'
  | 'ndvi_zone'
  | 'geoportal'
  | 'general';

function detectIntent(message: string): Intent {
  const msg = message.toLowerCase();

  if (msg.includes('ndvi') || (msg.includes('indice') && (msg.includes('végét') || msg.includes('veget')))) {
    if (msg.includes('zone') || msg.includes('region') || msg.includes('préfecture') || msg.includes('commune')) {
      return 'ndvi_zone';
    }
    return 'ndvi_field';
  }

  if (msg.includes('prévision') || msg.includes('prevision') || msg.includes('demain') || msg.includes('5 jours') || msg.includes('semaine')) {
    return 'weather_forecast';
  }

  if (msg.includes('météo') || msg.includes('meteo') || msg.includes('températ') || msg.includes('temperature') ||
      msg.includes('humidité') || msg.includes('humidite') || msg.includes('pluie') || msg.includes('vent') ||
      msg.includes('il fait') || msg.includes('dehors') || msg.includes('temps') || msg.includes('chaud') || msg.includes('froid') ||
      msg.includes('condition')) {
    return 'weather_now';
  }

  if (msg.includes('alerte') || msg.includes('urgence') || msg.includes('critique') || msg.includes('danger') ||
      msg.includes('risque') || msg.includes('sécheresse') || msg.includes('inondation') || msg.includes('crise')) {
    return 'alerts_list';
  }

  if (msg.includes('culture') || msg.includes('agricult') || msg.includes('recolte') || msg.includes('semis') || msg.includes('plant') || msg.includes('maïs') ||
      msg.includes('mais') || msg.includes('igname') || msg.includes('manioc') || msg.includes('mil') ||
      msg.includes('coton') || msg.includes('riz') || msg.includes('irrig') || msg.includes('champ') ||
      msg.includes('parcelle') || msg.includes('santé') || msg.includes('rendement')) {
    if (msg.includes('liste') || msg.includes('toutes') || msg.includes('combien')) {
      return 'crops_list';
    }
    return 'crops_specific';
  }

  if (msg.includes('prix') || msg.includes('marché') || msg.includes('marche') || msg.includes('coût') ||
      msg.includes('cout') || msg.includes('vente') || msg.includes('achat') || msg.includes('fcfa') ||
      msg.includes('disponib') || msg.includes('fluctuation')) {
    return 'market_prices';
  }

  if (msg.includes('population') || msg.includes('habit') || msg.includes('infrastruct') ||
      msg.includes('projet') || msg.includes('école') || msg.includes('ecole') || msg.includes('hôpital') ||
      msg.includes('hopital') || msg.includes('route') || msg.includes('eau') || msg.includes('commune') ||
      msg.includes('forage') || msg.includes('statistique')) {
    return 'communal_stats';
  }

  if (msg.includes('carte') || msg.includes('géoportail') || msg.includes('geoportail') ||
      msg.includes('géo') || msg.includes('geo') || msg.includes('couche') || msg.includes('satellite')) {
    return 'geoportal';
  }

  return 'general';
}

function extractName(message: string): string | null {
  const patterns = [
    /[Mm]\.?\s*([A-Z][A-Za-zéèêëàâùûîïôç\-]+(?:\s+[A-Z][A-Za-zéèêëàâùûîïôç\-]+)*)/,
    /[Mm]onsieur\s+([A-Z][A-Za-zéèêëàâùûîïôç\-]+(?:\s+[A-Z][A-Za-zéèêëàâùûîïôç\-]+)*)/,
    /champ\s+(?:de\s+)?([A-Z][A-Za-zéèêëàâùûîïôç\-]+)/i,
    /parcelle\s+(?:de\s+)?([A-Z][A-Za-zéèêëàâùûîïôç\-]+)/i,
    /propriétai?re\s+([A-Z][A-Za-zéèêëàâùûîïôç\-]+)/i,
  ];
  for (const p of patterns) {
    const match = message.match(p);
    if (match) return match[1].trim();
  }
  return null;
}

function extractCoords(message: string): { lat?: string; lon?: string; zone?: string } | null {
  const coordMatch = message.match(/(\d+\.?\d*)[°\s,]+(\d+\.?\d*)/);
  if (coordMatch) return { lat: coordMatch[1], lon: coordMatch[2] };

  const zones: Record<string, { lat: string; lon: string }> = {
    'blitta': { lat: '8.32', lon: '1.0476' },
    'sokodé': { lat: '9.04', lon: '1.13' },
    'kara': { lat: '9.55', lon: '1.15' },
    'lomé': { lat: '6.13', lon: '1.22' },
    'lome': { lat: '6.13', lon: '1.22' },
    'atakpamé': { lat: '7.53', lon: '1.13' },
    'kpalimé': { lat: '7.75', lon: '0.85' },
    'notse': { lat: '7.55', lon: '1.19' },
    'tsévié': { lat: '6.83', lon: '1.23' },
  };
  const msgLower = message.toLowerCase();
  for (const [zone, coords] of Object.entries(zones)) {
    if (msgLower.includes(zone)) return { ...coords, zone };
  }
  return null;
}

function extractProduct(message: string): string | null {
  const products = ['maïs', 'mais', 'igname', 'manioc', 'mil', 'sorgho', 'coton', 'riz', 'tomate', 'piment', 'gombo', 'niébé', 'arachide', 'voandzou', 'mangue', 'agrumes', 'papaye'];
  const msgLower = message.toLowerCase();
  for (const p of products) {
    if (msgLower.includes(p)) return p;
  }
  return null;
}

// ============================================================
// BUILD LIVE DATA CONTEXT
// ============================================================

async function buildLiveDataContext(message: string, intent: Intent, baseUrl: string): Promise<string> {
  let context = '';
  const coords = extractCoords(message);

  switch (intent) {
    case 'weather_now': {
      const weather = await fetchLiveWeather(baseUrl, coords?.lat, coords?.lon);
      if (weather) {
        const sourceLabel = weather.source === 'openweathermap' ? 'OpenWeatherMap (temps réel)' : 'Base de données (dernière mesure)';
        context = `
**DONNÉES MÉTÉO EN TEMPS RÉEL** (source: ${sourceLabel}):
- 🌡️ Température : ${weather.temperature}°C
- 💧 Humidité : ${weather.humidity}%
- 🌧️ Pluviométrie : ${weather.rainfall} mm
${weather.windSpeed ? `- 💨 Vent : ${weather.windSpeed} km/h` : ''}
${weather.pressure ? `- 📊 Pression : ${weather.pressure} hPa` : ''}
- 🌤️ Conditions : ${weather.forecast}
${coords?.zone ? `- 📍 Zone : ${coords.zone}` : coords ? `- 📍 Coordonnées : ${coords.lat}, ${coords.lon}` : `- 📍 Position : Blitta 2 (${DEFAULT_LAT}, ${DEFAULT_LON})`}
- 🕐 Dernière mise à jour : ${weather.lastUpdate}

Réponds avec ces données EXACTES. Ne les invente jamais.`;
      } else {
        context = '\n[Les données météo ne sont pas disponibles. Vérifiez que OPENWEATHER_API_KEY est configuré et que /api/weather fonctionne.]';
      }
      break;
    }

    case 'weather_forecast': {
      const forecast = await fetchWeatherForecast(coords?.lat, coords?.lon);
      if (forecast && forecast.length > 0) {
        const text = forecast.map(d => `- ${d.day} (${d.date}): ${d.condition}, ${d.max}°/${d.min}°, précip. ${d.precip}%`).join('\n');
        context = `\n**PRÉVISIONS MÉTÉO À 5 JOURS** :\n${text}\n\nUtilise ces prévisions exactes.`;
      } else {
        context = '\n[Les prévisions nécessitent OPENWEATHER_API_KEY configuré dans .env.local]';
      }
      break;
    }

    case 'alerts_list': {
      const alerts = await fetchAlerts(baseUrl);
      if (alerts && alerts.length > 0) {
        const text = alerts.map((a: any) =>
          `- [${a.level}] **${a.title}** — ${a.description?.substring(0, 150)}${a.location ? ` (${a.location})` : ''} — ${a.time || 'récemment'} — Par: ${a.author || 'Système'}`
        ).join('\n');
        context = `\n**ALERTES EN BASE** (${alerts.length} alerte(s)) :\n${text}\n\nTypes: PRICE, DROUGHT, FLOOD, INFRASTRUCTURE, HEALTH, SECURITY, WEATHER. Niveaux: LOW, MEDIUM, HIGH, CRITICAL.`;
      } else {
        context = '\n[Aucune alerte active dans la base de données.]';
      }
      break;
    }

    case 'crops_list': {
      const crops = await fetchCrops(baseUrl);
      if (crops && crops.length > 0) {
        const text = crops.map((c: any) =>
          `- 🌱 **${c.name}** (${c.type}) — ${c.area || ''} — ${c.areaHa} ha — ${c.farmers} agriculteurs — Statut: ${c.status} — Santé: ${c.healthStatus || c.health} — Saison: ${c.currentSeason}`
        ).join('\n');
        context = `\n**CULTURES EN BASE** (${crops.length} culture(s)) :\n${text}`;
      } else {
        context = '\n[Aucune culture enregistrée dans la base.]';
      }
      break;
    }

    case 'crops_specific': {
      const name = extractName(message);
      const crops = await fetchCrops(baseUrl);
      if (crops && crops.length > 0) {
        let filtered = crops;
        if (name) {
          filtered = crops.filter((c: any) =>
            c.name?.toLowerCase().includes(name.toLowerCase()) ||
            c.area?.toLowerCase().includes(name.toLowerCase()) ||
            c.farmers?.toString().includes(name)
          );
        }
        const text = (filtered.length > 0 ? filtered : crops).slice(0, 15).map((c: any) =>
          `- 🌱 **${c.name}** | Type: ${c.type} | Surface: ${c.areaHa}ha | ${c.farmers} agri. | Santé: ${c.healthStatus || c.health} | Statut: ${c.status} | Rendement: ${c.expectedYield} | Irrigation: ${c.irrigation ? '✅' : '❌'} | Engrais: ${c.fertilizer || 'N/A'}${c.challenges?.length ? ' | Défis: ' + (Array.isArray(c.challenges) ? c.challenges.join(', ') : c.challenges) : ''}${c.nextAction ? ' | Action: ' + c.nextAction : ''}`
        ).join('\n');
        context = `\n**DONNÉES CULTURES** :\n${text}`;
        if (name && filtered.length === 0) {
          context += `\n\n⚠️ Aucune culture trouvée pour "${name}". Voici toutes les cultures disponibles.`;
        }
      } else {
        context = '\n[Aucune culture trouvée dans la base.]';
      }
      break;
    }

    case 'market_prices': {
      const product = extractProduct(message);
      const market = await fetchMarketPrices(baseUrl);
      if (market?.data && market.data.length > 0) {
        let filtered = market.data;
        if (product) {
          filtered = market.data.filter((p: any) =>
            p.product?.toLowerCase().includes(product.toLowerCase())
          );
        }
        const text = filtered.slice(0, 15).map((p: any) =>
          `- ${p.product} : **${p.price} ${p.currency || 'FCFA'}/${p.unit}** (${p.market}) — Tendance: ${p.trend} — Dispo: ${p.availability} — Qualité: ${p.quality}`
        ).join('\n');
        const summary = market.summary || {};
        context = `\n**PRIX DU MARCHÉ** (${market.total} produits) :\n${text}\nRésumé : ${summary.productsIncreasing || 0} en hausse ↗️, ${summary.productsDecreasing || 0} en baisse ↘️, ${summary.productsStable || 0} stables →.${summary.criticalProducts?.length ? '\n⚠️ Produits critiques: ' + summary.criticalProducts.join(', ') : ''}`;
      } else {
        context = '\n[Aucun prix du marché dans la base.]';
      }
      break;
    }

    case 'communal_stats': {
      const data = await fetchCommunalData(baseUrl);
      if (data.stats) {
        const s = data.stats;
        context += `\n**STATISTIQUES COMMUNALES** :\n`;
        context += `- 👥 Population : ${s.population} habitants\n`;
        context += `- 🏠 Ménages : ${s.households}\n`;
        context += `- 📋 Projets : ${s.projects} (${s.activeProjects} actifs, ${s.completedProjects} terminés)\n`;
        context += `- 🏗️ Infrastructures : ${s.infrastructures} (${s.operationalInfra} opérationnelles)\n`;
        context += `- 📏 Superficie : ${s.totalArea} km²\n`;
        context += `- 📊 Densité : ${s.density} hab/km²\n`;
      }
      if (data.communal?.projects?.list?.length) {
        const projText = data.communal.projects.list.slice(0, 8).map((p: any) =>
          `- 📋 ${p.name} (${p.status}) — ${p.progress}% — Budget: ${p.budget}`
        ).join('\n');
        context += `\n**PROJETS** :\n${projText}`;
      }
      if (data.communal?.infrastructures?.categories) {
        const catText = Object.entries(data.communal.infrastructures.categories).slice(0, 4).map(([type, cat]: [string, any]) =>
          `- **${type}** : ${cat.total} total (${cat.operational} opérationnels)`
        ).join('\n');
        context += `\n\n**INFRASTRUCTURES** :\n${catText}`;
      }
      if (!context) context = '\n[Données communales non disponibles.]';
      break;
    }

    case 'ndvi_field': {
      const name = extractName(message);
      const fields = await fetchUserFields();

      if (fields && fields.length > 0) {
        let matched = null;
        if (name) {
          matched = fields.find((f: any) =>
            f.properties?.proprietaire?.toLowerCase().includes(name.toLowerCase()) ||
            f.properties?.nom?.toLowerCase().includes(name.toLowerCase())
          );
        }
        if (!matched && fields.length > 0) matched = fields[0];

        if (matched) {
          const props = matched.properties || {};
          context += `\n**INFORMATIONS CHAMP** :\n`;
          context += `- Nom : ${props.nom || 'N/A'}\n`;
          context += `- Propriétaire : ${props.proprietaire || 'N/A'}\n`;
          context += `- Type de culture : ${props.type_culture || 'N/A'}\n`;
          context += `- Date de semis : ${props.date_semi || 'N/A'}\n`;
          context += `- ID : ${matched.id || 'N/A'}\n`;

          if (matched.id) {
            const ndvi = await fetchFieldNdvi(String(matched.id), 'ndvi');
            if (ndvi && ndvi.length > 0) {
              const ndviText = ndvi.slice(-5).map((n: any) =>
                `- ${n.date} : NDVI = ${n.ndvi} ${n.ndvi > 0.6 ? '(🟢 Bon)' : n.ndvi > 0.3 ? '(🟡 Moyen)' : '(🔴 Faible)'}`
              ).join('\n');
              context += `\n**DONNÉES NDVI SATELLITE** :\n${ndviText}`;
              const last = ndvi[ndvi.length - 1];
              context += `\n\nDernière valeur NDVI : **${last.ndvi}** — ${last.ndvi > 0.6 ? 'Végétation dense et saine 🌿' : last.ndvi > 0.3 ? 'Végétation modérée, à surveiller ⚠️' : 'Végétation faible ou sol nu 🔴'}`;
            } else {
              context += '\n\n[NDVI non disponible. Le backend Django (port 8000) doit être en marche.]';
            }
          }
        } else {
          const listText = fields.slice(0, 10).map((f: any) =>
            `- ${f.properties?.nom || 'Sans nom'} (${f.properties?.proprietaire || 'N/A'}) — ${f.properties?.type_culture || 'N/A'}`
          ).join('\n');
          context += `\n**CHAMPS DISPONIBLES** (${fields.length}) :\n${listText}`;
          if (name) context += `\n\n⚠️ Aucun champ trouvé pour "${name}".`;
        }
      } else {
        const crops = await fetchCrops(baseUrl);
        if (crops && crops.length > 0) {
          const text = crops.map((c: any) =>
            `- 🌱 ${c.name} (${c.type}) — ${c.areaHa}ha — Santé: ${c.healthStatus || c.health} — Statut: ${c.status}`
          ).join('\n');
          context += `\n**CULTURES EN BASE** (backend Django indisponible, pas de NDVI satellite) :\n${text}`;
          context += '\n\nℹ️ Pour les données NDVI satellite, le backend Django (port 8000) doit être en marche.';
        } else {
          context += '\n[Données NDVI non accessibles. Le backend Django (port 8000) doit être en marche.]';
        }
      }
      break;
    }

    case 'ndvi_zone': {
      context += '\n[Analyse NDVI par zone : nécessite le backend Django (port 8000).]';
      context += '\nIndices disponibles : NDVI (végétation), EVI, NDWI (eau), MSAVI (sol).';
      break;
    }

    case 'geoportal': {
      const data = await fetchCommunalData(baseUrl);
      if (data.communal?.infrastructures?.categories) {
        const text = Object.entries(data.communal.infrastructures.categories).map(([type, cat]: [string, any]) =>
          `- **${type}** (${cat.total}): ${cat.list?.slice(0, 3).map((i: any) => `${i.name} (${i.status})`).join(', ') || ''}`
        ).join('\n');
        context += `\n**DONNÉES GÉOSPATIALES** :\n${text}`;
      } else {
        context += '\n[Géoportail : couches disponibles via Django (port 8000) — cantons, communes, routes, marchés, hôpitaux, écoles, forages, bornes fontaines.]';
      }
      break;
    }

    default:
      break;
  }

  return context;
}

// ============================================================
// FALLBACK RESPONSES
// ============================================================

function getFallbackResponse(message: string, intent: Intent): string {
  switch (intent) {
    case 'weather_now':
      return '🌤️ **Météo actuelle**\n\nLes données météo en temps réel ne sont pas accessibles actuellement. Veuillez vérifier que :\n- La clé API OpenWeatherMap est configurée dans `.env.local` (`OPENWEATHER_API_KEY`)\n- L\'API météo interne `/api/weather` est disponible\n\nEn attendant, voici les informations générales sur la saison météorologique au Togo :\n- 🌡️ Température moyenne : 25-35°C\n- 🌧️ Saison des pluies : avril à octobre\n- ☀️ Saison sèche : novembre à mars';

    case 'weather_forecast':
      return '📅 **Prévisions météo**\n\nLes prévisions à 5 jours nécessitent la clé API OpenWeatherMap configurée dans `.env.local`.';

    case 'alerts_list':
      return '🚨 **Alertes**\n\nAucune alerte n\'est accessible pour le moment.';

    case 'crops_list':
    case 'crops_specific':
      return '🌾 **Cultures agricoles**\n\nLes données cultures ne sont pas encore accessibles.';

    case 'market_prices':
      return '💰 **Prix du marché**\n\nLes données de prix du marché ne sont pas accessibles pour le moment.';

    case 'communal_stats':
      return '🏘️ **Commune de Blitta 2 Agbandi**\n\nDonnées communales (approximatives) :\n- 👥 Population : ~12 450 habitants\n- 🏠 Ménages : ~2 100\n- 📏 Superficie : 276 km²';

    case 'ndvi_field':
      return '🛰️ **NDVI Satellite**\n\nLes données NDVI nécessitent le backend Django (port 8000).';

    case 'ndvi_zone':
      return '🗺️ **NDVI par zone**\n\nL\'analyse NDVI par zone nécessite le backend Django (port 8000).';

    case 'geoportal':
      return '🗺️ **Géoportail SysLAP**\n\nLe géoportail permet de visualiser les données géospatiales de la commune.';

    default:
      return '🤖 **AgriBot IA - SysLAP**\n\nJe suis l\'assistant du Système Locale d\'Alerte Précoce. Le service IA est temporairement indisponible. Veuillez réessayer.';
  }
}

// ============================================================
// SYSTEM PROMPT
// ============================================================

let _systemPrompt: string | null = null;

function getSystemPrompt(): string {
  if (_systemPrompt) return _systemPrompt;
  try {
    const knowledge = getSystemKnowledge();
    _systemPrompt = `Tu es **AgriBot**, l'assistant IA intelligent du système **SysLAP - Système Locale d'Alerte Précoce** pour la gestion agricole et communale au Togo (Commune de Blitta 2 Agbandi).

Tu as accès aux **DONNÉES EN TEMPS RÉEL** de la plateforme via ses API internes :
- 🌡️ Météo actuelle et prévisions (OpenWeatherMap + fallback DB)
- 🚨 Alertes précoces (sécheresse, inondation, prix, santé, sécurité, météo)
- 🌱 Cultures agricoles avec suivi santé, irrigation, rendement
- 💰 Prix du marché en FCFA avec tendances
- 🏘️ Données communales (population, infrastructures, projets)
- 🛰️ Champs agriculteurs + NDVI satellite (backend Django)
- 🗺️ Géoportail avec couches géographiques

RÈGLES DE RÉPONSE :
1. Réponds TOUJOURS en français.
2. Utilise les **DONNÉES RÉELLES** fournies dans le contexte. Ne les invente JAMAIS.
3. Si les données ne sont pas disponibles, dis-le clairement et suggère une alternative.
4. Utilise des émojis pour rendre les réponses visuelles et agréables.
5. Structure avec titres et listes à puces.
6. Limite à 300 mots sauf si l'utilisateur demande plus de détails.
7. Pour le NDVI d'un champ (ex: "champ de M. ATOKOU"), cherche par nom de propriétaire et donne les mesures NDVI réelles.

${knowledge}`;
  } catch (e) {
    console.error('[Chatbot] Failed to load system prompt:', e);
    _systemPrompt = `Tu es **AgriBot**, l'assistant IA du système **SysLAP - Système Locale d'Alerte Précoce** pour la gestion agricole et communale au Togo.
Réponds TOUJOURS en français. Utilise des émojis. Sois concis et utile.`;
  }
  return _systemPrompt;
}

// ============================================================
// ★★★ CORRECTION PRINCIPALE : Appel direct Groq au lieu de z-ai-web-dev-sdk ★★★
// ============================================================

async function callGroqLLM(messages: Array<{ role: ChatRole; content: string }>): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1';
  const model = process.env.OPENAI_MODEL || 'llama-3-3-70b-versatile';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY non configurée dans .env.local');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[Chatbot] Groq API error (${response.status}):`, errText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ============================================================
// MAIN HANDLERS
// ============================================================

export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'AgriBot IA - SysLAP',
    version: '2.0.0',
    status: 'operational',
    llm: 'groq',
  });
}

export async function POST(request: NextRequest) {
  try {
    const baseUrl = new URL(request.url).origin;

    const body = await request.json().catch(() => null);
    const { message, sessionId = 'default' } = body || {};

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message requis' }, { status: 400 });
    }

    if (!checkRateLimit(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Trop de requêtes. Patientez une minute.' },
        { status: 429 }
      );
    }

    const sanitizedMessage = message.substring(0, 500).trim();

    // Historique de conversation
    const systemPrompt = getSystemPrompt();

    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [{ role: 'system', content: systemPrompt }]);
    }
    const history = conversations.get(sessionId)!;
    history.push({ role: 'user', content: sanitizedMessage });

    // Garder le prompt système + les 18 derniers messages
    if (history.length > 20) {
      const systemMsg = history[0];
      const trimmed = history.slice(-18);
      conversations.set(sessionId, [systemMsg, ...trimmed]);
    }

    // 1) Détecter l'intention
    const intent = detectIntent(sanitizedMessage);

    // 2) Récupérer les données LIVE depuis les API internes
    let liveDataContext = '';
    try {
      liveDataContext = await buildLiveDataContext(sanitizedMessage, intent, baseUrl);
    } catch (dataError) {
      console.error('[Chatbot] Live data fetch error (non-fatal):', dataError);
      liveDataContext = '';
    }

    // 3) Injecter les données dans le message envoyé au LLM
    let augmentedMessage = sanitizedMessage;
    if (liveDataContext) {
      augmentedMessage += `\n\n${liveDataContext}`;
    }
    augmentedMessage += `\n\n[Intent: ${intent}]`;

    // ★★★ 4) Appeler Groq directement (CORRECTION) ★★★
    let aiResponse: string;
    try {
      // Construire les messages pour Groq : système + historique + message augmenté
      const currentHistory = conversations.get(sessionId)!;
      // Remplacer le dernier message user par la version augmentée
      const groqMessages = currentHistory.slice(0, -1).concat([
        { role: 'user' as ChatRole, content: augmentedMessage }
      ]);

      aiResponse = await callGroqLLM(groqMessages);

      if (!aiResponse) {
        aiResponse = getFallbackResponse(sanitizedMessage, intent);
      }
    } catch (llmError) {
      console.error('[Chatbot] LLM error, using fallback:', llmError);
      aiResponse = getFallbackResponse(sanitizedMessage, intent);
    }

    // Mettre à jour l'historique
    const currentHistory = conversations.get(sessionId)!;
    currentHistory.push({ role: 'assistant', content: aiResponse });

    return NextResponse.json({
      success: true,
      response: aiResponse,
      intent,
      category: mapIntentToCategory(intent),
      hasLiveData: !!liveDataContext && liveDataContext.length > 0,
    });
  } catch (error: any) {
    console.error('[Chatbot] API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

function mapIntentToCategory(intent: Intent): string {
  const map: Record<Intent, string> = {
    weather_now: 'meteo',
    weather_forecast: 'meteo',
    alerts_list: 'alerte',
    crops_list: 'agriculture',
    crops_specific: 'agriculture',
    market_prices: 'commune',
    communal_stats: 'commune',
    ndvi_field: 'agriculture',
    ndvi_zone: 'agriculture',
    geoportal: 'commune',
    general: 'general',
  };
  return map[intent] || 'general';
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || 'default';
    conversations.delete(sessionId);
    return NextResponse.json({ success: true, message: 'Historique effacé' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}