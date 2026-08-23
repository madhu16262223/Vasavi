import express from 'express';
import { query } from '../pgdb.js';

const router = express.Router();

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminKey = req.headers['x-admin-key'];

  if (adminKey === 'vasavi_admin_secret_2026') {
    return next();
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized admin access' });
};

// GET /api/coupons - List active coupons (Admin gets all)
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.headers['x-admin-key'] === 'vasavi_admin_secret_2026';
    const sql = isAdmin
      ? 'SELECT * FROM coupons ORDER BY "createdAt" DESC'
      : 'SELECT id, code, "discountType", "discountValue", "minOrderAmount", "maxDiscountAmount" FROM coupons WHERE "isActive" = true ORDER BY "createdAt" DESC';
    const result = await query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch coupons error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coupons/validate - Validate coupon code & calculate discount
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const result = await query(
      'SELECT * FROM coupons WHERE UPPER(code) = $1 AND "isActive" = true',
      [cleanCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false, message: 'Invalid or inactive coupon code' });
    }

    const coupon = result.rows[0];
    const total = parseFloat(cartTotal) || 0;

    if (coupon.minOrderAmount && total < coupon.minOrderAmount) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon ${cleanCode}`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((total * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed total
    discount = Math.min(discount, total);
    const finalPayable = Math.max(0, total - discount);

    res.json({
      valid: true,
      code: cleanCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      finalTotal: finalPayable,
      message: `Coupon ${cleanCode} applied successfully! You saved ₹${discount}`
    });
  } catch (err) {
    console.error('Validate coupon error:', err.message);
    res.status(500).json({ valid: false, error: err.message });
  }
});

// POST /api/coupons - Create new coupon (Admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, isActive, expiresAt } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Code and discount value are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const id = `coup-${Date.now()}`;
    const dType = discountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE';
    const dVal = parseFloat(discountValue) || 0;
    const minOrder = minOrderAmount ? parseFloat(minOrderAmount) : 0;
    const maxDisc = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
    const active = isActive !== undefined ? !!isActive : true;

    const result = await query(
      `INSERT INTO coupons (id, code, "discountType", "discountValue", "minOrderAmount", "maxDiscountAmount", "isActive", "expiresAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (code) DO UPDATE SET
         "discountType" = EXCLUDED."discountType",
         "discountValue" = EXCLUDED."discountValue",
         "minOrderAmount" = EXCLUDED."minOrderAmount",
         "maxDiscountAmount" = EXCLUDED."maxDiscountAmount",
         "isActive" = EXCLUDED."isActive",
         "updatedAt" = NOW()
       RETURNING *`,
      [id, cleanCode, dType, dVal, minOrder, maxDisc, active, expiresAt || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create coupon error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/coupons/:id - Delete coupon (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM coupons WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err) {
    console.error('Delete coupon error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
