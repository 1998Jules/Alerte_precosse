import { NextResponse } from 'next/server';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const response = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/stats/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Erreur API Django: ${response.status}`);
    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erreur stats GET:', error.message);
    return NextResponse.json({ success: true, data: { total: 0, publiees: 0, domaines: [] } });
  }
}