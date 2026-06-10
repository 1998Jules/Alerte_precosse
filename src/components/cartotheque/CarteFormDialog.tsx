// src/components/cartotheque/CarteFormDialog.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, Upload, Link, Layers } from 'lucide-react'
import { useLanguage } from '@/app/contexts/LanguageContext'

// Couches du géoportail disponibles
const GEO_LAYERS = [
  { id: 'cantons', name: 'Cantons' },
  { id: 'communes', name: 'Communes' },
  { id: 'routes', name: 'Routes' },
  { id: 'hopitaux', name: 'Hôpitaux' },
  { id: 'jardins', name: 'Jardins d\'enfants' },
  { id: 'colleges', name: 'Collèges' },
  { id: 'lycees', name: 'Lycées' },
  { id: 'peas', name: 'Forages PEA' },
  { id: 'bornefontaines', name: 'Bornes fontaines' },
  { id: 'marches', name: 'Marchés' },
  { id: 'cooperatives', name: 'Coopératives' },
  { id: 'magasins', name: 'Magasins / Intrants' },
  { id: 'chateaux', name: 'Châteaux' },
  { id: 'terrains', name: 'Terrains / Stades' },
]

interface Domaine {
  id: number
  nom: string
  slug: string
  icone: string
  couleur: string
}

interface CarteFormDialogProps {
  domaines: Domaine[]
  onSuccess: () => void
  onCancel: () => void
}

export default function CarteFormDialog({ domaines, onSuccess, onCancel }: CarteFormDialogProps) {
  const { t } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formulaire
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [domaineId, setDomaineId] = useState<string>('')
  const [statut, setStatut] = useState<string>('brouillon')
  const [auteur, setAuteur] = useState('')
  const [source, setSource] = useState('')
  const [motsCles, setMotsCles] = useState('')

  // Source de données
  const [dataSourceType, setDataSourceType] = useState<'layers' | 'url' | 'file'>('layers')
  const [geojsonUrl, setGeojsonUrl] = useState('')
  const [vignetteFile, setVignetteFile] = useState<File | null>(null)
  const [geojsonFile, setGeojsonFile] = useState<File | null>(null)
  const [selectedLayers, setSelectedLayers] = useState<string[]>([])

  // Configuration carte
  const [centreLat, setCentreLat] = useState('8.20150')
  const [centreLng, setCentreLng] = useState('1.16599')
  const [zoomDefault, setZoomDefault] = useState('12')
  const [fondCarte, setFondCarte] = useState('osm')

  const toggleLayer = (layerId: string) => {
    setSelectedLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('titre', titre)
      formData.append('description', description)
      if (domaineId) formData.append('domaine', domaineId)
      formData.append('statut', statut)
      formData.append('auteur', auteur)
      formData.append('source', source)
      formData.append('mots_cles', motsCles)
      formData.append('centre_lat', centreLat)
      formData.append('centre_lng', centreLng)
      formData.append('zoom_default', zoomDefault)
      formData.append('fond_carte', fondCarte)

      if (vignetteFile) formData.append('vignette', vignetteFile)
      if (geojsonFile) formData.append('geojson_file', geojsonFile)
      if (geojsonUrl) formData.append('geojson_url', geojsonUrl)

      // Ajouter les couches associées comme JSON
      if (dataSourceType === 'layers' && selectedLayers.length > 0) {
        formData.append('couches_associees', JSON.stringify(selectedLayers))
      } else {
        formData.append('couches_associees', JSON.stringify([]))
      }

      const res = await fetch('/api/cartotheque/cartes', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Erreur lors de la création')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Titre */}
      <div className="space-y-2">
        <Label htmlFor="titre">{t('cartotheque.form.titre')} *</Label>
        <Input
          id="titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder={t('cartotheque.form.titre.placeholder')}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('cartotheque.form.description')}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('cartotheque.form.description.placeholder')}
          rows={3}
        />
      </div>

      {/* Domaine et statut */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('cartotheque.form.domain')}</Label>
          <Select value={domaineId} onValueChange={setDomaineId}>
            <SelectTrigger>
              <SelectValue placeholder={t('cartotheque.form.domain.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {domaines.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('cartotheque.form.status')}</Label>
          <Select value={statut} onValueChange={setStatut}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brouillon">{t('cartotheque.form.status.draft')}</SelectItem>
              <SelectItem value="publie">{t('cartotheque.form.status.published')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('cartotheque.form.author')}</Label>
          <Input
            value={auteur}
            onChange={(e) => setAuteur(e.target.value)}
            placeholder={t('cartotheque.form.author.placeholder')}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('cartotheque.form.source')}</Label>
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={t('cartotheque.form.source.placeholder')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('cartotheque.form.keywords')}</Label>
        <Input
          value={motsCles}
          onChange={(e) => setMotsCles(e.target.value)}
          placeholder={t('cartotheque.form.keywords.placeholder')}
        />
      </div>

      {/* Vignette */}
      <div className="space-y-2">
        <Label>{t('cartotheque.form.thumbnail')}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setVignetteFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          {vignetteFile && <span className="text-xs text-green-600">{vignetteFile.name}</span>}
        </div>
      </div>

      {/* Source de données */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">{t('cartotheque.form.datasource')}</Label>

        {/* Onglets source */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={dataSourceType === 'layers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDataSourceType('layers')}
            className={dataSourceType === 'layers' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Layers className="h-3.5 w-3.5 mr-1" />
            {t('cartotheque.form.datasource.layers')}
          </Button>
          <Button
            type="button"
            variant={dataSourceType === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDataSourceType('url')}
            className={dataSourceType === 'url' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Link className="h-3.5 w-3.5 mr-1" />
            {t('cartotheque.form.datasource.url')}
          </Button>
          <Button
            type="button"
            variant={dataSourceType === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDataSourceType('file')}
            className={dataSourceType === 'file' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            {t('cartotheque.form.datasource.file')}
          </Button>
        </div>

        {/* Sélection des couches du géoportail */}
        {dataSourceType === 'layers' && (
          <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 bg-gray-50">
            {GEO_LAYERS.map((layer) => (
              <label
                key={layer.id}
                className={`flex items-center gap-2 text-sm p-2 rounded cursor-pointer transition-colors ${
                  selectedLayers.includes(layer.id)
                    ? 'bg-green-100 border border-green-300'
                    : 'hover:bg-gray-100 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLayers.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                  className="rounded"
                />
                {layer.name}
              </label>
            ))}
          </div>
        )}

        {/* URL GeoJSON */}
        {dataSourceType === 'url' && (
          <Input
            value={geojsonUrl}
            onChange={(e) => setGeojsonUrl(e.target.value)}
            placeholder="http://localhost:8000/geojson/hopitale/"
          />
        )}

        {/* Fichier GeoJSON */}
        {dataSourceType === 'file' && (
          <Input
            type="file"
            accept=".json,.geojson"
            onChange={(e) => setGeojsonFile(e.target.files?.[0] || null)}
          />
        )}
      </div>

      {/* Configuration de la carte */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">{t('cartotheque.form.mapconfig')}</Label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Latitude</Label>
            <Input value={centreLat} onChange={(e) => setCentreLat(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Longitude</Label>
            <Input value={centreLng} onChange={(e) => setCentreLng(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Zoom</Label>
            <Input type="number" value={zoomDefault} onChange={(e) => setZoomDefault(e.target.value)} min="1" max="18" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('cartotheque.form.basemap')}</Label>
            <Select value={fondCarte} onValueChange={setFondCarte}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="osm">OpenStreetMap</SelectItem>
                <SelectItem value="satellite">Satellite ESRI</SelectItem>
                <SelectItem value="dark">CartoDB Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cartotheque.form.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={submitting || !titre}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('cartotheque.form.submitting')}
            </>
          ) : (
            t('cartotheque.form.submit')
          )}
        </Button>
      </div>
    </form>
  )
}