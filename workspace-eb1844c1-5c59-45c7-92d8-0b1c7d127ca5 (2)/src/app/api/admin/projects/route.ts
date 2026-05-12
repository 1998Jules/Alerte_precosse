import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: projects,
      total: projects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des projets' 
      },
      { status: 500 }
    );
  }
}