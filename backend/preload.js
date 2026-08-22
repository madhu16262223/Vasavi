import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const DIRECT_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
const JWT_SEC = "vasavi_fancy_store_jwt_secret_key_2026_nandyal";

process.env.DATABASE_URL = process.env.DATABASE_URL || DB_URL;
process.env.DIRECT_URL = process.env.DIRECT_URL || DIRECT_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET || JWT_SEC;

try {
  const backendEnv = path.join(__dirname, '.env');
  const rootEnv = path.join(__dirname, '..', '.env');
  const envContent = `DATABASE_URL="${DB_URL}"\nDIRECT_URL="${DIRECT_URL}"\nJWT_SECRET="${JWT_SEC}"\n`;

  if (!fs.existsSync(backendEnv)) fs.writeFileSync(backendEnv, envContent);
  if (!fs.existsSync(rootEnv)) fs.writeFileSync(rootEnv, envContent);
} catch (e) {}

dotenv.config();
