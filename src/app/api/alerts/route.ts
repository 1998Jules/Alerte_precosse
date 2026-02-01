import { NextResponse } from "next/server";

// Mock data - dans une vraie application, cela viendrait d'une base de données
const alerts = [
  {
    id: 1,
    type: 'price',
    title: 'Augmentation du prix du maïs',
    description: 'Le prix du maïs a augmenté de 15% cette semaine',
    level: 'high',
    time: 'Il y a 2 heures',
    location: 'Marché central',
    impact: 'Élevé',
    actions: ['Surveillance renforcée', 'Communication aux commerçants', 'Analyse des causes']
  },
  {
    id: 2,
    type: 'drought',
    title: 'Risque de sécheresse',
    description: 'Faibles précipitations prévues pour les 2 prochaines semaines',
    level: 'medium',
    time: 'Il y a 5 heures',
    location: 'Zone agricole nord',
    impact: 'Moyen',
    actions: ['Optimisation irrigation', 'Sensibilisation agriculteurs', 'Plan d\'urgence']
  },
  {
    id: 3,
    type: 'flood',
    title: 'Alerte inondation',
    description: 'Crue du fleuve surveillée dans la zone sud',
    level: 'low',
    time: 'Il y a 1 jour',
    location: 'Zone sud du fleuve',
    impact: 'Faible',
    actions: ['Surveillance continue', 'Préparation des équipements', 'Information population']
  },
  {
    id: 4,
    type: 'infrastructure',
    title: 'Panne de pompe à eau',
    description: 'La pompe du puits n°3 est en panne',
    level: 'medium',
    time: 'Il y a 3 heures',
    location: 'Quartier Adjamé',
    impact: 'Moyen',
    actions: ['Intervention technique prévue', 'Distribution eau potable', 'Réparation urgente']
  },
  {
    id: 5,
    type: 'health',
    title: 'Campagne de vaccination',
    description: 'Campagne de vaccination contre la rougeole',
    level: 'low',
    time: 'Il y a 2 jours',
    location: 'Centre de santé',
    impact: 'Positif',
    actions: ['Communication population', 'Organisation centres', 'Suivi couverture']
  }
];

export async function GET() {
  try {
    // Simulation de délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      data: alerts,
      total: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des alertes' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation des données
    const { type, title, description, level, location } = body;
    
    if (!type || !title || !description || !level) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Champs obligatoires manquants' 
        },
        { status: 400 }
      );
    }

    // Création de la nouvelle alerte
    const newAlert = {
      id: alerts.length + 1,
      type,
      title,
      description,
      level,
      location: location || 'Non spécifié',
      time: 'À l\'instant',
      impact: level === 'high' ? 'Élevé' : level === 'medium' ? 'Moyen' : 'Faible',
      actions: []
    };

    alerts.push(newAlert);

    return NextResponse.json({
      success: true,
      data: newAlert,
      message: 'Alerte créée avec succès'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de l\'alerte' 
      },
      { status: 500 }
    );
  }
}