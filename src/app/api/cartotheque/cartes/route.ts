import { NextRequest, NextResponse } from 'next/server'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000'

/**
 * GET /api/cartotheque/cartes
 *
 * Proxy vers Django. Transmet les query params.
 * Si Django est injoignable ou en erreur, retourne un résultat vide (pas de crash).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statut = searchParams.get('statut') || 'publie'
    const domaineSlug = searchParams.get('domaine_slug') || ''
    const search = searchParams.get('search') || ''
    const page = searchParams.get('page') || '1'

    let url = `${DJANGO_API_URL}/api/cartotheque/cartes/?statut=${statut}&page=${page}`
    if (domaineSlug) url += `&domaine__slug=${domaineSlug}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    // Transmettre aussi domaine et is_payant si présents
    const domaine = searchParams.get('domaine')
    if (domaine) url += `&domaine=${domaine}`
    const isPayant = searchParams.get('is_payant')
    if (isPayant) url += `&is_payant=${isPayant}`

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      console.warn(`[cartotheque] Django GET ${response.status}`)
      // Ne pas crasher : retourner un résultat vide
      return NextResponse.json({ success: true, results: [], data: [], count: 0 })
    }

    const data = await response.json()
    const cartes = Array.isArray(data) ? data : (data.results || [])
    const count = data.count ?? cartes.length
    return NextResponse.json({ success: true, results: cartes, data: cartes, count })
  } catch (error: any) {
    console.error('[cartotheque] GET error:', error.message)
    // Django injoignable : résultat vide, pas de 500
    return NextResponse.json({ success: true, results: [], data: [], count: 0 })
  }
}

/**
 * POST /api/cartotheque/cartes
 *
 * Proxy vers Django en multipart/form-data ou JSON.
 * - Si Django répond OK → transmettre la réponse
 * - Si Django répond 400 → transmettre le détail de l'erreur de validation (pas 500 !)
 * - Si Django est injoignable → erreur 502 avec message clair
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''
  const authorization = request.headers.get('authorization')

  try {
    let djangoResponse: Response

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      djangoResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/`, {
        method: 'POST',
        headers: authorization ? { Authorization: authorization } : undefined,
        body: formData,
      })
    } else {
      const body = await request.json()
      djangoResponse = await fetch(`${DJANGO_API_URL}/api/cartotheque/cartes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body: JSON.stringify(body),
      })
    }

    // Django a répondu — transmettre sa réponse telle quelle
    const responseData = await djangoResponse.json()

    if (djangoResponse.ok) {
      return NextResponse.json({ success: true, data: responseData })
    }

    // Django a renvoyé une erreur (400, 403, etc.)
    // Transmettre le détail au frontend avec le bon code HTTP
    console.warn(`[cartotheque] Django POST ${djangoResponse.status}:`, JSON.stringify(responseData).substring(0, 500))
    return NextResponse.json(
      {
        success: false,
        error: responseData.detail || responseData.error || responseData.message || `Erreur Django ${djangoResponse.status}`,
        errors: responseData.errors || responseData,  // Détail field-level de Django
      },
      { status: djangoResponse.status }
    )
  } catch (error: any) {
    console.error('[cartotheque] POST error:', error.message)
    // Django injoignable
    return NextResponse.json(
      { success: false, error: `Backend Django injoignable (${DJANGO_API_URL}). Vérifiez que le serveur Django est démarré.` },
      { status: 502 }
    )
  }
}
