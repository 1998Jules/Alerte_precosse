import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const infrastructures = await db.infrastructure.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: infrastructures,
      total: infrastructures.length
    });
  } catch (error) {
    console.error('Error fetching infrastructures:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des infrastructures' 
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
      status, 
      location, 
      capacity, 
      users, 
      responsible, 
      budget, 
      description,
      latitude,
      longitude 
    } = body;

    if (!name || !type || !status || !location || !responsible || !description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Champs obligatoires manquants' 
        },
        { status: 400 }
      );
    }

    const infrastructure = await db.infrastructure.create({
      data: {
        name,
        type,
        status,
        location,
        capacity: capacity || null,
        users: users || null,
        responsible,
        budget: budget || null,
        description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: infrastructure,
      message: 'Infrastructure créée avec succès'
    });
  } catch (error) {
    console.error('Error creating infrastructure:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de l\'infrastructure' 
      },
      { status: 500 }
    );
  }
}