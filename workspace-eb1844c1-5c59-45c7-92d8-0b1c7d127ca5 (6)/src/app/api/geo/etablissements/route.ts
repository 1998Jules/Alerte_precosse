import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const etablissements = await db.etablissementEducatif.findMany({
      select: {
        canton_nom: true,
        nom_locali: true,
        etablissem: true,
        ouverture: true,
        etabliss_1: true,
        type_terrain: true,
        inspection: true,
        type_etab: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: etablissements.map(etab => ({
        type: "Feature",
        properties: {
          canton_nom: etab.canton_nom,
          nom_locali: etab.nom_locali,
          etablissem: etab.etablissem,
          ouverture: etab.ouverture,
          etabliss_1: etab.etabliss_1,
          type_terrain: etab.type_terrain,
          inspection: etab.inspection,
          type_etab: etab.type_etab,
        },
        geometry: JSON.parse(etab.geometry || '{"type": "Point", "coordinates": [0, 0]}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching etablissements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch etablissements' },
      { status: 500 }
    );
  }
}