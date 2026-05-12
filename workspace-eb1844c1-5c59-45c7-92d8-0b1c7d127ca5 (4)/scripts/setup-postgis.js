import { Client } from 'pg';

async function setupPostGIS() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Configuration de PostgreSQL avec PostGIS...');
    
    // Activer l'extension PostGIS
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ Extension PostGIS activée');
    
    // Activer les fonctions géospatiales
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis_raster;');
    console.log('✅ Extension PostGIS Raster activée');
    
    // Créer la base de données si elle n'existe pas
    const dbName = process.env.DATABASE_URL.split('/').pop();
    await client.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
    console.log(`✅ Base de données "${dbName}" créée ou déjà existante`);
    
    console.log('🎉 PostgreSQL avec PostGIS est maintenant configuré !');
    console.log('\nÉtapes suivantes :');
    console.log('1. Mettez à jour votre DATABASE_URL dans .env avec vos vraies identifiants');
    console.log('2. Exécutez : bun run db:push');
    console.log('3. Exécutez : bun run db:seed-postgres');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration de PostGIS:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupPostGIS();