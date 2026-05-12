import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const communes = await db.communeGeo.findMany({
      select: {
        commune: true,
        code_commu: true,
        region: true,
        code_regio: true,
        prefecture: true,
        code_prefe: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: communes.map(commune => ({
        type: "Feature",
        properties: {
          commune: commune.commune,
          code_commu: commune.code_commu,
          region: commune.region,
          code_regio: commune.code_regio,
          prefecture: commune.prefecture,
          code_prefe: commune.code_prefe,
        },
        geometry: JSON.parse(commune.geometry || '{"type": "Polygon", "coordinates": []}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching communes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communes' },
      { status: 500 }
    );
  }
}