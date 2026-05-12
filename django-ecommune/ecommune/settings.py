"""
Configuration Django pour l'application E-Commune
Version complète avec toutes les fonctionnalités
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import os
import sys
from pathlib import Path

# ============================================
# CONFIGURATION GIS CRITIQUE (DOIT ÊTRE EN HAUT)
# ============================================

BASE_DIR = Path(__file__).resolve().parent.parent

# 1. DÉSACTIVER LES FONCTIONNALITÉS PROBABLES
os.environ['PROJ_NETWORK'] = 'OFF'
os.environ['PROJ_DEBUG'] = '0'

# 2. UTILISER PROJ DE VOTRE VENV (GDAL 3.11.4)
# Le chemin devrait être dans votre venv
venv_path = r"D:\Horison\.venv"

# Chercher proj.db dans le venv
proj_paths_to_try = [
    os.path.join(venv_path, "Lib", "site-packages", "osgeo", "data", "proj"),
    os.path.join(venv_path, "Lib", "site-packages", "osgeo", "proj"),
    os.path.join(venv_path, "Lib", "site-packages", "pyproj", "proj_dir", "share", "proj"),
    os.path.join(venv_path, "share", "proj"),
]

for proj_path in proj_paths_to_try:
    proj_db_path = os.path.join(proj_path, "proj.db")
    if os.path.exists(proj_db_path):
        os.environ['PROJ_LIB'] = proj_path
        print(f"✓ PROJ_LIB trouvé: {proj_path}")
        break
else:
    # Si non trouvé, désactiver la recherche automatique
    os.environ['PROJ_LIB'] = r'D:\Horison\.venv\Lib\site-packages\osgeo\data\proj'
    print(f"⚠ PROJ_LIB configuré par défaut")

# 3. CONFIGURER GDAL_DATA
gdal_data_paths = [
    os.path.join(venv_path, "Lib", "site-packages", "osgeo", "data", "gdal"),
    os.path.join(venv_path, "share", "gdal"),
]

for gdal_path in gdal_data_paths:
    if os.path.exists(gdal_path):
        os.environ['GDAL_DATA'] = gdal_path
        print(f"✓ GDAL_DATA trouvé: {gdal_path}")
        break

# 4. AJOUTER OSGEO AU PATH
osgeo_path = os.path.join(venv_path, "Lib", "site-packages", "osgeo")
if os.path.exists(osgeo_path):
    # Ajouter au début du PATH pour priorité
    os.environ["PATH"] = osgeo_path + ";" + os.environ["PATH"]
    print(f"✓ OSGeo ajouté au PATH: {osgeo_path}")

# 5. CONFIGURER LES CHEMINS DES LIBRAIRIES
GDAL_LIBRARY_PATH = os.path.join(osgeo_path, "gdal.dll")
GEOS_LIBRARY_PATH = os.path.join(osgeo_path, "geos_c.dll")

# Vérifier l'existence
if not os.path.exists(GDAL_LIBRARY_PATH):
    print(f"❌ GDAL library introuvable: {GDAL_LIBRARY_PATH}")
    # Chercher dans d'autres emplacements
    for root, dirs, files in os.walk(venv_path):
        for file in files:
            if file == "gdal.dll":
                GDAL_LIBRARY_PATH = os.path.join(root, file)
                print(f"✓ GDAL trouvé: {GDAL_LIBRARY_PATH}")
                break

if not os.path.exists(GEOS_LIBRARY_PATH):
    print(f"❌ GEOS library introuvable: {GEOS_LIBRARY_PATH}")
    for root, dirs, files in os.walk(venv_path):
        for file in files:
            if file == "geos_c.dll":
                GEOS_LIBRARY_PATH = os.path.join(root, file)
                print(f"✓ GEOS trouvé: {GEOS_LIBRARY_PATH}")
                break

print("=" * 50)
print("CONFIGURATION GIS:")
print(f"  GDAL_LIBRARY_PATH: {GDAL_LIBRARY_PATH}")
print(f"  GEOS_LIBRARY_PATH: {GEOS_LIBRARY_PATH}")
print(f"  PROJ_LIB: {os.environ.get('PROJ_LIB', 'Non défini')}")
print(f"  GDAL_DATA: {os.environ.get('GDAL_DATA', 'Non défini')}")
print("=" * 50)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-668s^s2k9$u3_zs8mps1+1dy5-)+%*dlmr3*yp-phgep2&!!vp'

# SECURITY WARNING: don't run with debug turned on in p
# Charger les variables d'environnement
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ============================================
# SÉCURITÉ
# ============================================
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-e-commune-key-change-in-production')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = ['*']  # À restreindre en production

# ============================================
# MIDDLEWARE (CORS en premier pour l'API)
# ============================================
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

# ============================================
# CONFIGURATION CORS
# ============================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

CORS_ALLOW_ALL_ORIGINS = DEBUG  # Plus permissif en développement
CORS_ALLOW_CREDENTIALS = True

# ============================================
# APPLICATIONS
# ============================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'rest_framework',
    'corsheaders',
    'widget_tweaks',
    'crispy_forms',
    'crispy_bootstrap5',
    # Nos applications
    'dashboard',
    'alerts',
    'geoportail',
    'market',
    'admin_panel',
]

# ============================================
# BASE DE DONNÉES
# ============================================
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.getenv('DB_NAME', 'Ecommune'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', '1234'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# ============================================
# REST FRAMEWORK
# ============================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # À restreindre en production
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# ============================================
# CONFIGURATION CRISPY FORMS
# ============================================
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"

# ============================================
# URLS ET TEMPLATES
# ============================================
ROOT_URLCONF = 'ecommune.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'ecommune.wsgi.application'

# ============================================
# INTERNATIONALISATION
# ============================================
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Lome'
USE_I18N = True
USE_TZ = True

# ============================================
# FICHIERS STATIQUES
# ============================================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ============================================
# AUTHENTIFICATION
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

LOGIN_URL = '/admin/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# ============================================
# CONFIGURATION SPÉCIFIQUE
# ============================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Messages
from django.contrib.messages import constants as messages
MESSAGE_TAGS = {
    messages.ERROR: 'danger',
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'ecommune': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# ============================================
# CONFIGURATION GDAL/GEOS (Windows)
# ============================================
if os.name == 'nt':  # Windows
    venv_path = BASE_DIR / "venv"
    if venv_path.exists():
        osgeo_path = venv_path / "Lib" / "site-packages" / "osgeo"
        if osgeo_path.exists():
            os.environ["PATH"] = f"{osgeo_path};{os.environ.get('PATH', '')}"
            
            gdal_dll = osgeo_path / "gdal.dll"
            geos_dll = osgeo_path / "geos_c.dll"
            
            if gdal_dll.exists():
                os.environ["GDAL_LIBRARY_PATH"] = str(gdal_dll)
            if geos_dll.exists():
                os.environ["GEOS_LIBRARY_PATH"] = str(geos_dll)