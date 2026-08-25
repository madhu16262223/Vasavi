import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_DB_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // High-concurrency connection pool for thousands of concurrent users
  idleTimeoutMillis: 10000, // Rapidly reclaim idle connections
  connectionTimeoutMillis: 5000, // Fail-fast timeout
  allowExitOnIdle: true
});

pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Note]:', err.message);
});

export async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    // If connection dropped, attempt single retry for high resilience
    if (err.message && (err.message.includes('Connection terminated') || err.message.includes('timeout') || err.message.includes('closed'))) {
      try {
        const retryRes = await pool.query(text, params);
        return retryRes;
      } catch (retryErr) {
        console.error('[PostgreSQL Query Retry Error]:', retryErr.message);
        throw retryErr;
      }
    }
    console.error('[PostgreSQL Query Error]:', err.message);
    throw err;
  }
}

export default { pool, query };
