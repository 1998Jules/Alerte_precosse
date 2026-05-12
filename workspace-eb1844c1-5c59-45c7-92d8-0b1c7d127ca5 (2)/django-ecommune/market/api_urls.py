"""
API URLs de l'application market
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.market_prices_api, name='market_prices_api'),
    path('stats/', views.market_stats_api, name='market_stats_api'),
]