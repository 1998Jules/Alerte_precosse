'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  FileText,
  ImageIcon,
  Calendar,
  Ruler,
  Tag,
  User,
  Building,
  Layers,
  Map as MapIcon,
  Printer,
  Maximize2,
  ExternalLink,
  Loader2,
  Lock,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import type { CarteTheematique } from './types'
import { CarteBadge } from './CarteBadge'
import {
  getMainMediaUrl,
  getDownloadUrl,
  getDownloadFilename,
  isPdfUrl,
  isImageUrl,
  formatDate,
} from './types'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/app/contexts/LanguageContext'

// Couches du géoportail — config couleurs
const LAYER_ICON_MAP: Record<string, { color: string }> = {
  hopitaux: { color: '#DC143C' },
  jardins: { color: '#96CEB4' },
  colleges: { color: '#87CEEB' },
  lycees: { color: '#4682B4' },
  peas: { color: '#0077BE' },
  bornefontaines: { color: '#20B2AA' },
  marches: { color: '#FFA07A' },
  chateaux: { color: '#DDA0DD' },
  cantons: { color: '#FF6B6B' },
  communes: { color: '#4ECDC4' },
  routes: { color: '#45B7D1' },
  terrains: { color: '#387c38' },
  cooperatives: { color: '#FF8C00' },
  magasins: { color: '#9370DB' },
}

interface CarteDetailModalProps {
  carte: CarteTheematique | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Modal de visualisation d'une carte :
 *  - L'image est GRANDE et visible en premier
 *  - Un bandeau compact en haut : titre + badges + bouton "Infos"
 *  - Panneau d'infos repliable (fermé par défaut)
 *  - Image au centre avec zoom/rotation/plein écran
 *  - Téléchargement en bas
 */
export function CarteDetailModal({ carte, open, onOpenChange }: CarteDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
        {carte ? (
          <CarteDetailContent key={carte.id} carte={carte} />
        ) : (
          <div className="p-6 text-sm text-slate-500">Aucune carte sélectionnée.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Contenu interne du modal. Remonté à chaque changement de carte (via `key`)
 * pour réinitialiser naturellement l'état zoom/rotation/fullscreen.
 */
function CarteDetailContent({ carte }: { carte: CarteTheematique }) {
  const { t } = useLanguage()
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [loadingImage, setLoadingImage] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Drag pour déplacement quand zoomé
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [positionStart, setPositionStart] = useState({ x: 0, y: 0 })

  // Fermer le plein écran avec Escape
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) {
        e.stopPropagation()
        setFullscreen(false)
      }
    },
    [fullscreen]
  )
  useEffect(() => {
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [handleEsc])

  const mediaUrl = getMainMediaUrl(carte)
  const downloadUrl = getDownloadUrl(carte)
  const downloadName = getDownloadFilename(carte)
  const isPdf = isPdfUrl(mediaUrl)
  const isImage = isImageUrl(mediaUrl)

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const handleResetView = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setPositionStart({ ...position })
  }, [zoom, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    setPosition({ x: positionStart.x + dx, y: positionStart.y + dy })
  }, [isDragging, dragStart, positionStart])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  // Liste des mots-clés
  const motsCles = carte.mots_cles
    ? carte.mots_cles
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
    : []

  const handleDownload = async () => {
    if (!downloadUrl) return
    if (carte.is_payant) return

    setDownloading(true)
    try {
      const response = await fetch(`/api/cartotheque/cartes/${carte.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = downloadName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = downloadName
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch {
      if (downloadUrl) window.open(downloadUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    if (!downloadUrl) return
    window.open(downloadUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* ===== OVERLAY PLEIN ÉCRAN IMAGE ===== */}
      {fullscreen && isImage && mediaUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={() => setFullscreen(false)}
            aria-label="Quitter le plein écran"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="absolute top-4 left-4 flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur p-1">
            <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleZoomOut() }}>
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-xs text-white font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleZoomIn() }}>
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1 bg-white/20" />
            <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleRotate() }}>
              <RotateCw className="h-5 w-5" />
            </Button>
          </div>
          <img
            src={mediaUrl}
            alt={carte.titre}
            className="max-w-[95vw] max-h-[95vh] object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}

      {/* ===== CONTENU DU MODAL ===== */}
      <div className="flex flex-col h-[90vh]">

        {/* ===== BANDEAU COMPACT EN HAUT (titre + badges + bouton infos) ===== */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-slate-700"
          style={{ background: `linear-gradient(135deg, ${carte.domaine_couleur || '#10b981'}08, ${carte.domaine_couleur || '#10b981'}18)` }}
        >
          {/* Titre */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">{carte.titre}</h2>
            {(carte.auteur || carte.source) && (
              <p className="text-[11px] text-slate-500 truncate">
                {carte.auteur && <span>{carte.auteur}</span>}
                {carte.auteur && carte.source && ' · '}
                {carte.source && <span>{carte.source}</span>}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <CarteBadge isPayant={carte.is_payant} prixFormate={carte.prix_formate} size="sm" />
            {carte.domaine_nom && (
              <Badge
                className="text-white border-none shadow-sm text-[10px]"
                style={{ backgroundColor: carte.domaine_couleur ?? '#64748b' }}
              >
                <Layers className="h-3 w-3 mr-0.5" />
                {carte.domaine_nom}
              </Badge>
            )}
          </div>

          {/* Bouton Infos */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 gap-1.5 text-xs shrink-0',
              showDetails && 'bg-slate-100 dark:bg-slate-800'
            )}
            onClick={() => setShowDetails(!showDetails)}
          >
            <Info className="h-3.5 w-3.5" />
            {showDetails ? t('cartotheque.detail.hide') || 'Masquer' : t('cartotheque.detail.show') || 'Détails'}
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {/* ===== PANNEAU DÉTAILS (repliable — fermé par défaut) ===== */}
        <div
          className={cn(
            'flex-shrink-0 border-b border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ease-in-out',
            showDetails ? 'max-h-[35vh] opacity-100' : 'max-h-0 opacity-0 border-b-0'
          )}
        >
          <ScrollArea className="h-full max-h-[35vh]">
            <div className="p-4 space-y-4">
              {/* Description */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  {t('cartotheque.detail.description')}
                </h4>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {carte.description || t('cartotheque.no.description')}
                </p>
              </section>

              <Separator />

              {/* Fiche technique — grille 2 colonnes compacte */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  {t('cartotheque.detail.specs')}
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                  <DetailItem icon={<Ruler className="h-3.5 w-3.5" />} label={t('cartotheque.detail.scale')} value={carte.echelle || '—'} />
                  <DetailItem icon={<Printer className="h-3.5 w-3.5" />} label={t('cartotheque.detail.print_format')} value={carte.format_impression || '—'} />
                  <DetailItem icon={<Calendar className="h-3.5 w-3.5" />} label={t('cartotheque.detail.edition_date')} value={formatDate(carte.date_edition)} />
                  <DetailItem icon={<User className="h-3.5 w-3.5" />} label={t('cartotheque.detail.realisateur')} value={carte.realisateur || carte.auteur || '—'} />
                  <DetailItem icon={<Tag className="h-3.5 w-3.5" />} label={t('cartotheque.detail.author')} value={carte.auteur || '—'} />
                  <DetailItem icon={<Building className="h-3.5 w-3.5" />} label={t('cartotheque.detail.source')} value={carte.source || '—'} />
                  <DetailItem icon={<Layers className="h-3.5 w-3.5" />} label={t('cartotheque.detail.type')} value={
                    carte.type_carte === 'dynamique' ? t('cartotheque.type.dynamic') :
                    carte.type_carte === 'fichier' ? t('cartotheque.type.file') :
                    carte.type_carte === 'url_externe' ? t('cartotheque.type.external') :
                    t('cartotheque.type.empty')
                  } />
                </div>
              </section>

              {/* Mots-clés + Couches */}
              {(motsCles.length > 0 || (carte.couches_associees && carte.couches_associees.length > 0)) && (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-4">
                    {motsCles.length > 0 && (
                      <section className="flex-1 min-w-[180px]">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          {t('cartotheque.detail.keywords')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {motsCles.map((m) => (
                            <Badge key={m} variant="outline" className="text-[10px] font-normal">{m}</Badge>
                          ))}
                        </div>
                      </section>
                    )}
                    {carte.couches_associees && carte.couches_associees.length > 0 && (
                      <section className="flex-1 min-w-[180px]">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          {t('cartotheque.detail.layers')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {carte.couches_associees.map((couche) => {
                            const config = LAYER_ICON_MAP[couche]
                            return (
                              <Badge
                                key={couche}
                                variant="secondary"
                                className="text-[10px]"
                                style={config ? {
                                  backgroundColor: `${config.color}20`,
                                  color: config.color,
                                } : {}}
                              >
                                {couche}
                              </Badge>
                            )
                          })}
                        </div>
                      </section>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Prix + métadonnées */}
              <div className="flex gap-4 items-start">
                <section
                  className={cn(
                    'rounded-lg p-3 border flex-1',
                    carte.is_payant
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        {t('cartotheque.detail.price')}
                      </p>
                      <p
                        className={cn(
                          'text-xl font-bold',
                          carte.is_payant ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                        )}
                      >
                        {carte.prix_formate}
                      </p>
                    </div>
                    <CarteBadge isPayant={carte.is_payant} prixFormate={carte.prix_formate} size="md" withPrice />
                  </div>
                </section>
                <section className="text-[10px] text-slate-400 space-y-0.5 pt-0.5 flex-shrink-0">
                  <p>ID: <span className="font-mono">#{carte.id}</span></p>
                  <p>Créée: {formatDate(carte.date_creation)}</p>
                  <p>Modifiée: {formatDate(carte.date_modification)}</p>
                </section>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* ===== SECTION IMAGE / MÉDIA (ZONE PRINCIPALE — GRANDE) ===== */}
        <div className="flex-1 relative bg-slate-900 dark:bg-black min-w-0 flex flex-col min-h-0">
          {/* Barre d'outils en haut à droite */}
          {isImage && mediaUrl && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur p-1">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={handleZoomOut} disabled={zoom <= 0.25} title="Dézoomer">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-white font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={handleZoomIn} disabled={zoom >= 4} title="Zoomer">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1 bg-white/20" />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={handleRotate} title="Pivoter 90°">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={handleResetView} title="Réinitialiser">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setFullscreen(true)} className="h-8 w-8 p-0 text-white hover:bg-white/20" title="Plein écran">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Indicateur chargement */}
          {loadingImage && isImage && mediaUrl && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">{t('cartotheque.loading.map')}</p>
              </div>
            </div>
          )}

          {/* Erreur */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900">
              <div className="text-center">
                <ImageIcon className="h-16 w-16 text-slate-600 mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm text-slate-400">{t('cartotheque.detail.image_unavailable')}</p>
              </div>
            </div>
          )}

          {/* Aucun média */}
          {!mediaUrl && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900">
              <div className="text-center">
                <MapIcon className="h-16 w-16 text-slate-600 mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm text-slate-400">{t('cartotheque.detail.no_image')}</p>
              </div>
            </div>
          )}

          {/* Affichage du média */}
          <ScrollArea className="h-full w-full">
            <div
              className="flex min-h-full items-center justify-center p-2 select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              {isImage && mediaUrl && (
                <img
                  src={mediaUrl}
                  alt={carte.titre}
                  className="max-w-full transition-transform duration-200 ease-out select-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    maxHeight: zoom === 1 ? '70vh' : 'none',
                  }}
                  onLoad={() => setLoadingImage(false)}
                  onError={() => { setLoadingImage(false); setImageError(true) }}
                  draggable={false}
                />
              )}
              {isPdf && mediaUrl && (
                <iframe
                  src={`${mediaUrl}#toolbar=1&view=FitH`}
                  title={carte.titre}
                  className="w-full h-[70vh] bg-white rounded"
                />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ===== BARRE DE TÉLÉCHARGEMENT (TOUT EN BAS) ===== */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3">
          <div className="flex items-center gap-3">
            {!carte.is_payant && downloadUrl && (
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                size="lg"
              >
                {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {downloading ? t('cartotheque.loading') : t('cartotheque.download.free')}
              </Button>
            )}
            {!carte.is_payant && !downloadUrl && (
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">{t('cartotheque.detail.no_image')}</p>
              </div>
            )}
            {carte.is_payant && (
              <div className="flex-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3 flex items-center justify-center gap-3">
                <Lock className="h-5 w-5 text-amber-500" />
                <div className="text-center">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{t('cartotheque.download.paid')}</p>
                  {carte.prix && (
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-300">{carte.prix_formate}</p>
                  )}
                </div>
              </div>
            )}
            {downloadUrl && !carte.is_payant && (
              <Button onClick={handlePrint} variant="outline" size="lg" className="h-11" title="Ouvrir dans un nouvel onglet">
                <ExternalLink className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

interface DetailItemProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
        <span className="text-slate-400">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border dark:border-slate-600 max-w-[130px] truncate text-right">
        {value}
      </span>
    </div>
  )
}
