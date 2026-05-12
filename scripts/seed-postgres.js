const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Début du peuplement de la base de données PostgreSQL avec PostGIS...');

  // Créer un utilisateur administrateur
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@blitta2agbandi.tg' },
    update: {},
    create: {
      email: 'admin@blitta2agbandi.tg',
      name: 'Administrateur',
      role: 'ADMIN',
    },
  });

  console.log('Utilisateur administrateur créé');

  // Créer des alertes
  const alerts = [
    {
      title: 'Alerte prix élevé - Maïs',
      description: 'Le prix du maïs a augmenté de 15% cette semaine au marché central.',
      type: 'PRICE_ALERT',
      level: 'HIGH',
      location: 'Marché central',
      authorId: adminUser.id,
      latitude: 8.8667,
      longitude: 0.7833,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.7833, 8.8667]
      })
    },
    {
      title: 'Risque de sécheresse',
      description: 'Les prévisions météorologiques indiquent des précipitations faibles pour les deux prochaines semaines.',
      type: 'DROUGHT',
      level: 'MEDIUM',
      location: 'Zone agricole nord',
      authorId: adminUser.id,
      latitude: 8.88,
      longitude: 0.79,
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.77, 8.86], [0.82, 8.86], [0.82, 8.89], [0.77, 8.89], [0.77, 8.86]
          ]
        ]
      })
    },
    {
      title: 'Inondation dans la zone sud',
      description: 'Une crue soudaine a affecté les quartiers bas de la zone sud. Évacuation recommandée.',
      type: 'FLOOD',
      level: 'HIGH',
      location: 'Zone sud',
      authorId: adminUser.id,
      latitude: 8.85,
      longitude: 0.80,
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.79, 8.84], [0.81, 8.84], [0.81, 8.86], [0.79, 8.86], [0.79, 8.84]
          ]
        ]
      })
    },
    {
      title: 'Panne de pompe à eau - Puits n°2',
      description: 'La pompe du puits n°2 est en panne. Réparation prévue dans 48h.',
      type: 'INFRASTRUCTURE',
      level: 'MEDIUM',
      location: 'Puits n°2',
      authorId: adminUser.id,
      latitude: 8.87,
      longitude: 0.795,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.795, 8.87]
      })
    },
    {
      title: 'Marché hebdomadaire demain',
      description: 'Le grand marché hebdomadaire aura lieu demain comme d\'habitude.',
      type: 'INFO',
      level: 'LOW',
      location: 'Place du marché',
      authorId: adminUser.id,
      latitude: 8.865,
      longitude: 0.782,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.782, 8.865]
      })
    }
  ];

  for (const alertData of alerts) {
    await prisma.alert.create({
      data: alertData,
    });
  }

  console.log(`${alerts.length} alertes créées`);

  // Créer des prix du marché
  const marketPrices = [
    {
      productName: 'Maïs',
      price: '350 FCFA/kg',
      unit: 'kg',
      market: 'Marché central',
      vendor: 'Coopérative des agriculteurs',
      trend: 'UP',
      change: '+15%',
      lastUpdated: new Date(),
      location: 'Marché central',
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.7833, 8.8667]
      })
    },
    {
      productName: 'Riz',
      price: '500 FCFA/kg',
      unit: 'kg',
      market: 'Marché central',
      vendor: 'Importateur Togo',
      trend: 'STABLE',
      change: '0%',
      lastUpdated: new Date(),
      location: 'Marché central',
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.7833, 8.8667]
      })
    },
    {
      productName: 'Mil',
      price: '300 FCFA/kg',
      unit: 'kg',
      market: 'Marché de Blitta',
      vendor: 'Agriculteurs locaux',
      trend: 'DOWN',
      change: '-5%',
      lastUpdated: new Date(),
      location: 'Marché de Blitta',
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.785, 8.868]
      })
    },
    {
      productName: 'Arachide',
      price: '800 FCFA/kg',
      unit: 'kg',
      market: 'Marché central',
      vendor: 'Coopérative féminine',
      trend: 'UP',
      change: '+10%',
      lastUpdated: new Date(),
      location: 'Marché central',
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.7833, 8.8667]
      })
    },
    {
      productName: 'Manioc',
      price: '200 FCFA/kg',
      unit: 'kg',
      market: 'Marché de Blitta',
      vendor: 'Producteurs locaux',
      trend: 'STABLE',
      change: '0%',
      lastUpdated: new Date(),
      location: 'Marché de Blitta',
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.785, 8.868]
      })
    },
    {
      productName: 'Poisson séché',
      price: '2500 FCFA/kg',
      unit: 'kg',
      market: 'Marché central',
      vendor: 'Pêcheurs de la région',
      trend: 'UP',
      change: '+20%',
      lastUpdated: new Date(),
      location: 'Marché central',
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.7833, 8.8667]
      })
    },
    {
      productName: 'Huile de palme',
      price: '1200 FCFA/l',
      unit: 'litre',
      market: 'Marché de Blitta',
      vendor: 'Transformateurs locaux',
      trend: 'DOWN',
      change: '-8%',
      lastUpdated: new Date(),
      location: 'Marché de Blitta',
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.785, 8.868]
      })
    },
    {
      productName: 'Légumes variés',
      price: '150 FCFA/unité',
      unit: 'unité',
      market: 'Marché central',
      vendor: 'Maraîchers',
      trend: 'STABLE',
      change: '0%',
      lastUpdated: new Date(),
      location: 'Marché central',
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.7833, 8.8667]
      })
    }
  ];

  for (const priceData of marketPrices) {
    await prisma.marketPrice.create({
      data: priceData,
    });
  }

  console.log(`${marketPrices.length} prix du marché créés`);

  // Créer des infrastructures
  const infrastructures = [
    {
      name: 'École Primaire Publique de Blitta 2',
      type: 'EDUCATION',
      status: 'OPERATIONAL',
      location: 'Centre ville',
      capacity: 300,
      currentUsage: 280,
      maintenanceDate: new Date('2024-03-15'),
      responsiblePerson: 'M. Koné',
      budget: '5M FCFA',
      latitude: 8.868,
      longitude: 0.784,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.784, 8.868]
      })
    },
    {
      name: 'Centre de Santé de Blitta 2',
      type: 'HEALTH',
      status: 'OPERATIONAL',
      location: 'Quartier sanitaire',
      capacity: 150,
      currentUsage: 120,
      maintenanceDate: new Date('2024-02-28'),
      responsiblePerson: 'Dr. Traoré',
      budget: '10M FCFA',
      latitude: 8.869,
      longitude: 0.786,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.786, 8.869]
      })
    },
    {
      name: 'Puits n°1 - Agbandi',
      type: 'WATER',
      status: 'MAINTENANCE',
      location: 'Nord d\'Agbandi',
      capacity: 5000,
      currentUsage: 0,
      maintenanceDate: new Date('2024-01-20'),
      responsiblePerson: 'M. Ouattara',
      budget: '2M FCFA',
      latitude: 8.872,
      longitude: 0.791,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.791, 8.872]
      })
    },
    {
      name: 'Marché Central',
      type: 'MARKET',
      status: 'OPERATIONAL',
      location: 'Centre ville',
      capacity: 200,
      currentUsage: 180,
      maintenanceDate: new Date('2024-04-01'),
      responsiblePerson: 'Mme Bamba',
      budget: '8M FCFA',
      latitude: 8.8667,
      longitude: 0.7833,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.7833, 8.8667]
      })
    },
    {
      name: 'Stade Municipal',
      type: 'SPORTS',
      status: 'OPERATIONAL',
      location: 'Sud de la commune',
      capacity: 1000,
      currentUsage: 150,
      maintenanceDate: new Date('2024-03-30'),
      responsiblePerson: 'M. Sangaré',
      budget: '3M FCFA',
      latitude: 8.862,
      longitude: 0.788,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.788, 8.862]
      })
    },
    {
      name: 'Poste de Police',
      type: 'SECURITY',
      status: 'OPERATIONAL',
      location: 'Centre administratif',
      capacity: 20,
      currentUsage: 15,
      maintenanceDate: new Date('2024-02-15'),
      responsiblePerson: 'Commissaire Kouadio',
      budget: '4M FCFA',
      latitude: 8.870,
      longitude: 0.782,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.782, 8.870]
      })
    }
  ];

  for (const infraData of infrastructures) {
    await prisma.infrastructure.create({
      data: infraData,
    });
  }

  console.log(`${infrastructures.length} infrastructures créées`);

  // Créer des cultures agricoles
  const crops = [
    {
      name: 'Maïs - Saison pluvieuse',
      type: 'CEREAL',
      status: 'GROWING',
      plantedDate: new Date('2024-01-15'),
      expectedHarvestDate: new Date('2024-04-15'),
      area: '50 hectares',
      farmer: 'Coopérative des jeunes agriculteurs',
      location: 'Zone nord',
      healthStatus: 'GOOD',
      irrigationNeeded: true,
      estimatedYield: '3.5 tonnes/hectare',
      latitude: 8.875,
      longitude: 0.792,
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.79, 8.87], [0.795, 8.87], [0.795, 8.88], [0.79, 8.88], [0.79, 8.87]
          ]
        ]
      })
    },
    {
      name: 'Riz irrigué',
      type: 'CEREAL',
      status: 'GROWING',
      plantedDate: new Date('2024-01-01'),
      expectedHarvestDate: new Date('2024-04-01'),
      area: '30 hectares',
      farmer: 'Groupement des femmes rizicultrices',
      location: 'Vallée de l\'Oti',
      healthStatus: 'EXCELLENT',
      irrigationNeeded: true,
      estimatedYield: '5 tonnes/hectare',
      latitude: 8.865,
      longitude: 0.795,
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.792, 8.86], [0.798, 8.86], [0.798, 8.87], [0.792, 8.87], [0.792, 8.86]
          ]
        ]
      })
    },
    {
      name: 'Arachides',
      type: 'LEGUME',
      status: 'PLANTED',
      plantedDate: new Date('2024-01-20'),
      expectedHarvestDate: new Date('2024-05-20'),
      area: '25 hectares',
      farmer: 'M. Traoré',
      location: 'Zone centre',
      healthStatus: 'GOOD',
      irrigationNeeded: false,
      estimatedYield: '1.8 tonnes/hectare',
      latitude: 8.868,
      longitude: 0.785,
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.78, 8.865], [0.79, 8.865], [0.79, 8.875], [0.78, 8.875], [0.78, 8.865]
          ]
        ]
      })
    },
    {
      name: 'Manioc',
      type: 'TUBER',
      status: 'GROWING',
      plantedDate: new Date('2023-12-01'),
      expectedHarvestDate: new Date('2024-06-01'),
      area: '40 hectares',
      farmer: 'Coopérative mixte',
      location: 'Zone sud',
      healthStatus: 'GOOD',
      irrigationNeeded: false,
      estimatedYield: '20 tonnes/hectare',
      latitude: 8.860,
      longitude: 0.788,
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.785, 8.855], [0.795, 8.855], [0.795, 8.865], [0.785, 8.865], [0.785, 8.855]
          ]
        ]
      })
    },
    {
      name: 'Maraîchage (tomates, oignons)',
      type: 'VEGETABLE',
      status: 'GROWING',
      plantedDate: new Date('2024-01-10'),
      expectedHarvestDate: new Date('2024-03-10'),
      area: '10 hectares',
      farmer: 'Groupement des maraîchers',
      location: 'Périphérie nord',
      healthStatus: 'FAIR',
      irrigationNeeded: true,
      estimatedYield: '15 tonnes/hectare',
      latitude: 8.878,
      longitude: 0.783,
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.78, 8.875], [0.79, 8.875], [0.79, 8.885], [0.78, 8.885], [0.78, 8.875]
          ]
        ]
      })
    }
  ];

  for (const cropData of crops) {
    await prisma.crop.create({
      data: cropData,
    });
  }

  console.log(`${crops.length} cultures créées`);

  // Créer des informations communales
  const communalInfos = [
    {
      title: 'Population de la commune',
      content: 'La commune de Blitta 2 Agbandi compte environ 25 000 habitants selon le dernier recensement.',
      category: 'DEMOGRAPHY',
      authorId: adminUser.id,
      published: true,
      priority: 'HIGH'
    },
    {
      title: 'Conseil municipal - Prochaine réunion',
      content: 'La prochaine réunion du conseil municipal aura lieu le 15 février 2024 à 10h dans la salle des délibérations.',
      category: 'ADMINISTRATIVE',
      authorId: adminUser.id,
      published: true,
      priority: 'MEDIUM'
    },
    {
      title: 'Budget annuel 2024',
      content: 'Le budget prévisionnel pour 2024 s\'élève à 500 millions de FCFA, avec une focus sur l\'éducation et la santé.',
      category: 'FINANCIAL',
      authorId: adminUser.id,
      published: true,
      priority: 'HIGH'
    },
    {
      title: 'Projets d\'infrastructure en cours',
      content: 'Plusieurs projets sont en cours : construction d\'une nouvelle école, réhabilitation du marché, et adduction d\'eau.',
      category: 'INFRASTRUCTURE',
      authorId: adminUser.id,
      published: true,
      priority: 'MEDIUM'
    }
  ];

  for (const infoData of communalInfos) {
    await prisma.communalInfo.create({
      data: infoData,
    });
  }

  console.log(`${communalInfos.length} informations communales créées`);

  // Créer des projets
  const projects = [
    {
      name: 'Construction du nouveau marché',
      description: 'Construction d\'un marché moderne avec 200 commerces.',
      status: 'ACTIVE',
      progress: 65,
      budget: '50M FCFA',
      startDate: new Date('2024-01-01'),
      completionDate: new Date('2024-06-30'),
      impact: 'Élevé',
      manager: 'M. Ouattara',
      latitude: 8.875,
      longitude: 0.78,
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.78, 8.87], [0.79, 8.87], [0.79, 8.88], [0.78, 8.88], [0.78, 8.87]
          ]
        ]
      })
    },
    {
      name: 'Réhabilitation du puits n°3',
      description: 'Réparation complète de la pompe.',
      status: 'ACTIVE',
      progress: 30,
      budget: '5M FCFA',
      startDate: new Date('2024-01-15'),
      completionDate: new Date('2024-03-15'),
      impact: 'Moyen',
      manager: 'M. Kouassi',
      latitude: 8.87,
      longitude: 0.80,
      geometry: JSON.stringify({
        type: 'Point',
        coordinates: [0.80, 8.87]
      })
    },
    {
      name: 'Installation de l\'éclairage public',
      description: 'Installation de 150 lampadaires solaires.',
      status: 'PLANNING',
      progress: 10,
      budget: '25M FCFA',
      startDate: new Date('2024-02-01'),
      completionDate: new Date('2024-08-31'),
      impact: 'Élevé',
      manager: 'M. Koné',
      latitude: 8.87,
      longitude: 0.78,
      geometry: JSON.stringify({
        type: 'MultiPolygon',
        coordinates: [
          [[0.78, 8.87], [0.79, 8.87], [0.79, 8.88], [0.78, 8.88], [0.78, 8.87]],
          [[0.82, 8.86], [0.84, 8.86], [0.84, 8.89], [0.82, 8.89], [0.82, 8.86]]
        ]
      })
    },
    {
      name: 'Construction de l\'école maternelle',
      description: 'Construction d\'une école maternelle avec 4 classes.',
      status: 'ACTIVE',
      progress: 45,
      budget: '30M FCFA',
      startDate: new Date('2024-01-10'),
      completionDate: new Date('2024-07-15'),
      impact: 'Élevé',
      manager: 'Mme Traoré',
      latitude: 8.86,
      longitude: 0.78,
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.858, 8.868], 
            [0.862, 8.868], 
            [0.862, 8.872], 
            [0.858, 8.872], 
            [0.858, 8.868]
          ]
        ]
      })
    }
  ];

  for (const projectData of projects) {
    await prisma.project.create({
      data: projectData,
    });
  }

  console.log(`${projects.length} projets créés`);

  // Créer des zones géographiques pour le géoportail
  const geoZones = [
    {
      name: 'Zone agricole nord',
      type: 'AGRICULTURAL',
      description: 'Zone principale de culture de maïs et de riz',
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.78, 8.88], [0.82, 8.88], [0.82, 8.92], [0.78, 8.92], [0.78, 8.88]
          ]
        ]
      }),
      properties: JSON.stringify({
        main_crops: ['maïs', 'riz'],
        area: '150 hectares',
        irrigation: 'partielle'
      })
    },
    {
      name: 'Zone résidentielle centre',
      type: 'RESIDENTIAL',
      description: 'Zone densément peuplée',
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.78, 8.86], [0.80, 8.86], [0.80, 8.88], [0.78, 8.88], [0.78, 8.86]
          ]
        ]
      }),
      properties: JSON.stringify({
        population: 12000,
        density: 'haute'
      })
    },
    {
      name: 'Zone commerciale',
      type: 'COMMERCIAL',
      description: 'Centre commercial et administratif',
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.80, 8.86], [0.82, 8.86], [0.82, 8.88], [0.80, 8.88], [0.80, 8.86]
          ]
        ]
      }),
      properties: JSON.stringify({
        businesses: 200,
        market_days: ['lundi', 'jeudi']
      })
    },
    {
      name: 'Zone de conservation',
      type: 'NATURAL',
      description: 'Zone forestière protégée',
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.82, 8.88], [0.86, 8.88], [0.86, 8.92], [0.82, 8.92], [0.82, 8.88]
          ]
        ]
      }),
      properties: JSON.stringify({
        forest_type: 'savane arborée',
        protected_species: ['baobab', 'karité']
      })
    },
    {
      name: 'Zone urbaine',
      type: 'URBAN',
      description: 'Zone urbaine principale',
      geometry: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [0.84, 8.86], [0.88, 8.86], [0.88, 8.88], [0.84, 8.88], [0.84, 8.86]
          ]
        ]
      }),
      properties: JSON.stringify({
        population: 8500,
        infrastructure_density: 'élevée'
      })
    }
  ];

  for (const zoneData of geoZones) {
    await prisma.geoZone.create({
      data: zoneData,
    });
  }

  console.log(`${geoZones.length} zones géographiques créées pour le géoportail`);

  // Créer les statistiques du tableau de bord
  const dashboardStats = await prisma.dashboardStats.upsert({
    where: { id: 1 },
    update: {
      totalPopulation: 25000,
      activeAlerts: 5,
      operationalInfrastructures: 5,
      ongoingProjects: 4,
      marketPriceChanges: 3,
      lastUpdated: new Date()
    },
    create: {
      totalPopulation: 25000,
      activeAlerts: 5,
      operationalInfrastructures: 5,
      ongoingProjects: 4,
      marketPriceChanges: 3,
      lastUpdated: new Date()
    }
  });

  console.log('Statistiques du tableau de bord mises à jour');

  console.log('\n🎉 Base de données PostgreSQL avec PostGIS peuplée avec succès !');
  console.log('\n🌍 Fonctionnalités géospatiales activées :');
  console.log('- Coordonnées GPS pour toutes les entités');
  console.log('- Géométries GeoJSON pour les zones complexes');
  console.log('- Requêtes spatiales possibles avec PostGIS');
  console.log('- Support du géoportail amélioré');

}

main()
  .catch((e) => {
    console.error('Erreur lors du peuplement de la base de données:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });