//src/app/api/geoprtal/route.ts
import { NextResponse } from "next/server";

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000/geoportail';

export async function GET() {
  console.log('🔄 1. Début de l\'appel API Next.js');
  
  try {
    const djangoUrl = `${DJANGO_API_URL}/api/layers/`;
    console.log('🔄 2. Appel à Django:', djangoUrl);
    
    // 1. Appel à l'API Django
    const response = await fetch(djangoUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🔄 3. Réponse Django - Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 4. Erreur Django:', errorText);
      throw new Error(`Erreur API Django: ${response.status} ${response.statusText}`);
    }

    const djangoData = await response.json();
    console.log('✅ 5. Données Django reçues, nombre de couches:', Object.keys(djangoData.layers || {}).length);

    // 2. Transformer les données
    const formattedLayers = Object.entries(djangoData.layers || {}).map(([key, layer]: [string, any]) => {
      return {
        id: key,
        name: layer.name || key.charAt(0).toUpperCase() + key.slice(1),
        visible: layer.visible ?? true,
        opacity: layer.opacity ?? 0.7,
        color: '#3388ff', // Couleur temporaire
        data: layer.data
      };
    });

    console.log('✅ 6. Couches formatées:', formattedLayers.length);

    return NextResponse.json({
      success: true,
      layers: formattedLayers,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("❌ 7. Erreur complète:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Impossible de contacter le serveur de cartes: ' + error.message,
        layers: []
      },
      { status: 500 }
    );
  }
}