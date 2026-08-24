import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS, STORE_INFO } from '../data/mockData';
import { getTranslation } from '../utils/translations';
import { cleanIndianPhone, EMAIL_REGEX, PHONE_REGEX } from '../utils/phoneUtils';

const StoreContext = createContext();

const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://vasavi-api.onrender.com';

const ADMIN_API_HEADER = {
  'Content-Type': 'application/json',
  'x-admin-key': 'vasavi_admin_secret_2026'
};

// ─── DATA VERSION GUARD ───────────────────────────────────────────────────────
// Increment this number any time you want to force-clear old localStorage data.
// When the version changes, ALL store data is automatically wiped on first load.
const DATA_VERSION = 'vasavi_v10_permanent_clean';

const runAutoReset = () => {
  try {
    const stored = localStorage.getItem('vasavi_data_version');
    if (stored !== DATA_VERSION) {
      // Wipe all old bulky demo/test data and oversized caches
      [
        'vasavi_products', 'vasavi_orders', 'vasavi_offline_sales',
        'vasavi_cart', 'vasavi_reviews', 'vasavi_categories',
        'vasavi_customer_user', 'vasavi_registered_users'
      ].forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      // Stamp the new version
      try { localStorage.setItem('vasavi_data_version', DATA_VERSION); } catch (e) {}
      console.info('[Vasavi] Cloud Sync initialized: fresh v10 data version active.');
    }
  } catch (err) {
    console.warn('[Vasavi] Auto reset caught:', err);
  }
};

// Run immediately before any state is read from localStorage
runAutoReset();
// ─────────────────────────────────────────────────────────────────────────────

export const StoreProvider = ({ children }) => {
  // Store Settings State
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_store_settings');
      return saved ? JSON.parse(saved) : {
        whatsappNumber: STORE_INFO.whatsappNumber,
        displayPhone: STORE_INFO.displayPhone,
        deliveryFee: 0,
        announcementBanner: "Order directly on WhatsApp — Instant Confirmation & Delivery in Nandyal!"
      };
    } catch (e) {
      return {
        whatsappNumber: STORE_INFO.whatsappNumber,
        displayPhone: STORE_INFO.displayPhone,
        deliveryFee: 0,
        announcementBanner: "Order directly on WhatsApp — Instant Confirmation & Delivery in Nandyal!"
      };
    }
  });

  // Products State
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_products');
      if (!saved) return INITIAL_PRODUCTS;
      return JSON.parse(saved);
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  // Categories State
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  });

  // Orders State
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch (e) {
      return INITIAL_ORDERS;
    }
  });

  // Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Product Reviews State
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_reviews');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Language State ('en' | 'te')
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('vasavi_lang') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'te' : 'en';
      try {
        localStorage.setItem('vasavi_lang', next);
      } catch (e) {}
      return next;
    });
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [product, ...prev];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => p.id === productId);
  };

  // UI State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'shop' | 'track' | 'admin'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderConfirmedModal, setIsOrderConfirmedModal] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  
  // Admin Auth State (Always default to false so every access requires login)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Customer Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('vasavi_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Permanent Safe Storage Setter (Guaranteed to NEVER throw QuotaExceededError)
  const safeLocalStorageSet = (key, value) => {
    try {
      const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringVal);
    } catch (err) {
      console.warn(`[Vasavi] Storage quota reached while setting ${key}. Auto-evicting bulky caches...`);
      try {
        localStorage.removeItem('vasavi_products');
        localStorage.removeItem('vasavi_categories');
        localStorage.removeItem('vasavi_orders');
        localStorage.removeItem('vasavi_offline_sales');
        localStorage.removeItem('vasavi_reviews');
        const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringVal);
      } catch (finalErr) {
        // Silently swallow error so React never throws Uncaught QuotaExceededError
      }
    }
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  useEffect(() => {
    safeLocalStorageSet('vasavi_wishlist', wishlist);
  }, [wishlist]);

  // Local Storage Sync (Safe from QuotaExceededError)
  useEffect(() => {
    safeLocalStorageSet('vasavi_products', products);
  }, [products]);

  useEffect(() => {
    safeLocalStorageSet('vasavi_categories', categories);
  }, [categories]);

  useEffect(() => {
    safeLocalStorageSet('vasavi_orders', orders);
  }, [orders]);

  useEffect(() => {
    // Sanitize cart to prevent base64 data URL overflow
    const sanitizedCart = (cart || []).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size || 'Standard',
      selectedColor: item.selectedColor || '',
      image: (typeof item.image === 'string' && !item.image.startsWith('data:')) ? item.image : ''
    }));
    safeLocalStorageSet('vasavi_cart', sanitizedCart);
  }, [cart]);

  useEffect(() => {
    safeLocalStorageSet('vasavi_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    safeLocalStorageSet('vasavi_store_settings', storeSettings);
  }, [storeSettings]);

  useEffect(() => {
    if (currentUser) {
      safeLocalStorageSet('vasavi_customer_user', currentUser);
    } else {
      try { localStorage.removeItem('vasavi_customer_user'); } catch (e) {}
    }
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorageSet('vasavi_registered_users', registeredUsers);
  }, [registeredUsers]);

  // Live Cloud Database Hydration (Syncs Admin edits across all customers & devices in Real-Time)
  const fetchCloudData = React.useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/categories?t=${Date.now()}`),
        fetch(`${API_BASE_URL}/api/products?t=${Date.now()}`)
      ]);

      if (catRes.ok) {
        const cloudCats = await catRes.json();
        if (Array.isArray(cloudCats) && cloudCats.length > 0) {
          setCategories(cloudCats);
        }
      }

      if (prodRes.ok) {
        const cloudProds = await prodRes.json();
        if (Array.isArray(cloudProds) && cloudProds.length > 0) {
          setProducts(cloudProds);
        }
      }
    } catch (err) {
      console.warn('[Vasavi] Cloud API sync offline, using local cache:', err);
    }
  }, []);

  useEffect(() => {
    fetchCloudData();

    // Auto-refresh every 20 seconds so all customer devices stay synchronized in real-time
    const interval = setInterval(fetchCloudData, 20000);

    // Refresh whenever user switches back to the browser tab
    window.addEventListener('focus', fetchCloudData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchCloudData);
    };
  }, [fetchCloudData]);

  // Auto-sync all products & categories to Cloud Database whenever Admin makes changes
  useEffect(() => {
    if (isAdminLoggedIn && products.length > 0) {
      // Sync categories to cloud
      fetch(`${API_BASE_URL}/api/categories/bulk-sync`, {
        method: 'POST',
        headers: ADMIN_API_HEADER,
        body: JSON.stringify({ categories })
      }).catch((err) => console.warn('[Vasavi] Auto-sync categories warning:', err));

      // Sync products to cloud
      fetch(`${API_BASE_URL}/api/products/bulk-sync`, {
        method: 'POST',
        headers: ADMIN_API_HEADER,
        body: JSON.stringify({ products })
      }).catch((err) => console.warn('[Vasavi] Auto-sync products warning:', err));
    }
  }, [isAdminLoggedIn, products, categories]);

  // Live Order & Customer Fetching from Cloud for Admin Dashboard
  const [coupons, setCoupons] = useState([
    { id: 'coup-welcome50', code: 'WELCOME50', discountType: 'FLAT', discountValue: 50, minOrderAmount: 200, isActive: true },
    { id: 'coup-vasavi10', code: 'VASAVI10', discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: 300, maxDiscountAmount: 200, isActive: true },
    { id: 'coup-festive100', code: 'FESTIVE100', discountType: 'FLAT', discountValue: 100, minOrderAmount: 500, isActive: true }
  ]);
  const [reviewsList, setReviewsList] = useState([]);

  const fetchOrdersFromCloud = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders?t=${Date.now()}`, {
        headers: ADMIN_API_HEADER
      });
      if (res.ok) {
        const cloudOrders = await res.json();
        if (Array.isArray(cloudOrders)) {
          setOrders(cloudOrders);
        }
      }
    } catch (err) {
      console.warn('[Vasavi] Could not fetch orders from cloud:', err);
    }
  }, []);

  const fetchCustomersFromCloud = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/customers?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRegisteredUsers(data);
        }
      }
    } catch (e) {}
  }, []);

  const fetchCoupons = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCoupons(data);
        }
      }
    } catch (e) {}
  }, []);

  const fetchReviews = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviewsList(data);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchReviews();
    if (isAdminLoggedIn) {
      fetchOrdersFromCloud();
      fetchCustomersFromCloud();
      const orderInterval = setInterval(() => {
        fetchOrdersFromCloud();
        fetchCustomersFromCloud();
        fetchReviews();
      }, 10000);
      return () => clearInterval(orderInterval);
    }
  }, [isAdminLoggedIn, fetchOrdersFromCloud, fetchCustomersFromCloud, fetchCoupons, fetchReviews]);

  // Offline Sales / Shop Counter Income State
  const [offlineSales, setOfflineSales] = useState(() => {
    const saved = localStorage.getItem('vasavi_offline_sales');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    safeLocalStorageSet('vasavi_offline_sales', offlineSales);
  }, [offlineSales]);

  const addOfflineSale = ({ amount, paymentMethod, customerName, notes, date }) => {
    const newSale = {
      id: `OFF-${Math.floor(100 + Math.random() * 900)}`,
      amount: Number(amount) || 0,
      paymentMethod: paymentMethod || 'Cash',
      customerName: customerName || 'Walk-in Counter Customer',
      notes: notes || 'Counter Direct Sale',
      createdAt: date ? new Date(date).toISOString() : new Date().toISOString()
    };
    setOfflineSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  const deleteOfflineSale = (id) => {
    setOfflineSales((prev) => prev.filter((s) => s.id !== id));
  };

  // Cart Actions (Seamless Guest Checkout + Optional Login)
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        const availableStock = product.stock || 99;
        updated[existingIndex].quantity = Math.min(newQty, availableStock);
        return updated;
      } else {
        return [...prevCart, { product, quantity: Math.min(quantity, product.stock || 99) }];
      }
    });
    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock || 99;
          return { ...item, quantity: Math.min(newQuantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.product?.price === 'number' ? item.product.price : (parseFloat(item.product?.price) || 0);
      const qty = item.quantity || 1;
      return total + (price * qty);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  };

    // Order Placement (WhatsApp Direct or Cash on Delivery)
    const placeOrder = (customerInfo) => {
      if (cart.length === 0) return null;

      const orderNum = `VSV-${Math.floor(10000 + Math.random() * 90000)}`;
      const itemsTotal = getCartTotal();
      const deliveryFee = storeSettings.deliveryFee || 0;
      const totalAmount = itemsTotal + deliveryFee;

      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity
      }));

      const isPaidOnline = customerInfo.paymentMethod === 'ONLINE_UPI';

      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: orderNum,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: `${customerInfo.address}, ${customerInfo.city || 'Nandyal'}`,
        notes: customerInfo.notes || '',
        deliveryFee,
        totalAmount,
        paymentMethod: customerInfo.paymentMethod || 'ONLINE_UPI',
        paymentStatus: isPaidOnline ? 'PAID' : 'UNPAID',
        status: isPaidOnline ? 'PROCESSING' : 'PENDING',
        createdAt: new Date().toISOString(),
        items: orderItems
      };

      // Update Orders State immediately for Admin Dashboard
      setOrders((prev) => [newOrder, ...prev]);

      // Update Product Stock
      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          const cartItem = cart.find((item) => item.product.id === prod.id);
          if (cartItem) {
            return {
              ...prod,
              stock: Math.max(0, prod.stock - cartItem.quantity)
            };
          }
          return prod;
        })
      );

      // Save Last Placed Order & Open Confirmation Modal
      setLastPlacedOrder(newOrder);
      setIsOrderConfirmedModal(true);
      clearCart();
      setIsCartOpen(false);

      // Sync order with Express API backend asynchronously
      try {
        fetch(`${API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        }).catch(() => {});
      } catch (err) {}

      return newOrder;
    };

    // WhatsApp Order Helper
    const placeWhatsAppOrder = (customerInfo) => {
      const order = placeOrder({ ...customerInfo, paymentMethod: 'WHATSAPP' });
      if (!order) return null;

      let message = `Hello Vasavi Fancy Store 👋\n\n`;
      message += `I would like to place an order.\n\n`;
      message += `📋 *Order ID:* ${order.orderNumber}\n`;
      message += `👤 *Customer Details:*\n`;
      message += `• Name: ${customerInfo.name}\n`;
      message += `• Phone: ${customerInfo.phone}\n`;
      message += `• Address: ${customerInfo.address}\n\n`;
      message += `💰 *Total Amount:* ₹${order.totalAmount}\n\n`;
      message += `Please confirm my order and delivery. Thank you!`;

      const whatsappUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(message)}`;
      return { order, whatsappUrl };
    };

  // Product CRUD with Cloud Sync
  const addProduct = (productData) => {
    const newProd = {
      ...productData,
      id: productData.id || `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      stock: Number(productData.stock) || 10,
      price: Number(productData.price),
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
      image: productData.image || productData.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
      imageUrl: productData.image || productData.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'
    };
    setProducts((prev) => [newProd, ...prev]);

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: ADMIN_API_HEADER,
      body: JSON.stringify(newProd)
    }).catch((err) => console.error('[Vasavi] Product sync error:', err));
  };

  const updateProduct = (productIdOrObj, maybePayload) => {
    const id = typeof productIdOrObj === 'object' ? productIdOrObj.id : productIdOrObj;
    const data = typeof productIdOrObj === 'object' ? productIdOrObj : (maybePayload || {});
    const imageSrc = data.image || data.imageUrl;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...data };
          if (data.price !== undefined) updated.price = Number(data.price);
          if (data.stock !== undefined) updated.stock = Number(data.stock);
          if (imageSrc) {
            updated.image = imageSrc;
            updated.imageUrl = imageSrc;
          }
          return updated;
        }
        return p;
      })
    );

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: ADMIN_API_HEADER,
      body: JSON.stringify({ ...data, image: imageSrc, imageUrl: imageSrc })
    }).catch((err) => console.error('[Vasavi] Product update sync error:', err));
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: ADMIN_API_HEADER
    }).catch((err) => console.error('[Vasavi] Product delete sync error:', err));
  };

  // Category CRUD with Cloud Sync
  const addCategory = (categoryData) => {
    const slug = (categoryData.slug || categoryData.name).toLowerCase().replace(/\s+/g, '-');
    const newCat = {
      ...categoryData,
      id: categoryData.id || `cat-${Date.now()}`,
      slug,
      image: categoryData.image || categoryData.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
      imageUrl: categoryData.image || categoryData.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
      itemCount: 0
    };
    setCategories((prev) => [...prev, newCat]);

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: ADMIN_API_HEADER,
      body: JSON.stringify(newCat)
    }).catch((err) => console.error('[Vasavi] Category add sync error:', err));
  };

  const updateCategory = (categoryId, updatedData) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, ...updatedData } : c))
    );

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: ADMIN_API_HEADER,
      body: JSON.stringify(updatedData)
    }).catch((err) => console.error('[Vasavi] Category update sync error:', err));
  };

  const deleteCategory = (categoryId) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      method: 'DELETE',
      headers: ADMIN_API_HEADER
    }).catch((err) => console.error('[Vasavi] Category delete sync error:', err));
  };

  // Order Status Update with Cloud Sync
  const updateOrderStatus = (orderId, newStatus, paymentStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? {
              ...o,
              status: newStatus,
              paymentStatus: paymentStatus || o.paymentStatus,
              updatedAt: new Date().toISOString()
            }
          : o
      )
    );

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: ADMIN_API_HEADER,
      body: JSON.stringify({ status: newStatus, paymentStatus })
    }).catch((err) => console.warn('[Vasavi] Order status sync error:', err));
  };

  // Delete Order with Cloud Sync
  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId && o.orderNumber !== orderId));

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: ADMIN_API_HEADER
    }).catch((err) => console.error('[Vasavi] Order delete sync error:', err));
  };

  // Delete Customer with Cloud Sync
  const deleteCustomer = (customerId) => {
    setRegisteredUsers((prev) => prev.filter((u) => u.id !== customerId));

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/auth/customers/${customerId}`, {
      method: 'DELETE',
      headers: ADMIN_API_HEADER
    }).catch((err) => console.error('[Vasavi] Customer delete sync error:', err));
  };

  // Create Coupon with Cloud Sync
  const createCoupon = (couponData) => {
    const newCoupon = {
      id: `coup-${Date.now()}`,
      code: (couponData.code || 'SAVE10').toUpperCase().trim(),
      discountType: couponData.discountType || 'PERCENTAGE',
      discountValue: Number(couponData.discountValue) || 10,
      minOrderAmount: Number(couponData.minOrderAmount) || 0,
      maxDiscountAmount: couponData.maxDiscountAmount ? Number(couponData.maxDiscountAmount) : null,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setCoupons((prev) => [newCoupon, ...prev]);

    fetch(`${API_BASE_URL}/api/coupons`, {
      method: 'POST',
      headers: ADMIN_API_HEADER,
      body: JSON.stringify(newCoupon)
    }).catch((err) => console.error('[Vasavi] Coupon create sync error:', err));

    return newCoupon;
  };

  // Delete Coupon with Cloud Sync
  const deleteCoupon = (couponId) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));

    fetch(`${API_BASE_URL}/api/coupons/${couponId}`, {
      method: 'DELETE',
      headers: ADMIN_API_HEADER
    }).catch((err) => console.error('[Vasavi] Coupon delete sync error:', err));
  };

  // Add Product Review with Cloud Sync
  const addReview = (reviewData) => {
    const newReview = {
      id: `rev-${Date.now()}`,
      productId: reviewData.productId,
      productName: reviewData.productName || 'Store Item',
      customerName: reviewData.customerName || (currentUser?.name || 'Customer'),
      customerPhone: reviewData.customerPhone || (currentUser?.phone || null),
      rating: Number(reviewData.rating) || 5,
      comment: reviewData.comment || '',
      isApproved: true,
      createdAt: new Date().toISOString()
    };

    setReviewsList((prev) => [newReview, ...prev]);

    fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    }).catch((err) => console.error('[Vasavi] Review add sync error:', err));

    return newReview;
  };

  // Delete Review with Cloud Sync
  const deleteReview = (reviewId) => {
    setReviewsList((prev) => prev.filter((r) => r.id !== reviewId));

    fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: ADMIN_API_HEADER
    }).catch((err) => console.error('[Vasavi] Review delete sync error:', err));
  };

  // Approve Review with Cloud Sync
  const approveReview = (reviewId, isApproved) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isApproved } : r))
    );

    fetch(`${API_BASE_URL}/api/reviews/${reviewId}/approve`, {
      method: 'PUT',
      headers: ADMIN_API_HEADER,
      body: JSON.stringify({ isApproved })
    }).catch((err) => console.error('[Vasavi] Review approve sync error:', err));
  };

  const updateStoreSettings = (newSettings) => {
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Admin Auth (Strict pair matching with brute-force rate limiting)
  const [adminLoginAttempts, setAdminLoginAttempts] = useState(0);
  const [adminLockoutUntil, setAdminLockoutUntil] = useState(null);

  const loginAdmin = (email, password) => {
    // Check if currently locked out
    if (adminLockoutUntil && Date.now() < adminLockoutUntil) {
      const remainingSeconds = Math.ceil((adminLockoutUntil - Date.now()) / 1000);
      return { success: false, message: `Security Lockout: Too many failed attempts. Try again in ${remainingSeconds}s.` };
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanPass = password ? password.trim() : '';

    // Authorized strictly-paired administrator credentials
    const authorizedAdmins = {
      'mogalipalliram@gmail.com': 'charan143',
      'gurumadhukgm@gmail.com': 'admin123'
    };

    if (authorizedAdmins[cleanEmail] && authorizedAdmins[cleanEmail] === cleanPass) {
      setIsAdminLoggedIn(true);
      setAdminLoginAttempts(0);
      setAdminLockoutUntil(null);
      return { success: true };
    }

    const newAttempts = adminLoginAttempts + 1;
    setAdminLoginAttempts(newAttempts);

    if (newAttempts >= 5) {
      const lockTime = Date.now() + 30000; // 30-second lockout
      setAdminLockoutUntil(lockTime);
      return { success: false, message: 'Too many failed login attempts. Account access temporarily locked for 30 seconds for security.' };
    }

    return { success: false, message: 'Invalid admin credentials. Please enter authorized email and password.' };
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setActiveTab('home');
  };

  // Customer Auth Functions
  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const sanitizeInput = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/[<>]/g, '').trim();
  };

  const isComplexPassword = (pwd) => {
    if (!pwd || pwd.length < 6) return false;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const loginCustomer = async (emailInput, passInput) => {
    const rawInput = (emailInput || '').trim();
    const cleanPass = (passInput || '').trim();

    if (!rawInput) {
      return { success: false, message: 'Please enter your registered email address or 10-digit mobile number.' };
    }

    if (!cleanPass) {
      return { success: false, message: 'Please enter your account password.' };
    }

    const cleanEmail = rawInput.toLowerCase();
    const cleanPhone = cleanIndianPhone(rawInput);

    // Validate format
    const isEmail = EMAIL_REGEX.test(cleanEmail);
    const isPhone = PHONE_REGEX.test(cleanPhone);

    if (!isEmail && !isPhone) {
      return {
        success: false,
        message: 'Please enter a valid email address (e.g. name@gmail.com) or a 10-digit Indian mobile number (+91).'
      };
    }

    // 1. Try Cloud Login via Supabase API with endpoint resilience
    const loginEndpoints = [
      `${API_BASE_URL}/api/auth/customer-login`,
      `${API_BASE_URL}/api/auth/customer/login`,
      `${API_BASE_URL}/api/auth/login`
    ];

    let cloudAuthSucceeded = false;

    for (const endpoint of loginEndpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: isPhone ? cleanPhone : cleanEmail, password: cleanPass })
        });

        if (res.status === 404) {
          continue; // Endpoint variant not mounted on current server release, try next alias
        }

        const data = await res.json().catch(() => null);

        if (res.ok && data?.user) {
          setCurrentUser(data.user);
          setRegisteredUsers((prev) => {
            const exists = prev.some((u) => u.id === data.user.id || u.phone === data.user.phone);
            return exists ? prev : [data.user, ...prev];
          });
          cloudAuthSucceeded = true;
          return { success: true, user: data.user };
        }

        if (data?.error) {
          // Authentication error explicitly returned from database
          return { success: false, message: data.error };
        }
      } catch (e) {
        // Network timeout / Render cold start
      }
    }

    // 2. Local fallback check with strict password verification
    const user = registeredUsers.find(
      (u) => (u.email && u.email.toLowerCase() === cleanEmail) || 
             (cleanPhone && u.phone && cleanIndianPhone(u.phone) === cleanPhone)
    );

    if (user) {
      if (user.password && user.password !== cleanPass) {
        return { success: false, message: 'Incorrect password. Please enter the correct password or use Forgot Password.' };
      }
      setCurrentUser(user);
      return { success: true, user };
    }

    return { 
      success: false, 
      message: 'No registered account found with this email or mobile number. Please Create an Account first.' 
    };
  };

  const signupCustomer = async ({ name, email, phone, password, address }) => {
    const cleanName = sanitizeInput(name);
    const cleanPhone = cleanIndianPhone(phone);
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanAddress = address ? sanitizeInput(address) : 'Nandyal, Andhra Pradesh';
    const cleanPass = (password || '').trim();

    // 1. Strict Name Validation
    if (!cleanName || cleanName.length < 3) {
      return { success: false, message: 'Please enter a valid full name (at least 3 characters).' };
    }

    // 2. Strict Phone Validation (10-digit Indian Mobile)
    if (!PHONE_REGEX.test(cleanPhone)) {
      return { success: false, message: 'Please enter a valid 10-digit Indian mobile number (+91) starting with 6, 7, 8, or 9.' };
    }

    // 3. Strict Email Validation
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address (e.g. name@gmail.com).' };
    }

    // 4. Strict Password Validation with Character Combination Rules
    if (!cleanPass || cleanPass.length < 6 || !isComplexPassword(cleanPass)) {
      return {
        success: false,
        message: 'Password must be at least 6 characters and contain uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), and special characters (!@#$).'
      };
    }

    const finalEmail = cleanEmail || `${cleanPhone}@vasavistore.in`;

    // 5. Check Local Duplicates
    const localExists = registeredUsers.some(
      (u) => (cleanPhone && u.phone && cleanIndianPhone(u.phone) === cleanPhone) ||
             (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (localExists) {
      return {
        success: false,
        message: 'An account with this mobile number or email already exists. Please Sign In instead.'
      };
    }

    const newUser = {
      id: `cust-${Date.now()}`,
      name: cleanName,
      email: finalEmail,
      phone: cleanPhone,
      address: cleanAddress,
      password: cleanPass,
      avatar: cleanName.charAt(0).toUpperCase(),
      isVip: true,
      createdAt: new Date().toISOString()
    };

    // 6. Save to Cloud Database (Supabase customers table)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          address: cleanAddress,
          password: cleanPass
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 409 || data?.error) {
          return { success: false, message: data?.error || 'An account with this mobile number or email already exists. Please Sign In.' };
        }
      } else if (data?.user) {
        newUser.id = data.user.id || newUser.id;
      }
    } catch (e) {
      console.warn('[Vasavi] Cloud customer register fetch error:', e);
    }

    setRegisteredUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    return { success: true, user: newUser, message: 'Account registered successfully! Welcome to Vasavi Fancy Store.' };
  };

  const logoutCustomer = () => {
    setCurrentUser(null);
  };

  const requestPasswordReset = async (identifier) => {
    const rawInput = (identifier || '').trim();
    if (!rawInput) {
      return { success: false, message: 'Please enter your registered email address or mobile number.' };
    }

    const cleanEmail = rawInput.toLowerCase();
    const cleanPhone = rawInput.replace(/[^\d]/g, '');

    // 1. Attempt Cloud API request
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/customer/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: rawInput })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        return { 
          success: true, 
          email: data.email || rawInput, 
          phone: data.phone || '', 
          otp: data.otp,
          message: data.message || `Password reset verification code sent to ${data.email || rawInput}` 
        };
      }

      if (data?.error) {
        return { success: false, message: data.error };
      }
    } catch (e) {
      console.warn('[Vasavi] Forgot password request error:', e);
    }

    // 2. Check local users
    const user = registeredUsers.find(
      (u) => (u.email && u.email.toLowerCase() === cleanEmail) || 
             (cleanPhone && u.phone && u.phone.replace(/[^\d]/g, '') === cleanPhone)
    );

    if (user) {
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        success: true,
        email: user.email || `${user.phone}@vasavistore.in`,
        phone: user.phone,
        otp: fallbackOtp,
        message: `Password reset verification code sent to ${user.email || user.phone}. Verification code: ${fallbackOtp}`
      };
    }

    return {
      success: false,
      message: 'No registered account found with this email or mobile number. Please check your credentials or Create an Account.'
    };
  };

  const resetPassword = async ({ email, phone, otp, newPassword }) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPhone = (phone || '').replace(/[^\d]/g, '').trim();
    const cleanPass = (newPassword || '').trim();

    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    // 1. Sync with Cloud Database
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/customer/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, phone: cleanPhone, otp, newPassword: cleanPass })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        // Update local registeredUsers
        setRegisteredUsers((prev) =>
          prev.map((u) => {
            if ((cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
                (cleanPhone && u.phone && u.phone.replace(/[^\d]/g, '') === cleanPhone)) {
              return { ...u, password: cleanPass };
            }
            return u;
          })
        );

        return { success: true, message: data.message || 'Password has been reset successfully!' };
      }

      if (data?.error) {
        return { success: false, message: data.error };
      }
    } catch (e) {
      console.warn('[Vasavi] Reset password error:', e);
    }

    // 2. Local Fallback Update
    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if ((cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
            (cleanPhone && u.phone && u.phone.replace(/[^\d]/g, '') === cleanPhone)) {
          return { ...u, password: cleanPass };
        }
        return u;
      })
    );

    return { success: true, message: 'Password reset successfully! You can now sign in with your new password.' };
  };

  const resetStoreToCleanState = () => {
    setProducts([]);
    setOrders([]);
    setOfflineSales([]);
    setCart([]);
    setReviews({});
    localStorage.removeItem('vasavi_products');
    localStorage.removeItem('vasavi_orders');
    localStorage.removeItem('vasavi_offline_sales');
    localStorage.removeItem('vasavi_cart');
    localStorage.removeItem('vasavi_reviews');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        cart,
        reviews,
        storeSettings,
        registeredUsers,
        activeTab,
        setActiveTab,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isOrderConfirmedModal,
        setIsOrderConfirmedModal,
        lastPlacedOrder,
        isAdminLoggedIn,
        currentUser,
        offlineSales,
        addOfflineSale,
        deleteOfflineSale,
        resetStoreToCleanState,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        loginCustomer,
        signupCustomer,
        logoutCustomer,
        requestPasswordReset,
        resetPassword,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        placeOrder,
        placeWhatsAppOrder,
        addReview,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        deleteOrder,
        deleteCustomer,
        coupons,
        createCoupon,
        deleteCoupon,
        reviewsList,
        deleteReview,
        approveReview,
        updateStoreSettings,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        language,
        toggleLanguage,
        t: (key, fallback) => getTranslation(language, key, fallback),
        loginAdmin,
        logoutAdmin,
        refreshCloudData: fetchCloudData,
        storeInfo: { ...STORE_INFO, ...storeSettings }
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
