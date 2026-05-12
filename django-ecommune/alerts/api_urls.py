"""
API URLs de l'application alerts
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.alerts_api, name='alerts_api'),
]