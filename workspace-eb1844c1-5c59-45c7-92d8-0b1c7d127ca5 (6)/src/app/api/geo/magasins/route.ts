import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const magasins = await db.magasin.findMany({
      select: {
        canton_nom: true,
        etab_nom: true,
        ouverture: true,
        organisme: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: magasins.map(magasin => ({
        type: "Feature",
        properties: {
          canton_nom: magasin.canton_nom,
          etab_nom: magasin.etab_nom,
          ouverture: magasin.ouverture,
          organisme: magasin.organisme,
        },
        geometry: JSON.parse(magasin.geometry || '{"type": "Point", "coordinates": [0, 0]}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching magasins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch magasins' },
      { status: 500 }
    );
  }
}