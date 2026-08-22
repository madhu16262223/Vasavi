import express from 'express';
import prisma from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// Get all categories with product counts
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.imageUrl,
      itemCount: c._count.products
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { id, name, description, image, imageUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const imageSrc = image || imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name,
        description: description || '',
        imageUrl: imageSrc
      },
      create: {
        id: id || `cat-${Date.now()}`,
        name,
        slug,
        description: description || '',
        imageUrl: imageSrc
      }
    });

    res.status(201).json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.imageUrl,
      itemCount: 0
    });
  } catch (err) {
    console.error('Error in category create:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, image, imageUrl } = req.body;
    const imageSrc = image || imageUrl;
    const slug = name ? name.toLowerCase().replace(/\s+/g, '-') : undefined;

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : undefined,
        slug: slug !== undefined ? slug : undefined,
        description: description !== undefined ? description : undefined,
        imageUrl: imageSrc !== undefined ? imageSrc : undefined
      }
    });

    res.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.imageUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
