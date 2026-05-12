import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const communalInfos = await db.communalInfo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: communalInfos,
      total: communalInfos.length
    });
  } catch (error) {
    console.error('Error fetching communal infos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des informations communales' 
      },
      { status: 500 }
    );
  }
}