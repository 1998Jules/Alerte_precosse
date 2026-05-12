"""
Vues pour le géoportail
"""
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import AsGeoJSON
from django.db.models import F
from django.views.decorators.http import require_http_methods
import json

# Import des modèles (votre code existant)

from dashboard.models import CommuneInfo, Project
from alerts.models import Alert
from market.models import MarketPrice

# Import des modèles géographiques (selon votre code Django)
try:
    from .models import (
        Cantons, Commune, Routes, Marche, Jardin, 
        College, Lycee, Pea, Bornefontaine, Chateau, 
        Hopitale, Terrain, Cooperative, Magazinbl2
    )
    DJANGO_GEO_MODELS_AVAILABLE = True
except ImportError:
    DJANGO_GEO_MODELS_AVAILABLE = False
    print("⚠️ Modèles géographiques non trouvés - utilisation des données de démonstration")


def geoportal_home(request):
    """Page principale du géoportail"""
    
    # Récupérer les informations de la commune
    commune_info, created = CommuneInfo.objects.get_or_create(
        pk=1,
        defaults={
            'name': 'Blitta 2 Agbandi',
            'center_latitude': 8.3201,
            'center_longitude': 1.04757,
            'default_zoom': 10,
        }
    )
    
    context = {
        'commune_info': commune_info,
        'page_title': 'Géoportail de Blitta 2 Agbandi',
    }
    
    return render(request, 'geoportail/geoportal.html', context)


@require_http_methods(["GET"])
def get_all_layers(request):
    """API qui retourne toutes les couches géographiques en GeoJSON"""
    
    try:
        layers = {}
        
        if DJANGO_GEO_MODELS_AVAILABLE:
            # === CANTONS ===
            try:
                cantons_qs = Cantons.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['cantons'] = {
                    "name": "Cantons",
                    "visible": True,
                    "opacity": 0.6,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(c.geom_json),
                                "properties": {
                                    "gid": c.gid,
                                    "canton": c.canton,
                                    "prefecture": c.prefecture,
                                    "region": c.region,
                                    "code_canto": c.code_canto
                                }
                            } for c in cantons_qs
                        ]
                    }
                }
            except Exception as e:
                print(f"Erreur cantons: {e}")
            
            # === COMMUNES ===
            try:
                communes_qs = Commune.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['communes'] = {
                    "name": "Communes",
                    "visible": True,
                    "opacity": 0.5,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(c.geom_json),
                                "properties": {
                                    "commune": c.commune,
                                    "prefecture": c.prefecture,
                                    "region": c.region,
                                    "code_commu": c.code_commu
                                }
                            } for c in communes_qs
                        ]
                    }
                }
            except Exception as e:
                print(f"Erreur communes: {e}")
            
            # === ROUTES ===
            try:
                routes_qs = Routes.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['routes'] = {
                    "name": "Routes",
                    "visible": True,
                    "opacity": 1,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(r.geom_json),
                                "properties": {
                                    "id": r.id,
                                    "route_nom": r.route_nom,
                                    "route_type": r.route_type,
                                    "route_clas": r.route_clas
                                }
                            } for r in routes_qs
                        ]
                    }
                }
            except Exception as e:
                print(f"Erreur routes: {e}")
            
            # === MARCHÉS ===
            try:
                marches_qs = Marche.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['marches'] = {
                    "name": "Marchés",
                    "visible": True,
                    "opacity": 1,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(m.geom_json),
                                "properties": {
                                    "marche_nom": m.marche_nom,
                                    "canton": m.canton_nom,
                                    "nom_locali": m.nom_locali,
                                    "jour": m.jour
                                }
                            } for m in marches_qs
                        ]
                    }
                }
            except Exception as e:
                print(f"Erreur marches: {e}")
            
            # === HÔPITAUX ===
            try:
                hopitaux_qs = Hopitale.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['hopitaux'] = {
                    "name": "Hôpitaux",
                    "visible": True,
                    "opacity": 1,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(h.geom_json),
                                "properties": {
                                    "nom_fs": h.nom_fs,
                                    "nom_locali": h.nom_locali,
                                    "canton": h.canton_nom,
                                    "secteur": h.secteur,
                                    "services_p": h.services_p
                                }
                            } for h in hopitaux_qs
                        ]
                    }
                }
            except Exception as e:
                print(f"Erreur hopitaux: {e}")
            
            # === ÉTABLISSEMENTS ÉDUCATIFS ===
            for etab_type, model, name in [
                ('jardins', Jardin, 'Jardins'),
                ('colleges', College, 'Collèges'),
                ('lycees', Lycee, 'Lycées'),
            ]:
                try:
                    etab_qs = model.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                    layers[etab_type] = {
                        "name": name,
                        "visible": True,
                        "opacity": 1,
                        "data": {
                            "type": "FeatureCollection",
                            "features": [
                                {
                                    "type": "Feature",
                                    "geometry": json.loads(e.geom_json),
                                    "properties": {
                                        "nom_locali": e.nom_locali,
                                        "etablissem": e.etablissem,
                                        "canton": e.canton_nom,
                                        "ouverture": e.ouverture
                                    }
                                } for e in etab_qs
                            ]
                        }
                    }
                except Exception as e:
                    print(f"Erreur {etab_type}: {e}")
            
            # === POINTS D'EAU ===
            try:
                # Forages PEA
                peas_qs = Pea.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['peas'] = {
                    "name": "Forages PEA",
                    "visible": True,
                    "opacity": 1,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(p.geom_json),
                                "properties": {
                                    "forage_nom": p.forage_nom,
                                    "forage_typ": p.forage_typ,
                                    "canton": p.canton_nom,
                                    "nom_locali": p.nom_locali
                                }
                            } for p in peas_qs
                        ]
                    }
                }
                
                # Bornes fontaines
                bornes_qs = Bornefontaine.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['bornes'] = {
                    "name": "Bornes fontaines",
                    "visible": True,
                    "opacity": 1,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(b.geom_json),
                                "properties": {
                                    "borne_font": b.borne_font,
                                    "canton": b.canton_nom
                                }
                            } for b in bornes_qs
                        ]
                    }
                }
            except Exception as e:
                print(f"Erreur points d'eau: {e}")
            
            # === PATRIMOINE ===
            try:
                chateaux_qs = Chateau.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['chateaux'] = {
                    "name": "Châteaux",
                    "visible": True,
                    "opacity": 1,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(c.geom_json),
                                "properties": {
                                    "chateau_no": c.chateau_no,
                                    "organisme": c.organisme,
                                    "canton": c.canton_nom,
                                    "nom_locali": c.nom_locali
                                }
                            } for c in chateaux_qs
                        ]
                    }
                }
            except Exception as e:
                print(f"Erreur chateaux: {e}")
            
            # === INFRASTRUCTURES ===
            try:
                terrains_qs = Terrain.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['terrains'] = {
                    "name": "Terrains / Stades",
                    "visible": True,
                    "opacity": 0.7,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(t.geom_json),
                                "properties": {
                                    "terrain": t.terrain,
                                    "terrain_sp": t.terrain_sp,
                                    "canton": t.canton_nom,
                                    "nom_locali": t.nom_locali
                                }
                            } for t in terrains_qs
                        ]
                    }
                }
            except Exception as e:
                print(f"Erreur terrains: {e}")
            
            # === ÉCONOMIE ===
            try:
                # Coopératives
                cooperatives_qs = Cooperative.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['cooperatives'] = {
                    "name": "Coopératives",
                    "visible": True,
                    "opacity": 1,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(c.geom_json),
                                "properties": {
                                    "cooperativ": c.cooperativ,
                                    "cooperat_1": c.cooperat_1,
                                    "canton": c.canton_nom,
                                    "nom_locali": c.nom_locali
                                }
                            } for c in cooperatives_qs
                        ]
                    }
                }
                
                # Magasins
                magasins_qs = Magazinbl2.objects.all().annotate(geom_json=AsGeoJSON('geom'))
                layers['magasins'] = {
                    "name": "Magasins / Intrants",
                    "visible": True,
                    "opacity": 1,
                    "data": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": json.loads(m.geom_json),
                                "properties": {
                                    "etab_nom": m.etab_nom,
                                    "canton": m.canton_nom,
                                    "ouverture": m.ouverture,
                                    "organisme": m.organisme
                                }
                            } for m in magasins_qs
                        ]
                    }
                }
            except Exception as e:
                print(f"Erreur économie: {e}")
        
        else:
            # Données de démonstration si les modèles ne sont pas disponibles
            layers = get_demo_layers()
        
        return JsonResponse({
            "success": True,
            "layers": layers
        })
        
    except Exception as e:
        print(f"Erreur critique dans get_all_layers: {e}")
        return JsonResponse({
            "success": False,
            "error": str(e),
            "layers": {}
        }, status=500)


def get_demo_layers():
    """Générer des couches de démonstration"""
    
    # Centre de Blitta
    center_lat, center_lng = 8.3201, 1.04757
    
    # Couche de démo pour les cantons
    demo_cantons = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [center_lng - 0.05, center_lat - 0.05],
                        [center_lng + 0.05, center_lat - 0.05],
                        [center_lng + 0.05, center_lat + 0.05],
                        [center_lng - 0.05, center_lat + 0.05],
                        [center_lng - 0.05, center_lat - 0.05]
                    ]]
                },
                "properties": {
                    "gid": 1,
                    "canton": "Blitta",
                    "prefecture": "Blitta",
                    "region": "Centrale",
                    "code_canto": 1
                }
            }
        ]
    }
    
    # Couche de démo pour les points (marchés, hopitaux, etc.)
    demo_points = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [center_lng, center_lat]
                },
                "properties": {
                    "name": "Marché central",
                    "type": "marché",
                    "canton": "Blitta"
                }
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [center_lng + 0.01, center_lat + 0.01]
                },
                "properties": {
                    "name": "Centre de santé",
                    "type": "hopital",
                    "canton": "Blitta"
                }
            }
        ]
    }
    
    return {
        "cantons": {
            "name": "Cantons (démo)",
            "visible": True,
            "opacity": 0.6,
            "data": demo_cantons
        },
        "marches": {
            "name": "Marchés (démo)",
            "visible": True,
            "opacity": 1,
            "data": demo_points
        },
        "hopitaux": {
            "name": "Hôpitaux (démo)",
            "visible": True,
            "opacity": 1,
            "data": demo_points
        }
    }


def geoportal_stats_api(request):
    """API pour les statistiques du géoportail"""
    try:
        stats = {
            'total_layers': 0,
            'visible_layers': 0,
            'total_features': 0,
            'layers_info': {}
        }
        
        if DJANGO_GEO_MODELS_AVAILABLE:
            # Compter les entités par type
            model_counts = {
                'cantons': Cantons.objects.count(),
                'communes': Commune.objects.count(),
                'routes': Routes.objects.count(),
                'marches': Marche.objects.count(),
                'hopitaux': Hopitale.objects.count(),
                'jardins': Jardin.objects.count(),
                'colleges': College.objects.count(),
                'lycees': Lycee.objects.count(),
                'peas': Pea.objects.count(),
                'bornes': Bornefontaine.objects.count(),
                'chateaux': Chateau.objects.count(),
                'terrains': Terrain.objects.count(),
                'cooperatives': Cooperative.objects.count(),
                'magasins': Magazinbl2.objects.count(),
            }
            
            total_features = sum(model_counts.values())
            
            stats.update({
                'total_layers': len(model_counts),
                'visible_layers': len(model_counts),  # Toutes visibles par défaut
                'total_features': total_features,
                'layers_info': model_counts
            })
        else:
            stats.update({
                'total_layers': 3,
                'visible_layers': 3,
                'total_features': 2,
                'layers_info': {
                    'cantons': 1,
                    'marches': 1,
                    'hopitaux': 1
                }
            })
        
        return JsonResponse({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)