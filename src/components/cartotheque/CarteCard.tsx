'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Eye, FileText, ImageIcon, Calendar, Ruler, Tag, Map,
  Layers, Loader2,
} from 'lucide-react'
import type { CarteTheematique } from './types'
import { CarteBadge } from './CarteBadge'
import { getMainMediaUrl, isPdfUrl, isImageUrl, formatDate } from './types'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/app/contexts/LanguageContext'

// Icône dynamique selon le domaine
const DomainIcon = ({ iconName, className = 'h-3 w-3' }: { iconName: string | null; className?: string }) => {
  const iconMap: Record<string, any> = {
    Hospital: Eye, School: Eye, Droplets: Eye, Building: Eye,
    ShoppingBag: Eye, TreePine: Eye, Landmark: Eye, MapPin: Eye,
    Map: Map, Layers: Layers, Heart: Eye, GraduationCap: Eye,
    Building2: Eye, Wheat: Eye, TrendingUp: Eye, Church: Eye,
    ThermometerSun: Eye, Waves: Eye, Sprout: Eye, BookOpen: Eye,
  }
  const Icon = iconMap[iconName || ''] || MapPin
  return <Icon className={className} />
}

// Placeholder avec dégradé quand pas d'image
const CartePlaceholder = ({ couleur, titre }: { couleur: string; titre: string }) => (
  <div
    className="w-full h-full flex items-center justify-center relative overflow-hidden"
    style={{ background: `linear-gradient(135deg, ${couleur}22, ${couleur}66)` }}
  >
    <div className="absolute inset-0 opacity-10">
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        <path d="M100 20L180 80L160 170L40 170L20 80Z" stroke={couleur} strokeWidth="2" fill={couleur} fillOpacity="0.1" />
        <circle cx="60" cy="80" r="5" fill={couleur} fillOpacity="0.5" />
        <circle cx="140" cy="120" r="5" fill={couleur} fillOpacity="0.5" />
        <circle cx="100" cy="60" r="5" fill={couleur} fillOpacity="0.5" />
        <line x1="60" y1="80" x2="140" y2="120" stroke={couleur} strokeWidth="1" strokeOpacity="0.3" />
        <line x1="100" y1="60" x2="60" y2="80" stroke={couleur} strokeWidth="1" strokeOpacity="0.3" />
      </svg>
    </div>
    <div className="text-center z-10 px-4">
      <Map className="h-10 w-10 mx-auto mb-2" style={{ color: couleur }} />
      <p className="text-sm font-medium text-gray-700 line-clamp-2">{titre}</p>
    </div>
  </div>
)

interface CarteCardProps {
  carte: CarteTheematique
  /** Fonction optionnelle pour compatibilité ascendante.
   *  Si fournie, l'ancien comportement modal est conservé.
   *  Sinon, navigation vers /carte/[id].
   */
  onVoir?: (carte: CarteTheematique) => void
}

/**
 * Carte individuelle de la cartothèque :
 *  - vignette (image) OU icône PDF OU placeholder dégradé
 *  - badge "Gratuit" / "Payant" superposé sur le média
 *  - badge domaine avec icône et couleur
 *  - infos essentielles (échelle, date, auteur)
 *  - bouton "Voir" → navigation vers /carte/[id] (page dédiée)
 */
export function CarteCard({ carte, onVoir }: CarteCardProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const mediaUrl = getMainMediaUrl(carte)
  const isPdf = isPdfUrl(mediaUrl)
  const isImage = isImageUrl(mediaUrl)
  const hasMedia = !!mediaUrl

  // Gestion d'erreur de chargement image
  const [imgError, setImgError] = useState(false)

  // Navigation vers la page dédiée
  const handleVoir = () => {
    if (onVoir) {
      onVoir(carte)
    } else {
      router.push(`/carte/${carte.id}`)
    }
  }

  return (
    <Card className="group relative overflow-hidden flex flex-col p-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Zone média */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted cursor-pointer" onClick={handleVoir}>
        {hasMedia && isImage && !imgError && (
          <img
            src={mediaUrl!}
            alt={carte.titre}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}
        {hasMedia && isPdf && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-rose-50 to-orange-100 dark:from-rose-950/40 dark:to-orange-950/40">
            <FileText className="h-12 w-12 text-rose-500" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">PDF</span>
          </div>
        )}
        {(!hasMedia || imgError) && (
          <CartePlaceholder
            couleur={carte.domaine_couleur || '#10b981'}
            titre={carte.titre}
          />
        )}

        {/* Badge Gratuit / Payant — superposé en haut à gauche */}
        <div className="absolute left-2 top-2 z-10">
          <CarteBadge
            isPayant={carte.is_payant}
            prixFormate={carte.prix_formate}
            size="sm"
          />
        </div>

        {/* Domaine (pastille colorée en haut à droite) */}
        {carte.domaine_nom && (
          <div className="absolute right-2 top-2 z-10">
            <Badge
              className="text-white border-none shadow-md text-[10px] px-2 py-0.5 font-medium backdrop-blur-sm"
              style={{ backgroundColor: `${carte.domaine_couleur || '#64748b'}DD` }}
            >
              <DomainIcon iconName={carte.domaine_icone} className="h-3 w-3 mr-1" />
              {carte.domaine_nom}
            </Badge>
          </div>
        )}

        {/* Bouton "Voir" qui apparaît au survol (overlay) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="sm"
            onClick={handleVoir}
            className="bg-white text-slate-900 hover:bg-white/90 shadow-lg"
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('cartotheque.view')}
          </Button>
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100 group-hover:text-green-700 transition-colors cursor-pointer"
          title={carte.titre}
          onClick={handleVoir}
        >
          {carte.titre}
        </h3>

        <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
          {carte.description || t('cartotheque.no.description')}
        </p>

        {/* Échelle et format */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {carte.echelle && (
            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              <Layers className="h-3 w-3" />
              {carte.echelle}
            </span>
          )}
          {carte.format_impression && (
            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {carte.format_impression}
            </span>
          )}
        </div>

        {/* Métadonnées compactes */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          {(carte.date_edition || carte.date_creation) && (
            <span className="inline-flex items-center gap-1" title={t('cartotheque.detail.edition_date')}>
              <Calendar className="h-3 w-3" />
              {formatDate(carte.date_edition || carte.date_creation)}
            </span>
          )}
          {(carte.realisateur || carte.auteur) && (
            <span className="inline-flex items-center gap-1" title={t('cartotheque.detail.realisateur')}>
              <Tag className="h-3 w-3" />
              <span className="max-w-[120px] truncate">{carte.realisateur || carte.auteur}</span>
            </span>
          )}
        </div>

        {/* Prix + bouton Voir (mobile-friendly) */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide text-slate-400">{t('cartotheque.detail.price')}</span>
            <span
              className={cn(
                'text-sm font-bold',
                carte.is_payant ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {carte.prix_formate}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleVoir}
            className="h-8"
            aria-label={`${t('cartotheque.view')} ${carte.titre}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('cartotheque.view')}
          </Button>
        </div>
      </div>
    </Card>
  )
}
