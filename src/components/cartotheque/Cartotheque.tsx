// src/components/cartotheque/Cartotheque.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  MapPin, Search, Filter, Plus, Eye, Grid3X3, List,
  Hospital, School, Droplets, Building, ShoppingBag, TreePine,
  Landmark, Loader2, XCircle, Calendar, User, Tag, Map,
  ChevronDown, Layers, LayoutGrid,
} from 'lucide-react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import CarteViewer from './CarteViewer'
import CarteFormDialog from './CarteFormDialog'

// Types
interface Domaine {
  id: number
  nom: string
  slug: string
  description: string
  icone: string
  couleur: string
  ordre: number
  nombre_cartes: number
}

interface CarteTheematique {
  id: number
  titre: string
  description: string
  domaine: number | null
  domaine_nom: string | null
  domaine_couleur: string | null
  domaine_icone: string | null
  vignette_url: string | null
  type_carte: string
  statut: string
  auteur: string
  source: string
  mots_cles: string
  date_creation: string
  date_modification: string
  // Detail fields
  geojson_url?: string
  geojson_file_url?: string
  couches_associees?: string[]
  centre_lat?: number
  centre_lng?: number
  zoom_default?: number
  fond_carte?: string
}

// Icône dynamique selon le domaine
const DomainIcon = ({ iconName, className = "h-5 w-5" }: { iconName: string; className?: string }) => {
  const iconMap: Record<string, any> = {
    Hospital, School, Droplets, Building, ShoppingBag, TreePine,
    Landmark, MapPin, Map, Layers,
  }
  const Icon = iconMap[iconName] || MapPin
  return <Icon className={className} />
}

// Carte vignette placeholder avec dégradé
const CartePlaceholder = ({ couleur, titre }: { couleur: string; titre: string }) => (
  <div
    className="w-full h-48 rounded-t-lg flex items-center justify-center relative overflow-hidden"
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

export default function Cartotheque() {
  const { t } = useLanguage()

  // State
  const [cartes, setCartes] = useState<CarteTheematique[]>([])
  const [domaines, setDomaines] = useState<Domaine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomaine, setSelectedDomaine] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCarte, setSelectedCarte] = useState<CarteTheematique | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  // Charger les domaines
  useEffect(() => {
    const fetchDomaines = async () => {
      try {
        const res = await fetch('/api/cartotheque/domaines')
        const data = await res.json()
        if (data.results) {
          setDomaines(data.results)
        } else if (Array.isArray(data)) {
          setDomaines(data)
        }
      } catch (err) {
        console.error('Erreur chargement domaines:', err)
      }
    }
    fetchDomaines()
  }, [])

  // Charger les cartes
  const fetchCartes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      let url = '/api/cartotheque/cartes?statut=publie'
      if (selectedDomaine) url += `&domaine=${selectedDomaine}`
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.results) {
        setCartes(data.results)
      } else if (Array.isArray(data)) {
        setCartes(data)
      } else if (data.success === false) {
        setError(data.error || 'Erreur de chargement')
        setCartes([])
      }
    } catch (err: any) {
      setError(err.message)
      setCartes([])
    } finally {
      setLoading(false)
    }
  }, [selectedDomaine, searchTerm])

  useEffect(() => {
    fetchCartes()
  }, [fetchCartes])

  // Ouvrir la visualisation d'une carte
  const handleViewCarte = async (carte: CarteTheematique) => {
    try {
      const res = await fetch(`/api/cartotheque/cartes/${carte.id}`)
      const detail = await res.json()
      setSelectedCarte(detail)
      setViewerOpen(true)
    } catch (err) {
      console.error('Erreur chargement détail carte:', err)
      setSelectedCarte(carte)
      setViewerOpen(true)
    }
  }

  // Callback après création de carte
  const handleCarteCreated = () => {
    setFormOpen(false)
    fetchCartes()
  }

  // Filtrer côté client en plus du filtrage serveur
  const filteredCartes = cartes.filter(carte => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      carte.titre.toLowerCase().includes(term) ||
      carte.description?.toLowerCase().includes(term) ||
      carte.mots_cles?.toLowerCase().includes(term) ||
      carte.auteur?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('cartotheque.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('cartotheque.subtitle')}
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              {t('cartotheque.publish')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('cartotheque.form.title')}</DialogTitle>
            </DialogHeader>
            <CarteFormDialog
              domaines={domaines}
              onSuccess={handleCarteCreated}
              onCancel={() => setFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('cartotheque.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres par domaine */}
            <div className="flex flex-wrap gap-2 items-center">
              <Filter className="h-4 w-4 text-gray-400" />
              <Button
                variant={selectedDomaine === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDomaine(null)}
                className={selectedDomaine === null ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {t('cartotheque.all')}
              </Button>
              {domaines.map((domaine) => (
                <Button
                  key={domaine.id}
                  variant={selectedDomaine === domaine.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDomaine(selectedDomaine === domaine.id ? null : domaine.id)}
                  className={selectedDomaine === domaine.id ? '' : ''}
                  style={selectedDomaine === domaine.id ? {
                    backgroundColor: domaine.couleur,
                    borderColor: domaine.couleur,
                  } : {}}
                >
                  <DomainIcon iconName={domaine.icone} className="h-3.5 w-3.5 mr-1" />
                  {domaine.nom}
                  {domaine.nombre_cartes > 0 && (
                    <span className="ml-1 text-xs opacity-70">({domaine.nombre_cartes})</span>
                  )}
                </Button>
              ))}
            </div>

            {/* Mode de vue */}
            <div className="flex items-center gap-1 border-l pl-4">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* État de chargement */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">{t('cartotheque.loading')}</h3>
              <p className="text-sm text-blue-700">{t('cartotheque.loading.desc')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">{t('cartotheque.error')}</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Résultats */}
      {!loading && !error && (
        <>
          {/* Compteur de résultats */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCartes.length} {filteredCartes.length > 1 ? t('cartotheque.maps.plural') : t('cartotheque.maps.singular')}
              {selectedDomaine && domaines.find(d => d.id === selectedDomaine) && (
                <span> — {domaines.find(d => d.id === selectedDomaine)?.nom}</span>
              )}
            </p>
          </div>

          {/* Vue grille */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCartes.map((carte) => (
                <Card
                  key={carte.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden group"
                  onClick={() => handleViewCarte(carte)}
                >
                  {/* Vignette */}
                  {carte.vignette_url ? (
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
  src={carte.vignette_url}
  alt={carte.titre}
  className="object-cover group-hover:scale-105 transition-transform duration-300 absolute inset-0 w-full h-full"
/>
                    </div>
                  ) : (
                    <CartePlaceholder
                      couleur={carte.domaine_couleur || '#10b981'}
                      titre={carte.titre}
                    />
                  )}

                  <CardContent className="p-4">
                    {/* Badge domaine */}
                    <div className="flex items-center gap-2 mb-2">
                      {carte.domaine_nom && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `${carte.domaine_couleur}20`,
                            color: carte.domaine_couleur,
                            borderColor: `${carte.domaine_couleur}40`,
                          }}
                        >
                          {carte.domaine_icone && (
                            <DomainIcon iconName={carte.domaine_icone} className="h-3 w-3 mr-1" />
                          )}
                          {carte.domaine_nom}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {carte.type_carte === 'dynamique' ? t('cartotheque.type.dynamic') :
                         carte.type_carte === 'url_externe' ? t('cartotheque.type.external') :
                         carte.type_carte === 'fichier' ? t('cartotheque.type.file') :
                         t('cartotheque.type.empty')}
                      </Badge>
                    </div>

                    {/* Titre */}
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {carte.titre}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {carte.description || t('cartotheque.no.description')}
                    </p>

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(carte.date_creation).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {carte.auteur && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[80px]">{carte.auteur}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Bouton voir au survol */}
                  <div className="absolute bottom-16 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      {t('cartotheque.view')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Vue liste */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredCartes.map((carte) => (
                <Card
                  key={carte.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
                  onClick={() => handleViewCarte(carte)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Miniature */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {carte.vignette_url ? (
                          <img
  src={carte.vignette_url}
  alt={carte.titre}
  className="object-cover w-full h-full"
/>
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${carte.domaine_couleur || '#10b981'}22, ${carte.domaine_couleur || '#10b981'}66)` }}
                          >
                            <Map className="h-6 w-6" style={{ color: carte.domaine_couleur || '#10b981' }} />
                          </div>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {carte.domaine_nom && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{
                                backgroundColor: `${carte.domaine_couleur}20`,
                                color: carte.domaine_couleur,
                              }}
                            >
                              {carte.domaine_nom}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{carte.titre}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{carte.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(carte.date_creation).toLocaleDateString('fr-FR')}
                          </span>
                          {carte.auteur && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {carte.auteur}
                            </span>
                          )}
                          {carte.mots_cles && (
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {carte.mots_cles.split(',').slice(0, 3).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewCarte(carte)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('cartotheque.view')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Aucun résultat */}
          {filteredCartes.length === 0 && !loading && (
            <div className="text-center py-16">
              <Map className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {searchTerm || selectedDomaine
                  ? t('cartotheque.no.results')
                  : t('cartotheque.empty')
                }
              </h3>
              <p className="text-sm text-gray-500">
                {searchTerm
                  ? `${t('cartotheque.search.for')} "${searchTerm}"`
                  : t('cartotheque.empty.desc')
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* Visualiseur de carte plein écran */}
      {selectedCarte && (
        <CarteViewer
          carte={selectedCarte}
          open={viewerOpen}
          onClose={() => {
            setViewerOpen(false)
            setSelectedCarte(null)
          }}
        />
      )}
    </div>
  )
}