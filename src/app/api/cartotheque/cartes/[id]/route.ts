import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/${id}/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Erreur API Django: ${response.status}`);
    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    let djangoResponse: Response;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      djangoResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/${id}/`, {
        method: 'PUT', body: formData,
      });
    } else {
      const body = await request.json();
      djangoResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/${id}/`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
    }

    if (!djangoResponse.ok) throw new Error(`Erreur API Django: ${djangoResponse.status}`);
    const data = await djangoResponse.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/${id}/`, {
      method: 'DELETE',
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}