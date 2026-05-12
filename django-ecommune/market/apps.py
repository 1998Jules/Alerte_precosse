"""
Application Market pour la gestion des prix du marché
"""
from django.apps import AppConfig


class MarketConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'market'
    verbose_name = 'Marché'