const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Début du peuplement de la base PostgreSQL Ecommune...');

  try {
    // Créer un utilisateur administrateur
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@blitta2agbandi.tg' },
      update: {},
      create: {
        email: 'admin@blitta2agbandi.tg',
        name: 'Administrateur de la commune',
        role: 'ADMIN',
      },
    });

    console.log('✅ Utilisateur administrateur créé');

    // Créer des alertes communautaires
    const alerts = [
      {
        title: 'Alerte prix élevé - Maïs',
        description: 'Le prix du maïs a augmenté de 15% cette semaine au marché central. Cette hausse affecte principalement les ménages les plus vulnérables.',
        type: 'PRICE',
        level: 'HIGH',
        location: 'Marché central de Blitta',
        authorId: adminUser.id,
        latitude: 8.8667,
        longitude: 0.7833,
        status: 'ACTIVE'
      },
      {
        title: 'Risque de sécheresse persistant',
        description: 'Les prévisions météorologiques indiquent des précipitations faibles pour les deux prochaines semaines. Les agriculteurs sont invités à optimiser l\'irrigation et à utiliser des techniques de conservation d\'eau.',
        type: 'DROUGHT',
        level: 'MEDIUM',
        location: 'Zone agricole nord de Blitta 2',
        authorId: adminUser.id,
        latitude: 8.88,
        longitude: 0.79,
        status: 'ACTIVE'
      },
      {
        title: 'Crue soudaine dans la zone sud',
        description: 'Une crue soudaine a affecté les quartiers bas de la zone sud. Évacuation recommandée pour les habitants des zones à risque. Un centre d\'hébergement est ouvert à l\'école primaire.',
        type: 'FLOOD',
        level: 'HIGH',
        location: 'Quartiers sud, zone riveraine',
        authorId: adminUser.id,
        latitude: 8.85,
        longitude: 0.80,
        status: 'ACTIVE'
      },
      {
        title: 'Panne de pompe à eau - Puits n°2',
        description: 'La pompe du puits n°2 est en panne. Les équipes techniques interviendront dans les 48h prochaines. En attendant, veuillez utiliser les puits n°1 et n°3.',
        type: 'INFRASTRUCTURE',
        level: 'MEDIUM',
        location: 'Puits communautaire n°2 - Agbandi',
        authorId: adminUser.id,
        latitude: 8.87,
        longitude: 0.795,
        status: 'ACTIVE'
      },
      {
        title: 'Grand marché hebdomadaire demain',
        description: 'Le grand marché hebdomadaire aura lieu demain jeudi comme d\'habitude de 5h à 18h. Tous les commerçants et acheteurs sont invités à respecter les mesures d\'hygiène.',
        type: 'WEATHER',
        level: 'LOW',
        location: 'Place du marché central',
        authorId: adminUser.id,
        latitude: 8.865,
        longitude: 0.782,
        status: 'ACTIVE'
      },
      {
        title: 'Campagne de vaccination - Bétail',
        description: 'La campagne de vaccination du bétail commence lundi prochain. Tous les éleveurs doivent présenter leurs animaux au centre vétérinaire.',
        type: 'HEALTH',
        level: 'MEDIUM',
        location: 'Centre vétérinaire de Blitta',
        authorId: adminUser.id,
        latitude: 8.870,
        longitude: 0.788,
        status: 'ACTIVE'
      }
    ];

    console.log('📝 Création des alertes...');
    for (const alertData of alerts) {
      await prisma.alert.create({ data: alertData });
    }
    console.log(`✅ ${alerts.length} alertes créées`);

    // Créer des prix du marché détaillés
    const marketPrices = [
      {
        product: 'Maïs',
        price: 350,
        unit: 'kg',
        currency: 'FCFA',
        trend: '+15%',
        market: 'Marché central de Blitta',
        category: 'Céréales',
        availability: 'Limité',
        quality: 'Bon',
        latitude: 8.8667,
        longitude: 0.7833
      },
      {
        product: 'Riz importé',
        price: 500,
        unit: 'kg',
        currency: 'FCFA',
        trend: '0%',
        market: 'Marché central de Blitta',
        category: 'Céréales',
        availability: 'Bon',
        quality: 'Excellent',
        latitude: 8.8667,
        longitude: 0.7833
      },
      {
        product: 'Mil local',
        price: 300,
        unit: 'kg',
        currency: 'FCFA',
        trend: '-5%',
        market: 'Marché de Blitta 2',
        category: 'Céréales',
        availability: 'Abondant',
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
        market: 'Marché central de Blitta',
        category: 'Légumineuses',
        availability: 'Modéré',
        quality: 'Excellent',
        latitude: 8.8667,
        longitude: 0.7833
      },
      {
        product: 'Manioc frais',
        price: 200,
        unit: 'kg',
        currency: 'FCFA',
        trend: '0%',
        market: 'Marché de Blitta 2',
        category: 'Tubercules',
        availability: 'Abondant',
        quality: 'Bon',
        latitude: 8.868,
        longitude: 0.785
      },
      {
        product: 'Igname',
        price: 400,
        unit: 'kg',
        currency: 'FCFA',
        trend: '+8%',
        market: 'Marché central de Blitta',
        category: 'Tubercules',
        availability: 'Limité',
        quality: 'Excellent',
        latitude: 8.8667,
        longitude: 0.7833
      },
      {
        product: 'Tomate fraîche',
        price: 250,
        unit: 'kg',
        currency: 'FCFA',
        trend: '+12%',
        market: 'Marché central de Blitta',
        category: 'Légumes',
        availability: 'Limité',
        quality: 'Bon',
        latitude: 8.8667,
        longitude: 0.7833
      },
      {
        product: 'Oignon',
        price: 180,
        unit: 'kg',
        currency: 'FCFA',
        trend: '-3%',
        market: 'Marché de Blitta 2',
        category: 'Légumes',
        availability: 'Abondant',
        quality: 'Bon',
        latitude: 8.868,
        longitude: 0.785
      },
      {
        product: 'Poisson fumé',
        price: 2500,
        unit: 'kg',
        currency: 'FCFA',
        trend: '+20%',
        market: 'Marché central de Blitta',
        category: 'Protéines',
        availability: 'Limité',
        quality: 'Bon',
        latitude: 8.8667,
        longitude: 0.7833
      },
      {
        product: 'Huile de palme',
        price: 1200,
        unit: 'litre',
        currency: 'FCFA',
        trend: '-8%',
        market: 'Marché de Blitta 2',
        category: 'Lipides',
        availability: 'Bon',
        quality: 'Artisanale',
        latitude: 8.868,
        longitude: 0.785
      }
    ];

    console.log('💰 Création des prix du marché...');
    for (const priceData of marketPrices) {
      await prisma.marketPrice.create({ data: priceData });
    }
    console.log(`✅ ${marketPrices.length} prix du marché créés`);

    // Créer des infrastructures communales
    const infrastructures = [
      {
        name: 'École Primaire Publique de Blitta 2 Agbandi',
        type: 'EDUCATION',
        status: 'OPERATIONAL',
        location: 'Centre ville - Blitta 2',
        address: 'Avenue de l\'Indépendance, BP 12',
        capacity: '300 élèves',
        users: 280,
        lastMaintenance: new Date('2024-03-15'),
        nextMaintenance: new Date('2024-06-15'),
        responsible: 'M. Koné Adama',
        budget: '5M FCFA/an',
        description: 'École primaire publique avec 8 salles de classe, bibliothèque et cantine',
        latitude: 8.868,
        longitude: 0.784
      },
      {
        name: 'Centre de Santé Intégré de Blitta 2',
        type: 'HEALTH',
        status: 'OPERATIONAL',
        location: 'Quartier sanitaire',
        address: 'Rue de la Santé',
        capacity: '150 patients/jour',
        users: 120,
        lastMaintenance: new Date('2024-02-28'),
        nextMaintenance: new Date('2024-05-28'),
        responsible: 'Dr. Traoré Mariam',
        budget: '10M FCFA/an',
        description: 'Centre de santé primaire avec maternité et dispensaire',
        latitude: 8.869,
        longitude: 0.786
      },
      {
        name: 'Puits communautaire n°1 - Agbandi',
        type: 'WATER',
        status: 'OPERATIONAL',
        location: 'Nord d\'Agbandi',
        address: 'Route de Kara',
        capacity: '5000L/jour',
        users: 200,
        lastMaintenance: new Date('2024-01-20'),
        nextMaintenance: new Date('2024-04-20'),
        responsible: 'M. Ouattara Karim',
        budget: '2M FCFA/an',
        description: 'Puits communautaire avec pompe manuelle et réservoir',
        latitude: 8.872,
        longitude: 0.791
      },
      {
        name: 'Marché Central de Blitta 2',
        type: 'MARKET',
        status: 'OPERATIONAL',
        location: 'Centre ville',
        address: 'Place du Marché',
        capacity: '200 commerçants',
        users: 180,
        lastMaintenance: new Date('2024-03-01'),
        nextMaintenance: new Date('2024-06-01'),
        responsible: 'Mme Bamba Aminata',
        budget: '8M FCFA/an',
        description: 'Marché couvert avec 200 espaces commerciaux, entrepôts et sanitaires',
        latitude: 8.8667,
        longitude: 0.7833
      },
      {
        name: 'Stade Municipal de Blitta 2',
        type: 'SPORTS',
        status: 'OPERATIONAL',
        location: 'Sud de la commune',
        address: 'Route du Stade',
        capacity: '1000 spectateurs',
        users: 150,
        lastMaintenance: new Date('2024-03-30'),
        nextMaintenance: new Date('2024-09-30'),
        responsible: 'M. Sangaré Yacouba',
        budget: '3M FCFA/an',
        description: 'Stade municipal avec terrain de football, vestiaires et tribunes',
        latitude: 8.862,
        longitude: 0.788
      },
      {
        name: 'Poste de Police de Blitta 2',
        type: 'SECURITY',
        status: 'OPERATIONAL',
        location: 'Centre administratif',
        address: 'Avenue de l\'Administration',
        capacity: '20 agents',
        users: 15,
        lastMaintenance: new Date('2024-02-15'),
        nextMaintenance: new Date('2024-08-15'),
        responsible: 'Commissaire Kouadio',
        budget: '4M FCFA/an',
        description: 'Poste de police avec cellules de détention et bureau de plainte',
        latitude: 8.870,
        longitude: 0.782
      }
    ];

    console.log('🏗️ Création des infrastructures...');
    for (const infraData of infrastructures) {
      await prisma.infrastructure.create({ data: infraData });
    }
    console.log(`✅ ${infrastructures.length} infrastructures créées`);

    // Créer des informations sur les cultures agricoles
    const crops = [
      {
        name: 'Maïs pluvial - Saison 2024',
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
        name: 'Riz irrigué - Vallée de l\'Oti',
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
        fertilizer: 'Urée 46%',
        challenges: '[]',
        opportunities: '[]',
        latitude: 8.865,
        longitude: 0.795
      },
      {
        name: 'Arachides - Zone centre',
        type: 'LEGUME',
        area: '25 hectares',
        areaHa: 25,
        farmers: 12,
        currentSeason: 'Saison pluviale 2024',
        expectedYield: '1.8 tonnes/hectare',
        status: 'PLANTED',
        healthStatus: 'GOOD',
        nextAction: 'Désherbage mécanique',
        irrigation: false,
        fertilizer: 'Fosmate',
        challenges: '[]',
        opportunities: '[]',
        latitude: 8.868,
        longitude: 0.785
      },
      {
        name: 'Manioc - Zone sud',
        type: 'TUBER',
        area: '40 hectares',
        areaHa: 40,
        farmers: 20,
        currentSeason: 'Année 2024',
        expectedYield: '20 tonnes/hectare',
        status: 'GROWING',
        healthStatus: 'GOOD',
        nextAction: 'Contrôle des maladies',
        irrigation: false,
        fertilizer: 'Fumier organique',
        challenges: '[]',
        opportunities: '[]',
        latitude: 8.860,
        longitude: 0.788
      },
      {
        name: 'Maraîchage - Périphérie nord',
        type: 'VEGETABLE',
        area: '10 hectares',
        areaHa: 10,
        farmers: 8,
        currentSeason: 'Saison fraîche 2024',
        expectedYield: '15 tonnes/hectare',
        status: 'GROWING',
        healthStatus: 'WARNING',
        nextAction: 'Traitement anti-insectes',
        irrigation: true,
        fertilizer: 'Compost',
        challenges: '[]',
        opportunities: '[]',
        latitude: 8.878,
        longitude: 0.783
      }
    ];

    console.log('🌾 Création des informations sur les cultures...');
    for (const cropData of crops) {
      await prisma.crop.create({ data: cropData });
    }
    console.log(`✅ ${crops.length} cultures créées`);

    // Créer des informations communales
    const communalInfos = [
      {
        category: 'Démographie',
        title: 'Population de la commune de Blitta 2 Agbandi',
        content: 'La commune de Blitta 2 Agbandi compte environ 25 000 habitants selon le dernier recensement de 2022, avec une croissance annuelle de 2.8%. La population est majoritairement jeune (65% ont moins de 25 ans).',
        status: 'PUBLISHED',
        priority: 'HIGH',
        author: 'Mairie de Blitta 2 Agbandi'
      },
      {
        category: 'Administratif',
        title: 'Conseil municipal - Prochaine réunion',
        content: 'La prochaine réunion du conseil municipal aura lieu le 15 février 2024 à 10h dans la salle des délibérations. Ordre du jour : budget 2024, projets d\'infrastructure, rapport d\'activités.',
        status: 'PUBLISHED',
        priority: 'MEDIUM',
        author: 'Secrétariat municipal'
      },
      {
        category: 'Financier',
        title: 'Budget annuel 2024 de la commune',
        content: 'Le budget prévisionnel pour 2024 s\'élève à 500 millions de FCFA, avec une priorité sur l\'éducation (30%), la santé (25%), les infrastructures (20%), l\'agriculture (15%) et l\'administration (10%).',
        status: 'PUBLISHED',
        priority: 'HIGH',
        author: 'Service financier'
      },
      {
        category: 'Infrastructure',
        title: 'Projets d\'infrastructure en cours 2024',
        content: 'Plusieurs projets sont en cours : construction d\'une nouvelle école primaire (avancement 65%), réhabilitation du marché (avancement 30%), adduction d\'eau dans 3 villages (avancement 45%), et électrification de 2 quartiers (avancement 20%).',
        status: 'PUBLISHED',
        priority: 'MEDIUM',
        author: 'Service technique'
      }
    ];

    console.log('📋 Création des informations communales...');
    for (const infoData of communalInfos) {
      await prisma.communalInfo.create({ data: infoData });
    }
    console.log(`✅ ${communalInfos.length} informations communales créées`);

    // Créer des projets de développement
    const projects = [
      {
        name: 'Construction du nouveau marché moderne',
        description: 'Construction d\'un marché moderne avec 200 espaces commerciaux, entrepôts frigorifiques, installations sanitaires, système de gestion des déchets et parking pour 500 véhicules.',
        status: 'ACTIVE',
        progress: 65,
        budget: '50M FCFA',
        startDate: new Date('2024-01-01'),
        completionDate: new Date('2024-06-30'),
        impact: 'Élevé - Améliorera les conditions de travail de 200 commerçants et bénéficiera à 5000 habitants',
        manager: 'M. Ouattara Karim - Directeur des travaux',
        latitude: 8.875,
        longitude: 0.78
      },
      {
        name: 'Réhabilitation complète du puits n°3',
        description: 'Réparation complète de la pompe, rénovation des abords du puits, installation d\'un système de traitement d\'eau et construction d\'un réservoir de stockage de 10 000 litres.',
        status: 'ACTIVE',
        progress: 30,
        budget: '5M FCFA',
        startDate: new Date('2024-01-15'),
        completionDate: new Date('2024-03-15'),
        impact: 'Moyen - Fournira de l\'eau potable à 1500 habitants supplémentaires',
        manager: 'M. Kouassi Jean - Chef de projet eau',
        latitude: 8.87,
        longitude: 0.80
      },
      {
        name: 'Installation de l\'éclairage public solaire',
        description: 'Installation de 150 lampadaires solaires dans les quartiers principaux pour améliorer la sécurité nocturne, les activités économiques et la qualité de vie.',
        status: 'PLANNING',
        progress: 10,
        budget: '25M FCFA',
        startDate: new Date('2024-02-01'),
        completionDate: new Date('2024-08-31'),
        impact: 'Élevé - Bénéficiera à 15 000 habitants et réduira la criminalité de 40%',
        manager: 'M. Koné Moussa - Responsable énergie',
        latitude: 8.87,
        longitude: 0.78
      },
      {
        name: 'Construction de l\'école maternelle',
        description: 'Construction d\'une école maternelle avec 4 salles de classe, une cour de récréation, des équipements adaptés, un bloc sanitaire et une cantine.',
        status: 'ACTIVE',
        progress: 45,
        budget: '30M FCFA',
        startDate: new Date('2024-01-10'),
        completionDate: new Date('2024-07-15'),
        impact: 'Élevé - Scolarisera 120 enfants et créera 8 emplois',
        manager: 'Mme Traoré Aïssata - Directrice de l\'éducation',
        latitude: 8.86,
        longitude: 0.78
      }
    ];

    console.log('🚧 Création des projets de développement...');
    for (const projectData of projects) {
      await prisma.project.create({ data: projectData });
    }
    console.log(`✅ ${projects.length} projets créés`);

    // Créer/mettre à jour les statistiques du tableau de bord
    console.log('📊 Mise à jour des statistiques du tableau de bord...');
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

    console.log('✅ Statistiques du tableau de bord mises à jour');

    console.log('\n🎉 Base de données PostgreSQL Ecommune peuplée avec succès !');
    console.log('🌍 Données réelles créées pour la commune de Blitta 2 Agbandi');
    console.log('\n📈 Résumé des données créées :');
    console.log(`   • ${alerts.length} alertes communautaires`);
    console.log(`   • ${marketPrices.length} prix du marché`);
    console.log(`   • ${infrastructures.length} infrastructures`);
    console.log(`   • ${crops.length} cultures agricoles`);
    console.log(`   • ${communalInfos.length} informations communales`);
    console.log(`   • ${projects.length} projets de développement`);
    console.log('\n🚀 L\'application est maintenant prête à être utilisée !');

  } catch (error) {
    console.error('❌ Erreur lors du peuplement de la base de données:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('💥 Erreur fatale:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('📝 Connexion à la base de données fermée');
  });