import express from 'express';
import { query } from '../pgdb.js';
import { authenticateAdmin } from './auth.js';
import { getStoredOrders, saveStoredOrder, updateStoredOrderStatus } from '../store.js';

const router = express.Router();

// Create Order (Public / Customer - Saves to Supabase PostgreSQL & Persistent Store)
router.post('/', async (req, res) => {
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
    items: (items || []).map((item) => ({
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

  // Direct PostgreSQL Save to Supabase
  try {
    // 1. Ensure customer exists
    const custRes = await query('SELECT id FROM customers WHERE phone = $1', [formattedOrder.customerPhone]);
    let custId = custRes.rows[0]?.id;
    if (!custId) {
      custId = `cust-${Date.now()}`;
      await query(
        'INSERT INTO customers (id, name, phone, address, "createdAt") VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (phone) DO NOTHING',
        [custId, formattedOrder.customerName, formattedOrder.customerPhone, formattedOrder.address]
      ).catch(() => {});
    }

    // 2. Insert into orders table
    await query(
      `INSERT INTO orders (id, "orderNumber", "customerId", "customerName", "customerPhone", address, notes, "totalAmount", status, "createdAt", "updatedAt", "paymentMethod", "paymentStatus")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::"OrderStatus", NOW(), NOW(), $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         "updatedAt" = NOW()`,
      [
        finalId,
        finalOrderNumber,
        custId,
        formattedOrder.customerName,
        formattedOrder.customerPhone,
        formattedOrder.address,
        formattedOrder.notes,
        finalTotal,
        formattedOrder.status,
        formattedOrder.paymentMethod,
        formattedOrder.paymentStatus
      ]
    );

    // 3. Insert order items
    for (const item of formattedOrder.items) {
      // Ensure product exists in Supabase
      await query(
        `INSERT INTO products (id, name, price, stock, "imageUrl", "isActive", "categoryId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 10, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', true, 'cat-1', NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [item.productId, item.productName, item.price]
      ).catch(() => {});

      await query(
        `INSERT INTO order_items (id, "orderId", "productId", "productName", quantity, price, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, finalId, item.productId, item.productName, item.quantity, item.price, item.subtotal]
      ).catch(() => {});
    }
  } catch (dbErr) {
    console.warn('[PostgreSQL Order Save Note]:', dbErr.message);
  }

  return res.status(201).json(formattedOrder);
});

// Track Order Status by Order Number or Phone (Direct from Supabase)
router.get('/track/:query', async (req, res) => {
  const q = (req.params.query || '').trim();

  try {
    const dbRes = await query(
      `SELECT o.*, 
              COALESCE(json_agg(json_build_object(
                'id', oi.id,
                'productId', oi."productId",
                'productName', oi."productName",
                'quantity', oi.quantity,
                'price', oi.price,
                'subtotal', oi.subtotal
              )) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi."orderId"
       WHERE LOWER(o."orderNumber") = LOWER($1) OR o."customerPhone" LIKE '%' || $1 || '%' OR o.id = $1
       GROUP BY o.id
       ORDER BY o."createdAt" DESC
       LIMIT 1`,
      [q]
    );

    if (dbRes.rows.length > 0) {
      const o = dbRes.rows[0];
      return res.json({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerAddress: o.address,
        address: o.address,
        notes: o.notes || '',
        totalAmount: o.totalAmount,
        status: o.status,
        paymentMethod: o.paymentMethod || 'WHATSAPP',
        paymentStatus: o.paymentStatus || 'UNPAID',
        createdAt: o.createdAt,
        items: o.items || []
      });
    }
  } catch (err) {
    console.warn('Track order DB fallback:', err.message);
  }

  const allOrders = getStoredOrders();
  const found = allOrders.find(
    (o) =>
      (o.orderNumber && o.orderNumber.toLowerCase() === q.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.includes(q))
  );

  if (found) return res.json(found);
  return res.status(404).json({ error: 'Order not found' });
});

// Get all orders (Admin protected - Direct from Supabase PostgreSQL)
router.get('/', authenticateAdmin, async (req, res) => {
  const { status, search } = req.query;

  try {
    let sql = `
      SELECT o.*, 
             COALESCE(json_agg(json_build_object(
               'id', oi.id,
               'productId', oi."productId",
               'productName', oi."productName",
               'quantity', oi.quantity,
               'price', oi.price,
               'subtotal', oi.subtotal
             )) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi."orderId"
    `;

    const params = [];
    const whereClauses = [];

    if (status && status !== 'ALL') {
      params.push(status);
      whereClauses.push(`o.status = $${params.length}::"OrderStatus"`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(o."orderNumber" ILIKE $${params.length} OR o."customerName" ILIKE $${params.length} OR o."customerPhone" LIKE $${params.length})`);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ` + whereClauses.join(' AND ');
    }

    sql += ` GROUP BY o.id ORDER BY o."createdAt" DESC`;

    const dbRes = await query(sql, params);
    const orders = dbRes.rows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerAddress: o.address,
      address: o.address,
      notes: o.notes || '',
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod || 'WHATSAPP',
      paymentStatus: o.paymentStatus || 'UNPAID',
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      items: o.items || []
    }));

    return res.json(orders);
  } catch (err) {
    console.warn('[Orders Admin API Fallback]:', err.message);
    const fallback = getStoredOrders();
    return res.json(fallback);
  }
});

// Update Order Status (Admin)
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  const { status, paymentStatus } = req.body;
  const orderId = req.params.id;

  updateStoredOrderStatus(orderId, status, paymentStatus);

  try {
    await query(
      `UPDATE orders SET
         status = COALESCE($1::"OrderStatus", status),
         "paymentStatus" = COALESCE($2, "paymentStatus"),
         "updatedAt" = NOW()
       WHERE id = $3 OR "orderNumber" = $3`,
      [status, paymentStatus, orderId]
    );
    res.json({ success: true, message: 'Status updated in Supabase successfully' });
  } catch (err) {
    console.warn('Update order status DB warning:', err.message);
    res.json({ success: true, message: 'Status updated' });
  }
});

// Delete Order from Database (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  const orderId = req.params.id;
  try {
    // 1. Delete associated order items
    await query('DELETE FROM order_items WHERE "orderId" = $1', [orderId]);
    // 2. Delete order itself
    await query('DELETE FROM orders WHERE id = $1 OR "orderNumber" = $1', [orderId]);
    
    res.json({ success: true, message: `Order ${orderId} permanently deleted from database` });
  } catch (err) {
    console.error('Delete order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
