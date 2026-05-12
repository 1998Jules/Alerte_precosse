import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cantons = await db.canton.findMany({
      select: {
        canton: true,
        code_canton: true,
        prefecture: true,
        code_prefe: true,
        region: true,
        code_regio: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: cantons.map(canton => ({
        type: "Feature",
        properties: {
          canton: canton.canton,
          code_canton: canton.code_canton,
          prefecture: canton.prefecture,
          code_prefe: canton.code_prefe,
          region: canton.region,
          code_regio: canton.code_regio,
        },
        geometry: JSON.parse(canton.geometry || '{"type": "Polygon", "coordinates": []}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching cantons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cantons' },
      { status: 500 }
    );
  }
}