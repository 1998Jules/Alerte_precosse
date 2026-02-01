import { NextResponse } from "next/server";

// Mock data - dans une vraie application, cela viendrait d'un SIG ou d'une base de données géospatiales
const geoportalData = {
  mapCenter: { lat: 8.8667, lng: 0.7833 }, // Coordonnées approximatives de Blitta
  zoom: 12,
  layers: {
    administrative: {
      name: 'Limites administratives',
      visible: true,
      opacity: 0.8,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Blitta 2 Agbandi', population: 12450, area: 276 },
            geometry: {
              type: 'Polygon',
              coordinates: [[[0.75, 8.85], [0.80, 8.85], [0.80, 8.88], [0.75, 8.88], [0.75, 8.85]]]
            }
          }
        ]
      }
    },
    infrastructures: {
      name: 'Infrastructures',
      visible: true,
      opacity: 1,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { 
              name: 'Mairie', 
              type: 'administration', 
              status: 'Opérationnel',
              address: 'Avenue principale',
              phone: '+228 XX XX XX XX'
            },
            geometry: { type: 'Point', coordinates: [0.7833, 8.8667] }
          },
          {
            type: 'Feature',
            properties: { 
              name: 'Centre de santé principal', 
              type: 'santé', 
              status: 'Opérationnel',
              capacity: 150,
              services: ['Urgences', 'Maternité', 'Vaccination']
            },
            geometry: { type: 'Point', coordinates: [0.775, 8.87] }
          },
          {
            type: 'Feature',
            properties: { 
              name: 'École primaire centrale', 
              type: 'éducation', 
              status: 'Opérationnel',
              students: 400,
              classes: 8
            },
            geometry: { type: 'Point', coordinates: [0.79, 8.86] }
          },
          {
            type: 'Feature',
            properties: { 
              name: 'Marché central', 
              type: 'marché', 
              status: 'Opérationnel',
              days: ['Lundi', 'Mercredi', 'Samedi'],
              stalls: 200
            },
            geometry: { type: 'Point', coordinates: [0.78, 8.86] }
          },
          {
            type: 'Feature',
            properties: { 
              name: 'Puits n°1', 
              type: 'eau', 
              status: 'Opérationnel',
              dailyCapacity: '5000L',
              users: 500
            },
            geometry: { type: 'Point', coordinates: [0.77, 8.88] }
          }
        ]
      }
    },
    alertZones: {
      name: 'Zones d\'alerte',
      visible: true,
      opacity: 0.6,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { 
              name: 'Zone à risque d\'inondation', 
              alertType: 'flood', 
              level: 'low',
              area: '12km²',
              population: 1500,
              description: 'Zone sud près du fleuve'
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[[0.76, 8.85], [0.78, 8.85], [0.78, 8.87], [0.76, 8.87], [0.76, 8.85]]]
            }
          },
          {
            type: 'Feature',
            properties: { 
              name: 'Zone de sécheresse', 
              alertType: 'drought', 
              level: 'medium',
              area: '25km²',
              population: 3200,
              description: 'Zone agricole nord'
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[[0.79, 8.87], [0.82, 8.87], [0.82, 8.89], [0.79, 8.89], [0.79, 8.87]]]
            }
          }
        ]
      }
    },
    agriculture: {
      name: 'Zones agricoles',
      visible: false,
      opacity: 0.7,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { 
              name: 'Zone céréalière', 
              crop: 'Maïs, Mil', 
              area: '3500ha',
              farmers: 180,
              yield: '2.5t/ha'
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[[0.80, 8.88], [0.85, 8.88], [0.85, 8.91], [0.80, 8.91], [0.80, 8.88]]]
            }
          },
          {
            type: 'Feature',
            properties: { 
              name: 'Zone maraîchère', 
              crop: 'Tomates, Oignons', 
              area: '800ha',
              farmers: 65,
              yield: '15t/ha'
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[[0.74, 8.86], [0.76, 8.86], [0.76, 8.88], [0.74, 8.88], [0.74, 8.86]]]
            }
          }
        ]
      }
    },
    waterResources: {
      name: 'Ressources en eau',
      visible: false,
      opacity: 0.8,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { 
              name: 'Fleuve', 
              type: 'fleuve', 
              length: '15km',
              flow: 'Normal',
              quality: 'Bonne'
            },
            geometry: {
              type: 'LineString',
              coordinates: [[0.75, 8.84], [0.78, 8.86], [0.80, 8.88]]
            }
          },
          {
            type: 'Feature',
            properties: { 
              name: 'Forage n°1', 
              type: 'forage', 
              depth: '80m',
              flow: '8m³/h',
              status: 'Opérationnel'
            },
            geometry: { type: 'Point', coordinates: [0.82, 8.89] }
          }
        ]
      }
    }
  },
  statistics: {
    totalArea: '276km²',
    builtUpArea: '45km²',
    agriculturalArea: '185km²',
    naturalArea: '46km²',
    populationDensity: '45 hab/km²',
    infrastructureDensity: '0.17 infrastructures/km²'
  }
};

export async function GET() {
  try {
    // Simulation de délai réseau
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return NextResponse.json({
      success: true,
      data: geoportalData,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des données géospatiales' 
      },
      { status: 500 }
    );
  }
}