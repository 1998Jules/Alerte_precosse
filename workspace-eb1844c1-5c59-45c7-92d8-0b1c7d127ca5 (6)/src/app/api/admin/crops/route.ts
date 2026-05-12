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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const crop = await db.crop.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.type && { type: body.type.toUpperCase() }),
        ...(body.area && { area: body.area }),
        ...(body.areaHa && { areaHa: parseFloat(body.areaHa) }),
        ...(body.farmers && { farmers: parseInt(body.farmers) }),
        ...(body.currentSeason && { currentSeason: body.currentSeason }),
        ...(body.expectedYield && { expectedYield: body.expectedYield }),
        ...(body.status && { status: body.status.toUpperCase() }),
        ...(body.healthStatus && { healthStatus: body.healthStatus.toUpperCase() }),
        ...(body.nextAction && { nextAction: body.nextAction }),
        ...(body.irrigation !== undefined && { irrigation: Boolean(body.irrigation) }),
        ...(body.fertilizer && { fertilizer: body.fertilizer }),
        ...(body.challenges && { challenges: Array.isArray(body.challenges) ? JSON.stringify(body.challenges) : '[]' }),
        ...(body.opportunities && { opportunities: Array.isArray(body.opportunities) ? JSON.stringify(body.opportunities) : '[]' }),
        ...(body.latitude && { latitude: parseFloat(body.latitude) }),
        ...(body.longitude && { longitude: parseFloat(body.longitude) })
      }
    });

    return NextResponse.json({
      success: true,
      data: crop,
      message: 'Culture mise à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating crop:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour de la culture' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    await db.crop.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Culture supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting crop:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression de la culture' 
      },
      { status: 500 }
    );
  }
}