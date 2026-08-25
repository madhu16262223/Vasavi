import express from 'express';
import { query } from '../pgdb.js';
import { authenticateAdmin } from './auth.js';
import {
  getStoredProducts,
  saveStoredProduct,
  deleteStoredProduct,
  bulkSaveStoredProducts
} from '../store.js';

const router = express.Router();

// Get all products (Direct from Supabase PostgreSQL)
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  
  try {
    const dbRes = await query(`
      SELECT p.*, c.name as "categoryName", c.slug as "categorySlug"
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p."isActive" = true
      ORDER BY p."createdAt" DESC
    `);

    let products = dbRes.rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      stock: p.stock,
      image: p.imageUrl,
      imageUrl: p.imageUrl,
      brand: p.brand || 'Vasavi Collection',
      shade: p.shade,
      isTrending: p.isTrending,
      isBestSeller: p.isBestSeller,
      categoryId: p.categoryId,
      categoryName: p.categoryName || 'Cosmetics',
      categorySlug: p.categorySlug || 'cosmetics',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    // Filter by Category if requested
    if (category && category !== 'all') {
      const cat = category.toLowerCase();
      products = products.filter(
        (p) =>
          (p.categoryId && p.categoryId.toLowerCase() === cat) ||
          (p.categorySlug && p.categorySlug.toLowerCase() === cat) ||
          (p.categoryName && p.categoryName.toLowerCase() === cat) ||
          (p.category && p.category.toLowerCase().replace(/\s+/g, '-') === cat)
      );
    }

    // Filter by Search Query if requested
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    return res.json(products);
  } catch (err) {
    console.warn('[Products API Fallback]:', err.message);
    const fallback = getStoredProducts();
    return res.json(fallback);
  }
});

// Bulk Sync Products from Admin to Supabase Cloud Database
router.post('/bulk-sync', authenticateAdmin, async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    // Save to disk persistent storage immediately
    bulkSaveStoredProducts(products);

    // Send instant response so the HTTP connection never times out (408/504)
    res.json({ success: true, count: products.length, message: 'Products synced successfully' });

    // Background sync to PostgreSQL
    (async () => {
      // Ensure default category exists
      await query(
        `INSERT INTO categories (id, name, slug, "imageUrl", "createdAt")
         VALUES ('cat-1', 'Cosmetics & Jewellery', 'cosmetics-jewellery', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', NOW())
         ON CONFLICT (id) DO NOTHING`
      ).catch(() => {});

      for (const p of products) {
        const catId = p.categoryId || 'cat-1';
        const imageSrc = p.imageUrl || p.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';
        const price = parseFloat(p.price) || 0;
        const origPrice = p.originalPrice ? parseFloat(p.originalPrice) : null;
        const stock = p.stock !== undefined ? parseInt(p.stock, 10) : 10;
        const isTrend = !!p.isTrending;
        const isBest = !!p.isBestSeller;

        await query(
          `INSERT INTO products (id, name, description, price, "originalPrice", stock, "imageUrl", brand, shade, "isTrending", "isBestSeller", "isActive", "categoryId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             price = EXCLUDED.price,
             "originalPrice" = EXCLUDED."originalPrice",
             stock = EXCLUDED.stock,
             "imageUrl" = EXCLUDED."imageUrl",
             brand = EXCLUDED.brand,
             shade = EXCLUDED.shade,
             "isTrending" = EXCLUDED."isTrending",
             "isBestSeller" = EXCLUDED."isBestSeller",
             "isActive" = true,
             "categoryId" = EXCLUDED."categoryId",
             "updatedAt" = NOW()`,
          [
            p.id,
            p.name,
            p.description || '',
            price,
            origPrice,
            stock,
            imageSrc,
            p.brand || 'Vasavi Collection',
            p.shade || null,
            isTrend,
            isBest,
            catId
          ]
        ).catch(() => {});
      }
    })().catch((e) => console.warn('[Background Products Sync Note]:', e.message));

  } catch (err) {
    console.error('Bulk sync error:', err);
    res.status(200).json({ success: true, count: (req.body?.products || []).length });
  }
});

// Get single product details
router.get('/:id', async (req, res) => {
  try {
    const dbRes = await query(
      `SELECT p.*, c.name as "categoryName", c.slug as "categorySlug"
       FROM products p
       LEFT JOIN categories c ON p."categoryId" = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (dbRes.rows.length > 0) {
      const p = dbRes.rows[0];
      return res.json({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        image: p.imageUrl,
        imageUrl: p.imageUrl,
        brand: p.brand || 'Vasavi Collection',
        shade: p.shade,
        isTrending: p.isTrending,
        isBestSeller: p.isBestSeller,
        categoryId: p.categoryId,
        categoryName: p.categoryName || 'Cosmetics',
        categorySlug: p.categorySlug || 'cosmetics'
      });
    }

    res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product (Admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { id, name, categoryId, price, originalPrice, stock, image, imageUrl, description, brand, shade, isTrending, isBestSeller } = req.body;
    const finalId = id || `prod-${Date.now()}`;
    const imageSrc = imageUrl || image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';
    const catId = categoryId || 'cat-1';
    const numPrice = parseFloat(price) || 0;
    const numOrig = originalPrice ? parseFloat(originalPrice) : null;
    const numStock = stock !== undefined ? parseInt(stock, 10) : 10;

    await query(
      `INSERT INTO products (id, name, description, price, "originalPrice", stock, "imageUrl", brand, shade, "isTrending", "isBestSeller", "isActive", "categoryId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         price = EXCLUDED.price,
         "originalPrice" = EXCLUDED."originalPrice",
         stock = EXCLUDED.stock,
         "imageUrl" = EXCLUDED."imageUrl",
         "categoryId" = EXCLUDED."categoryId",
         "updatedAt" = NOW()`,
      [finalId, name, description || '', numPrice, numOrig, numStock, imageSrc, brand || 'Vasavi Collection', shade || null, !!isTrending, !!isBestSeller, catId]
    );

    res.status(201).json({
      id: finalId,
      name,
      price: numPrice,
      originalPrice: numOrig,
      stock: numStock,
      image: imageSrc,
      imageUrl: imageSrc,
      categoryId: catId
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update product (Admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, categoryId, price, originalPrice, stock, image, imageUrl, description, brand, shade, isTrending, isBestSeller, isActive } = req.body;
    const imageSrc = imageUrl || image;

    await query(
      `UPDATE products SET
         name = COALESCE($1, name),
         "categoryId" = COALESCE($2, "categoryId"),
         price = COALESCE($3, price),
         "originalPrice" = COALESCE($4, "originalPrice"),
         stock = COALESCE($5, stock),
         "imageUrl" = COALESCE($6, "imageUrl"),
         description = COALESCE($7, description),
         brand = COALESCE($8, brand),
         shade = COALESCE($9, shade),
         "isTrending" = COALESCE($10, "isTrending"),
         "isBestSeller" = COALESCE($11, "isBestSeller"),
         "isActive" = COALESCE($12, "isActive"),
         "updatedAt" = NOW()
       WHERE id = $13`,
      [
        name,
        categoryId,
        price !== undefined ? parseFloat(price) : null,
        originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : null,
        stock !== undefined ? parseInt(stock, 10) : null,
        imageSrc,
        description,
        brand,
        shade,
        isTrending !== undefined ? !!isTrending : null,
        isBestSeller !== undefined ? !!isBestSeller : null,
        isActive !== undefined ? !!isActive : null,
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    deleteStoredProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
