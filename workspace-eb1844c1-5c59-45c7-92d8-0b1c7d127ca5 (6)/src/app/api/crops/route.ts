import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const crops = await db.crop.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedCrops = crops.map(crop => ({
      ...crop,
      type: crop.type.toLowerCase(),
      status: crop.status.toLowerCase(),
      healthStatus: crop.healthStatus.toLowerCase(),
      challenges: JSON.parse(crop.challenges || '[]'),
      opportunities: JSON.parse(crop.opportunities || '[]'),
      lastUpdate: new Date(crop.updatedAt).toLocaleDateString('fr-FR')
    }));

    return NextResponse.json({
      success: true,
      data: formattedCrops,
      total: formattedCrops.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching crops:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des cultures' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      type, 
      area, 
      areaHa, 
      farmers, 
      currentSeason, 
      expectedYield, 
      status, 
      healthStatus, 
      nextAction, 
      irrigation, 
      fertilizer, 
      challenges, 
      opportunities,
      latitude,
      longitude
    } = body;

    if (!name || !type || !area || !areaHa || !farmers || !currentSeason || !expectedYield || !status || !healthStatus) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Champs obligatoires manquants' 
        },
        { status: 400 }
      );
    }

    const crop = await db.crop.create({
      data: {
        name,
        type: type.toUpperCase(),
        area,
        areaHa: parseFloat(areaHa),
        farmers: parseInt(farmers),
        currentSeason,
        expectedYield,
        status: status.toUpperCase(),
        healthStatus: healthStatus.toUpperCase(),
        nextAction,
        irrigation: Boolean(irrigation),
        fertilizer,
        challenges: Array.isArray(challenges) ? JSON.stringify(challenges) : '[]',
        opportunities: Array.isArray(opportunities) ? JSON.stringify(opportunities) : '[]',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      }
    });

    // Transformer la réponse pour correspondre au format attendu
    const formattedCrop = {
      ...crop,
      type: crop.type.toLowerCase(),
      status: crop.status.toLowerCase(),
      healthStatus: crop.healthStatus.toLowerCase(),
      challenges: JSON.parse(crop.challenges || '[]'),
      opportunities: JSON.parse(crop.opportunities || '[]'),
      lastUpdate: new Date(crop.updatedAt).toLocaleDateString('fr-FR')
    };

    return NextResponse.json({
      success: true,
      data: formattedCrop,
      message: 'Culture créée avec succès'
    });
  } catch (error) {
    console.error('Error creating crop:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de la culture' 
      },
      { status: 500 }
    );
  }
}