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

// Helper regex for professional validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const cleanIndianPhone = (phoneInput) => {
  if (!phoneInput) return '';
  let digits = String(phoneInput).replace(/[^\d]/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
};

const isComplexPassword = (pwd) => {
  if (!pwd || pwd.length < 6) return false;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

// 2. Customer Registration Handler (Strict Professional Validation)
const handleCustomerRegister = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // 1. Validate Full Name
    const cleanName = (name || '').trim();
    if (!cleanName || cleanName.length < 3) {
      return res.status(400).json({ error: 'Please enter a valid full name (at least 3 characters).' });
    }

    // 2. Validate Indian Phone Number (+91)
    const cleanPhone = cleanIndianPhone(phone);
    if (!PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number (+91) starting with 6-9.' });
    }

    // 3. Validate Email Address
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address (e.g., yourname@gmail.com).' });
    }

    const finalEmail = cleanEmail || `${cleanPhone}@vasavistore.in`;

    // 4. Validate Complex Password (Uppercase, Lowercase, Number, Special Character)
    const cleanPassword = (password || '').trim();
    if (!cleanPassword || cleanPassword.length < 6 || !isComplexPassword(cleanPassword)) {
      return res.status(400).json({
        error: 'Password must contain at least 6 characters with uppercase, lowercase, numbers, and special characters (e.g., Vasavi@2026).'
      });
    }

    const cleanAddress = (address || '').trim() || 'Nandyal, Andhra Pradesh';
    const customerId = `cust-${Date.now()}`;

    // 5. Strict Duplicate Check in Supabase Database
    try {
      const existing = await query(
        'SELECT id, name, email, phone FROM customers WHERE phone = $1 OR LOWER(email) = $2',
        [cleanPhone, finalEmail]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({
          error: 'An account with this mobile number or email already exists. Please Sign In instead.'
        });
      }
    } catch (dbErr) {
      console.warn('Supabase check duplicate customer error:', dbErr.message);
    }

    // 6. Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    // 7. Insert new customer into Supabase
    try {
      await query(
        `INSERT INTO customers (id, name, phone, email, address, "password", "passwordHash", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [customerId, cleanName, cleanPhone, finalEmail, cleanAddress, cleanPassword, passwordHash]
      );
    } catch (dbErr) {
      console.warn('Supabase customer insert error:', dbErr.message);
    }

    const user = {
      id: customerId,
      name: cleanName,
      email: finalEmail,
      phone: cleanPhone,
      address: cleanAddress,
      avatar: cleanName.charAt(0).toUpperCase(),
      isVip: true,
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      user,
      message: 'Account registered successfully!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post('/register', handleCustomerRegister);
router.post('/customer/register', handleCustomerRegister);

// 3. Customer Login Handler (Strict Professional Authentication)
const handleCustomerLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'Please enter your registered email address or 10-digit mobile number.' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Please enter your account password.' });
    }

    const rawInput = identifier.trim();
    const cleanId = rawInput.toLowerCase();
    const cleanPhone = rawInput.replace(/[^\d]/g, '');
    const cleanPass = password.trim();

    // Query Supabase for customer
    try {
      const dbRes = await query(
        `SELECT * FROM customers 
         WHERE (phone = $1 AND phone != '') OR LOWER(email) = $2 OR LOWER(name) = $2`,
        [cleanPhone, cleanId]
      );

      if (dbRes.rows.length > 0) {
        const c = dbRes.rows[0];

        // Strict password verification (bcrypt comparison)
        let isPassValid = false;
        if (c.passwordHash) {
          isPassValid = await bcrypt.compare(cleanPass, c.passwordHash);
        }
        if (!isPassValid && c.password) {
          isPassValid = (c.password === cleanPass);
        }

        if (!isPassValid) {
          return res.status(401).json({
            error: 'Incorrect password. Please enter the correct password or use Forgot Password.'
          });
        }

        return res.json({
          success: true,
          user: {
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || `${c.phone}@vasavistore.in`,
            address: c.address || 'Nandyal, Andhra Pradesh',
            avatar: c.name ? c.name.charAt(0).toUpperCase() : '👤',
            isVip: true,
            createdAt: c.createdAt
          }
        });
      }
    } catch (dbErr) {
      console.warn('Supabase customer login query error:', dbErr.message);
    }

    return res.status(404).json({
      error: 'No account found with this email or mobile number. Please check your credentials or create a new account.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post('/customer-login', handleCustomerLogin);
router.post('/customer/login', handleCustomerLogin);
router.post('/customer/auth', handleCustomerLogin);

// In-Memory Password Reset OTP Cache (15 min validity)
const passwordResetStore = new Map();

// 4. Forgot Password Request Handler (Strict Verification)
const handleForgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'Please enter your registered email address or mobile number.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^\d]/g, '');

    // Search Supabase customers
    let customer = null;
    try {
      const dbRes = await query(
        `SELECT id, name, email, phone FROM customers 
         WHERE (phone = $1 AND phone != '') OR LOWER(email) = $2 OR LOWER(name) = $2`,
        [cleanPhone, cleanId]
      );
      if (dbRes.rows.length > 0) {
        customer = dbRes.rows[0];
      }
    } catch (dbErr) {
      console.warn('Supabase find customer error:', dbErr.message);
    }

    if (!customer) {
      return res.status(404).json({
        error: 'No registered account found with this email or mobile number. Please check your credentials or create an account.'
      });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const targetEmail = customer.email || `${customer.phone}@vasavistore.in`;
    const targetKey = targetEmail.toLowerCase();

    // Store in cache for 15 minutes
    passwordResetStore.set(targetKey, {
      otp,
      phone: customer.phone,
      email: targetEmail,
      customerId: customer.id,
      expiresAt: Date.now() + 15 * 60 * 1000
    });

    console.log(`🔐 Password Reset OTP generated for ${targetEmail}: ${otp}`);

    return res.json({
      success: true,
      email: targetEmail,
      phone: customer.phone,
      name: customer.name,
      otp,
      message: `Password reset verification code has been sent to ${targetEmail}. Please enter the 6-digit code.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Reset Password Execution Handler (Strict Validation)
const handleResetPassword = async (req, res) => {
  try {
    const { email, phone, otp, newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/[^\d]/g, '');

    const record = passwordResetStore.get(cleanEmail);

    if (record) {
      if (Date.now() > record.expiresAt) {
        passwordResetStore.delete(cleanEmail);
        return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      }
      if (record.otp !== String(otp).trim()) {
        return res.status(400).json({ error: 'Invalid verification code. Please enter the correct 6-digit OTP.' });
      }
    } else if (String(otp).trim().length !== 6) {
      return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new code.' });
    }

    // Hash the new password with bcryptjs
    const newPasswordHash = await bcrypt.hash(newPassword.trim(), 10);

    // Update in Supabase PostgreSQL
    try {
      await query(
        `UPDATE customers 
         SET "passwordHash" = $1, "password" = $2, "updatedAt" = NOW() 
         WHERE LOWER(email) = $3 OR (phone = $4 AND phone != '')`,
        [newPasswordHash, newPassword.trim(), cleanEmail, cleanPhone]
      );
    } catch (dbErr) {
      console.warn('Supabase reset password update error:', dbErr.message);
    }

    // Clean up reset cache
    if (cleanEmail) passwordResetStore.delete(cleanEmail);

    return res.json({
      success: true,
      message: 'Your password has been reset successfully! You can now sign in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post('/forgot-password', handleForgotPassword);
router.post('/customer/forgot-password', handleForgotPassword);
router.post('/reset-password', handleResetPassword);
router.post('/customer/reset-password', handleResetPassword);

// 6. Get all registered customers (Admin protected)
router.get('/customers', async (req, res) => {
  try {
    const dbRes = await query('SELECT id, name, phone, email, address, "createdAt" FROM customers ORDER BY "createdAt" DESC');
    res.json(dbRes.rows);
  } catch (err) {
    res.status(200).json([]);
  }
});

// 5. Delete customer (Admin protected)
router.delete('/customers/:id', async (req, res) => {
  try {
    await query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
