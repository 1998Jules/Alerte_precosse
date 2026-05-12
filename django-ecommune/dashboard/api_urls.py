"""
API URLs de l'application dashboard
"""
from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.dashboard_stats_api, name='stats_api'),
    path('projects/', views.projects_api, name='projects_api'),
]