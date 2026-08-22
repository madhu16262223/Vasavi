import express from 'express';
import prisma from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// Get all products (Formatted for frontend)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const where = { isActive: true };
    if (category && category !== 'all') {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
        { category: { name: { equals: category, mode: 'insensitive' } } }
      ];
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = products.map((p) => ({
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
      categoryName: p.category?.name || 'Cosmetics',
      categorySlug: p.category?.slug || 'cosmetics',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

// Bulk Sync Products from Admin to Cloud Database
router.post('/bulk-sync', authenticateAdmin, async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    const upserted = [];
    for (const p of products) {
      // Find or resolve category
      let catId = p.categoryId;
      if (!catId && p.categoryName) {
        const cat = await prisma.category.findFirst({
          where: { OR: [{ name: { equals: p.categoryName, mode: 'insensitive' } }, { slug: p.categoryName.toLowerCase().replace(/\s+/g, '-') }] }
        });
        if (cat) catId = cat.id;
      }

      if (!catId) {
        const firstCat = await prisma.category.findFirst();
        catId = firstCat?.id || 'cat-1';
      }

      const imageSrc = p.imageUrl || p.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

      const prod = await prisma.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          categoryId: catId,
          price: parseFloat(p.price) || 0,
          originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
          stock: p.stock !== undefined ? parseInt(p.stock, 10) : 10,
          imageUrl: imageSrc,
          description: p.description || '',
          brand: p.brand || 'Vasavi Collection',
          shade: p.shade || null,
          isTrending: !!p.isTrending,
          isBestSeller: !!p.isBestSeller,
          isActive: true
        },
        create: {
          id: p.id,
          name: p.name,
          categoryId: catId,
          price: parseFloat(p.price) || 0,
          originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
          stock: p.stock !== undefined ? parseInt(p.stock, 10) : 10,
          imageUrl: imageSrc,
          description: p.description || '',
          brand: p.brand || 'Vasavi Collection',
          shade: p.shade || null,
          isTrending: !!p.isTrending,
          isBestSeller: !!p.isBestSeller,
          isActive: true
        }
      });
      upserted.push(prod);
    }

    res.json({ success: true, count: upserted.length, message: 'Products synced to cloud successfully' });
  } catch (err) {
    console.error('Error bulk syncing products:', err);
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
    
    res.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      image: product.imageUrl,
      imageUrl: product.imageUrl,
      brand: product.brand || 'Vasavi Collection',
      shade: product.shade,
      isTrending: product.isTrending,
      isBestSeller: product.isBestSeller,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      categorySlug: product.category?.slug
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product (Admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { id, name, categoryId, categoryName, price, originalPrice, stock, image, imageUrl, description, brand, shade, isTrending, isBestSeller } = req.body;
    
    // Resolve Category
    let targetCatId = categoryId;
    if (!targetCatId && categoryName) {
      const existingCat = await prisma.category.findFirst({
        where: { OR: [{ name: { equals: categoryName, mode: 'insensitive' } }, { slug: categoryName.toLowerCase().replace(/\s+/g, '-') }] }
      });
      if (existingCat) targetCatId = existingCat.id;
    }

    if (!targetCatId) {
      const firstCat = await prisma.category.findFirst();
      targetCatId = firstCat?.id || 'cat-1';
    }

    const imageSrc = imageUrl || image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

    const product = await prisma.product.create({
      data: {
        id: id || `prod-${Date.now()}`,
        name,
        categoryId: targetCatId,
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: stock !== undefined ? parseInt(stock, 10) : 10,
        imageUrl: imageSrc,
        description: description || '',
        brand: brand || 'Vasavi Collection',
        shade: shade || null,
        isTrending: !!isTrending,
        isBestSeller: !!isBestSeller
      },
      include: { category: true }
    });

    res.status(201).json({
      ...product,
      image: product.imageUrl,
      categoryName: product.category?.name
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update product (Admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, categoryId, price, originalPrice, stock, image, imageUrl, description, brand, shade, isTrending, isBestSeller, isActive } = req.body;
    const imageSrc = imageUrl || image;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : undefined,
        stock: stock !== undefined ? parseInt(stock, 10) : undefined,
        imageUrl: imageSrc !== undefined ? imageSrc : undefined,
        description: description !== undefined ? description : undefined,
        brand: brand !== undefined ? brand : undefined,
        shade: shade !== undefined ? shade : undefined,
        isTrending: isTrending !== undefined ? !!isTrending : undefined,
        isBestSeller: isBestSeller !== undefined ? !!isBestSeller : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined
      },
      include: { category: true }
    });

    res.json({
      ...product,
      image: product.imageUrl,
      categoryName: product.category?.name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
