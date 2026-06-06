import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut') || 'publie';
    const domaineSlug = searchParams.get('domaine_slug') || '';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';

    let url = `${DJANGO_API_URL}/api/cartotheque/cartes/?statut=${statut}&page=${page}`;
    if (domaineSlug) url += `&domaine__slug=${domaineSlug}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`Erreur API Django: ${response.status}`);
    const data = await response.json();
    
    // Django peut renvoyer un tableau ou un objet avec results
    const cartes = Array.isArray(data) ? data : (data.results || []);
    return NextResponse.json({ success: true, results: cartes, count: cartes.length });
  } catch (error: any) {
    console.error('Erreur cartes GET:', error.message);
    return NextResponse.json({ success: true, results: [], count: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let djangoResponse: Response;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      djangoResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/`, {
        method: 'POST', body: formData,
      });
    } else {
      const body = await request.json();
      djangoResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
    }

    if (!djangoResponse.ok) throw new Error(`Erreur API Django: ${djangoResponse.status}`);
    const data = await djangoResponse.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}