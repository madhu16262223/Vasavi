import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../pgdb.js';

export const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'vasavi_fancy_store_jwt_secret_key_2026_nandyal';

// 1. Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check hardcoded owner credentials first
    if (cleanEmail === 'mogalipalliram@gmail.com' && password === 'charan143') {
      const token = jwt.sign(
        { email: cleanEmail, name: 'Ramcharan (Owner)' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        admin: { id: 'admin-owner', name: 'Ramcharan (Owner)', email: cleanEmail }
      });
    }

    // Check PostgreSQL admins table
    try {
      const dbRes = await query('SELECT * FROM admins WHERE LOWER(email) = $1', [cleanEmail]);
      if (dbRes.rows.length > 0) {
        const admin = dbRes.rows[0];
        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (isValid) {
          const token = jwt.sign(
            { adminId: admin.id, email: admin.email, name: admin.name },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          return res.json({
            success: true,
            token,
            admin: { id: admin.id, name: admin.name, email: admin.email }
          });
        }
      }
    } catch (dbErr) {
      console.warn('DB admin check fallback:', dbErr.message);
    }

    return res.status(401).json({ error: 'Invalid admin credentials' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Customer Registration (Saves to Supabase `customers` table)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/[^\d+]/g, '').trim();
    const cleanEmail = email ? email.trim().toLowerCase() : `${cleanPhone}@vasavistore.in`;
    const cleanAddress = address ? address.trim() : 'Nandyal, Andhra Pradesh';
    const customerId = `cust-${Date.now()}`;

    // Upsert into Supabase customers table
    try {
      const existing = await query('SELECT * FROM customers WHERE phone = $1', [cleanPhone]);
      if (existing.rows.length > 0) {
        await query(
          'UPDATE customers SET name = $1, address = $2 WHERE phone = $3',
          [cleanName, cleanAddress, cleanPhone]
        );
      } else {
        await query(
          'INSERT INTO customers (id, name, phone, address, "createdAt") VALUES ($1, $2, $3, $4, NOW())',
          [customerId, cleanName, cleanPhone, cleanAddress]
        );
      }
    } catch (dbErr) {
      console.warn('Supabase customer register error:', dbErr.message);
    }

    const user = {
      id: customerId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      address: cleanAddress,
      avatar: cleanName.charAt(0).toUpperCase(),
      isVip: true,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      user,
      message: 'Account registered successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Customer Login (Supports Phone or Email)
router.post('/customer-login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^\d]/g, '');

    try {
      const dbRes = await query(
        'SELECT * FROM customers WHERE phone = $1 OR LOWER(name) = $2',
        [cleanPhone, cleanId]
      );
      if (dbRes.rows.length > 0) {
        const c = dbRes.rows[0];
        return res.json({
          success: true,
          user: {
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: `${c.phone}@vasavistore.in`,
            address: c.address || 'Nandyal, Andhra Pradesh',
            avatar: c.name ? c.name.charAt(0).toUpperCase() : '👤',
            isVip: true,
            createdAt: c.createdAt
          }
        });
      }
    } catch (dbErr) {
      console.warn('Supabase customer login error:', dbErr.message);
    }

    // Default fast login for demo / valid phone numbers
    if (cleanPhone.length >= 10) {
      return res.json({
        success: true,
        user: {
          id: `cust-${Date.now()}`,
          name: cleanId.includes('@') ? cleanId.split('@')[0] : 'Customer',
          phone: cleanPhone,
          email: cleanId.includes('@') ? cleanId : `${cleanPhone}@vasavistore.in`,
          address: 'Nandyal, Andhra Pradesh',
          avatar: '👤',
          isVip: true,
          createdAt: new Date().toISOString()
        }
      });
    }

    return res.status(404).json({ error: 'Customer not found. Please sign up.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get all registered customers (Admin protected)
router.get('/customers', async (req, res) => {
  try {
    const dbRes = await query('SELECT * FROM customers ORDER BY "createdAt" DESC');
    res.json(dbRes.rows);
  } catch (err) {
    res.status(200).json([]);
  }
});

// Middleware for Admin protection
export const authenticateAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey === 'vasavi_admin_secret_2026') {
    req.admin = { name: 'Vasavi Admin' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized admin access' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
};
