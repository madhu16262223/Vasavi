/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS, STORE_INFO } from '../data/mockData';

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
const DATA_VERSION = 'vasavi_v6_cloud_sync';

const runAutoReset = () => {
  const stored = localStorage.getItem('vasavi_data_version');
  if (stored !== DATA_VERSION) {
    // Wipe all old demo/test data
    [
      'vasavi_products', 'vasavi_orders', 'vasavi_offline_sales',
      'vasavi_cart', 'vasavi_reviews', 'vasavi_categories',
      'vasavi_customer_user'
    ].forEach(k => localStorage.removeItem(k));
    // Stamp the new version so it won't wipe again on next load
    localStorage.setItem('vasavi_data_version', DATA_VERSION);
    console.info('[Vasavi] Cloud Sync initialized: fresh data version active.');
  }
};

// Run immediately before any state is read from localStorage
runAutoReset();
// ─────────────────────────────────────────────────────────────────────────────

export const StoreProvider = ({ children }) => {
  // Store Settings State
  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem('vasavi_store_settings');
    return saved ? JSON.parse(saved) : {
      whatsappNumber: STORE_INFO.whatsappNumber,
      displayPhone: STORE_INFO.displayPhone,
      deliveryFee: 0,
      announcementBanner: "Order directly on WhatsApp — Instant Confirmation & Delivery in Nandyal!"
    };
  });

  // Products State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('vasavi_products');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  // Categories State
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('vasavi_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Orders State
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('vasavi_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Cart State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('vasavi_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Product Reviews State
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('vasavi_reviews');
    return saved ? JSON.parse(saved) : {};
  });

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
    const saved = localStorage.getItem('vasavi_customer_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('vasavi_registered_users');
    return saved ? JSON.parse(saved) : [
      { id: 'usr-1', name: 'Ramcharan Mogalipalli', email: 'mogalipalliram@gmail.com', phone: '8309917665', password: 'charan143', avatar: '👑', isVip: true },
      { id: 'usr-2', name: 'Madhu Kakarla', email: 'gurumadhukgm@gmail.com', phone: '9704381790', password: 'admin123', avatar: '💻', isVip: true }
    ];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Local Storage Sync
  useEffect(() => {
    localStorage.setItem('vasavi_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vasavi_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('vasavi_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('vasavi_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vasavi_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('vasavi_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vasavi_customer_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vasavi_customer_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vasavi_registered_users', JSON.stringify(registeredUsers));
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

  // Offline Sales / Shop Counter Income State
  const [offlineSales, setOfflineSales] = useState(() => {
    const saved = localStorage.getItem('vasavi_offline_sales');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vasavi_offline_sales', JSON.stringify(offlineSales));
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
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
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

  // Review Actions
  const addReview = (productId, { author, rating, comment }) => {
    const newRev = {
      id: `rev-${Date.now()}`,
      author,
      rating: Number(rating),
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews((prev) => {
      const existingList = prev[productId] || [];
      const updatedList = [newRev, ...existingList];
      
      // Recalculate Product Rating
      const avgRating = (updatedList.reduce((s, r) => s + r.rating, 0) / updatedList.length).toFixed(1);
      
      setProducts((prods) =>
        prods.map((p) => (p.id === productId ? { ...p, rating: Number(avgRating), reviewsCount: updatedList.length } : p))
      );

      return {
        ...prev,
        [productId]: updatedList
      };
    });
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

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...data };
          if (data.price !== undefined) updated.price = Number(data.price);
          if (data.stock !== undefined) updated.stock = Number(data.stock);
          if (data.image) updated.image = data.image;
          if (data.imageUrl) updated.imageUrl = data.imageUrl;
          return updated;
        }
        return p;
      })
    );

    // Send to Cloud Database
    fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: ADMIN_API_HEADER,
      body: JSON.stringify(data)
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

  // Order Status Update
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o))
    );
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

  const loginCustomer = (emailInput, passInput) => {
    const cleanEmail = emailInput ? emailInput.toLowerCase().trim() : '';
    const cleanPass = passInput ? passInput.trim() : '';

    if (!cleanEmail || !cleanPass) {
      return { success: false, message: 'Please provide both your email address and password.' };
    }

    const user = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
    );

    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }

    return { success: false, message: 'Invalid email or password. Please check your credentials or create a new account.' };
  };

  const signupCustomer = ({ name, email, phone, password }) => {
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanName = sanitizeInput(name);
    const cleanPhone = phone ? phone.replace(/[^\d+]/g, '').trim() : '';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address (e.g., name@gmail.com).' };
    }

    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Please enter a valid full name.' };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: password.trim(),
      avatar: cleanName ? cleanName.charAt(0).toUpperCase() : '👤',
      isVip: true,
      createdAt: new Date().toISOString()
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logoutCustomer = () => {
    setCurrentUser(null);
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
        updateStoreSettings,
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
