// src/app/api/tts/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text')
  const lang = searchParams.get('lang')

  if (!text || !lang) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    // URL de Google Translate TTS
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`

    // On "trompe" Google en faisant passer la requête serveur pour un navigateur Chrome
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    // Si Google refuse (code 403 ou 404), cela signifie souvent que la langue n'est pas supportée ou qu'il a bloqué l'IP
    if (!response.ok) {
      console.error(`TTS Error: Google refused (Status ${response.status}) for language ${lang}. Probably unsupported by Google TTS.`)
      // On renvoie une réponse vide 503 pour dire au frontend "Pas de son dispo"
      return new NextResponse(null, { status: 503 })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    console.error('TTS Error:', error)
    return new NextResponse(null, { status: 500 })
  }
}