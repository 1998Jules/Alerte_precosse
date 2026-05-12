import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID du prix requis' 
        },
        { status: 400 }
      );
    }

    // Vérifier si le prix existe
    const existingPrice = await db.marketPrice.findUnique({
      where: { id }
    });

    if (!existingPrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prix non trouvé' 
        },
        { status: 404 }
      );
    }

    // Supprimer le prix
    await db.marketPrice.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Prix supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting market price:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression du prix' 
      },
      { status: 500 }
    );
  }
}