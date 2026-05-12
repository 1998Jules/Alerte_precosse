import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cooperatives = await db.cooperative.findMany({
      select: {
        canton_nom: true,
        nom_locali: true,
        cooperativ: true,
        cooperat_1: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: cooperatives.map(cooperative => ({
        type: "Feature",
        properties: {
          canton_nom: cooperative.canton_nom,
          nom_locali: cooperative.nom_locali,
          cooperativ: cooperative.cooperativ,
          cooperat_1: cooperative.cooperat_1,
        },
        geometry: JSON.parse(cooperative.geometry || '{"type": "Point", "coordinates": [0, 0]}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching cooperatives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cooperatives' },
      { status: 500 }
    );
  }
}