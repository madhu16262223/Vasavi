import express from 'express';
import prisma from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// Create Order (Public / Customer)
router.post('/', async (req, res) => {
  try {
    const {
      id,
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      address,
      notes,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status
    } = req.body;
    
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer details and items are required' });
    }

    const finalOrderNumber = orderNumber || `VSV-${Math.floor(10000 + Math.random() * 90000)}`;
    const finalAddress = customerAddress || address || 'Nandyal, Andhra Pradesh';
    const finalTotal = parseFloat(totalAmount) || 0;

    // Ensure all products exist in DB before linking foreign keys
    for (const item of items) {
      const prodId = item.productId || `prod-${Date.now()}`;
      const prodName = item.productName || item.name || 'Vasavi Fancy Product';
      const prodPrice = parseFloat(item.price) || 0;

      const existingProd = await prisma.product.findUnique({ where: { id: prodId } });
      if (!existingProd) {
        // Find default category
        const defaultCat = await prisma.category.findFirst() || { id: 'cat-1' };
        await prisma.product.upsert({
          where: { id: prodId },
          update: {},
          create: {
            id: prodId,
            name: prodName,
            categoryId: defaultCat.id,
            price: prodPrice,
            stock: 10,
            imageUrl: item.image || item.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
            description: 'Store product',
            isActive: true
          }
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        id: id || `ord-${Date.now()}`,
        orderNumber: finalOrderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        address: finalAddress.trim(),
        notes: notes ? notes.trim() : '',
        totalAmount: finalTotal,
        status: status || 'PENDING',
        paymentMethod: paymentMethod || 'WHATSAPP_UPI',
        paymentStatus: paymentStatus || 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId || `prod-${Date.now()}`,
            productName: item.productName || item.name || 'Vasavi Fancy Store Item',
            quantity: parseInt(item.quantity, 10) || 1,
            price: parseFloat(item.price) || 0,
            subtotal: parseFloat(item.subtotal || item.price * (item.quantity || 1))
          }))
        }
      },
      include: { items: true }
    });

    // Best-effort stock decrement
    for (const item of items) {
      if (item.productId) {
        try {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: parseInt(item.quantity, 10) || 1 } }
          });
        } catch (stockErr) {
          console.warn('Stock decrement skipped for:', item.productId);
        }
      }
    }

    res.status(201).json({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.address,
      address: order.address,
      notes: order.notes,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items
    });
  } catch (err) {
    console.error('Create order error:', err);
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
    res.json({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.address,
      address: order.address,
      notes: order.notes,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items
    });
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

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerAddress: o.address,
      address: o.address,
      notes: o.notes || '',
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod || 'WHATSAPP_UPI',
      paymentStatus: o.paymentStatus || 'PENDING',
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.subtotal
      }))
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Admin)
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: status !== undefined ? status : undefined,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined
      },
      include: { items: true }
    });

    res.json({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.address,
      address: order.address,
      notes: order.notes,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
