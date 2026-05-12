"""
URLs de l'application dashboard
"""
from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    # Vues web
    path('', views.home, name='home'),
    
    # API
    path('api/stats/', views.dashboard_stats_api, name='stats_api'),
    path('api/projects/', views.projects_api, name='projects_api'),
]