'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  X, Maximize2, Minimize2, Info, Calendar, User,
  Tag, ExternalLink, Loader2, ZoomIn, ZoomOut, RotateCcw,
  Move, Layers, Ruler, Printer, MapPin, Lock, Unlock,
  Download, Share2, ChevronLeft, ChevronRight, PanelRightOpen, PanelRightClose,
} from 'lucide-react'
import { useLanguage } from '@/app/contexts/LanguageContext'

// Config des couches pour les icones
const LAYER_ICON_MAP: Record<string, { color: string; iconUrl: string | null }> = {
  hopitaux: { color: '#DC143C', iconUrl: '/icone/hopital.png' },
  jardins: { color: '#96CEB4', iconUrl: '/icone/jardin.png' },
  colleges: { color: '#87CEEB', iconUrl: '/icone/college.png' },
  lycees: { color: '#4682B4', iconUrl: '/icone/lycee.png' },
  peas: { color: '#0077BE', iconUrl: '/icone/pea.png' },
  bornefontaines: { color: '#20B2AA', iconUrl: '/icone/bornefontaine.png' },
  marches: { color: '#FFA07A', iconUrl: '/icone/marche.png' },
  chateaux: { color: '#DDA0DD', iconUrl: '/icone/chateau.png' },
  cantons: { color: '#FF6B6B', iconUrl: null },
  communes: { color: '#4ECDC4', iconUrl: null },
  routes: { color: '#45B7D1', iconUrl: null },
  terrains: { color: '#387c38', iconUrl: null },
  cooperatives: { color: '#FF8C00', iconUrl: null },
  magasins: { color: '#9370DB', iconUrl: null },
}

interface CarteTheematique {
  id: number
  titre: string
  description: string
  domaine_nom?: string | null
  domaine_couleur?: string | null
  domaine_icone?: string | null
  type_carte: string
  auteur: string
  source: string
  mots_cles: string
  date_creation: string
  geojson_url?: string
  geojson_file_url?: string
  vignette_url?: string | null
  image_url?: string | null
  couches_associees?: string[]
  centre_lat?: number
  centre_lng?: number
  zoom_default?: number
  fond_carte?: string
  // Nouveaux champs CNTIG
  echelle?: string | null
  format_impression?: string | null
  date_edition?: string | null
  realisateur?: string | null
  is_payant?: boolean
  prix?: number | null
  prix_formate?: string | null
}

interface CarteViewerProps {
  carte: CarteTheematique
  open: boolean
  onClose: () => void
}

export default function CarteViewer({ carte, open, onClose }: CarteViewerProps) {
  const { t } = useLanguage()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(true)
  const [loadingImage, setLoadingImage] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Etat du zoom et du deplacement
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [positionStart, setPositionStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Determiner l'URL de l'image a afficher
  const imageUrl = carte.image_url || carte.vignette_url || ''

  // Reinitialiser le zoom et la position quand on ouvre une nouvelle carte
  useEffect(() => {
    if (open) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      setLoadingImage(true)
      setImageError(false)
      setDownloading(false)
    }
  }, [open, carte.id])

  // Reinitialiser a la fermeture
  useEffect(() => {
    if (!open) {
      setIsFullscreen(false)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [open])

  // Gestion du zoom
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.3, 10))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => {
      const newZoom = prev / 1.3
      if (newZoom < 0.3) return 0.3
      return newZoom
    })
  }, [])

  const handleResetView = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Zoom avec la molette de la souris
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev * 1.1, 10))
    } else {
      setZoom(prev => {
        const newZoom = prev / 1.1
        if (newZoom < 0.3) return 0.3
        return newZoom
      })
    }
  }, [])

  // Gestion du deplacement (drag)
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
    setPosition({
      x: positionStart.x + dx,
      y: positionStart.y + dy,
    })
  }, [isDragging, dragStart, positionStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Chargement de l'image
  const handleImageLoad = useCallback(() => {
    setLoadingImage(false)
  }, [])

  const handleImageError = useCallback(() => {
    setLoadingImage(false)
    setImageError(true)
  }, [])

  // Formatage de la date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Telechargement de la carte (gratuite uniquement)
  const handleDownload = useCallback(async () => {
    if (carte.is_payant) return

    setDownloading(true)
    try {
      const response = await fetch(`/api/cartotheque/cartes/${carte.id}/download`)
      if (!response.ok) {
        throw new Error('Erreur de telechargement')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${carte.titre?.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '_') || 'carte'}_${carte.id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Erreur telechargement:', err)
      // Fallback: ouvrir l'image dans un nouvel onglet
      if (imageUrl) {
        window.open(imageUrl, '_blank')
      }
    } finally {
      setDownloading(false)
    }
  }, [carte, imageUrl])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${isFullscreen ? 'max-w-full w-full h-screen' : 'max-w-[95vw] w-[95vw]'} p-0 gap-0 overflow-hidden`}>
        <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[90vh]'}`}>

          {/* ===== ZONE DE VISUALISATION DE L'IMAGE (GAUCHE - plus grande) ===== */}
          <div className="flex-1 relative bg-gray-100 min-w-0">
            {/* Chargement */}
            {loadingImage && imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600">{t('cartotheque.loading.map')}</p>
                </div>
              </div>
            )}

            {/* Erreur de chargement */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">{t('cartotheque.detail.image_unavailable')}</p>
                </div>
              </div>
            )}

            {/* Aucune image */}
            {!imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">{t('cartotheque.detail.no_image')}</p>
                </div>
              </div>
            )}

            {/* Conteneur de l'image avec zoom et deplacement */}
            <div
              ref={containerRef}
              className="w-full h-full overflow-hidden select-none"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              {imageUrl && (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={carte.titre}
                    className="max-w-full max-h-full object-contain"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    draggable={false}
                  />
                </div>
              )}
            </div>

            {/* Barre du haut avec titre et controles */}
            <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between p-4 bg-gradient-to-b from-black/40 to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 bg-white/20 hover:bg-white/40 text-white shrink-0">
                  <X className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate max-w-[300px]">{carte.titre}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {carte.domaine_nom && (
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: `${carte.domaine_couleur || '#10b981'}CC`,
                          color: '#fff',
                          borderColor: 'transparent',
                        }}
                      >
                        {carte.domaine_nom}
                      </Badge>
                    )}
                    {carte.is_payant && carte.prix ? (
                      <Badge className="bg-amber-500 text-white border-0 text-xs gap-0.5">
                        <Lock className="h-2.5 w-2.5" />
                        {carte.prix_formate || `${carte.prix.toLocaleString('fr-FR')} F CFA`}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500 text-white border-0 text-xs gap-0.5">
                        <Unlock className="h-2.5 w-2.5" />
                        Gratuit
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Telechargement */}
                {!carte.is_payant && imageUrl && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{t('cartotheque.download')}</span>
                  </Button>
                )}
                {carte.is_payant && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 gap-1.5 h-9"
                    disabled
                  >
                    <Lock className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('cartotheque.download.paid')}</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-9 w-9 p-0 bg-white/20 hover:bg-white/40 text-white"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className="h-9 w-9 p-0 bg-white/20 hover:bg-white/40 text-white"
                >
                  {showInfoPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Controles de zoom en bas a droite */}
            <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
                title="Zoom avant"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
                title="Zoom arriere"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={handleResetView}
                className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
                title="Reinitialiser la vue"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Indicateur de zoom */}
            {zoom !== 1 && (
              <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow px-3 py-1.5 flex items-center gap-2">
                <Move className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-600 font-medium">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* ===== PANNEAU D'INFORMATIONS (DROITE - plus compact) ===== */}
          {showInfoPanel && (
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0">
              {/* En-tete avec couleur de domaine */}
              <div
                className="p-5 relative"
                style={{ background: `linear-gradient(135deg, ${carte.domaine_couleur || '#10b981'}15, ${carte.domaine_couleur || '#10b981'}30)` }}
              >
                <h2 className="text-lg font-bold text-gray-900 mb-2 pr-2">{carte.titre}</h2>

                {/* Domaine + Prix */}
                <div className="flex items-center gap-2 flex-wrap">
                  {carte.domaine_nom && (
                    <Badge
                      style={{
                        backgroundColor: `${carte.domaine_couleur || '#10b981'}20`,
                        color: carte.domaine_couleur || '#10b981',
                        borderColor: `${carte.domaine_couleur || '#10b981'}40`,
                      }}
                    >
                      {carte.domaine_nom}
                    </Badge>
                  )}
                  {carte.is_payant && carte.prix ? (
                    <Badge className="bg-amber-500 text-white border-0 font-semibold">
                      <Lock className="h-3 w-3 mr-1" />
                      {carte.prix_formate || `${carte.prix.toLocaleString('fr-FR')} F CFA`}
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500 text-white border-0 font-semibold">
                      <Unlock className="h-3 w-3 mr-1" />
                      Gratuit
                    </Badge>
                  )}
                </div>
              </div>

              {/* Section Caracteristiques du produit */}
              <div className="p-5 space-y-4">
                {/* Description */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('cartotheque.detail.description')}
                  </Label>
                  <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                    {carte.description || t('cartotheque.no.description')}
                  </p>
                </div>

                <Separator />

                {/* Fiche technique - Style CNTIG */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                    {t('cartotheque.detail.specs')}
                  </Label>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2.5">
                    {/* Echelle */}
                    {carte.echelle && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Ruler className="h-4 w-4 text-gray-400" />
                          <span>{t('cartotheque.detail.scale')}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border">
                          {carte.echelle}
                        </span>
                      </div>
                    )}

                    {/* Format d'impression */}
                    {carte.format_impression && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Printer className="h-4 w-4 text-gray-400" />
                          <span>{t('cartotheque.detail.print_format')}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border">
                          {carte.format_impression}
                        </span>
                      </div>
                    )}

                    {/* Date d'edition */}
                    {(carte.date_edition || carte.date_creation) && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{t('cartotheque.detail.edition_date')}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border">
                          {formatDate(carte.date_edition) || formatDate(carte.date_creation)}
                        </span>
                      </div>
                    )}

                    {/* Realisateur */}
                    {(carte.realisateur || carte.auteur) && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{t('cartotheque.detail.realisateur')}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border max-w-[140px] truncate">
                          {carte.realisateur || carte.auteur}
                        </span>
                      </div>
                    )}

                    {/* Source */}
                    {carte.source && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                          <span>{t('cartotheque.detail.source')}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border max-w-[140px] truncate">
                          {carte.source}
                        </span>
                      </div>
                    )}

                    {/* Prix */}
                    {(carte.is_payant !== undefined) && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {carte.is_payant ? (
                            <Lock className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Unlock className="h-4 w-4 text-emerald-500" />
                          )}
                          <span>{t('cartotheque.detail.price')}</span>
                        </div>
                        <span className={`text-sm font-bold px-2 py-0.5 rounded border ${carte.is_payant ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>
                          {carte.is_payant && carte.prix
                            ? (carte.prix_formate || `${carte.prix.toLocaleString('fr-FR')} F CFA`)
                            : t('cartotheque.badge.free')
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Mots-cles */}
                {carte.mots_cles && (
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      {t('cartotheque.detail.keywords')}
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {carte.mots_cles.split(',').map((mot, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{mot.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Couches associees */}
                {carte.couches_associees && carte.couches_associees.length > 0 && (
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      {t('cartotheque.detail.layers')}
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {carte.couches_associees.map((couche) => {
                        const config = LAYER_ICON_MAP[couche]
                        return (
                          <Badge
                            key={couche}
                            variant="secondary"
                            className="text-xs"
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
                  </div>
                )}

                {/* Type de carte */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                    {t('cartotheque.detail.type')}
                  </Label>
                  <p className="text-sm text-gray-700 capitalize">
                    {carte.type_carte === 'dynamique' ? t('cartotheque.type.dynamic') :
                     carte.type_carte === 'url_externe' ? t('cartotheque.type.external') :
                     carte.type_carte === 'fichier' ? t('cartotheque.type.file') :
                     t('cartotheque.type.empty')}
                  </p>
                </div>

                <Separator />

                {/* Bouton de telechargement */}
                {!carte.is_payant && imageUrl && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {downloading ? t('cartotheque.loading') : t('cartotheque.download.free')}
                  </Button>
                )}
                {carte.is_payant && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <Lock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-amber-700">{t('cartotheque.download.paid')}</p>
                    {carte.prix && (
                      <p className="text-lg font-bold text-amber-600 mt-1">
                        {carte.prix_formate || `${carte.prix.toLocaleString('fr-FR')} F CFA`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
