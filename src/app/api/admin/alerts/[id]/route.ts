import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =======================
   DELETE : supprimer alerte
   ======================= */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID manquant" },
        { status: 400 }
      );
    }

    await db.alert.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Alerte supprimée avec succès",
    });
  } catch (error) {
    console.error("DELETE alert error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

/* =======================
   PUT : modifier alerte
   ======================= */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { title, description, type, level, status, location } = body;

    const alert = await db.alert.update({
      where: { id },
      data: {
        title,
        description,
        type,
        level,
        status,
        location,
      },
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: "Alerte mise à jour",
    });
  } catch (error) {
    console.error("PUT alert error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
