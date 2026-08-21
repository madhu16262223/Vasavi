import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as authRouter } from './routes/auth.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import analyticsRouter from './routes/analytics.js';
import paymentRouter from './routes/payment.js';

dotenv.config();

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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Vasavi Fancy Store API',
    database: 'PostgreSQL Ready',
    paymentSystem: 'WhatsApp Direct & Cash on Delivery',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🌸 Vasavi Fancy Store Backend API running on http://localhost:${PORT}`);
});
