import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 1. POST /api/payment/create-order
 * Backend endpoint for WhatsApp / COD Order Registration
 */
router.post('/create-order', async (req, res) => {
  try {
    const { items, customerName, customerPhone, customerAddress, notes, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({ success: false, message: 'Customer details are required.' });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      let product = null;
      try {
        if (item.productId && item.productId.length > 10) {
          product = await prisma.product.findUnique({ where: { id: item.productId } });
        }
      } catch (err) {
        console.warn('Prisma lookup warning:', err.message);
      }

      const itemPrice = product ? product.price : (parseFloat(item.price) || 0);
      const qty = parseInt(item.quantity, 10) || 1;
      const subtotal = itemPrice * qty;
      totalAmount += subtotal;

      validatedItems.push({
        productId: item.productId || 'custom-prod',
        productName: item.productName || item.name || 'Vasavi Store Item',
        quantity: qty,
        price: itemPrice,
        subtotal
      });
    }

    const orderNumber = `VSV-${Math.floor(10000 + Math.random() * 90000)}`;

    return res.status(200).json({
      success: true,
      orderNumber,
      totalAmount,
      items: validatedItems,
      paymentMethod: paymentMethod || 'WHATSAPP',
      message: 'Order created successfully for WhatsApp / COD verification'
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * 2. GET /api/payment/methods
 */
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      { id: 'whatsapp_upi', name: 'WhatsApp Order & UPI Scanner', status: 'ACTIVE' },
      { id: 'cod', name: 'Cash on Delivery (Nandyal)', status: 'ACTIVE' }
    ]
  });
});

export default router;
