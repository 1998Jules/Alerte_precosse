"""
Modèles pour le dashboard
"""
from django.db import models
from django.contrib.gis.db import models as gis_models


class DashboardStats(models.Model):
    """Statistiques du tableau de bord"""
    population = models.IntegerField(default=12450)
    households = models.IntegerField(default=2100)
    projects = models.IntegerField(default=24)
    active_projects = models.IntegerField(default=16)
    infrastructures = models.IntegerField(default=47)
    operational_infra = models.IntegerField(default=43)
    total_area = models.FloatField(default=185.5)  # km²
    density = models.FloatField(default=67.1)  # hab/km²
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Statistiques du tableau de bord"
        verbose_name_plural = "Statistiques du tableau de bord"


class CommuneInfo(models.Model):
    """Informations générales sur la commune"""
    name = models.CharField(max_length=200, default="Blitta 2 Agbandi")
    description = models.TextField(blank=True)
    mayor_name = models.CharField(max_length=200, blank=True)
    population = models.IntegerField(default=12450)
    area = models.FloatField(default=185.5)  # km²
    region = models.CharField(max_length=100, default="Centrale")
    prefecture = models.CharField(max_length=100, default="Blitta")
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Champs pour le géoportail
    center_latitude = models.FloatField(default=8.3201)
    center_longitude = models.FloatField(default=1.04757)
    default_zoom = models.IntegerField(default=10)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Information communale"
        verbose_name_plural = "Informations communales"


class Project(models.Model):
    """Projets de la commune"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('planned', 'Planifié'),
            ('in_progress', 'En cours'),
            ('completed', 'Terminé'),
            ('suspended', 'Suspendu'),
        ],
        default='planned'
    )
    priority = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Faible'),
            ('medium', 'Moyen'),
            ('high', 'Élevé'),
            ('critical', 'Critique'),
        ],
        default='medium'
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    progress = models.IntegerField(default=0, help_text="Pourcentage d'avancement")
    
    # Localisation (optionnel)
    location = models.CharField(max_length=200, blank=True)
    geometry = gis_models.PointField(null=True, blank=True, srid=4326)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Projet"
        verbose_name_plural = "Projets"
        ordering = ['-created_at']