import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const routes = await db.route.findMany({
      select: {
        route_clas: true,
        route_type: true,
        route_reco: true,
        route_nom: true,
        geometry: true,
      },
    });

    // Convertir en format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: routes.map(route => ({
        type: "Feature",
        properties: {
          route_clas: route.route_clas,
          route_type: route.route_type,
          route_reco: route.route_reco,
          route_nom: route.route_nom,
        },
        geometry: JSON.parse(route.geometry || '{"type": "LineString", "coordinates": []}'),
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}