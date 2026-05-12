"""
Django settings for horison project - CORRIGÉ pour géoportail
"""
import os
import sys
from pathlib import Path

# ============================================
# CONFIGURATION DE BASE
# ============================================

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-668s^s2k9$u3_zs8mps1+1dy5-)+%*dlmr3*yp-phgep2&!!vp'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# ============================================
# CONFIGURATION CORS (TRÈS IMPORTANT)
# ============================================

# CORS doit être en premier dans MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configuration CORS pour Next.js
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js par défaut
    "http://127.0.0.1:3000",  # Alternative localhost
    "http://localhost:3001",  # Si vous utilisez ce port
]

# Pour le développement, vous pouvez aussi utiliser (moins sécurisé) :
CORS_ALLOW_ALL_ORIGINS = True

# Autoriser les headers nécessaires
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

# Autoriser les méthodes HTTP
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# ============================================
# APPLICATIONS DJANGO
# ============================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',  # Important pour la géométrie
    'rest_framework',      # Pour l'API
    'corsheaders',         # Pour CORS
    'geoportail',          # Votre app géoportail
]

# ============================================
# CONFIGURATION BASE DE DONNÉES
# ============================================

# Utiliser PostgreSQL avec PostGIS (recommandé pour la géométrie)
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'Ecommune',
        'USER': 'postgres',
        'PASSWORD': '1234',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Si PostgreSQL ne fonctionne pas, utilisez SQLite en backup
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# ============================================
# CONFIGURATION URLs ET TEMPLATES
# ============================================

ROOT_URLCONF = 'horison.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'horison.wsgi.application'

# ============================================
# VALIDATION DES MOTS DE PASSE
# ============================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ============================================
# INTERNATIONALISATION
# ============================================

LANGUAGE_CODE = 'fr-fr'  # Français pour votre projet
TIME_ZONE = 'Africa/Lome'  # Fuseau horaire du Togo
USE_I18N = True
USE_TZ = True

# ============================================
# FICHIERS STATIQUES
# ============================================

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ============================================
# CONFIGURATION SPÉCIFIQUE WINDOWS (GDAL/GEOS)
# ============================================

# Détecter automatiquement le chemin du venv
venv_path = BASE_DIR / ".venv"

if os.path.exists(venv_path):
    osgeo_path = venv_path / "Lib" / "site-packages" / "osgeo"
    if osgeo_path.exists():
        # Ajouter OSGeo au PATH
        current_path = os.environ.get("PATH", "")
        os.environ["PATH"] = f"{osgeo_path};{current_path}"
        
        # Configurer les chemins des librairies
        gdal_dll = osgeo_path / "gdal.dll"
        geos_dll = osgeo_path / "geos_c.dll"
        
        if gdal_dll.exists():
            os.environ["GDAL_LIBRARY_PATH"] = str(gdal_dll)
        
        if geos_dll.exists():
            os.environ["GEOS_LIBRARY_PATH"] = str(geos_dll)
        
        # Configurer PROJ_LIB
        proj_paths = [
            osgeo_path / "data" / "proj",
            venv_path / "share" / "proj",
            r"C:\Program Files\PostgreSQL\15\share\contrib\postgis-3.5\proj"
        ]
        
        for proj_path in proj_paths:
            if proj_path.exists():
                os.environ["PROJ_LIB"] = str(proj_path)
                break

# ============================================
# AUTRES CONFIGURATIONS
# ============================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Logging pour voir les erreurs
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'geoportail': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}