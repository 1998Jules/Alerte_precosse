# 🚀 Application Django E-Commune - Guide de Déploiement

## 📋 Vue d'ensemble

J'ai recréé votre application Next.js en une application Django complète avec toutes les fonctionnalités :

- ✅ **Tableau de bord** avec statistiques en temps réel
- ✅ **Système d'alertes** avec niveaux et statuts
- ✅ **Géoportail interactif** avec Leaflet et vos données géographiques
- ✅ **Gestion des prix du marché** avec tendances
- ✅ **Panneau d'administration** Django intégré
- ✅ **Design responsive** avec Bootstrap 5
- ✅ **API REST** pour toutes les fonctionnalités

## 🏗️ Architecture du Projet

```
django-ecommune/
├── ecommune/           # Configuration principale
│   ├── settings.py      # Configuration Django
│   ├── urls.py          # URLs principales
│   └── wsgi.py          # Configuration WSGI
├── dashboard/           # Tableau de bord
│   ├── models.py        # Modèles de données
│   ├── views.py         # Vues et API
│   └── urls.py          # URLs de l'app
├── alerts/              # Système d'alertes
│   ├── models.py        # Modèle Alert
│   ├── views.py         # Vues et API
│   ├── forms.py         # Formulaires
│   └── urls.py          # URLs de l'app
├── market/              # Prix du marché
│   ├── models.py        # Modèles MarketPrice
│   ├── views.py         # Vues et API
│   ├── forms.py         # Formulaires
│   └── urls.py          # URLs de l'app
├── geoportail/          # Géoportail
│   ├── views.py         # Vues et API
│   └── urls.py          # URLs de l'app
├── templates/           # Templates HTML
│   ├── base.html        # Template de base
│   ├── dashboard/      # Templates dashboard
│   └── geoportail/     # Templates géoportail
├── static/             # Fichiers statiques
├── media/               # Fichiers médias
└── manage.py           # Script de gestion Django
```

## 🛠️ Prérequis

### 1. Python et Environnement Virtuel
```bash
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

### 2. Base de Données PostgreSQL avec PostGIS
```sql
-- Créer la base de données
CREATE DATABASE Ecommune;

-- Activer l'extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

### 3. Variables d'Environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos informations
nano .env
```

## 🚀 Démarrage Rapide

### 1. Appliquer les Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 2. Créer un Superutilisateur
```bash
python manage.py createsuperuser
```

### 3. Démarrer le Serveur
```bash
python manage.py runserver 0.0.0.0:8000
```

### 4. Accéder à l'Application
- **Tableau de bord** : http://localhost:8000/
- **Géoportail** : http://localhost:8000/geoportail/
- **Alertes** : http://localhost:8000/alerts/
- **Marché** : http://localhost:8000/market/
- **Admin Django** : http://localhost:8000/admin/

## 🗺️ Intégration avec Vos Données Existantes

### Importer vos modèles géographiques

1. **Copiez vos modèles Django existants** dans `geoportail/models.py`
2. **Adaptez les vues** dans `geoportail/views.py`
3. **Mettez à jour les URLs** si nécessaire

### Exemple d'import de vos modèles :
```python
# Dans geoportail/models.py
from django.contrib.gis.db import models as gis_models

# Vos modèles existants
class Cantons(gis_models.Model):
    gid = models.IntegerField(primary_key=True)
    canton = models.CharField(max_length=100)
    # ... autres champs
    geom = gis_models.MultiPolygonField(srid=4326)
    
    class Meta:
        db_table = "cant_bli2"
        managed = False
```

## 📡 API Endpoints

### Tableau de Bord
- `GET /api/dashboard/stats/` - Statistiques
- `GET /api/dashboard/projects/` - Projets

### Alertes
- `GET /api/alerts/` - Lister les alertes
- `POST /api/alerts/` - Créer une alerte
- `PUT /api/alerts/{id}/` - Modifier une alerte
- `DELETE /api/alerts/{id}/` - Supprimer une alerte

### Marché
- `GET /api/market/` - Lister les prix
- `POST /api/market/` - Ajouter un prix
- `GET /api/market/stats/` - Statistiques du marché

### Géoportail
- `GET /geoportail/api/layers/` - Toutes les couches GeoJSON
- `GET /geoportail/api/stats/` - Statistiques du géoportail

## 🎨 Personnalisation

### Changer les Couleurs
Modifiez les variables CSS dans `templates/base.html` :
```css
:root {
    --primary-color: #2c7a7b;
    --secondary-color: #f4a261;
    /* ... autres couleurs */
}
```

### Ajouter de Nouvelles Couches
1. Ajoutez le modèle dans `geoportail/models.py`
2. Mettez à jour `geoportail/views.py` dans `get_all_layers()`
3. Les couches apparaîtront automatiquement !

## 🔧 Configuration Avancée

### Personnaliser les Statistiques
Modifiez `dashboard/views.py` pour ajouter de nouvelles métriques.

### Ajouter des Notifications
Configurez Django Messages Framework dans `settings.py` pour les notifications système.

### Intégrer l'Authentification
Activez l'authentification Django pour sécuriser l'accès aux fonctionnalités.

## 🐛 Déploiement en Production

### 1. Configuration Sécurisée
```python
# Dans settings.py
DEBUG = False
ALLOWED_HOSTS = ['votre-domaine.com']
SECRET_KEY = 'votre-clé-secrète-très-longue'
```

### 2. Base de Données Production
Utilisez PostgreSQL avec les paramètres de performance appropriés.

### 3. Fichiers Statiques
```bash
python manage.py collectstatic --noinput
```

### 4. Serveur WSGI
Utilisez Gunicorn ou uWSGI en production :
```bash
pip install gunicorn
gunicorn ecommune.wsgi:application
```

## 🔄 Migration depuis Next.js

### Données à Transférer
- **Alertes** : Exportez depuis votre API Next.js
- **Prix du marché** : Exportez depuis votre base de données
- **Projets** : Créez un script de migration

### Avantages de la Version Django
- ✅ **Une seule application** à déployer
- ✅ **Base de données intégrée** (PostgreSQL + PostGIS)
- ✅ **Admin Django** pour la gestion
- ✅ **Performance native** Python
- ✅ **Moins de dépendances** externes

## 🆘 Support et Dépannage

### Problèmes Communs
1. **GDAL/GEOS non trouvés** : Vérifiez votre environnement virtuel
2. **PostGIS non activé** : `CREATE EXTENSION postgis;`
3. **CORS** : Configurez `CORS_ALLOWED_ORIGINS` dans settings.py
4. **Fichiers statiques** : Exécutez `collectstatic`

### Logs
Les logs sont écrits dans `logs/django.log` pour le dépannage.

## 🎉 Conclusion

Votre application Django E-Commune est maintenant prête avec :
- ✅ Toutes les fonctionnalités de votre version Next.js
- ✅ Géoportail avec vos vraies données géographiques
- ✅ Performance optimale avec une seule application
- ✅ Administration Django intégrée
- ✅ Design responsive avec Bootstrap 5

**Lancez `python manage.py runserver` et profitez de votre nouvelle plateforme !** 🚀