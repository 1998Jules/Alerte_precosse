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
      },
      take: 10 // Limiter aux 10 plus récentes pour le dashboard
    });

    // Transformer les données pour correspondre au format attendu
    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      type: alert.type.toLowerCase(),
      title: alert.title,
      description: alert.description,
      level: alert.level.toLowerCase(),
      time: formatTimeAgo(alert.createdAt),
      location: alert.location,
      status: alert.status,
      author: alert.author.name
    }));

    return NextResponse.json({
      success: true,
      data: formattedAlerts,
      total: alerts.length,
      timestamp: new Date().toISOString()
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
    const { type, title, description, level, location, authorId } = body;

    if (!type || !title || !description || !level) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Champs obligatoires manquants' 
        },
        { status: 400 }
      );
    }

    // Utiliser l'utilisateur admin par défaut si aucun authorId n'est fourni
    let user = null;
    if (authorId) {
      user = await db.user.findUnique({ where: { id: authorId } });
    } else {
      user = await db.user.findFirst({ where: { role: 'ADMIN' } });
    }

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Utilisateur non trouvé' 
        },
        { status: 400 }
      );
    }

    const alert = await db.alert.create({
      data: {
        title,
        description,
        type: type.toUpperCase(),
        level: level.toUpperCase(),
        location: location || null,
        authorId: user.id,
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
      data: {
        id: alert.id,
        type: alert.type.toLowerCase(),
        title: alert.title,
        description: alert.description,
        level: alert.level.toLowerCase(),
        time: 'À l\'instant',
        location: alert.location,
        status: alert.status.toLowerCase(),
        author: alert.author.name
      },
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

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return 'À l\'instant';
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }
}