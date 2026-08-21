import express from 'express';
import prisma from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const where = { isActive: true };
    if (category && category !== 'all') {
      where.categoryId = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product details
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product (Admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, categoryId, price, originalPrice, stock, imageUrl, description, brand, shade, isTrending, isBestSeller } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock) || 0,
        imageUrl,
        description,
        brand,
        shade,
        isTrending: !!isTrending,
        isBestSeller: !!isBestSeller
      }
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product (Admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, categoryId, price, originalPrice, stock, imageUrl, description, brand, shade, isTrending, isBestSeller, isActive } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        categoryId,
        price: price ? parseFloat(price) : undefined,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        imageUrl,
        description,
        brand,
        shade,
        isTrending,
        isBestSeller,
        isActive
      }
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
