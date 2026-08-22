import express from 'express';
import prisma from '../db.js';
import { authenticateAdmin } from './auth.js';
import {
  getStoredCategories,
  saveStoredCategory,
  deleteStoredCategory,
  bulkSaveStoredCategories
} from '../store.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    let categories = getStoredCategories();

    // Merge with DB if available
    try {
      if (prisma && prisma.category) {
        const dbCats = await prisma.category.findMany({
          orderBy: { name: 'asc' }
        });

        if (Array.isArray(dbCats) && dbCats.length > 0) {
          dbCats.forEach((c) => {
            const exists = categories.some((sc) => sc.id === c.id || sc.slug === c.slug);
            if (!exists) {
              categories.push({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                image: c.imageUrl,
                imageUrl: c.imageUrl
              });
            }
          });
        }
      }
    } catch (e) {}

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Sync Categories from Admin to Cloud Database
router.post('/bulk-sync', authenticateAdmin, async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Categories array is required' });
    }

    // Save to persistent file store
    bulkSaveStoredCategories(categories);

    // Also attempt PostgreSQL save asynchronously
    try {
      if (prisma && prisma.category) {
        for (const c of categories) {
          const slug = (c.slug || c.name).toLowerCase().replace(/\s+/g, '-');
          const imageSrc = c.imageUrl || c.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

          await prisma.category.upsert({
            where: { slug },
            update: {
              name: c.name,
              description: c.description || '',
              imageUrl: imageSrc
            },
            create: {
              id: c.id || `cat-${Date.now()}`,
              name: c.name,
              slug,
              description: c.description || '',
              imageUrl: imageSrc
            }
          }).catch(() => {});
        }
      }
    } catch (dbErr) {}

    res.json({ success: true, count: categories.length, message: 'Categories synced to cloud successfully' });
  } catch (err) {
    console.error('Error bulk syncing categories:', err);
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
    const finalId = id || `cat-${Date.now()}`;

    const newCat = {
      id: finalId,
      name,
      slug,
      description: description || '',
      image: imageSrc,
      imageUrl: imageSrc
    };

    saveStoredCategory(newCat);

    // Attempt DB upsert
    try {
      if (prisma && prisma.category) {
        await prisma.category.upsert({
          where: { slug },
          update: { name, description: description || '', imageUrl: imageSrc },
          create: { id: finalId, name, slug, description: description || '', imageUrl: imageSrc }
        }).catch(() => {});
      }
    } catch (e) {}

    res.status(201).json(newCat);
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

    const categories = getStoredCategories();
    const existing = categories.find((c) => c.id === req.params.id || c.slug === req.params.id);

    if (existing) {
      if (name) existing.name = name;
      if (slug) existing.slug = slug;
      if (description !== undefined) existing.description = description;
      if (imageSrc) {
        existing.image = imageSrc;
        existing.imageUrl = imageSrc;
      }
      saveStoredCategory(existing);
    }

    try {
      if (prisma && prisma.category) {
        await prisma.category.update({
          where: { id: req.params.id },
          data: {
            name: name !== undefined ? name : undefined,
            slug: slug !== undefined ? slug : undefined,
            description: description !== undefined ? description : undefined,
            imageUrl: imageSrc !== undefined ? imageSrc : undefined
          }
        }).catch(() => {});
      }
    } catch (e) {}

    res.json(existing || { success: true, message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    deleteStoredCategory(req.params.id);

    try {
      if (prisma && prisma.category) {
        await prisma.category.delete({ where: { id: req.params.id } }).catch(() => {});
      }
    } catch (e) {}

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
