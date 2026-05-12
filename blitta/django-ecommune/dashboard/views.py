"""
Vues pour le dashboard
"""
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta
from .models import DashboardStats, CommuneInfo, Project
from alerts.models import Alert
from market.models import MarketPrice


@login_required
def home(request):
    """Vue principale du tableau de bord"""
    # Récupérer les statistiques
    stats, created = DashboardStats.objects.get_or_create(
        pk=1,
        defaults={
            'population': 12450,
            'households': 2100,
            'projects': 24,
            'active_projects': 16,
            'infrastructures': 47,
            'operational_infra': 43,
            'total_area': 185.5,
            'density': 67.1,
        }
    )
    
    # Récupérer les informations communales
    commune_info, created = CommuneInfo.objects.get_or_create(
        pk=1,
        defaults={
            'name': 'Blitta 2 Agbandi',
            'region': 'Centrale',
            'prefecture': 'Blitta',
            'population': 12450,
            'area': 185.5,
            'center_latitude': 8.3201,
            'center_longitude': 1.04757,
            'default_zoom': 10,
        }
    )
    
    # Récupérer les alertes récentes
    recent_alerts = Alert.objects.filter(
        status='active'
    ).order_by('-created_at')[:5]
    
    # Récupérer les projets récents
    recent_projects = Project.objects.all().order_by('-created_at')[:6]
    
    # Récupérer les prix du marché récents
    recent_prices = MarketPrice.objects.all().order_by('-created_at')[:4]
    
    context = {
        'stats': stats,
        'commune_info': commune_info,
        'recent_alerts': recent_alerts,
        'recent_projects': recent_projects,
        'recent_prices': recent_prices,
        'page_title': 'Tableau de bord',
    }
    
    return render(request, 'dashboard/home.html', context)


def dashboard_stats_api(request):
    """API pour les statistiques du dashboard"""
    try:
        stats, _ = DashboardStats.objects.get_or_create(
            pk=1,
            defaults={
                'population': 12450,
                'households': 2100,
                'projects': Project.objects.count(),
                'active_projects': Project.objects.filter(status='in_progress').count(),
                'infrastructures': 47,
                'operational_infra': 43,
                'total_area': 185.5,
                'density': 67.1,
            }
        )
        
        # Mettre à jour les compteurs
        stats.projects = Project.objects.count()
        stats.active_projects = Project.objects.filter(status='in_progress').count()
        stats.save()
        
        data = {
            'success': True,
            'data': {
                'population': stats.population,
                'households': stats.households,
                'projects': stats.projects,
                'active_projects': stats.active_projects,
                'infrastructures': stats.infrastructures,
                'operational_infra': stats.operational_infra,
                'total_area': stats.total_area,
                'density': stats.density,
            }
        }
        
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def projects_api(request):
    """API pour les projets"""
    try:
        projects = Project.objects.all().order_by('-created_at')
        
        data = {
            'success': True,
            'data': [
                {
                    'id': project.id,
                    'title': project.title,
                    'description': project.description,
                    'status': project.status,
                    'priority': project.priority,
                    'progress': project.progress,
                    'start_date': project.start_date.isoformat() if project.start_date else None,
                    'end_date': project.end_date.isoformat() if project.end_date else None,
                    'budget': float(project.budget) if project.budget else None,
                    'location': project.location,
                    'created_at': project.created_at.isoformat(),
                }
                for project in projects
            ]
        }
        
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)