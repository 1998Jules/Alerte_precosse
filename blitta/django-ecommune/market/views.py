"""
Vues pour les prix du marché
"""
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.db.models import Q, Avg, Min, Max
from django.utils import timezone
from datetime import timedelta
from .models import MarketPrice, MarketTrend
from .forms import MarketPriceForm


@login_required
def market_price_list(request):
    """Liste des prix du marché"""
    prices = MarketPrice.objects.all().order_by('-recorded_at')
    
    # Filtres
    market_filter = request.GET.get('market')
    category_filter = request.GET.get('category')
    product_filter = request.GET.get('product')
    search = request.GET.get('search')
    
    if market_filter:
        prices = prices.filter(market__icontains=market_filter)
    if category_filter:
        prices = prices.filter(category=category_filter)
    if product_filter:
        prices = prices.filter(product__icontains=product_filter)
    if search:
        prices = prices.filter(
            Q(product__icontains=search) |
            Q(market__icontains=search) |
            Q(supplier__icontains=search)
        )
    
    # Statistiques
    total_products = prices.values('product').distinct().count()
    avg_price = prices.aggregate(Avg('price'))['price__avg'] or 0
    
    context = {
        'prices': prices,
        'total_products': total_products,
        'avg_price': avg_price,
        'page_title': 'Prix du marché',
        'categories': MarketPrice.PRODUCT_CATEGORIES,
        'availability_choices': MarketPrice.AVAILABILITY_CHOICES,
    }
    
    return render(request, 'market/market_price_list.html', context)


@login_required
def market_price_detail(request, pk):
    """Détail d'un prix du marché"""
    price = get_object_or_404(MarketPrice, pk=pk)
    
    # Prix similaires
    similar_prices = MarketPrice.objects.filter(
        product=price.product
    ).exclude(pk=pk).order_by('-recorded_at')[:5]
    
    context = {
        'price': price,
        'similar_prices': similar_prices,
        'page_title': f'Prix: {price.product}',
    }
    
    return render(request, 'market/market_price_detail.html', context)


@login_required
@require_http_methods(["GET", "POST"])
def market_price_create(request):
    """Ajouter un nouveau prix"""
    if request.method == 'POST':
        form = MarketPriceForm(request.POST)
        if form.is_valid():
            price = form.save(commit=False)
            price.recorded_by = request.user
            price.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Prix ajouté avec succès',
                    'price': {
                        'id': price.id,
                        'product': price.product,
                        'price': float(price.price),
                        'currency': price.currency,
                        'unit': price.unit,
                        'market': price.market,
                        'trend': price.trend,
                        'recorded_at': price.recorded_at.isoformat(),
                    }
                })
            
            return redirect('market:detail', pk=price.pk)
    else:
        form = MarketPriceForm()
    
    context = {
        'form': form,
        'page_title': 'Nouveau prix',
        'action': 'Ajouter',
    }
    
    return render(request, 'market/market_price_form.html', context)


@login_required
@require_http_methods(["GET", "POST"])
def market_price_update(request, pk):
    """Modifier un prix du marché"""
    price = get_object_or_404(MarketPrice, pk=pk)
    
    if request.method == 'POST':
        form = MarketPriceForm(request.POST, instance=price)
        if form.is_valid():
            price = form.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Prix mis à jour avec succès',
                    'price': {
                        'id': price.id,
                        'product': price.product,
                        'price': float(price.price),
                        'currency': price.currency,
                        'unit': price.unit,
                        'market': price.market,
                        'trend': price.trend,
                        'updated_at': price.updated_at.isoformat(),
                    }
                })
            
            return redirect('market:detail', pk=price.pk)
    else:
        form = MarketPriceForm(instance=price)
    
    context = {
        'form': form,
        'price': price,
        'page_title': f'Modifier: {price.product}',
        'action': 'Modifier',
    }
    
    return render(request, 'market/market_price_form.html', context)


@login_required
@require_http_methods(["POST"])
def market_price_delete(request, pk):
    """Supprimer un prix du marché"""
    price = get_object_or_404(MarketPrice, pk=pk)
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        price.delete()
        return JsonResponse({
            'success': True,
            'message': 'Prix supprimé avec succès'
        })
    
    price.delete()
    return redirect('market:list')


# API Endpoints
def market_prices_api(request):
    """API pour les prix du marché"""
    try:
        prices = MarketPrice.objects.all().order_by('-recorded_at')
        
        # Filtres
        market_filter = request.GET.get('market')
        category_filter = request.GET.get('category')
        product_filter = request.GET.get('product')
        search = request.GET.get('search')
        
        if market_filter:
            prices = prices.filter(market__icontains=market_filter)
        if category_filter:
            prices = prices.filter(category=category_filter)
        if product_filter:
            prices = prices.filter(product__icontains=product_filter)
        if search:
            prices = prices.filter(
                Q(product__icontains=search) |
                Q(market__icontains=search) |
                Q(supplier__icontains=search)
            )
        
        data = {
            'success': True,
            'data': [
                {
                    'id': price.id,
                    'product': price.product,
                    'category': price.category,
                    'price': float(price.price),
                    'currency': price.currency,
                    'unit': price.unit,
                    'trend': price.trend,
                    'market': price.market,
                    'location': price.location,
                    'availability': price.availability,
                    'quality': price.quality,
                    'supplier': price.supplier,
                    'origin': price.origin,
                    'recorded_at': price.recorded_at.isoformat(),
                    'updated_at': price.updated_at.isoformat(),
                    'recorded_by': price.recorded_by.username if price.recorded_by else None,
                }
                for price in prices
            ]
        }
        
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def market_stats_api(request):
    """API pour les statistiques du marché"""
    try:
        prices = MarketPrice.objects.all()
        
        # Statistiques générales
        total_prices = prices.count()
        unique_products = prices.values('product').distinct().count()
        unique_markets = prices.values('market').distinct().count()
        
        # Prix par catégorie
        category_stats = {}
        for category, _ in MarketPrice.PRODUCT_CATEGORIES:
            cat_prices = prices.filter(category=category)
            if cat_prices.exists():
                category_stats[category] = {
                    'count': cat_prices.count(),
                    'avg_price': float(cat_prices.aggregate(Avg('price'))['price__avg'] or 0),
                    'min_price': float(cat_prices.aggregate(Min('price'))['price__min'] or 0),
                    'max_price': float(cat_prices.aggregate(Max('price'))['price__max'] or 0),
                }
        
        # Tendances récentes
        recent_prices = prices.filter(
            recorded_at__gte=timezone.now() - timedelta(days=7)
        )
        
        increasing_prices = recent_prices.filter(trend__startswith('+')).count()
        decreasing_prices = recent_prices.filter(trend__startswith('-')).count()
        stable_prices = recent_prices.filter(trend='0%').count()
        
        data = {
            'success': True,
            'data': {
                'total_prices': total_prices,
                'unique_products': unique_products,
                'unique_markets': unique_markets,
                'category_stats': category_stats,
                'trends': {
                    'increasing': increasing_prices,
                    'decreasing': decreasing_prices,
                    'stable': stable_prices,
                    'total_recent': recent_prices.count(),
                }
            }
        }
        
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)