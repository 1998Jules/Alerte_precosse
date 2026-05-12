"""
URLs de l'application alerts
"""
from django.urls import path
from . import views

app_name = 'alerts'

urlpatterns = [
    # Vues web
    path('', views.alert_list, name='list'),
    path('<int:pk>/', views.alert_detail, name='detail'),
    path('create/', views.alert_create, name='create'),
    path('<int:pk>/update/', views.alert_update, name='update'),
    path('<int:pk>/delete/', views.alert_delete, name='delete'),
    
    # API
    path('api/', views.alerts_api, name='api'),
]