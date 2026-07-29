// Types partagés par les composants de la cartothèque.
// Reflète exactement le serializer Django `CarteTheematiqueListSerializer`
// avec les extensions du projet Alerte_precosse (couches, GeoJSON, prix CNTIG).

export interface CarteTheematique {
  id: number
  titre: string
  description: string
  domaine: number | null
  domaine_nom: string | null
  domaine_couleur: string | null
  domaine_icone: string | null
  vignette_url: string | null
  image_url: string | null
  geojson_file_url: string | null
  type_carte: 'dynamique' | 'url_externe' | 'fichier' | 'vide'
  statut: 'brouillon' | 'publie' | 'archive'
  auteur: string
  source: string
  mots_cles: string
  date_creation: string
  date_modification: string
  echelle: string
  format_impression: string
  date_edition: string | null
  realisateur: string
  is_payant: boolean
  prix: number | null
  prix_formate: string
  // Champs dynamiques (GeoPortail)
  geojson_url?: string
  couches_associees?: string[]
  centre_lat?: number
  centre_lng?: number
  zoom_default?: number
  fond_carte?: string
}

export interface Domaine {
  id: number
  nom: string
  slug: string
  description: string
  icone: string
  couleur: string
  ordre: number
  nombre_cartes: number
}

/** Détermine si une URL donnée pointe vers un PDF. */
export function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.toLowerCase().endsWith('.pdf')
}

/** Détermine si une URL donnée pointe vers une image raster. */
export function isImageUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return /\.(png|jpe?g|webp|gif|svg|bmp|tiff?)$/i.test(url)
}

/**
 * Retourne l'URL du média principal à afficher (préférence image > pdf).
 * Utilisé par la carte et le modal pour savoir quoi montrer.
 */
export function getMainMediaUrl(carte: CarteTheematique): string | null {
  if (carte.image_url) return carte.image_url
  if (carte.vignette_url) return carte.vignette_url
  if (carte.geojson_file_url && isPdfUrl(carte.geojson_file_url)) return carte.geojson_file_url
  return null
}

/** URL à utiliser pour le téléchargement (préférence image > pdf). */
export function getDownloadUrl(carte: CarteTheematique): string | null {
  return (
    carte.image_url ||
    carte.vignette_url ||
    (carte.geojson_file_url && isPdfUrl(carte.geojson_file_url) ? carte.geojson_file_url : null)
  )
}

/** Nom de fichier proposé pour le téléchargement. */
export function getDownloadFilename(carte: CarteTheematique): string {
  const url = getDownloadUrl(carte)
  if (!url) return `carte-${carte.id}`
  const fromUrl = url.split('/').pop()
  if (fromUrl && fromUrl.trim() !== '') return fromUrl
  const slug = carte.titre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const ext = isPdfUrl(url) ? 'pdf' : 'png'
  return `${slug || `carte-${carte.id}`}.${ext}`
}

/** Formate une date ISO en format français lisible. */
export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}
