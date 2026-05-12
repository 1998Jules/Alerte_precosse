"""
URLs de l'application geoportail
"""
from django.urls import path
from . import views

app_name = 'geoportail'

urlpatterns = [
    # Vue principale
    path('', views.geoportal_home, name='home'),
    
    # API
    path('api/layers/', views.get_all_layers, name='get_all_layers'),
    path('api/stats/', views.geoportal_stats_api, name='stats_api'),
]