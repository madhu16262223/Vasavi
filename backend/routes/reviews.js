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

// GET /api/reviews - Get reviews (public gets approved, admin gets all)
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.headers['x-admin-key'] === 'vasavi_admin_secret_2026';
    const sql = isAdmin
      ? 'SELECT * FROM reviews ORDER BY "createdAt" DESC'
      : 'SELECT * FROM reviews WHERE "isApproved" = true ORDER BY "createdAt" DESC';
    const result = await query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch reviews error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/product/:productId - Get reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM reviews WHERE "productId" = $1 AND "isApproved" = true ORDER BY "createdAt" DESC',
      [req.params.productId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch product reviews error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews - Submit a new review
router.post('/', async (req, res) => {
  try {
    const { productId, productName, customerName, customerPhone, rating, comment } = req.body;
    
    if (!productId || !customerName || !rating) {
      return res.status(400).json({ error: 'Product ID, customer name, and rating (1-5) are required' });
    }

    const numRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    const reviewId = `rev-${Date.now()}`;

    const insertRes = await query(
      `INSERT INTO reviews (id, "productId", "productName", "customerName", "customerPhone", rating, comment, "isApproved", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       RETURNING *`,
      [reviewId, productId, productName || 'Store Item', customerName.trim(), customerPhone || null, numRating, comment || '']
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error('Create review error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reviews/:id/approve - Toggle approval (Admin)
router.put('/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { isApproved } = req.body;
    const result = await query(
      'UPDATE reviews SET "isApproved" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [isApproved !== undefined ? !!isApproved : true, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ success: true, review: result.rows[0] });
  } catch (err) {
    console.error('Approve review error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id - Delete review (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
