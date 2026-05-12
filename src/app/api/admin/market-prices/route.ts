import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const marketPrices = await db.marketPrice.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: marketPrices,
      total: marketPrices.length
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

    const marketPrice = await db.marketPrice.create({
      data: {
        product,
        price: parseFloat(price),
        unit,
        market,
        category,
        availability: availability || 'Bonne',
        quality: quality || 'Bonne',
        trend: trend || '0%',
        currency: 'FCFA'
      }
    });

    return NextResponse.json({
      success: true,
      data: marketPrice,
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