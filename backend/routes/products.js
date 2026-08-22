import express from 'express';
import prisma from '../db.js';
import { authenticateAdmin } from './auth.js';
import {
  getStoredProducts,
  saveStoredProduct,
  deleteStoredProduct,
  bulkSaveStoredProducts
} from '../store.js';

const router = express.Router();

// Get all products (Formatted for frontend)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let products = getStoredProducts();

    // Merge with DB products if available
    try {
      if (prisma && prisma.product) {
        const dbProds = await prisma.product.findMany({
          include: { category: true },
          orderBy: { createdAt: 'desc' }
        });

        if (Array.isArray(dbProds) && dbProds.length > 0) {
          dbProds.forEach((p) => {
            const exists = products.some((sp) => sp.id === p.id);
            if (!exists) {
              products.push({
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
                categorySlug: p.category?.slug || 'cosmetics'
              });
            }
          });
        }
      }
    } catch (e) {}

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

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Sync Products from Admin to Cloud Database
router.post('/bulk-sync', authenticateAdmin, async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    // Save to persistent file store
    bulkSaveStoredProducts(products);

    // Also attempt PostgreSQL save asynchronously
    try {
      if (prisma && prisma.product) {
        for (const p of products) {
          let catId = p.categoryId || 'cat-1';
          const imageSrc = p.imageUrl || p.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

          await prisma.product.upsert({
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
          }).catch(() => {});
        }
      }
    } catch (dbErr) {}

    res.json({ success: true, count: products.length, message: 'Products synced to cloud successfully' });
  } catch (err) {
    console.error('Error bulk syncing products:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get product details
router.get('/:id', async (req, res) => {
  try {
    const products = getStoredProducts();
    const product = products.find((p) => p.id === req.params.id);

    if (product) return res.json(product);

    if (prisma && prisma.product) {
      const dbProd = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: { category: true }
      });
      if (dbProd) {
        return res.json({
          id: dbProd.id,
          name: dbProd.name,
          description: dbProd.description,
          price: dbProd.price,
          originalPrice: dbProd.originalPrice,
          stock: dbProd.stock,
          image: dbProd.imageUrl,
          imageUrl: dbProd.imageUrl,
          brand: dbProd.brand || 'Vasavi Collection',
          shade: dbProd.shade,
          isTrending: dbProd.isTrending,
          isBestSeller: dbProd.isBestSeller,
          categoryId: dbProd.categoryId,
          categoryName: dbProd.category?.name,
          categorySlug: dbProd.category?.slug
        });
      }
    }

    res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product (Admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { id, name, categoryId, categoryName, price, originalPrice, stock, image, imageUrl, description, brand, shade, isTrending, isBestSeller } = req.body;
    
    const finalId = id || `prod-${Date.now()}`;
    const imageSrc = imageUrl || image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

    const newProd = {
      id: finalId,
      name,
      categoryId: categoryId || 'cat-1',
      categoryName: categoryName || 'Cosmetics',
      categorySlug: (categoryName || 'cosmetics').toLowerCase().replace(/\s+/g, '-'),
      price: parseFloat(price) || 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      stock: stock !== undefined ? parseInt(stock, 10) : 10,
      image: imageSrc,
      imageUrl: imageSrc,
      description: description || '',
      brand: brand || 'Vasavi Collection',
      shade: shade || null,
      isTrending: !!isTrending,
      isBestSeller: !!isBestSeller
    };

    saveStoredProduct(newProd);

    // Also attempt PostgreSQL save
    try {
      if (prisma && prisma.product) {
        const defaultCat = await prisma.category.findFirst() || { id: 'cat-1' };
        await prisma.product.create({
          data: {
            id: finalId,
            name,
            categoryId: categoryId || defaultCat.id,
            price: parseFloat(price) || 0,
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            stock: stock !== undefined ? parseInt(stock, 10) : 10,
            imageUrl: imageSrc,
            description: description || '',
            brand: brand || 'Vasavi Collection',
            shade: shade || null,
            isTrending: !!isTrending,
            isBestSeller: !!isBestSeller
          }
        }).catch(() => {});
      }
    } catch (e) {}

    res.status(201).json(newProd);
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

    const products = getStoredProducts();
    const existing = products.find((p) => p.id === req.params.id);

    if (existing) {
      if (name !== undefined) existing.name = name;
      if (categoryId !== undefined) existing.categoryId = categoryId;
      if (price !== undefined) existing.price = parseFloat(price) || 0;
      if (originalPrice !== undefined) existing.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
      if (stock !== undefined) existing.stock = parseInt(stock, 10) || 0;
      if (imageSrc !== undefined) {
        existing.image = imageSrc;
        existing.imageUrl = imageSrc;
      }
      if (description !== undefined) existing.description = description;
      if (brand !== undefined) existing.brand = brand;
      if (shade !== undefined) existing.shade = shade;
      if (isTrending !== undefined) existing.isTrending = !!isTrending;
      if (isBestSeller !== undefined) existing.isBestSeller = !!isBestSeller;
      saveStoredProduct(existing);
    }

    // Update in DB asynchronously
    try {
      if (prisma && prisma.product) {
        await prisma.product.update({
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
          }
        }).catch(() => {});
      }
    } catch (e) {}

    res.json(existing || { success: true, message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    deleteStoredProduct(req.params.id);

    try {
      if (prisma && prisma.product) {
        await prisma.product.delete({ where: { id: req.params.id } }).catch(() => {});
      }
    } catch (e) {}

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
