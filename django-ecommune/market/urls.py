"""
URLs de l'application market
"""
from django.urls import path
from . import views

app_name = 'market'

urlpatterns = [
    # Vues web
    path('', views.market_price_list, name='list'),
    path('<int:pk>/', views.market_price_detail, name='detail'),
    path('create/', views.market_price_create, name='create'),
    path('<int:pk>/update/', views.market_price_update, name='update'),
    path('<int:pk>/delete/', views.market_price_delete, name='delete'),
    
    # API
    path('api/', views.market_prices_api, name='api'),
    path('api/stats/', views.market_stats_api, name='stats_api'),
]