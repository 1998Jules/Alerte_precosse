# Géoportail - Architecture Simplifiée

## 🎯 Vue d'ensemble

Le géoportail utilise maintenant une architecture simplifiée où l'API Django fournit toutes les couches en un seul appel via `/geoportail/api/layers/`.

## 🔄 Flux de données

```
Django API → Next.js API → Frontend React
     ↓              ↓              ↓
/geoportail/   /api/geoportail   GeoPortal
api/layers/        ↓              ↓
    └─────────────┘──────────────> GeoportalMap
```

## 📡 Endpoints

### 1. API Django (votre code)
- **URL** : `http://localhost:8000/geoportail/api/layers/`
- **Méthode** : `GET`
- **Retour** : Toutes les couches GeoJSON avec métadonnées

```json
{
  "success": true,
  "layers": {
    "cantons": {
      "name": "Cantons",
      "visible": true,
      "opacity": 0.6,
      "color": "#FF6B6B",
      "data": {
        "type": "FeatureCollection",
        "features": [...]
      }
    },
    // ... autres couches
  }
}
```

### 2. API Next.js (bridge)
- **URL** : `http://localhost:3000/api/geoportail`
- **Méthode** : `GET`
- **Rôle** : Transformer les données Django pour le frontend

## 🗂️ Couches disponibles

| ID | Nom | Catégorie | Description |
|----|----|----------|-------------|
| `cantons` | Cantons | Administratif | Limites des cantons |
| `communes` | Communes | Administratif | Limites des communes |
| `routes` | Routes | Infrastructure | Réseau routier |
| `hopitaux` | Hôpitaux | Santé | Établissements de santé |
| `jardins` | Jardins | Éducation | Jardins d'enfants |
| `colleges` | Collèges | Éducation | Collèges |
| `lycees` | Lycées | Éducation | Lycées |
| `peas` | Forages PEA | Hydrologie | Points d'eau |
| `bornes` | Bornes fontaines | Hydrologie | Bornes publiques |
| `marches` | Marchés | Économie | Marchés publics |
| `cooperatives` | Coopératives | Économie | Coopératives agricoles |
| `magasins` | Magasins | Économie | Magasins d'intrants |
| `chateaux` | Châteaux | Patrimoine | Monuments |
| `terrains` | Terrains | Infrastructure | Terrains/stades |

## 🎨 Composants

### 1. GeoportalMap.tsx
- **Rôle** : Affichage pur de la carte Leaflet
- **Fonctionnalités** :
  - 8 basemaps différents
  - Plein écran
  - Popups automatiques
  - Contrôles de carte

### 2. GeoPortal.tsx
- **Rôle** : Panneau de contrôle et gestion des couches
- **Fonctionnalités** :
  - Chargement depuis l'API
  - Organisation par catégories
  - Gestion des états (chargement/erreur)
  - Panneau de détails des entités

## 🔧 Configuration requise

### 1. Django CORS
Dans `settings.py` :
```python
INSTALLED_APPS = [
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### 2. URLs Django
Dans `geoportail/urls.py` :
```python
urlpatterns = [
    # ...
    path('api/layers/', views.get_all_layers, name='get_all_layers'),
]
```

## 🚀 Démarrage

### 1. Démarrer Django
```bash
cd votre-projet-django
python manage.py runserver 0.0.0.0:8000
```

### 2. Démarrer Next.js
```bash
cd votre-projet-nextjs
bun run dev
```

### 3. Accéder au géoportail
1. Ouvrir `http://localhost:3000`
2. Cliquer sur "Géoportail" dans le menu
3. Les couches se chargent automatiquement depuis Django

## 🐛 Dépannage

### Si les couches ne chargent pas :
1. **Vérifier Django** : `http://localhost:8000/geoportail/api/layers/`
2. **Vérifier CORS** : Les erreurs CORS apparaissent dans la console
3. **Vérifier Next.js** : `http://localhost:3000/api/geoportail`

### Messages d'erreur :
- **🟡 Chargement...** : Communication avec Django en cours
- **🔴 Erreur** : Django inaccessible ou CORS mal configuré
- **🟢 X couches** : Django accessible et couches chargées

## 📊 Avantages de cette architecture

1. **Performance** : Un seul appel API pour toutes les couches
2. **Simplicité** : Pas de gestion individuelle des URLs
3. **Cohérence** : Django gère toutes les couches de manière unifiée
4. **Maintenance** : Ajouter une couche = modifier uniquement Django
5. **Flexibilité** : Les couleurs et métadonnées viennent de Django

## 🔄 Évolution future

Pour ajouter une nouvelle couche :
1. Ajouter le modèle Django
2. Ajouter la vue GeoJSON
3. Ajouter la couche dans `get_all_layers`
4. **Pas de modification Next.js nécessaire** !