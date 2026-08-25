import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

const INITIAL_CATEGORIES = [
  {
    id: "cat-1",
    name: "Cosmetics",
    slug: "cosmetics",
    description: "Premium lipsticks, matte foundations, eyeliners, and makeup palettes",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cat-2",
    name: "Jewellery",
    slug: "jewellery",
    description: "Temple jewellery, gold plated necklaces, jhumkas, and designer bangles",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cat-3",
    name: "Hand Bags",
    slug: "hand-bags",
    description: "Luxury totes, party clutches, bridal potlis, and crossbody bags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cat-4",
    name: "Hair Accessories",
    slug: "hair-accessories",
    description: "Bridal hair combs, pearl pins, floral tiaras, and velvet scrunchies",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cat-5",
    name: "Bangles",
    slug: "bangles",
    description: "Bridal silk thread bangles, gold-plated velvet kada sets, and designer chuda",
    image: "https://images.unsplash.com/photo-1611591475179-be25032890db?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cat-6",
    name: "Beauty & Perfumes",
    slug: "beauty-perfumes",
    description: "Long lasting floral perfumes, luxury body mists, and herbal skin care",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cat-7",
    name: "Rakis",
    slug: "rakis",
    description: "Designer Rakhi collection, royal thread sets, and festive gifts",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
  }
];

const INITIAL_PRODUCTS = [];

function readJsonFile(file, defaultValue) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return defaultValue;
  }
}

function writeJsonFile(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing file:', file, err);
  }
}

// ─── ORDERS ──────────────────────────────────────────────────────────
export function getStoredOrders() {
  return readJsonFile(ORDERS_FILE, []);
}

export function saveStoredOrder(order) {
  const orders = getStoredOrders();
  const existingIdx = orders.findIndex(o => o.id === order.id || o.orderNumber === order.orderNumber);
  if (existingIdx >= 0) {
    orders[existingIdx] = { ...orders[existingIdx], ...order };
  } else {
    orders.unshift(order);
  }
  writeJsonFile(ORDERS_FILE, orders);
  return order;
}

export function updateStoredOrderStatus(orderId, status, paymentStatus) {
  const orders = getStoredOrders();
  const existing = orders.find(o => o.id === orderId || o.orderNumber === orderId);
  if (existing) {
    existing.status = status;
    if (paymentStatus) existing.paymentStatus = paymentStatus;
    existing.updatedAt = new Date().toISOString();
    writeJsonFile(ORDERS_FILE, orders);
    return existing;
  }
  return null;
}

export function deleteStoredOrder(orderId) {
  const orders = getStoredOrders().filter(o => o.id !== orderId && o.orderNumber !== orderId);
  writeJsonFile(ORDERS_FILE, orders);
  return true;
}

// ─── PRODUCTS ────────────────────────────────────────────────────────
export function getStoredProducts() {
  return readJsonFile(PRODUCTS_FILE, INITIAL_PRODUCTS);
}

export function saveStoredProduct(product) {
  const products = getStoredProducts();
  const existingIdx = products.findIndex(p => p.id === product.id);
  if (existingIdx >= 0) {
    products[existingIdx] = { ...products[existingIdx], ...product };
  } else {
    products.unshift(product);
  }
  writeJsonFile(PRODUCTS_FILE, products);
  return product;
}

export function deleteStoredProduct(id) {
  const products = getStoredProducts().filter(p => p.id !== id);
  writeJsonFile(PRODUCTS_FILE, products);
  return true;
}

export function bulkSaveStoredProducts(newProds) {
  const products = getStoredProducts();
  newProds.forEach(np => {
    const idx = products.findIndex(p => p.id === np.id);
    if (idx >= 0) {
      products[idx] = { ...products[idx], ...np };
    } else {
      products.unshift(np);
    }
  });
  writeJsonFile(PRODUCTS_FILE, products);
  return products;
}

// ─── CATEGORIES ──────────────────────────────────────────────────────
export function getStoredCategories() {
  return readJsonFile(CATEGORIES_FILE, INITIAL_CATEGORIES);
}

export function saveStoredCategory(cat) {
  const categories = getStoredCategories();
  const slug = (cat.slug || cat.name).toLowerCase().replace(/\s+/g, '-');
  const existingIdx = categories.findIndex(c => c.id === cat.id || c.slug === slug);
  if (existingIdx >= 0) {
    categories[existingIdx] = { ...categories[existingIdx], ...cat, slug };
  } else {
    categories.push({ ...cat, slug });
  }
  writeJsonFile(CATEGORIES_FILE, categories);
  return cat;
}

export function deleteStoredCategory(id) {
  const categories = getStoredCategories().filter(c => c.id !== id && c.slug !== id);
  writeJsonFile(CATEGORIES_FILE, categories);
  return true;
}

export function bulkSaveStoredCategories(newCats) {
  const categories = getStoredCategories();
  newCats.forEach(nc => {
    const slug = (nc.slug || nc.name).toLowerCase().replace(/\s+/g, '-');
    const idx = categories.findIndex(c => c.id === nc.id || c.slug === slug);
    if (idx >= 0) {
      categories[idx] = { ...categories[idx], ...nc, slug };
    } else {
      categories.push({ ...nc, slug });
    }
  });
  writeJsonFile(CATEGORIES_FILE, categories);
  return categories;
}

// ─── ORDERS ──────────────────────────────────────────────────────────
export function getStoredOrders() {
  return readJsonFile(ORDERS_FILE, []);
}

export function saveStoredOrder(order) {
  const orders = getStoredOrders();
  const existingIdx = orders.findIndex(o => o.id === order.id || (order.orderNumber && o.orderNumber === order.orderNumber));
  if (existingIdx >= 0) {
    orders[existingIdx] = { ...orders[existingIdx], ...order, updatedAt: new Date().toISOString() };
  } else {
    orders.unshift(order);
  }
  writeJsonFile(ORDERS_FILE, orders);
  return order;
}

export function updateStoredOrderStatus(orderId, status, paymentStatus) {
  const orders = getStoredOrders();
  const idx = orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
  if (idx >= 0) {
    if (status) orders[idx].status = status;
    if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
    orders[idx].updatedAt = new Date().toISOString();
    writeJsonFile(ORDERS_FILE, orders);
    return orders[idx];
  }
  return null;
}

export function deleteStoredOrder(orderId) {
  const orders = getStoredOrders().filter(o => o.id !== orderId && o.orderNumber !== orderId);
  writeJsonFile(ORDERS_FILE, orders);
  return true;
}

