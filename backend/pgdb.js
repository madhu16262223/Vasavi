import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_DB_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Note]:', err.message);
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('[PostgreSQL Query Error]:', err.message);
    throw err;
  }
}

export default { pool, query };
