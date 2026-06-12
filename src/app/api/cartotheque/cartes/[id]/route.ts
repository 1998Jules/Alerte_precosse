import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // D'abord recuperer les details de la carte pour verifier l'URL de l'image
    const detailResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/${id}/`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!detailResponse.ok) {
      throw new Error(`Carte non trouvee: ${detailResponse.status}`);
    }

    const detailData = await detailResponse.json();
    const carte = detailData;

    // Verifier si la carte est gratuite
    if (carte.is_payant) {
      return NextResponse.json(
        { success: false, error: 'Cette carte est payante. Veuillez proceder au paiement.' },
        { status: 403 }
      );
    }

    // Determiner l'URL de l'image a telecharger
    const imageUrl = carte.image_url || carte.vignette_url;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Aucune image disponible pour le telechargement' },
        { status: 404 }
      );
    }

    // Telecharger l'image depuis Django
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(`Erreur de telechargement de l'image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Determiner le content-type
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    // Generer un nom de fichier
    const filename = `${carte.titre?.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '_') || 'carte'}_${id}.png`;

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Erreur download carte:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}