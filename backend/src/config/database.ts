import { Pool } from 'pg';

let pool: Pool | null = null;

export const connectDB = async () => {
  if (pool) return pool;
  
  try {
    // Use DATABASE_URL from environment (Railway public URL)
    const connectionString = process.env.DATABASE_URL || 
                            process.env.POSTGRES_URL || 
                            'postgresql://postgres:MoEAzKDZDmmBFaIfqVFMptomGRbWdhVa@reseau.proxy.rlwy.net:21194/railway';
    
    console.log('🔌 Connecting to PostgreSQL with:', connectionString.substring(0, 30) + '...');
    
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    // Test connection
    const client = await pool.connect();
    client.release();
    console.log('✅ PostgreSQL connected successfully');
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    // Don't process.exit in serverless — let the request fail gracefully
    return null;
  }
};

export const getPool = () => pool;
