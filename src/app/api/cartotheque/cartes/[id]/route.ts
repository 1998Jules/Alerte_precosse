import { NextRequest, NextResponse } from 'next/server'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000'

/**
 * GET  /api/cartotheque/cartes/[id]        → détail d'une carte + téléchargement
 * PUT  /api/cartotheque/cartes/[id]        → mise à jour
 * DELETE /api/cartotheque/cartes/[id]      → suppression
 *
 * Règle : toujours transmettre la réponse Django au frontend,
 * jamais convertir une erreur Django en 500 générique.
 */

/**
 * GET — Détail d'une carte ou téléchargement de l'image
 *
 * Si `?download=1` : télécharge l'image (gratuite uniquement) et renvoie le fichier binaire.
 * Sinon : retourne le JSON détaillé de la carte.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const isDownload = searchParams.get('download') === '1'

  try {
    // Récupérer le détail depuis Django
    const detailResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/${id}/`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!detailResponse.ok) {
      const errData = await detailResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          error: errData.detail || `Carte ${id} non trouvée (Django ${detailResponse.status})`,
        },
        { status: detailResponse.status }
      )
    }

    const carte = await detailResponse.json()

    // Mode téléchargement
    if (isDownload) {
      if (carte.is_payant) {
        return NextResponse.json(
          { success: false, error: 'Cette carte est payante. Veuillez procéder au paiement.' },
          { status: 403 }
        )
      }

      const imageUrl = carte.image_url || carte.vignette_url
      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: 'Aucune image disponible pour le téléchargement' },
          { status: 404 }
        )
      }

      // Télécharger l'image depuis Django
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        return NextResponse.json(
          { success: false, error: `Erreur téléchargement image (${imageResponse.status})` },
          { status: 502 }
        )
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      const contentType = imageResponse.headers.get('content-type') || 'image/png'
      const filename = `${carte.titre?.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '_') || 'carte'}_${id}.png`

      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Content-Length': imageBuffer.byteLength.toString(),
        },
      })
    }

    // Mode détail JSON
    return NextResponse.json({ success: true, data: carte })
  } catch (error: any) {
    console.error('[cartotheque] GET detail error:', error.message)
    return NextResponse.json(
      { success: false, error: `Backend Django injoignable. Vérifiez que le serveur est démarré.` },
      { status: 502 }
    )
  }
}

/**
 * PUT — Mise à jour d'une carte
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const contentType = request.headers.get('content-type') || ''

  try {
    let djangoResponse: Response

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      djangoResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/${id}/`, {
        method: 'PUT',
        body: formData,
      })
    } else {
      const body = await request.json()
      djangoResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    const responseData = await djangoResponse.json()

    if (djangoResponse.ok) {
      return NextResponse.json({ success: true, data: responseData })
    }

    // Transmettre l'erreur Django avec son code exact
    console.warn(`[cartotheque] Django PUT ${djangoResponse.status}:`, JSON.stringify(responseData).substring(0, 500))
    return NextResponse.json(
      {
        success: false,
        error: responseData.detail || responseData.error || `Erreur Django ${djangoResponse.status}`,
        errors: responseData.errors || responseData,
      },
      { status: djangoResponse.status }
    )
  } catch (error: any) {
    console.error('[cartotheque] PUT error:', error.message)
    return NextResponse.json(
      { success: false, error: `Backend Django injoignable. Vérifiez que le serveur est démarré.` },
      { status: 502 }
    )
  }
}

/**
 * DELETE — Suppression d'une carte
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const response = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/${id}/`, {
      method: 'DELETE',
    })

    if (response.ok || response.status === 204) {
      return NextResponse.json({ success: true })
    }

    const errData = await response.json().catch(() => ({}))
    return NextResponse.json(
      {
        success: false,
        error: errData.detail || `Erreur suppression (Django ${response.status})`,
      },
      { status: response.status }
    )
  } catch (error: any) {
    console.error('[cartotheque] DELETE error:', error.message)
    return NextResponse.json(
      { success: false, error: `Backend Django injoignable. Vérifiez que le serveur est démarré.` },
      { status: 502 }
    )
  }
}
