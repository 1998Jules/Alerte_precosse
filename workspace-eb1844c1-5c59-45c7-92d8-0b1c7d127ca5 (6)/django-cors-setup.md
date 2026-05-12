# Configuration CORS pour Django

## 1. Installer django-cors-headers

```bash
pip install django-cors-headers
```

## 2. Ajouter dans settings.py

```python
# Ajouter dans INSTALLED_APPS
INSTALLED_APPS = [
    # ... vos autres apps
    'corsheaders',
    # ...
]

# Ajouter dans MIDDLEWARE (au début)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Doit être au début
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configuration CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js
    "http://127.0.0.1:3000",
]

# Pour le développement (plus permissif)
CORS_ALLOW_ALL_ORIGINS = True  # Seulement en développement!

# Autoriser les headers spécifiques
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Autoriser les méthodes
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

## 3. Mettre à jour les URLs pour inclure toutes les couches

Dans `geoportail/urls.py`, assurez-vous d'avoir toutes les URLs:

```python
from django.contrib import admin
from django.urls import path
from .views import get_all_layers
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    
    # Couches administratives
    path('geojson/cantons/', views.cantons_geojson, name='cantons_geojson'),
    path('geojson/commune/', views.commune_geojson, name='commune_geojson'),
    
    # Infrastructure
    path('geojson/routes/', views.route_geojson, name='route_geojson'),
    path('geojson/terrain/', views.terrain_geojson, name='terrain_geojson'),
    
    # Santé
    path('geojson/hopitale/', views.hopital_geojson, name='hopital_geojson'),
    
    # Éducation
    path('geojson/jardin/', views.jardin_geojson, name='jardin_geojson'),
    path('geojson/college/', views.college_geojson, name='college_geojson'),
    path('geojson/lycee/', views.lycee_geojson, name='lycee_geojson'),
    
    # Hydrologie
    path('geojson/Point_eau/', views.pea_geojson, name='pea_geojson'),
    path('geojson/bornefontaine/', views.borne_geojson, name='borne_geojson'),
    
    # Économie
    path('geojson/Marches/', views.marche_geojson, name='marche_geojson'),
    path('geojson/cooperative/', views.cooperative_geojson, name='cooperative_geojson'),
    path('geojson/magasin/', views.magazin_geojson, name='magazin_geojson'),
    
    # Patrimoine
    path('geojson/chateau/', views.chateau_geojson, name='chateau_geojson'),
    
    # API globale
    path('api/layers/', get_all_layers, name='get_all_layers'),
]
```

## 4. Démarrer le serveur Django

```bash
python manage.py runserver 0.0.0.0:8000
```

## 5. Tester l'API

Ouvrez dans votre navigateur:
- http://localhost:8000/geojson/cantons/
- http://localhost:8000/geojson/commune/

Vous devriez voir des données GeoJSON.