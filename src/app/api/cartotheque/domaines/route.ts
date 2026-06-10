import { NextResponse } from 'next/server';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const response = await fetch(`${DJANGO_API_URL}/api/cartotheque/domaines/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Erreur API Django: ${response.status}`);
    const data = await response.json();
    
    // Django peut renvoyer un tableau ou un objet
    const domaines = Array.isArray(data) ? data : (data.results || data || []);
    return NextResponse.json({ success: true, data: domaines });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}