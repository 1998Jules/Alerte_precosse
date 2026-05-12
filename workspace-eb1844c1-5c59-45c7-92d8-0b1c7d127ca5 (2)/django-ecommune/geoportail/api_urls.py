"""
API URLs de l'application geoportail
"""
from django.urls import path
from . import views

urlpatterns = [
    path('layers/', views.get_all_layers, name='get_all_layers'),
    path('stats/', views.geoportal_stats_api, name='stats_api'),
]