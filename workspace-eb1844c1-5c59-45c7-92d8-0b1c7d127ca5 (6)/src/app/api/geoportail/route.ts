import { NextResponse } from "next/server";

// Configuration de l'URL de ton API Django
const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    console.log('🔄 Loading geoportal layers from Django API...');
    
    // Appel direct à l'API Django qui retourne toutes les couches
    const response = await fetch(`${DJANGO_API_URL}/geoportail/api/layers/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Django API error:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: `API Django inaccessible (${response.status}: ${response.statusText})`,
        message: 'Vérifiez que votre serveur Django est en cours d\'exécution sur ' + DJANGO_API_URL,
        layers: []
      }, { status: 503 });
    }

    const djangoData = await response.json();
    console.log('✅ Django API response received');

    // Transformer les données Django pour le format attendu par le frontend
    if (!djangoData.success || !djangoData.layers) {
      console.error('❌ Invalid Django API response:', djangoData);
      return NextResponse.json({
        success: false,
        error: 'Réponse API Django invalide',
        message: 'Le format de réponse de l\'API Django est incorrect',
        layers: []
      }, { status: 500 });
    }

    // Convertir les couches Django au format attendu par GeoportalMap
    const formattedLayers = Object.entries(djangoData.layers).map(([key, layer]: [string, any]) => {
      console.log(`📦 Processing layer: ${key} - ${layer.name || key} (${layer.data?.features?.length || 0} features)`);
      
      return {
        id: key,
        name: layer.name || key.charAt(0).toUpperCase() + key.slice(1),
        visible: layer.visible ?? false, // Par défaut, les couches ne sont pas visibles
        opacity: layer.opacity ?? 0.7,
        color: layer.color || '#3388ff', // Utiliser la couleur de Django ou une par défaut
        data: layer.data // C'est le FeatureCollection GeoJSON
      };
    });

    console.log(`🎉 Successfully processed ${formattedLayers.length} layers`);

    return NextResponse.json({
      success: true,
      layers: formattedLayers,
      total: formattedLayers.length,
      timestamp: new Date().toISOString(),
      djangoApiUrl: DJANGO_API_URL,
      source: 'django_geoportal_api'
    });

  } catch (error) {
    console.error("❌ Critical error in geoportal API:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur critique lors de la communication avec l\'API Django',
        message: error.message,
        layers: []
      },
      { status: 500 }
    );
  }
}