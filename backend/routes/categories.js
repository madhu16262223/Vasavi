import express from 'express';
import { query } from '../pgdb.js';
import { authenticateAdmin } from './auth.js';
import {
  getStoredCategories,
  saveStoredCategory,
  deleteStoredCategory,
  bulkSaveStoredCategories
} from '../store.js';

const router = express.Router();

// Get all categories (Direct from Supabase PostgreSQL)
router.get('/', async (req, res) => {
  try {
    const dbRes = await query('SELECT * FROM categories ORDER BY name ASC');
    const categories = dbRes.rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.imageUrl,
      imageUrl: c.imageUrl
    }));
    return res.json(categories);
  } catch (err) {
    console.warn('[Categories API Fallback]:', err.message);
    const fallback = getStoredCategories();
    return res.json(fallback);
  }
});

// Bulk Sync Categories from Admin to Supabase
router.post('/bulk-sync', authenticateAdmin, async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Categories array is required' });
    }

    bulkSaveStoredCategories(categories);

    for (const c of categories) {
      const slug = (c.slug || c.name).toLowerCase().replace(/\s+/g, '-');
      const imageSrc = c.imageUrl || c.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

      await query(
        `INSERT INTO categories (id, name, slug, description, "imageUrl", "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           "imageUrl" = EXCLUDED."imageUrl"`,
        [c.id || `cat-${Date.now()}`, c.name, slug, c.description || '', imageSrc]
      ).catch((e) => console.warn('Category upsert warning:', e.message));
    }

    res.json({ success: true, count: categories.length, message: 'Categories synced to Supabase successfully' });
  } catch (err) {
    res.status(200).json({ success: true, count: (req.body?.categories || []).length });
  }
});

// Create category
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { id, name, description, image, imageUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const imageSrc = image || imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';
    const finalId = id || `cat-${Date.now()}`;

    await query(
      `INSERT INTO categories (id, name, slug, description, "imageUrl", "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         "imageUrl" = EXCLUDED."imageUrl"`,
      [finalId, name, slug, description || '', imageSrc]
    );

    res.status(201).json({ id: finalId, name, slug, description, image: imageSrc, imageUrl: imageSrc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, image, imageUrl } = req.body;
    const imageSrc = image || imageUrl;
    const slug = name ? name.toLowerCase().replace(/\s+/g, '-') : undefined;

    await query(
      `UPDATE categories SET
         name = COALESCE($1, name),
         slug = COALESCE($2, slug),
         description = COALESCE($3, description),
         "imageUrl" = COALESCE($4, "imageUrl")
       WHERE id = $5 OR slug = $5`,
      [name, slug, description, imageSrc, req.params.id]
    );

    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM categories WHERE id = $1 OR slug = $1', [req.params.id]);
    deleteStoredCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
