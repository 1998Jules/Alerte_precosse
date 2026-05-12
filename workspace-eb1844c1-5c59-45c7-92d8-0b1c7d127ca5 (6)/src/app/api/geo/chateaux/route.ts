import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const chateaux = await db.chateau.findMany({
      select: {
        canton_nom: true,
        nom_locali: true,
        chateau_no: true,
        organisme: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: chateaux.map(chateau => ({
        type: "Feature",
        properties: {
          canton_nom: chateau.canton_nom,
          nom_locali: chateau.nom_locali,
          chateau_no: chateau.chateau_no,
          organisme: chateau.organisme,
        },
        geometry: JSON.parse(chateau.geometry || '{"type": "Point", "coordinates": [0, 0]}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching chateaux:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chateaux' },
      { status: 500 }
    );
  }
}