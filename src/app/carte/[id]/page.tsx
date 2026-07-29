'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
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
  ArrowLeft,
  X,
  Check,
  FileText,
  Info,
  Share2,
  Clock,
  Hash,
  Banknote,
  FolderOpen,
} from 'lucide-react'
import type { CarteTheematique } from '@/components/cartotheque/types'
import { CarteBadge } from '@/components/cartotheque/CarteBadge'
import {
  getMainMediaUrl,
  getDownloadUrl,
  getDownloadFilename,
  isPdfUrl,
  isImageUrl,
  formatDate,
} from '@/components/cartotheque/types'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/app/contexts/LanguageContext'

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

export default function CarteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const id = params?.id as string

  const [carte, setCarte] = useState<CarteTheematique | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [loadingImage, setLoadingImage] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [positionStart, setPositionStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetch(`/api/cartotheque/cartes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setCarte(data.data || data))
      .catch((err) => {
        console.error('[carte detail] fetch error:', err)
        setError('Impossible de charger cette carte.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) {
        e.preventDefault()
        setFullscreen(false)
      }
    },
    [fullscreen]
  )
  useEffect(() => {
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [handleEsc])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const handleResetView = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setPositionStart({ ...position })
  }, [zoom, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: positionStart.x + (e.clientX - dragStart.x),
      y: positionStart.y + (e.clientY - dragStart.y),
    })
  }, [isDragging, dragStart, positionStart])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleDownload = async () => {
    if (!carte || carte.is_payant) return
    const downloadUrl = getDownloadUrl(carte)
    const downloadName = getDownloadFilename(carte)
    if (!downloadUrl) return
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
      const downloadUrl = getDownloadUrl(carte)
      if (downloadUrl) window.open(downloadUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  // ===== CHARGEMENT =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-500 animate-spin mx-auto" />
            <MapIcon className="h-6 w-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t('cartotheque.loading.map')}</p>
        </div>
      </div>
    )
  }

  // ===== ERREUR =====
  if (error || !carte) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="h-10 w-10 text-red-500" strokeWidth={1.5} />
          </div>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{error || 'Carte introuvable'}</p>
          <Button variant="outline" onClick={() => router.back()} className="gap-2 mt-2">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
        </div>
      </div>
    )
  }

  const mediaUrl = getMainMediaUrl(carte)
  const downloadUrl = getDownloadUrl(carte)
  const downloadName = getDownloadFilename(carte)
  const isPdf = isPdfUrl(mediaUrl)
  const isImage = isImageUrl(mediaUrl)
  const motsCles = carte.mots_cles ? carte.mots_cles.split(',').map((m) => m.trim()).filter(Boolean) : []
  const domaineColor = carte.domaine_couleur || '#10b981'

  return (
    <>
      {/* ===== PLEIN ÉCRAN ===== */}
      {fullscreen && isImage && mediaUrl && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={() => setFullscreen(false)}>
          <button className="absolute top-5 right-5 text-white/70 hover:text-white z-10 transition-colors" onClick={() => setFullscreen(false)}>
            <X className="h-8 w-8" />
          </button>
          <div className="absolute top-5 left-5 flex items-center gap-1 rounded-xl bg-black/50 backdrop-blur-md p-1.5 border border-white/10">
            <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleZoomOut() }}>
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-xs text-white/80 font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleZoomIn() }}>
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1 bg-white/20" />
            <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleRotate() }}>
              <RotateCw className="h-5 w-5" />
            </Button>
          </div>
          <img
            src={mediaUrl} alt={carte.titre}
            className="max-w-[95vw] max-h-[95vh] object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
            onClick={(e) => e.stopPropagation()} draggable={false}
          />
        </div>
      )}

      {/* ===== PAGE ===== */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

        {/* ===== HEADER AVEC DÉGRADÉ ===== */}
        <div
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${domaineColor}15, ${domaineColor}30, #0f172a10)` }}
        >
          {/* Motif décoratif en arrière-plan */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center gap-4">
              {/* Bouton retour */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-1.5 shrink-0 bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 backdrop-blur-sm border border-white/50 dark:border-white/10 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t('cartotheque.back') || 'Retour'}</span>
              </Button>

              {/* Icône domaine */}
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                style={{ background: `linear-gradient(135deg, ${domaineColor}, ${domaineColor}CC)` }}
              >
                <Layers className="h-5 w-5 text-white" />
              </div>

              {/* Titre + auteur */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{carte.titre}</h1>
                {(carte.auteur || carte.source) && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
                    className="text-white border-none shadow-sm text-xs"
                    style={{ backgroundColor: domaineColor }}
                  >
                    {carte.domaine_nom}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== CONTENU PRINCIPAL ===== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ===== COLONNE IMAGE (GRANDE) ===== */}
            <div className="flex-1 min-w-0">
              {/* Cadre de l'image */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                {/* Barre d'outils */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    {isPdf ? <FileText className="h-4 w-4 text-rose-500" /> : <MapIcon className="h-4 w-4 text-emerald-500" />}
                    <span>{isPdf ? 'Document PDF' : 'Carte thématique'}</span>
                  </div>
                  {isImage && mediaUrl && (
                    <div className="flex items-center gap-1 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-0.5 shadow-sm">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleZoomOut} disabled={zoom <= 0.25} title="Dézoomer">
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 w-10 text-center">{Math.round(zoom * 100)}%</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleZoomIn} disabled={zoom >= 4} title="Zoomer">
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                      <Separator orientation="vertical" className="h-5 mx-0.5" />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRotate} title="Pivoter">
                        <RotateCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleResetView} title="Réinitialiser">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setFullscreen(true)} title="Plein écran">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Zone image */}
                <div className="relative bg-slate-100 dark:bg-slate-950 min-h-[400px] lg:min-h-[550px] flex items-center justify-center">
                  {loadingImage && isImage && mediaUrl && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="h-10 w-10 rounded-full border-3 border-emerald-200 dark:border-emerald-900 border-t-emerald-500 animate-spin mx-auto" />
                        <p className="mt-3 text-sm text-slate-400">{t('cartotheque.loading.map')}</p>
                      </div>
                    </div>
                  )}
                  {imageError && (
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" strokeWidth={1} />
                      <p className="text-sm text-slate-400">{t('cartotheque.detail.image_unavailable')}</p>
                    </div>
                  )}
                  {!mediaUrl && (
                    <div className="text-center">
                      <MapIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" strokeWidth={1} />
                      <p className="text-sm text-slate-400">{t('cartotheque.detail.no_image')}</p>
                    </div>
                  )}

                  <ScrollArea className="h-full w-full max-h-[70vh]">
                    <div
                      className="flex items-center justify-center p-4 select-none min-h-[400px] lg:min-h-[550px]"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                    >
                      {isImage && mediaUrl && (
                        <img
                          src={mediaUrl} alt={carte.titre}
                          className="max-w-full rounded-lg shadow-md transition-transform duration-200 ease-out select-none"
                          style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                            transformOrigin: 'center center',
                            maxHeight: zoom === 1 ? '65vh' : 'none',
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
                          className="w-full h-[65vh] bg-white rounded-lg"
                        />
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Barre d'actions sous l'image */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {!carte.is_payant && downloadUrl && (
                  <Button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/25 h-12 px-6"
                    size="lg"
                  >
                    {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                    {downloading ? t('cartotheque.loading') : t('cartotheque.download.free')}
                  </Button>
                )}
                {carte.is_payant && (
                  <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{t('cartotheque.download.paid')}</p>
                      {carte.prix && <p className="text-xl font-bold text-amber-600 dark:text-amber-300">{carte.prix_formate}</p>}
                    </div>
                  </div>
                )}
                {downloadUrl && !carte.is_payant && (
                  <Button onClick={() => window.open(downloadUrl, '_blank')} variant="outline" size="lg" className="h-12 gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Ouvrir
                  </Button>
                )}
              </div>
            </div>

            {/* ===== COLONNE DÉTAILS ===== */}
            <div className="w-full lg:w-[380px] shrink-0 space-y-4">

              {/* Card : Description */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div
                  className="px-5 py-3.5 flex items-center gap-2.5"
                  style={{ background: `linear-gradient(135deg, ${domaineColor}10, ${domaineColor}20)` }}
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${domaineColor}20` }}>
                    <Info className="h-4 w-4" style={{ color: domaineColor }} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('cartotheque.detail.description')}</h3>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {carte.description || t('cartotheque.no.description')}
                  </p>
                </div>
              </div>

              {/* Card : Fiche technique */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-3.5 flex items-center gap-2.5 bg-gray-50 dark:bg-slate-800/50">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Ruler className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('cartotheque.detail.specs')}</h3>
                </div>
                <div className="px-5 py-3 space-y-0">
                  <SpecRow icon={<Ruler className="h-4 w-4 text-slate-400" />} label={t('cartotheque.detail.scale')} value={carte.echelle} />
                  <SpecRow icon={<Printer className="h-4 w-4 text-slate-400" />} label={t('cartotheque.detail.print_format')} value={carte.format_impression} />
                  <SpecRow icon={<Calendar className="h-4 w-4 text-slate-400" />} label={t('cartotheque.detail.edition_date')} value={formatDate(carte.date_edition)} />
                  <SpecRow icon={<User className="h-4 w-4 text-slate-400" />} label={t('cartotheque.detail.realisateur')} value={carte.realisateur || carte.auteur} />
                  <SpecRow icon={<Tag className="h-4 w-4 text-slate-400" />} label={t('cartotheque.detail.author')} value={carte.auteur} />
                  <SpecRow icon={<Building className="h-4 w-4 text-slate-400" />} label={t('cartotheque.detail.source')} value={carte.source} />
                  <SpecRow icon={<FolderOpen className="h-4 w-4 text-slate-400" />} label={t('cartotheque.detail.type')} value={
                    carte.type_carte === 'dynamique' ? t('cartotheque.type.dynamic') :
                    carte.type_carte === 'fichier' ? t('cartotheque.type.file') :
                    carte.type_carte === 'url_externe' ? t('cartotheque.type.external') :
                    t('cartotheque.type.empty')
                  } last />
                </div>
              </div>

              {/* Card : Mots-clés */}
              {motsCles.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
                  <div className="px-5 py-3.5 flex items-center gap-2.5 bg-gray-50 dark:bg-slate-800/50">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('cartotheque.detail.keywords')}</h3>
                  </div>
                  <div className="px-5 py-4 flex flex-wrap gap-2">
                    {motsCles.map((m) => (
                      <Badge key={m} variant="outline" className="text-xs font-normal py-1 px-2.5 rounded-lg">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Card : Couches */}
              {carte.couches_associees && carte.couches_associees.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
                  <div className="px-5 py-3.5 flex items-center gap-2.5 bg-gray-50 dark:bg-slate-800/50">
                    <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('cartotheque.detail.layers')}</h3>
                  </div>
                  <div className="px-5 py-4 flex flex-wrap gap-2">
                    {carte.couches_associees.map((couche) => {
                      const config = LAYER_ICON_MAP[couche]
                      return (
                        <Badge
                          key={couche}
                          variant="secondary"
                          className="text-xs rounded-lg py-1 px-2.5"
                          style={config ? { backgroundColor: `${config.color}15`, color: config.color, borderColor: `${config.color}30` } : {}}
                        >
                          {couche}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Card : Prix */}
              <div
                className={cn(
                  'rounded-2xl shadow-lg border overflow-hidden',
                  carte.is_payant
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-amber-200 dark:border-amber-800'
                    : 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800'
                )}
              >
                <div className="px-5 py-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      {t('cartotheque.detail.price')}
                    </p>
                    <p
                      className={cn(
                        'text-3xl font-bold',
                        carte.is_payant ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                      )}
                    >
                      {carte.prix_formate}
                    </p>
                  </div>
                  <CarteBadge isPayant={carte.is_payant} prixFormate={carte.prix_formate} size="lg" withPrice />
                </div>
              </div>

              {/* Card : Métadonnées */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-3.5 flex items-center gap-2.5 bg-gray-50 dark:bg-slate-800/50">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Hash className="h-4 w-4 text-slate-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Métadonnées</h3>
                </div>
                <div className="px-5 py-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5" />
                    <span>Identifiant : <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">#{carte.id}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Créée le <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(carte.date_creation)}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Modifiée le <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(carte.date_modification)}</span></span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ===== Composants utilitaires ===== */

function SpecRow({ icon, label, value, last = false }: { icon: React.ReactNode; label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-2.5', !last && 'border-b border-gray-50 dark:border-slate-800')}>
      <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className={cn(
        'text-sm font-medium text-slate-800 dark:text-slate-200 max-w-[160px] truncate text-right',
        !value && 'text-slate-300 dark:text-slate-600'
      )}>
        {value || '—'}
      </span>
    </div>
  )
}
