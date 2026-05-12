import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du peuplement de la base de données...');

  // Créer un utilisateur admin par défaut
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@blitta2-agbandi.tg' },
    update: {},
    create: {
      email: 'admin@blitta2-agbandi.tg',
      name: 'Administrateur',
      role: 'ADMIN',
    },
  });

  console.log('Utilisateur admin créé:', adminUser);

  // Créer les statistiques du tableau de bord
  const dashboardStats = await prisma.dashboardStats.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      population: 12450,
      households: 2100,
      projects: 24,
      activeProjects: 16,
      completedProjects: 6,
      infrastructures: 47,
      operationalInfra: 43,
      totalArea: "276",
      density: "45",
    },
  });

  console.log('Statistiques du tableau de bord créées:', dashboardStats);

  // Créer des alertes initiales
  const alerts = [
    {
      title: 'Augmentation du prix du maïs',
      description: 'Le prix du maïs a augmenté de 15% cette semaine, atteignant 350 FCFA/kg. Cette augmentation affecte l\'accessibilité alimentaire des ménages les plus vulnérables.',
      type: 'PRICE',
      level: 'HIGH',
      location: 'Marché central',
      authorId: adminUser.id,
    },
    {
      title: 'Risque de sécheresse',
      description: 'Les prévisions météorologiques indiquent des précipitations faibles pour les deux prochaines semaines. Les agriculteurs sont invités à optimiser l\'irrigation.',
      type: 'DROUGHT',
      level: 'MEDIUM',
      location: 'Zone agricole nord',
      authorId: adminUser.id,
    },
    {
      title: 'Crue du fleuve surveillée',
      description: 'Une légère crue est observée dans la zone sud. Le niveau d\'eau reste dans les limites normales mais la surveillance est maintenue.',
      type: 'FLOOD',
      level: 'LOW',
      location: 'Zone sud du fleuve',
      authorId: adminUser.id,
    },
    {
      title: 'Panne de pompe à eau',
      description: 'La pompe du puits n°3 est en panne, affectant l\'approvisionnement en eau du quartier Adjamé.',
      type: 'INFRASTRUCTURE',
      level: 'MEDIUM',
      location: 'Quartier Adjamé',
      authorId: adminUser.id,
    },
    {
      title: 'Campagne de vaccination',
      description: 'Campagne de vaccination contre la rougeole organisée au centre de santé principal.',
      type: 'HEALTH',
      level: 'LOW',
      location: 'Centre de santé',
      authorId: adminUser.id,
    },
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
      market: 'Marché central',
      category: 'Céréales',
      availability: 'Limitée',
      quality: 'Bonne',
      trend: '+15%',
    },
    {
      product: 'Riz',
      price: 500,
      unit: 'kg',
      market: 'Marché central',
      category: 'Céréales',
      availability: 'Bonne',
      quality: 'Excellente',
      trend: '+5%',
    },
    {
      product: 'Mil',
      price: 300,
      unit: 'kg',
      market: 'Marché de la zone nord',
      category: 'Céréales',
      availability: 'Excellente',
      quality: 'Bonne',
      trend: '-2%',
    },
    {
      product: 'Igname',
      price: 400,
      unit: 'kg',
      market: 'Marché central',
      category: 'Tubercules',
      availability: 'Bonne',
      quality: 'Bonne',
      trend: '0%',
    },
    {
      product: 'Tomate',
      price: 250,
      unit: 'kg',
      market: 'Marché de la zone sud',
      category: 'Légumes',
      availability: 'Limitée',
      quality: 'Moyenne',
      trend: '+8%',
    },
    {
      product: 'Oignon',
      price: 180,
      unit: 'kg',
      market: 'Marché central',
      category: 'Légumes',
      availability: 'Excellente',
      quality: 'Bonne',
      trend: '-5%',
    },
    {
      product: 'Poisson fumé',
      price: 1200,
      unit: 'kg',
      market: 'Marché central',
      category: 'Protéines',
      availability: 'Bonne',
      quality: 'Bonne',
      trend: '+3%',
    },
    {
      product: 'Huile de palme',
      price: 800,
      unit: 'litre',
      market: 'Marché de la zone est',
      category: 'Lipides',
      availability: 'Bonne',
      quality: 'Excellente',
      trend: '+2%',
    },
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
      name: 'Mairie de Blitta 2 Agbandi',
      type: 'ADMIN',
      status: 'OPERATIONAL',
      location: 'Avenue principale',
      capacity: '50 employés',
      users: 45,
      responsible: 'M. Koné',
      budget: '50M FCFA/an',
      description: 'Bâtiment administratif principal abritant les services municipaux',
      latitude: 8.8667,
      longitude: 0.7833,
    },
    {
      name: 'École primaire centrale',
      type: 'EDUCATION',
      status: 'OPERATIONAL',
      location: 'Quartier Centre',
      capacity: '400 élèves',
      users: 385,
      lastMaintenance: new Date('2024-01-10'),
      nextMaintenance: new Date('2024-04-10'),
      responsible: 'Mme Traoré',
      budget: '2M FCFA/an',
      description: 'École primaire publique avec 8 salles de classe',
    },
    {
      name: 'Centre de santé principal',
      type: 'HEALTH',
      status: 'OPERATIONAL',
      location: 'Quartier Nord',
      capacity: '150 patients/jour',
      users: 120,
      lastMaintenance: new Date('2024-01-05'),
      nextMaintenance: new Date('2024-02-05'),
      responsible: 'Dr. Bamba',
      budget: '8M FCFA/an',
      description: 'Centre de santé avec maternité et urgences',
    },
    {
      name: 'Puits n°3 - Adjamé',
      type: 'WATER',
      status: 'OUT_OF_SERVICE',
      location: 'Quartier Adjamé',
      capacity: '3000L/jour',
      users: 500,
      lastMaintenance: new Date('2023-12-15'),
      nextMaintenance: new Date('2024-01-20'),
      responsible: 'M. Ouattara',
      budget: '500K FCFA',
      description: 'Puits communautaire en panne de pompe',
    },
    {
      name: 'Stade municipal',
      type: 'SPORTS',
      status: 'MAINTENANCE',
      location: 'Zone Est',
      capacity: '1000 spectateurs',
      users: 150,
      lastMaintenance: new Date('2024-01-12'),
      nextMaintenance: new Date('2024-01-25'),
      responsible: 'M. Kouassi',
      budget: '1.5M FCFA/an',
      description: 'Stade de football avec piste d\'athlétisme',
    },
    {
      name: 'Route principale Nord-Sud',
      type: 'ROAD',
      status: 'OPERATIONAL',
      location: 'Axis Nord-Sud',
      responsible: 'Service des travaux',
      budget: '15M FCFA',
      description: 'Route principale bitumée de 8km',
    },
  ];

  for (const infraData of infrastructures) {
    await prisma.infrastructure.create({
      data: infraData,
    });
  }

  console.log(`${infrastructures.length} infrastructures créées`);

  // Créer des cultures
  const crops = [
    {
      name: 'Maïs',
      type: 'CEREAL',
      area: 'Zone Nord',
      areaHa: 1200,
      farmers: 85,
      currentSeason: 'Saison des pluies 2024',
      expectedYield: '3.2 t/ha',
      status: 'GROWING',
      healthStatus: 'WARNING',
      nextAction: 'Fertilisation - 15 jours',
      irrigation: true,
      fertilizer: 'NPK 15-15-15',
      challenges: JSON.stringify(['Sécheresse modérée', 'Ravageurs (chenilles)']),
      opportunities: JSON.stringify(['Prix élevé au marché', 'Demande forte']),
      latitude: 8.88,
      longitude: 0.79,
    },
    {
      name: 'Mil',
      type: 'CEREAL',
      area: 'Zone Est',
      areaHa: 800,
      farmers: 65,
      currentSeason: 'Saison des pluies 2024',
      expectedYield: '1.8 t/ha',
      status: 'GROWING',
      healthStatus: 'GOOD',
      nextAction: 'Désherbage - 10 jours',
      irrigation: false,
      fertilizer: 'Fumier organique',
      challenges: JSON.stringify(['Faibles précipitations']),
      opportunities: JSON.stringify(['Culture résistante', 'Marché local stable']),
      latitude: 8.87,
      longitude: 0.82,
    },
    {
      name: 'Igname',
      type: 'TUBER',
      area: 'Zone Centre',
      areaHa: 600,
      farmers: 45,
      currentSeason: 'Saison sèche 2024',
      expectedYield: '15 t/ha',
      status: 'HARVESTING',
      healthStatus: 'GOOD',
      nextAction: 'Récolte - En cours',
      irrigation: true,
      fertilizer: 'Compost',
      challenges: JSON.stringify(['Main d\'œuvre limitée']),
      opportunities: JSON.stringify(['Prix excellent', 'Stockage possible']),
      latitude: 8.86,
      longitude: 0.78,
    },
    {
      name: 'Tomates',
      type: 'VEGETABLE',
      area: 'Zone maraîchère Sud',
      areaHa: 50,
      farmers: 25,
      currentSeason: 'Toute l\'année',
      expectedYield: '25 t/ha',
      status: 'GROWING',
      healthStatus: 'CRITICAL',
      nextAction: 'Traitement phyto - Urgent',
      irrigation: true,
      fertilizer: 'Engrais liquide',
      challenges: JSON.stringify(['Maladies fongiques', 'Araignées rouges']),
      opportunities: JSON.stringify(['Marché urbain proche', 'Rotation possible']),
      latitude: 8.85,
      longitude: 0.76,
    },
    {
      name: 'Niébé',
      type: 'LEGUME',
      area: 'Zone Ouest',
      areaHa: 300,
      farmers: 35,
      currentSeason: 'Saison des pluies 2024',
      expectedYield: '0.8 t/ha',
      status: 'PLANTED',
      healthStatus: 'GOOD',
      nextAction: 'Semis - Terminé',
      irrigation: false,
      fertilizer: 'Fixation azote naturelle',
      challenges: JSON.stringify(['Prédateurs (insectes)']),
      opportunities: JSON.stringify(['Enrichissement sol', 'Double culture']),
      latitude: 8.89,
      longitude: 0.75,
    },
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
      category: 'population',
      title: 'Recensement de la population 2024',
      content: 'La population de la commune de Blitta 2 Agbandi est estimée à 12,450 habitants, avec une croissance annuelle de 2.3%. La densité de population est de 45 habitants par km².',
      status: 'PUBLISHED',
      priority: 'HIGH',
      author: 'M. Koné',
      views: 245,
    },
    {
      category: 'infrastructure',
      title: 'État des infrastructures scolaires',
      content: '12 établissements scolaires opérationnels sur 13 au total. Le collège municipal est en cours de rénovation pour améliorer les conditions d\'apprentissage.',
      status: 'PUBLISHED',
      priority: 'MEDIUM',
      author: 'Mme Traoré',
      views: 189,
      attachments: 3,
    },
    {
      category: 'health',
      title: 'Rapport mensuel de santé',
      content: 'Le centre de santé principal a enregistré 1,245 consultations ce mois-ci. La campagne de vaccination contre la rougeole est en cours avec une couverture de 78%.',
      status: 'PUBLISHED',
      priority: 'HIGH',
      author: 'Dr. Bamba',
      views: 156,
      attachments: 2,
    },
    {
      category: 'projects',
      title: 'Avancement des projets 2024',
      content: '24 projets en cours dont 8 dans la phase finale. Le nouveau marché devrait être opérationnel en juin 2024. Le budget total alloué est de 250M FCFA.',
      status: 'DRAFT',
      priority: 'HIGH',
      author: 'M. Ouattara',
      views: 312,
      attachments: 5,
    },
    {
      category: 'finance',
      title: 'Budget annuel 2024',
      content: 'Budget total de 250M FCFA alloué aux infrastructures (40%), éducation (32%), santé (24%) et services administratifs (4%).',
      status: 'PUBLISHED',
      priority: 'HIGH',
      author: 'M. Kouassi',
      views: 428,
      attachments: 8,
    },
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
      description: 'Construction d\'un marché moderne avec 200 commerces, des installations sanitaires et un système de gestion des déchets.',
      status: 'ACTIVE',
      progress: 65,
      budget: '50M FCFA',
      startDate: new Date('2024-01-01'),
      completionDate: new Date('2024-06-30'),
      impact: 'Élevé',
      manager: 'M. Ouattara',
    },
    {
      name: 'Réhabilitation du puits n°3',
      description: 'Réparation complète de la pompe et rénovation des abords du puits pour améliorer l\'accès à l\'eau potable.',
      status: 'ACTIVE',
      progress: 30,
      budget: '5M FCFA',
      startDate: new Date('2024-01-15'),
      completionDate: new Date('2024-03-15'),
      impact: 'Moyen',
      manager: 'M. Kouassi',
    },
    {
      name: 'Installation de l\'éclairage public',
      description: 'Installation de 150 lampadaires solaires dans les quartiers principaux pour améliorer la sécurité nocturne.',
      status: 'PLANNING',
      progress: 10,
      budget: '25M FCFA',
      startDate: new Date('2024-02-01'),
      completionDate: new Date('2024-08-31'),
      impact: 'Élevé',
      manager: 'M. Koné',
    },
    {
      name: 'Construction de l\'école maternelle',
      description: 'Construction d\'une école maternelle avec 4 classes, une cour de récréation et des équipements adaptés.',
      status: 'ACTIVE',
      progress: 45,
      budget: '30M FCFA',
      startDate: new Date('2024-01-10'),
      completionDate: new Date('2024-07-15'),
      impact: 'Élevé',
      manager: 'Mme Traoré',
    },
  ];

  for (const projectData of projects) {
    await prisma.project.create({
      data: projectData,
    });
  }

  console.log(`${projects.length} projets créés`);

  console.log('Base de données peuplée avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur lors du peuplement de la base de données:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });