import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:MoEAzKDZDmmBFaIfqVFMptomGRbWdhVa@reseau.proxy.rlwy.net:21194/railway';

async function runSchema() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await pool.connect();
    console.log('✅ Connected successfully');

    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📜 Running schema...');
    await pool.query(schema);
    console.log('✅ Schema executed successfully');

    // Verify tables were created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Tables created:', tables.rows.map(r => r.table_name));

    await pool.end();
    console.log('🎉 Schema migration complete!');
  } catch (error) {
    console.error('❌ Error running schema:', error);
    process.exit(1);
  }
}

runSchema();
