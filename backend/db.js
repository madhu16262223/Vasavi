import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_DB_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const SUPABASE_DIRECT_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

const DATABASE_URL = process.env.DATABASE_URL || SUPABASE_DB_URL;
const DIRECT_URL = process.env.DIRECT_URL || SUPABASE_DIRECT_URL;

// Ensure process.env is populated for Prisma binary engine
process.env.DATABASE_URL = DATABASE_URL;
process.env.DIRECT_URL = DIRECT_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

export default prisma;
