const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Début du peuplement de la base de données...');

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
      type: 'PRICE',
      level: 'HIGH',
      location: 'Marché central',
      authorId: adminUser.id,
      latitude: 8.8667,
      longitude: 0.7833
    },
    {
      title: 'Risque de sécheresse',
      description: 'Les prévisions météorologiques indiquent des précipitations faibles pour les deux prochaines semaines.',
      type: 'DROUGHT',
      level: 'MEDIUM',
      location: 'Zone agricole nord',
      authorId: adminUser.id,
      latitude: 8.88,
      longitude: 0.79
    },
    {
      title: 'Inondation dans la zone sud',
      description: 'Une crue soudaine a affecté les quartiers bas de la zone sud. Évacuation recommandée.',
      type: 'FLOOD',
      level: 'HIGH',
      location: 'Zone sud',
      authorId: adminUser.id,
      latitude: 8.85,
      longitude: 0.80
    },
    {
      title: 'Panne de pompe à eau - Puits n°2',
      description: 'La pompe du puits n°2 est en panne. Réparation prévue dans 48h.',
      type: 'INFRASTRUCTURE',
      level: 'MEDIUM',
      location: 'Puits n°2',
      authorId: adminUser.id,
      latitude: 8.87,
      longitude: 0.795
    },
    {
      title: 'Marché hebdomadaire demain',
      description: 'Le grand marché hebdomadaire aura lieu demain comme d\'habitude.',
      type: 'WEATHER',
      level: 'LOW',
      location: 'Place du marché',
      authorId: adminUser.id,
      latitude: 8.865,
      longitude: 0.782
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
      product: 'Maïs',
      price: 350,
      unit: 'kg',
      currency: 'FCFA',
      trend: '+15%',
      market: 'Marché central',
      category: 'Céréales',
      availability: 'Abondant',
      quality: 'Bon',
      latitude: 8.8667,
      longitude: 0.7833
    },
    {
      product: 'Riz',
      price: 500,
      unit: 'kg',
      currency: 'FCFA',
      trend: '0%',
      market: 'Marché central',
      category: 'Céréales',
      availability: 'Modéré',
      quality: 'Excellent',
      latitude: 8.8667,
      longitude: 0.7833
    },
    {
      product: 'Mil',
      price: 300,
      unit: 'kg',
      currency: 'FCFA',
      trend: '-5%',
      market: 'Marché de Blitta',
      category: 'Céréales',
      availability: 'Limité',
      quality: 'Bon',
      latitude: 8.868,
      longitude: 0.785
    },
    {
      product: 'Arachide',
      price: 800,
      unit: 'kg',
      currency: 'FCFA',
      trend: '+10%',
      market: 'Marché central',
      category: 'Légumineuses',
      availability: 'Abondant',
      quality: 'Excellent',
      latitude: 8.8667,
      longitude: 0.7833
    },
    {
      product: 'Manioc',
      price: 200,
      unit: 'kg',
      currency: 'FCFA',
      trend: '0%',
      market: 'Marché de Blitta',
      category: 'Tubercules',
      availability: 'Abondant',
      quality: 'Bon',
      latitude: 8.868,
      longitude: 0.785
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
      address: 'Avenue de l\'Indépendance',
      capacity: '300 élèves',
      users: 280,
      lastMaintenance: new Date('2024-03-15'),
      responsible: 'M. Koné',
      budget: '5M FCFA',
      description: 'École primaire publique avec 8 salles de classe',
      latitude: 8.868,
      longitude: 0.784
    },
    {
      name: 'Centre de Santé de Blitta 2',
      type: 'HEALTH',
      status: 'OPERATIONAL',
      location: 'Quartier sanitaire',
      address: 'Rue de la Santé',
      capacity: '150 patients/jour',
      users: 120,
      lastMaintenance: new Date('2024-02-28'),
      responsible: 'Dr. Traoré',
      budget: '10M FCFA',
      description: 'Centre de santé primaire',
      latitude: 8.869,
      longitude: 0.786
    },
    {
      name: 'Puits n°1 - Agbandi',
      type: 'WATER',
      status: 'MAINTENANCE',
      location: 'Nord d\'Agbandi',
      capacity: '5000L/jour',
      users: 0,
      lastMaintenance: new Date('2024-01-20'),
      responsible: 'M. Ouattara',
      budget: '2M FCFA',
      description: 'Puits communautaire avec pompe manuelle',
      latitude: 8.872,
      longitude: 0.791
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
      area: '50 hectares',
      areaHa: 50,
      farmers: 25,
      currentSeason: 'Saison des pluies 2024',
      expectedYield: '3.5 tonnes/hectare',
      status: 'GROWING',
      healthStatus: 'GOOD',
      nextAction: 'Fertilisation dans 2 semaines',
      irrigation: true,
      fertilizer: 'NPK 15-15-15',
      challenges: '[]',
      opportunities: '[]',
      latitude: 8.875,
      longitude: 0.792
    },
    {
      name: 'Riz irrigué',
      type: 'CEREAL',
      area: '30 hectares',
      areaHa: 30,
      farmers: 15,
      currentSeason: 'Saison sèche 2024',
      expectedYield: '5 tonnes/hectare',
      status: 'GROWING',
      healthStatus: 'GOOD',
      nextAction: 'Contrôle des nuisibles',
      irrigation: true,
      fertilizer: 'Urée',
      challenges: '[]',
      opportunities: '[]',
      latitude: 8.865,
      longitude: 0.795
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
      category: 'Démographie',
      title: 'Population de la commune',
      content: 'La commune de Blitta 2 Agbandi compte environ 25 000 habitants selon le dernier recensement.',
      status: 'PUBLISHED',
      priority: 'HIGH',
      author: 'Mairie de Blitta 2'
    },
    {
      category: 'Administratif',
      title: 'Conseil municipal - Prochaine réunion',
      content: 'La prochaine réunion du conseil municipal aura lieu le 15 février 2024 à 10h dans la salle des délibérations.',
      status: 'PUBLISHED',
      priority: 'MEDIUM',
      author: 'Secrétariat municipal'
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
      longitude: 0.78
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
      longitude: 0.80
    }
  ];

  for (const projectData of projects) {
    await prisma.project.create({
      data: projectData,
    });
  }

  console.log(`${projects.length} projets créés`);

  // Créer les statistiques du tableau de bord
  const dashboardStats = await prisma.dashboardStats.upsert({
    where: { id: 'main' },
    update: {
      population: 25000,
      households: 4000,
      projects: 24,
      activeProjects: 16,
      completedProjects: 6,
      infrastructures: 47,
      operationalInfra: 43,
      totalArea: '276',
      density: '45',
      lastUpdated: new Date()
    },
    create: {
      id: 'main',
      population: 25000,
      households: 4000,
      projects: 24,
      activeProjects: 16,
      completedProjects: 6,
      infrastructures: 47,
      operationalInfra: 43,
      totalArea: '276',
      density: '45',
      lastUpdated: new Date()
    }
  });

  console.log('Statistiques du tableau de bord mises à jour');

  console.log('\n🎉 Base de données peuplée avec succès !');
  console.log('✅ Données de démonstration créées pour Blitta 2 Agbandi');
}

main()
  .catch((e) => {
    console.error('Erreur lors du peuplement de la base de données:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });