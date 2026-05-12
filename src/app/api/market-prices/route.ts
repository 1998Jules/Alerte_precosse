import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Assure-toi que c'est bien ton client Prisma

// GET : récupérer tous les prix du marché
export async function GET() {
  try {
    const marketPrices = await db.marketPrice.findMany({
      orderBy: { recordedAt: "desc" }, // les plus récents en premier
    });

    // Calcul résumé simple
    const productsIncreasing = marketPrices.filter(p => p.trend?.includes("+")).length;
    const productsDecreasing = marketPrices.filter(p => p.trend?.includes("-")).length;
    const productsStable = marketPrices.filter(p => p.trend === "0%" || p.trend === "stable").length;
    const criticalProducts = marketPrices
      .filter(p => p.availability === "Limitée")
      .map(p => p.product);

    return NextResponse.json({
      success: true,
      data: marketPrices,
      total: marketPrices.length,
      timestamp: new Date().toISOString(),
      summary: {
        productsIncreasing,
        productsDecreasing,
        productsStable,
        criticalProducts
      }
    });
  } catch (error) {
    console.error("Error fetching market prices:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des prix du marché"
      },
      { status: 500 }
    );
  }
}

// POST : ajouter un nouveau prix
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, price, unit, market, category, availability, quality, trend } = body;

    if (!product || !price || !unit || !market || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Champs obligatoires manquants"
        },
        { status: 400 }
      );
    }

    const newPrice = await db.marketPrice.create({
      data: {
        product,
        price: parseFloat(price),
        unit,
        market,
        category,
        trend: trend || "Nouveau",
        availability: availability || "À vérifier",
        quality: quality || "À vérifier"
      }
    });

    return NextResponse.json({
      success: true,
      data: newPrice,
      message: "Prix ajouté avec succès"
    });
  } catch (error) {
    console.error("Error adding market price:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'ajout du prix"
      },
      { status: 500 }
    );
  }
}
