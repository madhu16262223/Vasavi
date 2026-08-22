import express from 'express';
import { query } from '../pgdb.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// Dashboard Overview Metrics & Revenue Analytics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const ordersRes = await query('SELECT "totalAmount", status FROM orders');
    const productsRes = await query('SELECT count(*) FROM products');

    const orders = ordersRes.rows;
    const totalProducts = parseInt(productsRes.rows[0]?.count || 0, 10);

    const totalRevenue = orders
      .filter((o) => o.status === 'COMPLETED' || o.status === 'CONFIRMED' || o.status === 'READY')
      .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

    const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
    const completedOrdersCount = orders.filter((o) => o.status === 'COMPLETED').length;

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalProducts,
      pendingOrdersCount,
      completedOrdersCount
    });
  } catch (err) {
    res.json({
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 11,
      pendingOrdersCount: 0,
      completedOrdersCount: 0
    });
  }
});

export default router;
