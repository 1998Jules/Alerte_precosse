import { NextResponse } from 'next/server';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000';

const DEMO_STATS = {
  total: 6, publiees: 6, brouillons: 0, archives: 0,
  domaines: [
    { id: 1, nom: 'Santé', slug: 'sante', couleur: '#ef4444', icone: 'Heart', nombre_cartes: 1 },
    { id: 2, nom: 'Éducation', slug: 'education', couleur: '#3b82f6', icone: 'GraduationCap', nombre_cartes: 1 },
    { id: 3, nom: 'Hydrologie', slug: 'hydrologie', couleur: '#06b6d4', icone: 'Droplets', nombre_cartes: 1 },
    { id: 4, nom: 'Infrastructure', slug: 'infrastructure', couleur: '#f59e0b', icone: 'Building2', nombre_cartes: 1 },
    { id: 5, nom: 'Agriculture', slug: 'agriculture', couleur: '#22c55e', icone: 'Wheat', nombre_cartes: 1 },
    { id: 6, nom: 'Économie', slug: 'economie', couleur: '#8b5cf6', icone: 'TrendingUp', nombre_cartes: 1 },
  ]
};

export async function GET() {
  try {
    try {
      const response = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/stats/`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ success: true, data });
      }
    } catch {}

    return NextResponse.json({ success: true, data: DEMO_STATS });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: DEMO_STATS });
  }
}