import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const hopitaux = await db.hopital.findMany({
      select: {
        canton_nom: true,
        nom_locali: true,
        nom_fs: true,
        ouverture: true,
        secteur: true,
        services_p: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: hopitaux.map(hopital => ({
        type: "Feature",
        properties: {
          canton_nom: hopital.canton_nom,
          nom_locali: hopital.nom_locali,
          nom_fs: hopital.nom_fs,
          ouverture: hopital.ouverture,
          secteur: hopital.secteur,
          services_p: hopital.services_p,
        },
        geometry: JSON.parse(hopital.geometry || '{"type": "Point", "coordinates": [0, 0]}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching hopitaux:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hopitaux' },
      { status: 500 }
    );
  }
}