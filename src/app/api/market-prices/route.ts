import { NextResponse } from "next/server";

// Mock data - dans une vraie application, cela viendrait d'une base de données
const marketPrices = [
  {
    id: 1,
    product: 'Maïs',
    price: 350,
    unit: 'kg',
    currency: 'FCFA',
    trend: '+15%',
    change: 'up',
    lastWeek: 304,
    lastMonth: 320,
    market: 'Marché central',
    category: 'Céréales',
    availability: 'Limitée',
    quality: 'Bonne'
  },
  {
    id: 2,
    product: 'Riz',
    price: 500,
    unit: 'kg',
    currency: 'FCFA',
    trend: '+5%',
    change: 'up',
    lastWeek: 476,
    lastMonth: 480,
    market: 'Marché central',
    category: 'Céréales',
    availability: 'Bonne',
    quality: 'Excellente'
  },
  {
    id: 3,
    product: 'Mil',
    price: 300,
    unit: 'kg',
    currency: 'FCFA',
    trend: '-2%',
    change: 'down',
    lastWeek: 306,
    lastMonth: 310,
    market: 'Marché de la zone nord',
    category: 'Céréales',
    availability: 'Excellente',
    quality: 'Bonne'
  },
  {
    id: 4,
    product: 'Igname',
    price: 400,
    unit: 'kg',
    currency: 'FCFA',
    trend: '0%',
    change: 'stable',
    lastWeek: 400,
    lastMonth: 395,
    market: 'Marché central',
    category: 'Tubercules',
    availability: 'Bonne',
    quality: 'Bonne'
  },
  {
    id: 5,
    product: 'Tomate',
    price: 250,
    unit: 'kg',
    currency: 'FCFA',
    trend: '+8%',
    change: 'up',
    lastWeek: 231,
    lastMonth: 220,
    market: 'Marché de la zone sud',
    category: 'Légumes',
    availability: 'Limitée',
    quality: 'Moyenne'
  },
  {
    id: 6,
    product: 'Oignon',
    price: 180,
    unit: 'kg',
    currency: 'FCFA',
    trend: '-5%',
    change: 'down',
    lastWeek: 189,
    lastMonth: 195,
    market: 'Marché central',
    category: 'Légumes',
    availability: 'Excellente',
    quality: 'Bonne'
  },
  {
    id: 7,
    product: 'Poisson fumé',
    price: 1200,
    unit: 'kg',
    currency: 'FCFA',
    trend: '+3%',
    change: 'up',
    lastWeek: 1165,
    lastMonth: 1150,
    market: 'Marché central',
    category: 'Protéines',
    availability: 'Bonne',
    quality: 'Bonne'
  },
  {
    id: 8,
    product: 'Huile de palme',
    price: 800,
    unit: 'litre',
    currency: 'FCFA',
    trend: '+2%',
    change: 'up',
    lastWeek: 784,
    lastMonth: 780,
    market: 'Marché de la zone est',
    category: 'Lipides',
    availability: 'Bonne',
    quality: 'Excellente'
  }
];

export async function GET() {
  try {
    // Simulation de délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json({
      success: true,
      data: marketPrices,
      total: marketPrices.length,
      timestamp: new Date().toISOString(),
      summary: {
        averageIncrease: '+4.5%',
        productsIncreasing: 5,
        productsDecreasing: 2,
        productsStable: 1,
        criticalProducts: ['Maïs', 'Tomate']
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des prix du marché' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation des données
    const { product, price, unit, market, category } = body;
    
    if (!product || !price || !unit || !market || !category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Champs obligatoires manquants' 
        },
        { status: 400 }
      );
    }

    // Création du nouveau prix
    const newPrice = {
      id: marketPrices.length + 1,
      product,
      price: parseFloat(price),
      unit,
      currency: 'FCFA',
      trend: 'Nouveau',
      change: 'new',
      lastWeek: parseFloat(price),
      lastMonth: parseFloat(price),
      market,
      category,
      availability: 'À vérifier',
      quality: 'À vérifier'
    };

    marketPrices.push(newPrice);

    return NextResponse.json({
      success: true,
      data: newPrice,
      message: 'Prix ajouté avec succès'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'ajout du prix' 
      },
      { status: 500 }
    );
  }
}