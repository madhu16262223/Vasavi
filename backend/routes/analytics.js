import express from 'express';
import prisma from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// Dashboard Overview Metrics & Revenue Analytics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true }
    });

    const products = await prisma.product.findMany();

    const totalRevenue = orders
      .filter((o) => o.status === 'COMPLETED' || o.status === 'CONFIRMED' || o.status === 'READY')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
    const completedOrdersCount = orders.filter((o) => o.status === 'COMPLETED').length;
    const outOfStockCount = products.filter((p) => p.stock <= 0).length;

    res.json({
      totalRevenue,
      totalOrdersCount: orders.length,
      pendingOrdersCount,
      completedOrdersCount,
      outOfStockCount,
      activeProductsCount: products.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
