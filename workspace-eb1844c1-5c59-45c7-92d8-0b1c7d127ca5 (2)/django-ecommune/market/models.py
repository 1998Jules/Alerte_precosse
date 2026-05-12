"""
Modèles pour les prix du marché
"""
from django.db import models
from django.contrib.auth.models import User
from django.contrib.gis.db import models as gis_models


class MarketPrice(models.Model):
    """Prix du marché"""
    
    PRODUCT_CATEGORIES = [
        ('cereals', 'Céréales'),
        ('tubers', 'Tubercules'),
        ('vegetables', 'Légumes'),
        ('fruits', 'Fruits'),
        ('legumes', 'Légumineuses'),
        ('meat', 'Viande'),
        ('fish', 'Poisson'),
        ('dairy', 'Produits laitiers'),
        ('other', 'Autre'),
    ]
    
    AVAILABILITY_CHOICES = [
        ('abundant', 'Abondante'),
        ('good', 'Bonne'),
        ('limited', 'Limitée'),
        ('scarce', 'Rare'),
        ('out_of_stock', 'Rupture'),
    ]
    
    QUALITY_CHOICES = [
        ('excellent', 'Excellente'),
        ('good', 'Bonne'),
        ('average', 'Moyenne'),
        ('poor', 'Mauvaise'),
    ]
    
    # Informations sur le produit
    product = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=PRODUCT_CATEGORIES)
    
    # Prix et unité
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='FCFA')
    unit = models.CharField(
        max_length=20,
        choices=[
            ('kg', 'kg'),
            ('tonne', 'tonne'),
            ('piece', 'pièce'),
            ('sac', 'sac (50kg)'),
            ('litre', 'litre'),
            ('bunch', 'botte'),
            ('dozen', 'douzaine'),
        ]
    )
    
    # Tendance
    trend = models.CharField(
        max_length=10,
        help_text="Ex: +15%, -5%, 0%"
    )
    
    # Localisation
    market = models.CharField(max_length=100)
    location = models.CharField(max_length=200, blank=True)
    geometry = gis_models.PointField(null=True, blank=True, srid=4326)
    
    # Qualité et disponibilité
    availability = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default='good'
    )
    quality = models.CharField(
        max_length=20,
        choices=QUALITY_CHOICES,
        default='good'
    )
    
    # Métadonnées
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Informations additionnelles
    supplier = models.CharField(max_length=100, blank=True)
    origin = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Prix du marché"
        verbose_name_plural = "Prix du marché"
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['product', 'market']),
            models.Index(fields=['category']),
            models.Index(fields=['recorded_at']),
            models.Index(fields=['availability']),
        ]
    
    def __str__(self):
        return f"{self.product} - {self.market} ({self.price} {self.currency}/{self.unit})"
    
    @property
    def price_per_kg(self):
        """Retourne le prix au kg si possible"""
        if self.unit == 'kg':
            return float(self.price)
        elif self.unit == 'tonne':
            return float(self.price) / 1000
        elif self.unit == 'sac':  # 50kg
            return float(self.price) / 50
        return None
    
    @property
    def is_price_increasing(self):
        """Vérifie si le prix est en augmentation"""
        return self.trend.startswith('+')
    
    @property
    def days_since_recorded(self):
        """Jours depuis l'enregistrement"""
        from django.utils import timezone
        return (timezone.now() - self.recorded_at).days


class MarketTrend(models.Model):
    """Tendances des prix sur le temps"""
    product = models.CharField(max_length=100)
    market = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=MarketPrice.PRODUCT_CATEGORIES)
    
    # Statistiques
    avg_price = models.DecimalField(max_digits=10, decimal_places=2)
    min_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Période
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Tendance
    price_change = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    price_change_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Tendance du marché"
        verbose_name_plural = "Tendances du marché"
        ordering = ['-period_end']
        indexes = [
            models.Index(fields=['product', 'market']),
            models.Index(fields=['period_end']),
        ]
    
    def __str__(self):
        return f"{self.product} - {self.market} ({self.period_end})"