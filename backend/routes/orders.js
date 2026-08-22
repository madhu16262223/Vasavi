import express from 'express';
import prisma from '../db.js';
import { authenticateAdmin } from './auth.js';
import { getStoredOrders, saveStoredOrder, updateStoredOrderStatus } from '../store.js';

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

    const finalId = id || `ord-${Date.now()}`;
    const finalOrderNumber = orderNumber || `VSV-${Math.floor(10000 + Math.random() * 90000)}`;
    const finalAddress = customerAddress || address || 'Nandyal, Andhra Pradesh';
    const finalTotal = parseFloat(totalAmount) || 0;

    const formattedOrder = {
      id: finalId,
      orderNumber: finalOrderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: finalAddress.trim(),
      address: finalAddress.trim(),
      notes: notes ? notes.trim() : '',
      totalAmount: finalTotal,
      status: status || 'PENDING',
      paymentMethod: paymentMethod || 'WHATSAPP_UPI',
      paymentStatus: paymentStatus || 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: items.map((item) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: item.productId || `prod-${Date.now()}`,
        productName: item.productName || item.name || 'Vasavi Fancy Store Item',
        quantity: parseInt(item.quantity, 10) || 1,
        price: parseFloat(item.price) || 0,
        subtotal: parseFloat(item.subtotal || item.price * (item.quantity || 1))
      }))
    };

    // Always save to persistent store
    saveStoredOrder(formattedOrder);

    // Also attempt PostgreSQL save asynchronously
    try {
      if (prisma && prisma.order) {
        // Ensure products exist
        for (const item of formattedOrder.items) {
          const defaultCat = await prisma.category.findFirst() || { id: 'cat-1' };
          await prisma.product.upsert({
            where: { id: item.productId },
            update: {},
            create: {
              id: item.productId,
              name: item.productName,
              categoryId: defaultCat.id,
              price: item.price,
              stock: 10,
              imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
              isActive: true
            }
          }).catch(() => {});
        }

        await prisma.order.upsert({
          where: { orderNumber: finalOrderNumber },
          update: {},
          create: {
            id: finalId,
            orderNumber: finalOrderNumber,
            customerName: formattedOrder.customerName,
            customerPhone: formattedOrder.customerPhone,
            address: formattedOrder.address,
            notes: formattedOrder.notes,
            totalAmount: formattedOrder.totalAmount,
            status: formattedOrder.status,
            paymentMethod: formattedOrder.paymentMethod,
            paymentStatus: formattedOrder.paymentStatus,
            items: {
              create: formattedOrder.items.map((i) => ({
                productId: i.productId,
                productName: i.productName,
                quantity: i.quantity,
                price: i.price,
                subtotal: i.subtotal
              }))
            }
          }
        }).catch(() => {});
      }
    } catch (dbErr) {
      console.warn('[Vasavi] DB save fallback used:', dbErr.message);
    }

    res.status(201).json(formattedOrder);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Track Order Status by Order Number or Phone
router.get('/track/:query', async (req, res) => {
  try {
    const query = req.params.query.trim().toLowerCase();

    // Check persistent store first
    const allOrders = getStoredOrders();
    const found = allOrders.find(
      (o) =>
        o.orderNumber.toLowerCase() === query ||
        o.customerPhone.includes(query) ||
        o.id.toLowerCase() === query
    );

    if (found) {
      return res.json(found);
    }

    // Attempt DB lookup
    if (prisma && prisma.order) {
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

      if (order) {
        return res.json({
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
      }
    }

    res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (Admin protected)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;

    let orders = getStoredOrders();

    // Merge with DB if available
    try {
      if (prisma && prisma.order) {
        const dbOrders = await prisma.order.findMany({
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        });

        if (Array.isArray(dbOrders) && dbOrders.length > 0) {
          dbOrders.forEach((dbo) => {
            const exists = orders.some((o) => o.id === dbo.id || o.orderNumber === dbo.orderNumber);
            if (!exists) {
              orders.push({
                id: dbo.id,
                orderNumber: dbo.orderNumber,
                customerName: dbo.customerName,
                customerPhone: dbo.customerPhone,
                customerAddress: dbo.address,
                address: dbo.address,
                notes: dbo.notes || '',
                totalAmount: dbo.totalAmount,
                status: dbo.status,
                paymentMethod: dbo.paymentMethod || 'WHATSAPP_UPI',
                paymentStatus: dbo.paymentStatus || 'PENDING',
                createdAt: dbo.createdAt,
                updatedAt: dbo.updatedAt,
                items: dbo.items.map((i) => ({
                  id: i.id,
                  productId: i.productId,
                  productName: i.productName,
                  quantity: i.quantity,
                  price: i.price,
                  subtotal: i.subtotal
                }))
              });
            }
          });
        }
      }
    } catch (e) {}

    // Apply filters
    if (status && status !== 'ALL') {
      orders = orders.filter((o) => o.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
      );
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Admin)
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const orderId = req.params.id;

    // Update in stored orders
    const updated = updateStoredOrderStatus(orderId, status, paymentStatus);

    // Update in DB asynchronously
    try {
      if (prisma && prisma.order) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: status !== undefined ? status : undefined,
            paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined
          }
        }).catch(() => {});
      }
    } catch (e) {}

    if (updated) {
      return res.json(updated);
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
