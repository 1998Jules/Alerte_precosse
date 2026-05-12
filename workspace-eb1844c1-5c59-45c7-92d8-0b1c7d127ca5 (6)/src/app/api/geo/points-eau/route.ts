import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const pointsEau = await db.pointEau.findMany({
      select: {
        canton_nom: true,
        nom_locali: true,
        forage_nom: true,
        forage_typ: true,
        batiment_n: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: pointsEau.map(point => ({
        type: "Feature",
        properties: {
          canton_nom: point.canton_nom,
          nom_locali: point.nom_locali,
          forage_nom: point.forage_nom,
          forage_typ: point.forage_typ,
          batiment_n: point.batiment_n,
        },
        geometry: JSON.parse(point.geometry || '{"type": "Point", "coordinates": [0, 0]}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching points eau:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points eau' },
      { status: 500 }
    );
  }
}