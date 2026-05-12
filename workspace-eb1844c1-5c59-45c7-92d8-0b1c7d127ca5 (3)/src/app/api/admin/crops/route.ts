import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const crops = await db.crop.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: crops,
      total: crops.length
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

    if (!name || !type || !area || !areaHa || !farmers || !status || !healthStatus) {
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
        type,
        area,
        areaHa: parseFloat(areaHa),
        farmers: parseInt(farmers),
        currentSeason: currentSeason || '',
        expectedYield: expectedYield || '',
        status,
        healthStatus,
        nextAction: nextAction || '',
        irrigation: irrigation || false,
        fertilizer: fertilizer || '',
        challenges: challenges ? JSON.stringify(challenges) : '[]',
        opportunities: opportunities ? JSON.stringify(opportunities) : '[]',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: crop,
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