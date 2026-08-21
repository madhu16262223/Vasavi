import express from 'express';
import prisma from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// Create Order (Public / Customer)
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, address, notes, items, totalAmount } = req.body;
    
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer details and items are required' });
    }

    const orderNumber = `VS-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          address,
          notes,
          totalAmount: parseFloat(totalAmount),
          status: 'PENDING',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: parseFloat(item.price),
              subtotal: parseFloat(item.subtotal || item.price * item.quantity)
            }))
          }
        },
        include: { items: true }
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return createdOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track Order Status by Order Number or Phone
router.get('/track/:query', async (req, res) => {
  try {
    const query = req.params.query.trim();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: query, mode: 'insensitive' } },
          { customerPhone: { contains: query } }
        ]
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (Admin protected)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Admin)
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: true }
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
