import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const marketPrices = await db.marketPrice.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedPrices = marketPrices.map(price => {
      const trendValue = parseFloat(price.trend.replace('%', '').replace('+', '')) || 0;
      const lastWeekPrice = price.lastWeekPrice || price.price * 0.95;
      const lastMonthPrice = price.lastMonthPrice || price.price * 0.90;
      
      return {
        id: price.id,
        product: price.product,
        price: price.price,
        unit: price.unit,
        currency: price.currency || 'FCFA',
        trend: price.trend || '0%',
        change: trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'stable',
        lastWeek: lastWeekPrice,
        lastMonth: lastMonthPrice,
        market: price.market,
        category: price.category,
        availability: price.availability || 'Bonne',
        quality: price.quality || 'Bonne'
      };
    });

    // Calculer les statistiques
    const increasing = formattedPrices.filter(p => p.change === 'up').length;
    const decreasing = formattedPrices.filter(p => p.change === 'down').length;
    const stable = formattedPrices.filter(p => p.change === 'stable').length;
    
    const averageTrend = formattedPrices.reduce((acc, p) => {
      const trend = parseFloat(p.trend.replace('%', '').replace('+', '')) || 0;
      return acc + trend;
    }, 0) / formattedPrices.length;

    return NextResponse.json({
      success: true,
      data: formattedPrices,
      total: formattedPrices.length,
      timestamp: new Date().toISOString(),
      summary: {
        averageIncrease: `${averageTrend > 0 ? '+' : ''}${averageTrend.toFixed(1)}%`,
        productsIncreasing: increasing,
        productsDecreasing: decreasing,
        productsStable: stable,
        criticalProducts: formattedPrices
          .filter(p => Math.abs(parseFloat(p.trend.replace('%', '').replace('+', ''))) > 10)
          .map(p => p.product)
      }
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
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
    const { product, price, unit, market, category, availability, quality, trend } = body;

    if (!product || !price || !unit || !market || !category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Champs obligatoires manquants' 
        },
        { status: 400 }
      );
    }

    // Récupérer le dernier prix pour ce produit pour calculer la tendance
    const lastPrice = await db.marketPrice.findFirst({
      where: { product },
      orderBy: { createdAt: 'desc' }
    });

    const currentPrice = parseFloat(price);
    const lastWeekPrice = lastPrice ? lastPrice.price : currentPrice * 0.95;
    const lastMonthPrice = lastPrice ? lastPrice.lastMonthPrice || currentPrice * 0.90 : currentPrice * 0.90;
    
    // Calculer la tendance si non fournie
    let calculatedTrend = trend;
    if (!calculatedTrend && lastPrice) {
      const change = ((currentPrice - lastPrice.price) / lastPrice.price) * 100;
      calculatedTrend = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    }

    const marketPrice = await db.marketPrice.create({
      data: {
        product,
        price: currentPrice,
        unit,
        market,
        category,
        availability: availability || 'Bonne',
        quality: quality || 'Bonne',
        trend: calculatedTrend || '0%',
        currency: 'FCFA'
      }
    });

    // Transformer la réponse pour correspondre au format attendu
    const trendValue = parseFloat(marketPrice.trend.replace('%', '').replace('+', '')) || 0;
    const formattedPrice = {
      id: marketPrice.id,
      product: marketPrice.product,
      price: marketPrice.price,
      unit: marketPrice.unit,
      currency: marketPrice.currency,
      trend: marketPrice.trend,
      change: trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'stable',
      lastWeek: lastWeekPrice,
      lastMonth: lastMonthPrice,
      market: marketPrice.market,
      category: marketPrice.category,
      availability: marketPrice.availability,
      quality: marketPrice.quality
    };

    return NextResponse.json({
      success: true,
      data: formattedPrice,
      message: 'Prix ajouté avec succès'
    });
  } catch (error) {
    console.error('Error creating market price:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'ajout du prix' 
      },
      { status: 500 }
    );
  }
}