import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const terrains = await db.terrainGeo.findMany({
      select: {
        canton_nom: true,
        nom_locali: true,
        terrain: true,
        terrain_sp: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: terrains.map(terrain => ({
        type: "Feature",
        properties: {
          canton_nom: terrain.canton_nom,
          nom_locali: terrain.nom_locali,
          terrain: terrain.terrain,
          terrain_sp: terrain.terrain_sp,
        },
        geometry: JSON.parse(terrain.geometry || '{"type": "Polygon", "coordinates": []}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching terrains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch terrains' },
      { status: 500 }
    );
  }
}