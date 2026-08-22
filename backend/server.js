import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const DIRECT_URL = "postgresql://postgres.pyiivdahvfaawjcwbcis:%40CharanVasavi@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
const JWT_SEC = "vasavi_fancy_store_jwt_secret_key_2026_nandyal";

// Write local .env files if missing
try {
  const backendEnv = path.join(__dirname, '.env');
  const rootEnv = path.join(__dirname, '..', '.env');
  const envContent = `DATABASE_URL="${DB_URL}"\nDIRECT_URL="${DIRECT_URL}"\nJWT_SECRET="${JWT_SEC}"\n`;

  if (!fs.existsSync(backendEnv)) fs.writeFileSync(backendEnv, envContent);
  if (!fs.existsSync(rootEnv)) fs.writeFileSync(rootEnv, envContent);
} catch (e) {}

process.env.DATABASE_URL = process.env.DATABASE_URL || DB_URL;
process.env.DIRECT_URL = process.env.DIRECT_URL || DIRECT_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET || JWT_SEC;

dotenv.config();

import { router as authRouter } from './routes/auth.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import analyticsRouter from './routes/analytics.js';
import paymentRouter from './routes/payment.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/payment', paymentRouter);

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`🌸 Vasavi Fancy Store Backend API running on http://localhost:${PORT}`);
});
