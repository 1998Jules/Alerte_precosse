"""
Vues pour les alertes
"""
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.db.models import Q
from .models import Alert
from .forms import AlertForm


@login_required
def alert_list(request):
    """Liste des alertes"""
    alerts = Alert.objects.all().order_by('-created_at')
    
    # Filtres
    status_filter = request.GET.get('status')
    level_filter = request.GET.get('level')
    type_filter = request.GET.get('type')
    search = request.GET.get('search')
    
    if status_filter:
        alerts = alerts.filter(status=status_filter)
    if level_filter:
        alerts = alerts.filter(level=level_filter)
    if type_filter:
        alerts = alerts.filter(type=type_filter)
    if search:
        alerts = alerts.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(location__icontains=search)
        )
    
    context = {
        'alerts': alerts,
        'page_title': 'Alertes communales',
        'status_choices': Alert.STATUS_CHOICES,
        'level_choices': Alert.LEVEL_CHOICES,
        'type_choices': Alert.TYPE_CHOICES,
    }
    
    return render(request, 'alerts/alert_list.html', context)


@login_required
def alert_detail(request, pk):
    """Détail d'une alerte"""
    alert = get_object_or_404(Alert, pk=pk)
    
    context = {
        'alert': alert,
        'page_title': f'Alerte: {alert.title}',
    }
    
    return render(request, 'alerts/alert_detail.html', context)


@login_required
@require_http_methods(["GET", "POST"])
def alert_create(request):
    """Créer une nouvelle alerte"""
    if request.method == 'POST':
        form = AlertForm(request.POST)
        if form.is_valid():
            alert = form.save(commit=False)
            alert.created_by = request.user
            alert.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Alerte créée avec succès',
                    'alert': {
                        'id': alert.id,
                        'title': alert.title,
                        'level': alert.level,
                        'type': alert.type,
                        'status': alert.status,
                        'created_at': alert.created_at.isoformat(),
                    }
                })
            
            return redirect('alerts:detail', pk=alert.pk)
    else:
        form = AlertForm()
    
    context = {
        'form': form,
        'page_title': 'Nouvelle alerte',
        'action': 'Créer',
    }
    
    return render(request, 'alerts/alert_form.html', context)


@login_required
@require_http_methods(["GET", "POST"])
def alert_update(request, pk):
    """Modifier une alerte"""
    alert = get_object_or_404(Alert, pk=pk)
    
    if request.method == 'POST':
        form = AlertForm(request.POST, instance=alert)
        if form.is_valid():
            alert = form.save()
            
            # Si le statut passe à "résolu", enregistrer la date
            if alert.status == 'resolved' and not alert.resolved_at:
                alert.resolved_at = timezone.now()
                alert.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Alerte mise à jour avec succès',
                    'alert': {
                        'id': alert.id,
                        'title': alert.title,
                        'level': alert.level,
                        'type': alert.type,
                        'status': alert.status,
                        'updated_at': alert.updated_at.isoformat(),
                    }
                })
            
            return redirect('alerts:detail', pk=alert.pk)
    else:
        form = AlertForm(instance=alert)
    
    context = {
        'form': form,
        'alert': alert,
        'page_title': f'Modifier: {alert.title}',
        'action': 'Modifier',
    }
    
    return render(request, 'alerts/alert_form.html', context)


@login_required
@require_http_methods(["POST"])
def alert_delete(request, pk):
    """Supprimer une alerte"""
    alert = get_object_or_404(Alert, pk=pk)
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        alert.delete()
        return JsonResponse({
            'success': True,
            'message': 'Alerte supprimée avec succès'
        })
    
    alert.delete()
    return redirect('alerts:list')


# API Endpoints
def alerts_api(request):
    """API pour les alertes"""
    try:
        alerts = Alert.objects.all().order_by('-created_at')
        
        # Filtres
        status_filter = request.GET.get('status')
        level_filter = request.GET.get('level')
        type_filter = request.GET.get('type')
        search = request.GET.get('search')
        
        if status_filter:
            alerts = alerts.filter(status=status_filter)
        if level_filter:
            alerts = alerts.filter(level=level_filter)
        if type_filter:
            alerts = alerts.filter(type=type_filter)
        if search:
            alerts = alerts.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        
        data = {
            'success': True,
            'data': [
                {
                    'id': alert.id,
                    'title': alert.title,
                    'description': alert.description,
                    'type': alert.type,
                    'level': alert.level,
                    'status': alert.status,
                    'location': alert.location,
                    'created_at': alert.created_at.isoformat(),
                    'updated_at': alert.updated_at.isoformat(),
                    'resolved_at': alert.resolved_at.isoformat() if alert.resolved_at else None,
                    'created_by': alert.created_by.username if alert.created_by else None,
                }
                for alert in alerts
            ]
        }
        
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)