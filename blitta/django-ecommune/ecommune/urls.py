"""
Configuration des URLs pour le projet E-Commune
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),
    
    # Page d'accueil (tableau de bord)
    path('', TemplateView.as_view(template_name='dashboard/home.html'), name='home'),
    
    # Applications
    path('dashboard/', include('dashboard.urls')),
    path('alerts/', include('alerts.urls')),
    path('geoportail/', include('geoportail.urls')),
    path('market/', include('market.urls')),
    
    # API REST
    path('api/', include([
        path('dashboard/', include('dashboard.api_urls')),
        path('alerts/', include('alerts.api_urls')),
        path('market/', include('market.api_urls')),
        path('geoportail/', include('geoportail.api_urls')),
    ])),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)