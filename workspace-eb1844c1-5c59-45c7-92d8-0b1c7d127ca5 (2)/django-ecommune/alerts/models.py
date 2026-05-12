"""
Modèles pour les alertes
"""
from django.db import models
from django.contrib.auth.models import User
from django.contrib.gis.db import models as gis_models


class Alert(models.Model):
    """Alertes communales"""
    
    TYPE_CHOICES = [
        ('price', 'Prix'),
        ('drought', 'Sécheresse'),
        ('flood', 'Inondation'),
        ('infrastructure', 'Infrastructure'),
        ('health', 'Santé'),
        ('security', 'Sécurité'),
        ('weather', 'Météo'),
        ('other', 'Autre'),
    ]
    
    LEVEL_CHOICES = [
        ('low', 'Faible'),
        ('medium', 'Moyen'),
        ('high', 'Élevé'),
        ('critical', 'Critique'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('resolved', 'Résolue'),
        ('archived', 'Archivée'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    
    # Localisation
    location = models.CharField(max_length=200, blank=True)
    geometry = gis_models.PointField(null=True, blank=True, srid=4326)
    
    # Métadonnées
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Informations additionnelles
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    
    class Meta:
        verbose_name = "Alerte"
        verbose_name_plural = "Alertes"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'level']),
            models.Index(fields=['type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_level_display()})"
    
    @property
    def is_critical(self):
        return self.level == 'critical'
    
    @property
    def days_since_creation(self):
        return (timezone.now() - self.created_at).days