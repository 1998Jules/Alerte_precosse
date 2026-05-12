import { NextResponse } from "next/server";

// Mock data - dans une vraie application, cela viendrait d'une base de données
const communalData = {
  population: {
    total: 12450,
    growth: '+2.3%',
    households: 2100,
    density: '45 hab/km²',
    demographics: {
      men: 6200,
      women: 6250,
      youth: 4800,
      elderly: 1200
    },
    distribution: [
      { zone: 'Centre', population: 3500 },
      { zone: 'Nord', population: 2800 },
      { zone: 'Sud', population: 3100 },
      { zone: 'Est', population: 1800 },
      { zone: 'Ouest', population: 1250 }
    ]
  },
  infrastructures: {
    total: 47,
    operational: 43,
    underMaintenance: 3,
    outOfService: 1,
    categories: {
      education: {
        total: 12,
        operational: 11,
        list: [
          { name: 'École primaire centrale', status: 'Opérationnel', capacity: 400 },
          { name: 'École primaire nord', status: 'Opérationnel', capacity: 250 },
          { name: 'Collège municipal', status: 'Opérationnel', capacity: 600 },
          { name: 'Lycée technique', status: 'En maintenance', capacity: 350 }
        ]
      },
      health: {
        total: 8,
        operational: 7,
        list: [
          { name: 'Centre de santé principal', status: 'Opérationnel', capacity: 150 },
          { name: 'Dispensaire nord', status: 'Opérationnel', capacity: 50 },
          { name: 'Dispensaire sud', status: 'Opérationnel', capacity: 60 },
          { name: 'Maternité', status: 'Opérationnel', capacity: 30 }
        ]
      },
      water: {
        total: 15,
        operational: 14,
        list: [
          { name: 'Puits n°1 - Centre', status: 'Opérationnel', dailyCapacity: '5000L' },
          { name: 'Puits n°2 - Nord', status: 'Opérationnel', dailyCapacity: '4000L' },
          { name: 'Puits n°3 - Adjamé', status: 'Hors service', dailyCapacity: '3000L' },
          { name: 'Forage n°1 - Est', status: 'Opérationnel', dailyCapacity: '8000L' }
        ]
      },
      roads: {
        total: 12,
        operational: 11,
        list: [
          { name: 'Route principale', status: 'Opérationnel', length: '5km', condition: 'Bonne' },
          { name: 'Route nord-sud', status: 'En maintenance', length: '8km', condition: 'Moyenne' },
          { name: 'Chemin rural est', status: 'Opérationnel', length: '3km', condition: 'Acceptable' }
        ]
      }
    }
  },
  projects: {
    total: 24,
    active: 16,
    completed: 6,
    pending: 2,
    list: [
      {
        id: 1,
        name: 'Construction du nouveau marché',
        status: 'En cours',
        progress: 65,
        budget: '50M FCFA',
        completionDate: '2024-06-30',
        impact: 'Élevé'
      },
      {
        id: 2,
        name: 'Réhabilitation du puits n°3',
        status: 'En cours',
        progress: 30,
        budget: '5M FCFA',
        completionDate: '2024-03-15',
        impact: 'Moyen'
      },
      {
        id: 3,
        name: 'Installation de l\'éclairage public',
        status: 'Planifié',
        progress: 10,
        budget: '25M FCFA',
        completionDate: '2024-08-31',
        impact: 'Élevé'
      },
      {
        id: 4,
        name: 'Construction de l\'école maternelle',
        status: 'En cours',
        progress: 45,
        budget: '30M FCFA',
        completionDate: '2024-07-15',
        impact: 'Élevé'
      }
    ]
  },
  agriculture: {
    totalFarms: 450,
    mainCrops: ['Maïs', 'Mil', 'Igname', 'Coton'],
    areaUnderCultivation: '8500 ha',
    irrigationCoverage: '35%',
    challenges: ['Sécheresse', 'Accès aux intrants', 'Équipement'],
    opportunities: ['Mécanisation', 'Irrigation', 'Formation']
  },
  waterResources: {
    totalPoints: 15,
    functional: 14,
    dailyProduction: '45000L',
    coverageRate: '78%',
    challenges: ['Panne puits n°3', 'Perte réseau', 'Qualité eau'],
    projects: ['Nouveau forage est', 'Réparation puits n°3', 'Extension réseau']
  }
};

export async function GET() {
  try {
    // Simulation de délai réseau
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return NextResponse.json({
      success: true,
      data: communalData,
      timestamp: new Date().toISOString(),
      lastUpdate: '2024-01-15T10:30:00Z'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des données communales' 
      },
      { status: 500 }
    );
  }
}