'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Map as MapIcon,
  Filter,
  LayoutGrid,
  List,
  RefreshCw,
  AlertCircle,
  FileText,
  ImageIcon,
  Check,
  Lock,
  X,
  Plus,
  Loader2,
  XCircle,
  Layers,
} from 'lucide-react'
import type { CarteTheematique, Domaine } from './types'
import { CarteCard } from './CarteCard'
import CarteFormDialog from './CarteFormDialog'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/app/contexts/LanguageContext'

type PriceFilter = 'all' | 'free' | 'paid'
type ViewMode = 'grid' | 'list'

// Icône dynamique selon le domaine
const DomainIcon = ({ iconName, className = 'h-5 w-5' }: { iconName: string; className?: string }) => {
  const iconMap: Record<string, any> = {
    Hospital: AlertCircle, School: AlertCircle, Droplets: AlertCircle, Building: AlertCircle,
    ShoppingBag: AlertCircle, TreePine: AlertCircle, Landmark: AlertCircle, MapPin: MapIcon,
    Map: MapIcon, Layers: Layers, Heart: AlertCircle, GraduationCap: AlertCircle,
    Building2: AlertCircle, Wheat: AlertCircle, TrendingUp: AlertCircle, Church: AlertCircle,
    ThermometerSun: AlertCircle, Waves: AlertCircle, Sprout: AlertCircle, BookOpen: FileText,
  }
  const Icon = iconMap[iconName] || MapIcon
  return <Icon className={className} />
}

/**
 * Vue principale de la cartothèque.
 *
 * Fonctionnalités :
 *  - recherche plein texte avec debounce (titre, description, mots-clés, auteur)
 *  - filtre par domaine thématique (depuis API /api/cartotheque/domaines)
 *  - filtre par tarif (toutes / gratuites / payantes)
 *  - grille de cartes avec badge Gratuit/Payant superposé sur chaque média
 *  - bouton "Voir" → ouverture du modal agrandi avec détails + téléchargement
 *  - bouton "Publier une carte" → formulaire de création
 *  - états : chargement (skeleton), erreur, vide
 *  - stats rapides (total, gratuites, payantes)
 */
export function CartothequeView() {
  const { t } = useLanguage()

  // Données
  const [cartes, setCartes] = useState<CarteTheematique[]>([])
  const [domaines, setDomaines] = useState<Domaine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtres
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [domaineFilter, setDomaineFilter] = useState<string>('tous')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Formulaire de publication
  const [showForm, setShowForm] = useState(false)

  // Debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timer)
  }, [search])

  // Charger les domaines depuis l'API
  useEffect(() => {
    const fetchDomaines = async () => {
      try {
        const res = await fetch('/api/cartotheque/domaines')
        const data = await res.json()
        if (data.results) {
          setDomaines(data.results)
        } else if (Array.isArray(data)) {
          setDomaines(data)
        } else if (data.data && Array.isArray(data.data)) {
          setDomaines(data.data)
        }
      } catch (err) {
        console.error('Erreur chargement domaines:', err)
      }
    }
    fetchDomaines()
  }, [])

  // Fetch des cartes avec filtres
  const fetchCartes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('statut', 'publie')
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (domaineFilter !== 'tous') params.set('domaine', domaineFilter)
      if (priceFilter === 'free') params.set('is_payant', 'false')
      if (priceFilter === 'paid') params.set('is_payant', 'true')

      const url = `/api/cartotheque/cartes?${params.toString()}`
      const resp = await fetch(url, { cache: 'no-store' })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const json = await resp.json()
      const data: CarteTheematique[] = json?.data ?? json?.results ?? (Array.isArray(json) ? json : [])
      setCartes(data)
    } catch (err) {
      console.error('[cartotheque] fetch error:', err)
      setError(t('cartotheque.error'))
      setCartes([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, domaineFilter, priceFilter, t])

  useEffect(() => {
    fetchCartes()
  }, [fetchCartes])

  // Stats calculées
  const stats = useMemo(() => {
    const total = cartes.length
    const gratuites = cartes.filter((c) => !c.is_payant).length
    const payantes = cartes.filter((c) => c.is_payant).length
    return { total, gratuites, payantes }
  }, [cartes])

  // Plus besoin de handleVoir — CarteCard navigue directement vers /carte/[id]

  const clearFilters = () => {
    setSearch('')
    setDomaineFilter('tous')
    setPriceFilter('all')
  }

  const hasActiveFilters =
    debouncedSearch !== '' || domaineFilter !== 'tous' || priceFilter !== 'all'

  return (
    <div className="w-full">
      {/* Bandeau titre compact + stats + bouton publier */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow">
          <MapIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {t('cartotheque.title')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('cartotheque.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="bg-white dark:bg-slate-800 gap-1">
            <span className="font-bold text-slate-700 dark:text-slate-200">{stats.total}</span>
            <span className="text-slate-500">{t('cartotheque.published')}</span>
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 gap-1 border-emerald-200 dark:border-emerald-900">
            <Check className="h-3 w-3" />
            {stats.gratuites} {t('cartotheque.badge.free')}
          </Badge>
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 gap-1 border-amber-200 dark:border-amber-900">
            <Lock className="h-3 w-3" />
            {stats.payantes} {t('cartotheque.badge.paid')}
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 ml-2"
        >
          <Plus className="h-4 w-4" />
          {t('cartotheque.publish')}
        </Button>
      </div>

      {/* Barre de filtres */}
      <div className="mb-4 rounded-xl border bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          {/* Recherche */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="search"
              placeholder={t('cartotheque.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
              aria-label={t('cartotheque.search')}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtre domaine */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
            <Select value={domaineFilter} onValueChange={setDomaineFilter}>
              <SelectTrigger className="w-full lg:w-48 h-10" aria-label="Filtrer par domaine">
                <SelectValue placeholder={t('cartotheque.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">{t('cartotheque.all')}</SelectItem>
                {domaines.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    <span className="flex items-center gap-2">
                      <DomainIcon iconName={d.icone} className="h-3.5 w-3.5" />
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: d.couleur }}
                      />
                      {d.nom}
                      {d.nombre_cartes > 0 && (
                        <span className="text-xs opacity-70">({d.nombre_cartes})</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre tarif */}
          <Tabs
            value={priceFilter}
            onValueChange={(v) => setPriceFilter(v as PriceFilter)}
            className="shrink-0"
          >
            <TabsList className="h-10">
              <TabsTrigger value="all" className="text-xs">
                {t('cartotheque.all')}
              </TabsTrigger>
              <TabsTrigger value="free" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                {t('cartotheque.badge.free')}
              </TabsTrigger>
              <TabsTrigger value="paid" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                {t('cartotheque.badge.paid')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Refresh + reset */}
          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10 text-xs"
                title="Réinitialiser les filtres"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={fetchCartes}
              className="h-10 w-10"
              title="Rafraîchir"
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Bascule vue grille / liste + compteur */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {loading
              ? t('cartotheque.loading')
              : `${cartes.length} ${cartes.length > 1 ? t('cartotheque.maps.plural') : t('cartotheque.maps.singular')}`}
          </p>
          <div className="flex items-center gap-1 rounded-md border p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-2"
              title="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-2"
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu : grille / liste / loading / error / empty */}
      {error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('cartotheque.error')}
          </h3>
          <p className="text-sm text-slate-500 max-w-md">{error}</p>
          <Button onClick={fetchCartes} variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Réessayer
          </Button>
        </div>
      ) : loading ? (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          )}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white dark:bg-slate-900 overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : cartes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <MapIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {hasActiveFilters ? t('cartotheque.no.results') : t('cartotheque.empty')}
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            {hasActiveFilters
              ? `${t('cartotheque.search.for')} "${debouncedSearch}"`
              : t('cartotheque.empty.desc')}
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline">
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          )}
        >
          {cartes.map((c) => (
            <CarteCard key={c.id} carte={c} />
          ))}
        </div>
      )}

      {/* Légende des badges */}
      {!loading && !error && cartes.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-lg border bg-white/60 dark:bg-slate-900/60 p-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold">Légende :</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Check className="h-2.5 w-2.5" /> GRATUIT
            </span>
            Carte libre d'accès
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Lock className="h-2.5 w-2.5" /> PAYANT
            </span>
            Carte payante
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-rose-500" />
            Document PDF
          </span>
        </div>
      )}

      {/* Formulaire de publication */}
      {showForm && (
        <CarteFormDialog
          domaines={domaines.map(d => ({ id: d.id, nom: d.nom, slug: d.slug, icone: d.icone, couleur: d.couleur }))}
          onSuccess={() => {
            setShowForm(false)
            fetchCartes()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default CartothequeView
