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
    const { name, description, image } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl: image
      }
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        imageUrl: image
      }
    });

    res.json(category);
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
