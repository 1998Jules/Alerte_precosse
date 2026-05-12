const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'Ecommune'
  });

  try {
    console.log('🔍 Test de connexion à PostgreSQL...');
    await client.connect();
    console.log('✅ Connexion réussie à PostgreSQL!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 Version PostgreSQL:', result.rows[0].version.split(' ')[0]);
    
    // Vérifier si la base Ecommune existe
    const dbResult = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', ['Ecommune']);
    if (dbResult.rows.length > 0) {
      console.log('✅ Base de données Ecommune existe');
    } else {
      console.log('❌ Base de données Ecommune n\'existe pas');
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 PostgreSQL n\'est probablement pas démarré');
    } else if (error.code === '28P01') {
      console.log('💡 Mauvais mot de passe ou utilisateur');
    } else if (error.code === '3D000') {
      console.log('💡 La base de données Ecommune n\'existe pas');
    }
  } finally {
    await client.end();
  }
}

testConnection();