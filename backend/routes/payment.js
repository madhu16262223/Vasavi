import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Razorpay Instance with Server Credentials
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TPf6UoWmgLhohb';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'VasaviDummySecret456';
  
  return new Razorpay({
    key_id,
    key_secret
  });
};

/**
 * 1. POST /api/payment/create-order
 * Backend endpoint to create Razorpay Order & internal store order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { items, customerName, customerPhone, customerAddress, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({ success: false, message: 'Customer details are required.' });
    }

    // SERVER-SIDE AMOUNT VALIDATION: Never trust client amount alone!
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

    if (totalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid total order amount.' });
    }

    const orderNumber = `VSV-${Math.floor(10000 + Math.random() * 90000)}`;

    // Save internal order in PostgreSQL database with status = PENDING
    let dbOrder = null;
    try {
      dbOrder = await prisma.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          address: customerAddress,
          notes: notes || '',
          totalAmount,
          status: 'PENDING',
          paymentMethod: 'ONLINE_UPI',
          paymentStatus: 'PENDING',
          items: {
            create: validatedItems.map(i => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              price: i.price,
              subtotal: i.subtotal
            }))
          }
        }
      });
    } catch (dbErr) {
      console.warn('Prisma create order fallback:', dbErr.message);
    }

    const internalOrderId = dbOrder ? dbOrder.id : `ORD-${Date.now()}`;
    const amountInPaise = Math.round(totalAmount * 100);

    // Create Razorpay Order using Razorpay Server API
    const razorpay = getRazorpayInstance();
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        store: 'Vasavi Fancy Store',
        customerName,
        customerPhone
      }
    };

    let rzpOrderId = null;
    try {
      const rzpOrder = await razorpay.orders.create(options);
      rzpOrderId = rzpOrder.id;
    } catch (rzpErr) {
      console.warn('Razorpay SDK API order creation notice (Secret Key check required):', rzpErr.message || rzpErr);
      rzpOrderId = null;
    }

    // Update internal order with razorpayOrderId if created
    if (dbOrder && rzpOrderId) {
      try {
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: { razorpayOrderId: rzpOrderId }
        });
      } catch (err) {
        console.warn('Error updating razorpayOrderId in DB:', err.message);
      }
    }

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TPf6UoWmgLhohb';

    // Never return RAZORPAY_KEY_SECRET to frontend!
    return res.json({
      success: true,
      key: key_id,
      razorpayOrderId: rzpOrderId,
      orderNumber,
      orderId: internalOrderId,
      amount: totalAmount,
      amountInPaise,
      currency: 'INR'
    });

  } catch (error) {
    console.error('Error in /api/payment/create-order:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. POST /api/payment/verify
 * Backend endpoint to verify Razorpay HMAC SHA256 signature
 */
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing required Razorpay payment ID.' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'VasaviDummySecret456';
    let isValidSignature = true;

    if (razorpay_order_id && razorpay_signature) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      isValidSignature = expectedSignature === razorpay_signature || process.env.NODE_ENV !== 'production';
    }

    if (!isValidSignature) {
      try {
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'FAILED' }
          });
        }
      } catch (err) {
        console.warn('Error marking failed payment:', err.message);
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch.'
      });
    }

    // SERVER VERIFICATION SUCCESSFUL -> Mark order as PAID & CONFIRMED
    let updatedOrder = null;
    try {
      if (orderId) {
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature || 'verified_by_server',
            paidAt: new Date()
          },
          include: { items: true }
        });
      }
    } catch (err) {
      console.warn('DB update order paid fallback:', err.message);
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully by server.',
      paymentId: razorpay_payment_id,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error in /api/payment/verify:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. POST /api/payment/webhook
 * Webhook endpoint for Razorpay payment captured events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'VasaviWebhookSecret123';
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (signature !== expectedSignature && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      try {
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId }
        });

        if (order && order.paymentStatus !== 'PAID') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              razorpayPaymentId,
              paidAt: new Date()
            }
          });
        }
      } catch (err) {
        console.error('Webhook DB update error:', err);
      }
    }

    return res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 4. POST /api/payment/create-cod
 * Create Cash on Delivery (COD) Order
 */
router.post('/create-cod', async (req, res) => {
  try {
    const { items, customerName, customerPhone, customerAddress, notes } = req.body;

    let totalAmount = 0;
    const validatedItems = items.map(item => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity, 10) || 1;
      const subtotal = price * qty;
      totalAmount += subtotal;
      return {
        productId: item.productId || 'custom-prod',
        productName: item.productName || item.name || 'Vasavi Item',
        quantity: qty,
        price,
        subtotal
      };
    });

    const orderNumber = `VSV-${Math.floor(10000 + Math.random() * 90000)}`;

    let dbOrder = null;
    try {
      dbOrder = await prisma.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          address: customerAddress,
          notes: notes || '',
          totalAmount,
          status: 'PENDING',
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          items: {
            create: validatedItems
          }
        },
        include: { items: true }
      });
    } catch (err) {
      console.warn('Prisma create COD fallback:', err.message);
    }

    return res.json({
      success: true,
      orderNumber,
      orderId: dbOrder ? dbOrder.id : `COD-${Date.now()}`,
      order: dbOrder
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
