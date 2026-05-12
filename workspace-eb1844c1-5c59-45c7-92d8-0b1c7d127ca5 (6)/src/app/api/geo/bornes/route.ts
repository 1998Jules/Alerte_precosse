import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const bornes = await db.borneFontaine.findMany({
      select: {
        canton_nom: true,
        nom_locali: true,
        borne_font: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: bornes.map(borne => ({
        type: "Feature",
        properties: {
          canton_nom: borne.canton_nom,
          nom_locali: borne.nom_locali,
          borne_font: borne.borne_font,
        },
        geometry: JSON.parse(borne.geometry || '{"type": "Point", "coordinates": [0, 0]}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching bornes fontaines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bornes fontaines' },
      { status: 500 }
    );
  }
}