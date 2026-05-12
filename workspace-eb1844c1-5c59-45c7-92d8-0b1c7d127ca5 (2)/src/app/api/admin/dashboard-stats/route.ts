import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let stats = await db.dashboardStats.findFirst();
    
    if (!stats) {
      // Créer les statistiques par défaut si elles n'existent pas
      stats = await db.dashboardStats.create({
        data: {
          population: 12450,
          households: 2100,
          projects: 24,
          activeProjects: 16,
          completedProjects: 6,
          infrastructures: 47,
          operationalInfra: 43,
          totalArea: "276",
          density: "45"
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { population, households, projects, activeProjects, completedProjects, infrastructures, operationalInfra, totalArea, density } = body;

    let stats = await db.dashboardStats.findFirst();
    
    if (stats) {
      stats = await db.dashboardStats.update({
        where: { id: stats.id },
        data: {
          population: population !== undefined ? population : stats.population,
          households: households !== undefined ? households : stats.households,
          projects: projects !== undefined ? projects : stats.projects,
          activeProjects: activeProjects !== undefined ? activeProjects : stats.activeProjects,
          completedProjects: completedProjects !== undefined ? completedProjects : stats.completedProjects,
          infrastructures: infrastructures !== undefined ? infrastructures : stats.infrastructures,
          operationalInfra: operationalInfra !== undefined ? operationalInfra : stats.operationalInfra,
          totalArea: totalArea !== undefined ? totalArea : stats.totalArea,
          density: density !== undefined ? density : stats.density,
          lastUpdated: new Date()
        }
      });
    } else {
      stats = await db.dashboardStats.create({
        data: {
          population: population || 12450,
          households: households || 2100,
          projects: projects || 24,
          activeProjects: activeProjects || 16,
          completedProjects: completedProjects || 6,
          infrastructures: infrastructures || 47,
          operationalInfra: operationalInfra || 43,
          totalArea: totalArea || "276",
          density: density || "45"
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Statistiques mises à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour des statistiques' 
      },
      { status: 500 }
    );
  }
}