import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: alerts,
      total: alerts.length
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
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
    const { title, description, type, level, location, authorId } = body;

    if (!title || !description || !type || !level || !authorId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Champs obligatoires manquants' 
        },
        { status: 400 }
      );
    }

    const alert = await db.alert.create({
      data: {
        title,
        description,
        type,
        level,
        location: location || null,
        authorId,
        status: 'ACTIVE'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alerte créée avec succès'
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de l\'alerte' 
      },
      { status: 500 }
    );
  }
}