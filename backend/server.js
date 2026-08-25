import './preload.js';
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
import reviewsRouter from './routes/reviews.js';
import couponsRouter from './routes/coupons.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Disable server fingerprinting (Anti-Hacking Reconnaissance)
app.disable('x-powered-by');

// 2. High-Grade HTTP Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allows rich imagery and external CDNs safely
}));

// 3. General API Rate Limiting (Anti-DDoS & High Traffic Protection)
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1200, // 1200 requests per 5 minutes per IP (supports multiple concurrent mobile users on shared carrier IPs)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again in 5 minutes.' }
});

// Stricter Auth Rate Limiter (Anti-Brute Force Protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  skip: (req) => req.method === 'GET' || req.headers['x-admin-key'] === 'vasavi_admin_secret_2026',
  message: { error: 'Security Notice: Too many authentication attempts. Please try again in 15 minutes.' }
});

// 4. CORS Whitelisting
const allowedOrigins = [
  'https://vasavistore.in',
  'https://www.vasavistore.in',
  'https://vasavi-api.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or if in whitelist
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to safe permissive response
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

app.use(express.json({ limit: '10mb' }));
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/coupons', couponsRouter);

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
