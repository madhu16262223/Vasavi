import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_DB_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const SUPABASE_DIRECT_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

process.env.DATABASE_URL = process.env.DATABASE_URL || SUPABASE_DB_URL;
process.env.DIRECT_URL = process.env.DIRECT_URL || SUPABASE_DIRECT_URL;

let prisma = null;

try {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || SUPABASE_DB_URL,
      },
    },
  });
} catch (err) {
  console.warn('[Prisma] Dynamic initialization note:', err?.message);
}

export default prisma;
