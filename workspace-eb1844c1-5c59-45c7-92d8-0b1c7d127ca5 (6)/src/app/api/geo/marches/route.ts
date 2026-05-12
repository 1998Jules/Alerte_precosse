import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const marches = await db.marcheGeo.findMany({
      select: {
        canton_nom: true,
        nom_locali: true,
        marche_nom: true,
        jour: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: marches.map(marche => ({
        type: "Feature",
        properties: {
          canton_nom: marche.canton_nom,
          nom_locali: marche.nom_locali,
          marche_nom: marche.marche_nom,
          jour: marche.jour,
        },
        geometry: JSON.parse(marche.geometry || '{"type": "Point", "coordinates": [0, 0]}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching marches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marches' },
      { status: 500 }
    );
  }
}