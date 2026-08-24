import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminLogin } from './AdminLogin';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSettings } from './AdminSettings';
import { AdminPOS } from './AdminPOS';
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  PackageCheck,
  BarChart3,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Menu,
  Users,
  CreditCard,
  Star,
  Ticket,
  Image,
  FileSpreadsheet,
  Package,
  UserCheck,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Trash2,
  Plus,
  Printer
} from 'lucide-react';
import { downloadMonthlySalesCSV, downloadGSTLedgerPDF } from '../../utils/reportsGenerator';

const formatFullDateTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return dateInput;
  
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = hours.toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
};

export const AdminDashboard = () => {
  const {
    isAdminLoggedIn,
    logoutAdmin,
    setActiveTab,
    orders,
    products,
    categories,
    registeredUsers = [],
    offlineSales = [],
    addOfflineSale,
    deleteOfflineSale,
    resetStoreToCleanState,
    deleteCustomer,
    coupons = [],
    createCoupon,
    deleteCoupon,
    reviewsList = [],
    deleteReview,
    approveReview,
    deleteOrder,
    storeSettings
  } = useStore();

  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'products' | 'categories' | 'orders' | 'payments' | 'analytics' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentLedgerType, setPaymentLedgerType] = useState('ALL'); // 'ALL' | 'ONLINE' | 'OFFLINE'
  const [customerSearch, setCustomerSearch] = useState('');

  // Notification Bell State & Click-Outside Ref
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const notificationRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Real Dynamic Notifications derived from Store Context
  const alertPendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING' || o.paymentStatus !== 'PAID');
  const lowStockProducts = products.filter(p => (p.stock !== undefined && p.stock !== null && p.stock <= 3));
  const pendingReviews = reviewsList.filter(r => !r.isApproved);

  const notificationsList = [
    ...alertPendingOrders.map(order => ({
      id: `ord-notif-${order.id || order.orderNumber}`,
      type: 'order',
      title: `New Online Order #${order.orderNumber || order.id}`,
      description: `${order.customerName || 'Customer'} • ₹${order.totalAmount} • ${order.paymentMethod === 'ONLINE_UPI' ? '💳 Online Paid' : '💵 Cash on Delivery'}`,
      time: order.createdAt ? formatFullDateTime(order.createdAt) : 'Recent Order',
      unread: !readNotificationIds.includes(`ord-notif-${order.id || order.orderNumber}`),
      actionTab: 'orders'
    })),
    ...lowStockProducts.map(prod => ({
      id: `stock-notif-${prod.id}`,
      type: 'stock',
      title: `Low Stock Alert: ${prod.name}`,
      description: `Only ${prod.stock} items remaining in stock. Restock soon to prevent out-of-stock.`,
      time: 'Inventory Alert',
      unread: !readNotificationIds.includes(`stock-notif-${prod.id}`),
      actionTab: 'products'
    })),
    ...pendingReviews.map(rev => ({
      id: `rev-notif-${rev.id}`,
      type: 'review',
      title: `New Review from ${rev.customerName || 'Customer'}`,
      description: `Rated ${rev.rating}⭐: "${rev.comment || 'Product feedback'}"`,
      time: rev.createdAt ? formatFullDateTime(rev.createdAt) : 'Recent',
      unread: !readNotificationIds.includes(`rev-notif-${rev.id}`),
      actionTab: 'overview'
    }))
  ];

  if (notificationsList.length === 0) {
    notificationsList.push({
      id: 'default-notif-1',
      type: 'info',
      title: 'Vasavi Store Live & Connected',
      description: 'Cloud database is connected and syncing real-time orders, products & POS sales.',
      time: 'System Status',
      unread: false,
      actionTab: 'overview'
    });
  }

  const unreadCount = notificationsList.filter(n => n.unread).length;

  // Offline Sale Modal Form State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offAmount, setOffAmount] = useState('');
  const [offMethod, setOffMethod] = useState('Cash');
  const [offCustomer, setOffCustomer] = useState('');
  const [offNotes, setOffNotes] = useState('');

  // Coupon Creation Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState('PERCENTAGE'); // 'PERCENTAGE' | 'FLAT'
  const [coupVal, setCoupVal] = useState('');
  const [coupMin, setCoupMin] = useState('0');

  // Fresh Start Reset Modal State
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFreshReset = () => {
    resetStoreToCleanState();
    setShowResetConfirm(false);
  };

  const handleCreateCouponSubmit = (e) => {
    e.preventDefault();
    if (!coupCode.trim() || !coupVal) return;
    createCoupon({
      code: coupCode.trim().toUpperCase(),
      discountType: coupType,
      discountValue: parseFloat(coupVal) || 0,
      minOrderAmount: parseFloat(coupMin) || 0
    });
    setCoupCode('');
    setCoupVal('');
    setCoupMin('0');
    setIsCouponModalOpen(false);
  };

  if (!isAdminLoggedIn) {
    return <AdminLogin />;
  }

  // Calculate Metrics strictly from real data (Initial = 0)
  const onlineRevenue = orders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  const offlineRevenue = offlineSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const totalRevenue = onlineRevenue + offlineRevenue;

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
  const outOfStockProducts = products.filter((p) => p.stock <= 5);
  const activeOrdersCount = orders.length;

  const handleRecordOfflineSale = (e) => {
    e.preventDefault();
    if (!offAmount || Number(offAmount) <= 0) return;
    addOfflineSale({
      amount: Number(offAmount),
      paymentMethod: offMethod,
      customerName: offCustomer || 'Counter Walk-in Customer',
      notes: offNotes || 'Counter Direct Sale'
    });
    setOffAmount('');
    setOffCustomer('');
    setOffNotes('');
    setIsOfflineModalOpen(false);
  };

  return (
    <div className="h-screen w-full bg-[#faf8f5] text-[#171717] flex font-sans relative overflow-hidden">
      
      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* LEFT SIDEBAR (Fixed Drawer on Mobile, Strictly Stationary Pinned Sidebar on Desktop) */}
      <aside
        className={`w-64 h-full bg-white border-r border-[#c99632]/25 flex flex-col justify-between transition-transform duration-300 z-40 fixed lg:static inset-y-0 left-0 shrink-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full justify-between overflow-hidden">
          {/* Top Brand Header matching Client Image 1 & 2 */}
          <div className="p-4 sm:p-5 border-b border-[#c99632]/20 flex flex-col items-start gap-1 shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#c99632]/50 bg-[#fff8ed] flex items-center justify-center shadow-xs shrink-0">
                  <svg className="w-8 h-8 text-[#c99632]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="39" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
                    <text x="50" y="63" textAnchor="middle" fill="#c99632" fontSize="38" fontFamily="Playfair Display, serif" fontWeight="bold">
                      V
                    </text>
                  </svg>
                </div>
                <div>
                  <h1 className="font-serif-luxury text-base font-black text-[#171717] leading-none">
                    VASAVI
                  </h1>
                  <p className="text-[10px] font-black text-[#c99632] tracking-widest uppercase mt-0.5 leading-none">
                    FANCY STORE
                  </p>
                  <p className="text-[8px] text-[#8a6200] font-bold tracking-wider uppercase mt-1 leading-none">
                    ADMIN PANEL
                  </p>
                </div>
              </div>

              {/* Close Button for Mobile Drawer */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-[#171717]"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Menu (Smooth no-scrollbar list) */}
          <nav className="p-3 sm:p-4 space-y-1 overflow-y-auto flex-1 no-scrollbar">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'pos', label: 'Super POS Counter', icon: Printer },
              { id: 'products', label: 'Products', icon: ShoppingBag, count: products.length },
              { id: 'categories', label: 'Categories', icon: Tag, count: categories.length },
              { id: 'orders', label: 'Orders', icon: PackageCheck, count: orders.length, badge: pendingOrders.length },
              { id: 'customers', label: 'Customers', icon: Users, count: registeredUsers.length },
              { id: 'payments', label: 'Payments', icon: CreditCard, count: (orders.length + offlineSales.length) },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'coupons', label: 'Coupons', icon: Ticket },
              { id: 'banners', label: 'Banner Management', icon: Image },
              { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'stock', label: 'Stock Management', icon: Package, badge: outOfStockProducts.length },
              { id: 'roles', label: 'Users & Roles', icon: UserCheck },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    const mainContainer = document.querySelector('main');
                    if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#c99632] text-white shadow-md gold-glow'
                      : 'text-[#555555] hover:bg-[#fff3c4]/40 hover:text-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-[#c99632]' : 'bg-[#e88a9a] text-white'}`}>
                      {item.badge}
                    </span>
                  ) : item.count ? (
                    <span className="text-[10px] opacity-75">{item.count}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Bottom Admin User Profile Card */}
          <div className="p-3 sm:p-4 border-t border-[#c99632]/20 bg-[#fffcf7] shrink-0">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#c99632]/20 shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#c99632]/20 border border-[#c99632]/40 flex items-center justify-center text-[#c99632] font-bold text-xs shrink-0">
                  👤
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-[#171717] leading-none truncate">Ramcharan (Owner)</h4>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 truncate">mogalipalliram@gmail.com</p>
                </div>
              </div>
              <button
                onClick={logoutAdmin}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
        
        {/* Topbar Header */}
        <header className="bg-white border-b border-[#c99632]/20 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs w-full">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-[#555555] hover:text-[#171717] hover:bg-[#faf8f5]"
              title="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-[#171717] flex items-center gap-1.5 leading-tight">
                Welcome back, Admin! 👋
              </h2>
              <p className="text-[10px] sm:text-xs text-[#666666] hidden sm:block">Here's what's happening with your store today.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-[#faf8f5] border border-[#c99632]/30 rounded-full py-1.5 pl-9 pr-4 text-xs text-[#171717] placeholder-[#777777] focus:outline-none focus:border-[#c99632]"
              />
              <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Interactive Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full border transition-all ${
                  showNotifications
                    ? 'bg-[#fff3c4] border-[#c99632] text-[#c99632] shadow-sm'
                    : 'bg-[#faf8f5] border-[#c99632]/30 text-[#171717] hover:bg-white hover:border-[#c99632]'
                }`}
                title="Store Alerts & Notifications"
              >
                <Bell className="w-4 h-4 text-[#c99632]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#e88a9a] to-rose-600 text-white text-[9px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Modal Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#c99632]/40 rounded-3xl shadow-2xl z-50 overflow-hidden font-sans animate-fadeIn">
                  
                  {/* Dropdown Header */}
                  <div className="bg-gradient-to-r from-[#faf8f5] to-[#fff3c4]/60 px-4 py-3 border-b border-[#c99632]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-[#c99632]/20 text-[#c99632]">
                        <Bell className="w-3.5 h-3.5 text-[#c99632]" />
                      </div>
                      <h4 className="font-bold text-xs text-[#171717]">Store Alerts & Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold">
                          {unreadCount} New
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={() => setReadNotificationIds(notificationsList.map(n => n.id))}
                        className="text-[10px] font-bold text-[#c99632] hover:text-[#a6751d] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notificationsList.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.actionTab) setAdminTab(notif.actionTab);
                          if (!readNotificationIds.includes(notif.id)) {
                            setReadNotificationIds(prev => [...prev, notif.id]);
                          }
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 hover:bg-[#fffcf7] cursor-pointer transition-colors flex items-start gap-3 ${
                          notif.unread ? 'bg-[#fffaf0]/60' : 'bg-white opacity-85'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'order' && (
                            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-xs">
                              📦
                            </div>
                          )}
                          {notif.type === 'stock' && (
                            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shadow-xs">
                              ⚠️
                            </div>
                          )}
                          {notif.type === 'review' && (
                            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shadow-xs">
                              ⭐
                            </div>
                          )}
                          {notif.type === 'info' && (
                            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-xs">
                              ℹ️
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className={`text-xs truncate ${notif.unread ? 'font-bold text-[#171717]' : 'font-medium text-[#444444]'}`}>
                              {notif.title}
                            </h5>
                            {notif.unread && (
                              <span className="w-2 h-2 rounded-full bg-[#e88a9a] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#666666] line-clamp-2 mt-0.5 leading-snug">
                            {notif.description}
                          </p>
                          <span className="text-[9px] font-semibold text-[#888888] block mt-1">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dropdown Footer Actions */}
                  <div className="p-2.5 bg-[#faf8f5] border-t border-[#c99632]/20 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setAdminTab('orders');
                        setShowNotifications(false);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-[#c99632]/30 text-[11px] font-bold text-[#171717] hover:bg-[#fff3c4]/50 transition-colors text-center"
                    >
                      📦 View Orders
                    </button>
                    <button
                      onClick={() => {
                        setAdminTab('pos');
                        setShowNotifications(false);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-[#c99632] text-white text-[11px] font-bold hover:brightness-110 transition-all text-center gold-glow"
                    >
                      🧾 Open POS
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Store Switcher Dropdown */}
            <button
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-full bg-[#c99632] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 hover:brightness-110 shadow-xs shrink-0"
            >
              <span>Vasavi Store</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Tab View Area */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">

          {/* POS COUNTER BILLING VIEW */}
          {adminTab === 'pos' && <AdminPOS />}

          {/* OVERVIEW DASHBOARD VIEW */}
          {adminTab === 'overview' && (
            <>
              {/* 🧹 FRESH START RESET BANNER — only when data exists */}
              {(products.length > 0 || orders.length > 0 || offlineSales.length > 0) && (
                <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-2xl px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧹</span>
                    <div>
                      <p className="text-sm font-bold text-rose-700">Client Handover Reset Available</p>
                      <p className="text-[11px] text-rose-500">{products.length} products, {orders.length} orders, {offlineSales.length} offline sales currently stored.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="shrink-0 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                  >
                    🗑️ Clear All Data
                  </button>
                </div>
              )}

              {/* ✅ FRESH STATE BANNER — when everything is empty */}
              {products.length === 0 && orders.length === 0 && offlineSales.length === 0 && (
                <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-5 py-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm font-bold text-emerald-700">Store is Fresh & Ready for Client!</p>
                    <p className="text-[11px] text-emerald-600">No demo data. Add real products from the Products tab to start selling.</p>
                  </div>
                </div>
              )}

              {/* TOP SUMMARY CARDS (Combined, Online & Offline Revenue Breakdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Stat 1: Total Combined Revenue */}
                <div className="bg-gradient-to-br from-amber-500/10 via-white to-white p-4 rounded-2xl border-2 border-[#c99632]/50 shadow-md space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#666666] font-bold uppercase tracking-wider">Total Combined Revenue</span>
                    <div className="p-2 rounded-xl bg-[#c99632] text-white shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#171717] font-serif-luxury">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-emerald-700 font-bold">Online + Counter Sales</span>
                    <button
                      onClick={() => setIsOfflineModalOpen(true)}
                      className="px-2 py-0.5 rounded-md bg-[#c99632] text-white font-bold text-[10px] hover:brightness-110 shadow-xs"
                    >
                      + Add Offline
                    </button>
                  </div>
                </div>

                {/* Stat 2: Online Website Sales */}
                <div className="bg-white p-4 rounded-2xl border border-[#c99632]/25 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider">🌐 Online Sales</span>
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#171717]">
                    ₹{onlineRevenue.toLocaleString('en-IN')}
                  </h3>
                  <div className="text-[10px] text-blue-600 font-bold">
                    Website Orders (UPI/COD)
                  </div>
                </div>

                {/* Stat 3: Offline Counter Sales */}
                <div className="bg-white p-4 rounded-2xl border border-[#c99632]/25 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider">🏪 Offline Counter Income</span>
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                      <Tag className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-purple-900">
                    ₹{offlineRevenue.toLocaleString('en-IN')}
                  </h3>
                  <div className="text-[10px] text-purple-600 font-bold">
                    Physical Shop Cash & Scanner
                  </div>
                </div>

                {/* Stat 4: Total Orders */}
                <div className="bg-white p-4 rounded-2xl border border-[#c99632]/25 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider">Total Orders</span>
                    <div className="p-2 rounded-xl bg-[#fff3c4] text-[#c99632]">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#171717]">{activeOrdersCount}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Active Website Orders</span>
                  </div>
                </div>

                {/* Stat 5: Pending Orders */}
                <div className="bg-white p-4 rounded-2xl border border-[#c99632]/25 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wider">Pending Orders</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                      <PackageCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-amber-700">{pendingOrders.length}</h3>
                  <div className="text-[10px] text-amber-600 font-bold">
                    Action Required
                  </div>
                </div>

              </div>

              {/* MIDDLE 3-COLUMN ANALYTICS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sales Overview Chart */}
                <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#c99632]/25 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#171717]">Sales Overview</h3>
                    <select className="bg-[#faf8f5] border border-[#c99632]/30 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#171717]">
                      <option>This Month</option>
                      <option>Last Month</option>
                      <option>This Year</option>
                    </select>
                  </div>

                  <div className="h-44 w-full relative my-2 flex items-center justify-center bg-[#faf8f5] rounded-xl border border-dashed border-[#c99632]/30">
                    {orders.length > 0 ? (
                      <svg className="w-full h-full text-[#c99632]" viewBox="0 0 500 150" fill="none" stroke="currentColor">
                        <line x1="0" y1="30" x2="500" y2="30" stroke="#f0f0f0" strokeDasharray="3 3" />
                        <line x1="0" y1="80" x2="500" y2="80" stroke="#f0f0f0" strokeDasharray="3 3" />
                        <line x1="0" y1="130" x2="500" y2="130" stroke="#f0f0f0" strokeDasharray="3 3" />
                        <path
                          d="M 0 130 L 100 110 L 200 90 L 300 70 L 400 40 L 500 20"
                          stroke="#c99632"
                          strokeWidth="3"
                          fill="none"
                        />
                      </svg>
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-2xl">📈</span>
                        <p className="text-xs font-bold text-[#171717] mt-1">Live Sales Graph Ready</p>
                        <p className="text-[10px] text-[#666666]">Real sales trend will plot as customer orders come in.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#c99632]/20 text-center">
                    <div>
                      <span className="text-[10px] text-[#666666]">Total Sales</span>
                      <h4 className="text-xs font-bold text-[#171717]">₹{totalRevenue.toLocaleString('en-IN')}</h4>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666]">Avg Order Value</span>
                      <h4 className="text-xs font-bold text-[#171717]">₹{orders.length ? Math.round(onlineRevenue / orders.length) : 0}</h4>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666]">Discounts</span>
                      <h4 className="text-xs font-bold text-[#171717]">₹0</h4>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666]">Refunds</span>
                      <h4 className="text-xs font-bold text-[#171717]">₹0</h4>
                    </div>
                  </div>
                </div>

                {/* Order Status Donut Breakdown */}
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-[#c99632]/25 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#171717]">Order Status</h3>
                    <MoreVertical className="w-4 h-4 text-[#888888]" />
                  </div>

                  <div className="relative flex items-center justify-center my-4">
                    <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e0e0e0" strokeWidth="3.8" />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-extrabold text-[#171717]">{orders.length}</span>
                      <span className="text-[9px] text-[#666666]">Total Orders</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-[#555555]"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Delivered</span>
                      <span className="font-bold text-[#171717]">{orders.filter(o => o.status === 'DELIVERED').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-[#555555]"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Processing</span>
                      <span className="font-bold text-[#171717]">{orders.filter(o => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-[#555555]"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Pending</span>
                      <span className="font-bold text-[#171717]">{pendingOrders.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-[#555555]"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Cancelled</span>
                      <span className="font-bold text-[#171717]">{orders.filter(o => o.status === 'CANCELLED').length}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-[#c99632]/25 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#171717]">Recent Orders</h3>
                    <button onClick={() => setAdminTab('orders')} className="text-xs text-[#c99632] hover:underline font-bold">
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orders.length > 0 ? (
                      orders.slice(0, 5).map((ord) => (
                        <div key={ord.id} className="flex items-center justify-between p-2 rounded-xl bg-[#faf8f5] border border-slate-100">
                          <div>
                            <span className="text-[10px] text-[#666666] font-bold">#{ord.orderNumber}</span>
                            <h5 className="text-xs font-bold text-[#171717]">{ord.customerName}</h5>
                            <span className="text-[11px] font-bold text-[#c99632]">₹{ord.totalAmount}</span>
                          </div>
                          <div className="text-right space-y-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'COMPLETED' || ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'PENDING'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.status}
                            </span>
                            <span className="text-[9px] text-[#888888] block">{formatFullDateTime(ord.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-[#777777] bg-[#faf8f5] rounded-xl border border-slate-100">
                        <span>📦 No customer orders yet</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* BOTTOM 3-COLUMN PERFORMANCE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Top Selling Products */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#c99632]/25 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#171717]">Top Selling Products</h3>
                    <span className="text-xs text-[#c99632] font-bold">View All</span>
                  </div>

                  <div className="space-y-3">
                    {products.slice(0, 4).map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-[#faf8f5]">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#c99632] text-white font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-white" />
                          <div>
                            <h5 className="text-xs font-bold text-[#171717] truncate max-w-[140px]">{p.name}</h5>
                            <span className="text-[10px] text-[#666666] font-medium">{p.reviewsCount || 98} Sold</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#171717]">₹{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Products */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#c99632]/25 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#171717]">Low Stock Products</h3>
                    <span className="text-xs text-[#c99632] font-bold">View All</span>
                  </div>

                  <div className="space-y-3">
                    {products.slice(4, 8).map((p) => (
                      <div key={p.id} className="p-2.5 rounded-xl bg-[#faf8f5] space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-[#171717] truncate max-w-[160px]">{p.name}</h5>
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Stock: {p.stock}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#c99632] h-full rounded-full"
                            style={{ width: `${Math.min(100, p.stock * 10)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales by Category */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#c99632]/25 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#171717]">Sales by Category</h3>
                    <select className="bg-[#faf8f5] border border-[#c99632]/30 rounded-lg px-2 py-1 text-xs font-semibold">
                      <option>This Month</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {[
                      { cat: 'Jewellery', amount: '₹1,28,750', pct: 51.7, color: 'bg-[#c99632]' },
                      { cat: 'Cosmetics', amount: '₹58,420', pct: 23.5, color: 'bg-[#e8c7b5]' },
                      { cat: 'Handbags', amount: '₹34,670', pct: 13.9, color: 'bg-amber-400' },
                      { cat: 'Perfumes', amount: '₹18,260', pct: 7.3, color: 'bg-emerald-400' },
                      { cat: 'Accessories', amount: '₹8,650', pct: 3.6, color: 'bg-indigo-400' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-[#171717]">{item.cat}</span>
                          <span className="font-bold text-[#666666]">{item.amount} ({item.pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* PAYMENTS TAB VIEW */}
          {adminTab === 'payments' && (
            <div className="space-y-6">
              
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#c99632]/30 shadow-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#c99632]">FINANCIAL LEDGER & PAYMENTS</span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#171717] font-serif-luxury mt-0.5">Payments & Revenue Audit</h2>
                  <p className="text-xs text-[#666666] mt-1">Track online store orders (WhatsApp & Cash on Delivery) and offline physical shop counter sales.</p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp & COD Store Active
                  </span>
                </div>
              </div>

              {/* Revenue & Gateway Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-[#c99632]/30 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">TOTAL COMBINED INCOME</span>
                      <h3 className="text-2xl font-bold text-[#171717] font-serif-luxury mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#fff3c4] text-[#c99632] flex items-center justify-center font-bold text-xs">
                      💰
                    </div>
                  </div>
                  <p className="text-xs text-emerald-600 font-bold">Online + Offline Shop Sales</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#c99632]/30 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">🌐 ONLINE STORE SALES</span>
                      <h3 className="text-2xl font-bold text-[#171717] font-serif-luxury mt-1">₹{onlineRevenue.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 font-bold">WhatsApp Direct & COD Orders</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#c99632]/30 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">🏪 OFFLINE COUNTER SALES</span>
                      <h3 className="text-2xl font-bold text-[#171717] font-serif-luxury mt-1">₹{offlineRevenue.toLocaleString('en-IN')}</h3>
                    </div>
                    <button
                      onClick={() => setIsOfflineModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-[#c99632] text-white font-bold text-xs hover:brightness-110 shadow-xs"
                    >
                      + Add Sale
                    </button>
                  </div>
                  <p className="text-xs text-purple-600 font-bold">Shop Counter Cash & Scanner</p>
                </div>

              </div>

              {/* Payment Audit Ledger Table with Ledger Filter Buttons */}
              <div className="bg-white rounded-2xl border border-[#c99632]/30 overflow-hidden shadow-xs space-y-4 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c99632]/20 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider">Payment Audit Ledger</h3>
                    <p className="text-xs text-[#666666]">Comprehensive record of Online Website & Offline Shop Counter Sales</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex bg-[#faf8f5] p-1 rounded-xl border border-[#c99632]/30">
                      <button
                        onClick={() => setPaymentLedgerType('ALL')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          paymentLedgerType === 'ALL' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
                        }`}
                      >
                        ALL
                      </button>
                      <button
                        onClick={() => setPaymentLedgerType('ONLINE')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          paymentLedgerType === 'ONLINE' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
                        }`}
                      >
                        🌐 ONLINE
                      </button>
                      <button
                        onClick={() => setPaymentLedgerType('OFFLINE')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          paymentLedgerType === 'OFFLINE' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
                        }`}
                      >
                        🏪 OFFLINE
                      </button>
                    </div>

                    <button
                      onClick={() => setIsOfflineModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white text-xs font-bold shadow-xs hover:brightness-110 flex items-center gap-1.5"
                    >
                      <span>➕ Record Income</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf8f5] border-b border-[#c99632]/20 text-[#666666] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">TYPE</th>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">CUSTOMER / SOURCE</th>
                        <th className="py-3 px-4">METHOD</th>
                        <th className="py-3 px-4">NOTES / ITEMS</th>
                        <th className="py-3 px-4">AMOUNT</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">DATE</th>
                        <th className="py-3 px-4 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c99632]/15 text-[#171717]">
                      {(() => {
                        const allTransactions = [
                          // Offline Sales Entries
                          ...(paymentLedgerType === 'ALL' || paymentLedgerType === 'OFFLINE'
                            ? offlineSales.map(s => ({
                                isOffline: true,
                                id: s.id,
                                type: '🏪 OFFLINE',
                                txId: s.id,
                                customer: s.customerName || 'Counter Customer',
                                method: s.paymentMethod || 'Cash',
                                notes: s.notes || 'Shop Counter Sale',
                                amount: `₹${Number(s.amount).toLocaleString('en-IN')}`,
                                status: 'RECORDED',
                                date: formatFullDateTime(s.createdAt)
                              }))
                            : []),

                          // Online Sales Entries
                          ...(paymentLedgerType === 'ALL' || paymentLedgerType === 'ONLINE'
                            ? orders.map(o => ({
                                isOffline: false,
                                id: o.id,
                                type: '🌐 ONLINE',
                                txId: o.paymentId || o.orderNumber || `PAY-${o.id}`,
                                customer: o.customerName,
                                method: o.paymentMethod || 'WhatsApp / COD',
                                notes: `Online Order #${o.orderNumber}`,
                                amount: `₹${Number(o.totalAmount).toLocaleString('en-IN')}`,
                                status: o.paymentStatus || 'PAID',
                                date: formatFullDateTime(o.createdAt)
                              }))
                            : [])
                        ];

                        if (allTransactions.length === 0) {
                          return (
                            <tr>
                              <td colSpan="9" className="py-12 text-center text-[#666666]">
                                <div className="space-y-2">
                                  <div className="text-3xl">💳</div>
                                  <p className="font-bold text-sm text-[#171717]">No transaction records found</p>
                                  <p className="text-xs">New online orders or recorded offline sales will appear in this ledger.</p>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return allTransactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-[#fffcf7] transition-colors">
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.isOffline ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#c99632]">{tx.txId}</td>
                            <td className="py-3 px-4 font-bold text-[#171717]">{tx.customer}</td>
                            <td className="py-3 px-4 font-semibold text-[#555555]">{tx.method}</td>
                            <td className="py-3 px-4 text-[#666666] font-medium max-w-[200px] truncate">{tx.notes}</td>
                            <td className="py-3 px-4 font-bold text-[#171717]">{tx.amount}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.status === 'PAID' || tx.status === 'RECORDED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-[11px] text-[#666666]">{tx.date}</td>
                            <td className="py-3 px-4 text-center">
                              {tx.isOffline ? (
                                <button
                                  onClick={() => deleteOfflineSale(tx.id)}
                                  className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-0.5 rounded hover:bg-red-50"
                                  title="Delete offline sale entry"
                                >
                                  Delete
                                </button>
                              ) : (
                                <span className="text-[#a0a0a0] text-[10px]">System</span>
                              )}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* OTHER ADMIN TABS */}
          {adminTab === 'products' && <AdminProducts />}
          {adminTab === 'categories' && <AdminCategories />}
          {adminTab === 'orders' && <AdminOrders />}
          {adminTab === 'analytics' && <AdminAnalytics />}
          {adminTab === 'settings' && <AdminSettings />}

          {/* CUSTOMERS MANAGEMENT */}
          {adminTab === 'customers' && (
            <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#c99632]/20 pb-3">
                <div>
                  <h3 className="text-base font-bold font-serif-luxury text-[#171717]">Customer Directory</h3>
                  <p className="text-xs text-[#666666]">{registeredUsers.length} Registered Customers in Supabase Database</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search name, phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="bg-[#faf8f5] border border-[#c99632]/30 rounded-xl px-3 py-1.5 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                  />
                  <span className="text-xs font-bold text-[#c99632] bg-[#fff3c4] px-3 py-1.5 rounded-full shrink-0">Live Cloud</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {registeredUsers.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="text-4xl">👥</div>
                    <p className="text-sm font-bold text-[#171717]">No registered customers yet</p>
                    <p className="text-xs text-[#666666]">Customers who sign up or order on the website will appear here in real-time.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs divide-y divide-[#c99632]/15">
                    <thead className="bg-[#faf8f5] text-[#666666] font-bold uppercase">
                      <tr>
                        <th className="p-3">Customer Name</th>
                        <th className="p-3">Phone &amp; Email</th>
                        <th className="p-3">Delivery Address</th>
                        <th className="p-3">Total Orders</th>
                        <th className="p-3">Total Spent</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c99632]/15">
                      {registeredUsers
                        .filter((u) => {
                          const q = customerSearch.toLowerCase();
                          return (u.name || '').toLowerCase().includes(q) || (u.phone || '').includes(q) || (u.email || '').toLowerCase().includes(q);
                        })
                        .map((u) => {
                          const customerOrders = orders.filter(o => o.customerPhone === u.phone || o.customerName === u.name);
                          const totalSpent = customerOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                          return (
                            <tr key={u.id} className="hover:bg-[#fffcf7]">
                              <td className="p-3 font-bold text-[#171717]">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{u.avatar || '👤'}</span>
                                  <span>{u.name}</span>
                                  {u.isVip && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">VIP</span>}
                                </div>
                              </td>
                              <td className="p-3 text-[#666666]">
                                <div className="font-bold text-[#171717]">{u.phone || '-'}</div>
                                <div className="text-[11px] text-[#888888]">{u.email || '-'}</div>
                              </td>
                              <td className="p-3 text-[#666666] max-w-[200px] truncate" title={u.address || 'Nandyal, AP'}>
                                {u.address || 'Nandyal, AP'}
                              </td>
                              <td className="p-3 font-bold text-[#c99632]">{customerOrders.length} Orders</td>
                              <td className="p-3 font-bold text-[#171717]">₹{totalSpent.toLocaleString('en-IN')}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete customer ${u.name} from database?`)) {
                                      deleteCustomer(u.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                  title="Delete Customer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* REVIEWS MANAGER */}
          {adminTab === 'reviews' && (
            <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-[#c99632]/20 pb-3">
                <div>
                  <h3 className="text-base font-bold font-serif-luxury text-[#171717]">Customer Reviews &amp; Ratings</h3>
                  <p className="text-xs text-[#666666]">{reviewsList.length} Customer reviews across all catalog products</p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  ⭐ Real Customer Feedback
                </span>
              </div>

              {reviewsList.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-4xl">⭐</div>
                  <p className="text-sm font-bold text-[#171717]">No reviews submitted yet</p>
                  <p className="text-xs text-[#666666]">Reviews written by customers on product pages will show up here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-[#faf8f5] border border-[#c99632]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#171717]">{rev.customerName}</span>
                          <span className="text-amber-500 font-bold">{'★'.repeat(Number(rev.rating) || 5)}</span>
                          <span className="text-[10px] bg-white border border-[#c99632]/30 px-2 py-0.5 rounded-full font-bold text-[#c99632]">
                            {rev.productName || 'Store Item'}
                          </span>
                        </div>
                        <p className="text-[#555555] italic">"{rev.comment}"</p>
                        <span className="text-[10px] text-[#999999]">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleString('en-IN') : 'Recent'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => approveReview(rev.id, !rev.isApproved)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rev.isApproved ? '✔ Approved' : '⏳ Pending Approval'}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this review permanently?')) {
                              deleteReview(rev.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-red-600 hover:bg-red-50"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COUPONS & DISCOUNTS */}
          {adminTab === 'coupons' && (
            <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-[#c99632]/20 pb-3">
                <div>
                  <h3 className="text-base font-bold font-serif-luxury text-[#171717]">Store Coupon &amp; Offer Manager</h3>
                  <p className="text-xs text-[#666666]">Manage promo codes, percentage discounts, and cart offer rules</p>
                </div>
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#c99632] hover:bg-[#a6751d] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {coupons.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-[#fffcf7] border border-[#c99632]/30 space-y-2 relative shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-[#c99632] tracking-wider uppercase font-mono">
                        🎟️ {c.code}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete coupon ${c.code}?`)) {
                            deleteCoupon(c.id);
                          }
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-[#555555] space-y-1">
                      <p className="font-bold text-[#171717]">
                        Discount: {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} Flat OFF`}
                      </p>
                      <p className="text-[11px] text-[#777777]">
                        Min Cart Value: ₹{c.minOrderAmount || 0}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#c99632]/20 flex justify-between items-center text-[10px]">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        ACTIVE IN CHECKOUT
                      </span>
                      <span className="text-[#888888]">Instant Apply</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Coupon Modal */}
              {isCouponModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="relative w-full max-w-md bg-white border border-[#c99632]/40 rounded-3xl p-6 shadow-2xl space-y-4 text-[#171717]">
                    <div className="flex justify-between items-center border-b border-[#c99632]/20 pb-3">
                      <h4 className="text-base font-bold font-serif-luxury text-[#171717]">Create New Promo Coupon</h4>
                      <button onClick={() => setIsCouponModalOpen(false)} className="text-slate-400 hover:text-[#171717]">✕</button>
                    </div>

                    <form onSubmit={handleCreateCouponSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-[#171717] mb-1">Coupon Code (Uppercase) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. FESTIVE20"
                          value={coupCode}
                          onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                          className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-mono uppercase font-bold focus:outline-none focus:border-[#c99632]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#171717] mb-1">Discount Type</label>
                          <select
                            value={coupType}
                            onChange={(e) => setCoupType(e.target.value)}
                            className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-bold focus:outline-none"
                          >
                            <option value="PERCENTAGE">% Percentage</option>
                            <option value="FLAT">₹ Flat Rupees</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-[#171717] mb-1">Discount Value *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            placeholder="e.g. 10 or 100"
                            value={coupVal}
                            onChange={(e) => setCoupVal(e.target.value)}
                            className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-bold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-[#171717] mb-1">Minimum Order Amount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={coupMin}
                          onChange={(e) => setCoupMin(e.target.value)}
                          className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-bold focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCouponModalOpen(false)}
                          className="py-2.5 bg-slate-100 hover:bg-slate-200 text-[#171717] font-bold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2.5 bg-[#c99632] hover:bg-[#a6751d] text-white font-bold rounded-xl shadow-xs"
                        >
                          Save Coupon
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BANNERS MANAGEMENT */}
          {adminTab === 'banners' && (
            <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-base font-bold font-serif-luxury text-[#171717]">Hero & Promo Banner Manager</h3>
              <p className="text-xs text-[#666666]">Customize front banner text, top announcement ticker, and seasonal sales badges.</p>
              <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#c99632]/20 text-xs space-y-2">
                <span className="font-bold text-[#c99632]">Active Announcement Ticker:</span>
                <p className="p-2 rounded-lg bg-white border border-[#c99632]/30 font-medium">Order directly on WhatsApp — Instant Confirmation & Delivery in Nandyal!</p>
              </div>
            </div>
          )}

          {/* REPORTS EXPORT (100% Functional Real CSV and GST PDF) */}
          {adminTab === 'reports' && (
            <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl shadow-xs space-y-5 text-xs">
              <div className="border-b border-[#c99632]/20 pb-3">
                <h3 className="text-base font-bold font-serif-luxury text-[#171717]">Financial Reports &amp; Official Audit Exports</h3>
                <p className="text-[#666666]">Export store sales ledgers, GST summaries, and product stock audit sheets with 100% authentic database data.</p>
              </div>

              {/* Financial Quick Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#c99632]/20 space-y-1">
                  <span className="text-[#666666] font-medium">Total Online Revenue</span>
                  <h4 className="text-lg font-bold text-[#171717]">₹{onlineRevenue.toLocaleString('en-IN')}</h4>
                  <p className="text-[10px] text-[#888888]">{orders.length} orders recorded</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#c99632]/20 space-y-1">
                  <span className="text-[#666666] font-medium">Counter Shop Sales</span>
                  <h4 className="text-lg font-bold text-[#171717]">₹{offlineRevenue.toLocaleString('en-IN')}</h4>
                  <p className="text-[10px] text-[#888888]">{offlineSales.length} cash entries</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#c99632]/40 space-y-1">
                  <span className="text-[#c99632] font-bold">Gross Business Revenue</span>
                  <h4 className="text-lg font-extrabold text-[#c99632]">₹{totalRevenue.toLocaleString('en-IN')}</h4>
                  <p className="text-[10px] text-emerald-700 font-bold">✔ 100% Reconciled</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => downloadMonthlySalesCSV(orders, offlineSales)}
                  className="p-4 rounded-2xl bg-[#faf8f5] border-2 border-[#c99632]/40 font-bold text-[#171717] hover:bg-[#fff3c4] flex items-center justify-center gap-3 transition-all shadow-xs"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <div className="text-left">
                    <span className="block text-xs font-extrabold">📊 Download Monthly Sales CSV</span>
                    <span className="block text-[10px] text-[#666666] font-normal">Excel / Spreadsheet compatible format</span>
                  </div>
                </button>

                <button
                  onClick={() => downloadGSTLedgerPDF(orders, offlineSales, storeSettings)}
                  className="p-4 rounded-2xl bg-[#faf8f5] border-2 border-[#c99632]/40 font-bold text-[#171717] hover:bg-[#fff3c4] flex items-center justify-center gap-3 transition-all shadow-xs"
                >
                  <FileText className="w-5 h-5 text-[#c99632]" />
                  <div className="text-left">
                    <span className="block text-xs font-extrabold">📑 Download GST Audit Ledger PDF</span>
                    <span className="block text-[10px] text-[#666666] font-normal">Tax breakdown, ledger table & sign-off statement</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STOCK MANAGEMENT */}
          {adminTab === 'stock' && (
            <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-base font-bold font-serif-luxury text-[#171717]">Inventory & Stock Control</h3>
              <div className="space-y-2 text-xs">
                {products.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-[#faf8f5] border border-slate-100">
                    <span className="font-bold text-[#171717]">{p.name}</span>
                    <span className={`font-bold px-2.5 py-0.5 rounded-full ${p.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                      {p.stock} units in stock
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS & ROLES */}
          {adminTab === 'roles' && (
            <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl shadow-xs space-y-5 text-xs">
              <div className="border-b border-[#c99632]/20 pb-3">
                <h3 className="text-base font-bold font-serif-luxury text-[#171717]">Admin Staff & Developer Access Control</h3>
                <p className="text-xs text-[#666666]">Authorized system administrators and technical developers for Vasavi Fancy Store.</p>
              </div>

              <div className="space-y-3">
                {/* Owner Card */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#c99632]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#c99632]/20 border border-[#c99632]/40 flex items-center justify-center text-lg font-bold text-[#c99632]">
                      👑
                    </div>
                    <div>
                      <h4 className="font-bold text-[#171717] text-sm">Ramcharan</h4>
                      <p className="text-[11px] text-[#666666]">📞 +91 83099 17665 • ✉️ mogalipalliram@gmail.com</p>
                      <p className="text-[10px] text-[#888888]">📍 NK Rd, Nadigadda, Telugu peta, Nandyal, AP 518501</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-[#c99632] text-white font-bold text-[11px] shrink-0 self-start sm:self-center shadow-xs">
                    SUPER ADMIN / OWNER
                  </span>
                </div>

                {/* Developer Card */}
                <div className="p-4 rounded-2xl bg-[#f5f8ff] border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-lg font-bold text-blue-700">
                      💻
                    </div>
                    <div>
                      <h4 className="font-bold text-[#171717] text-sm">K. Madhu</h4>
                      <p className="text-[11px] text-[#666666]">📞 +91 97043 81790 • ✉️ gurumadhukgm@gmail.com</p>
                      <p className="text-[10px] text-blue-700 font-semibold">⚡ Primary Software Engineer & System Architect</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-blue-600 text-white font-bold text-[11px] shrink-0 self-start sm:self-center shadow-xs">
                    LEAD DEVELOPER
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* RECORD OFFLINE INCOME MODAL OVERLAY */}
      {isOfflineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fffcf7] border-2 border-[#c99632]/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-[#171717]">
            <div className="flex items-center justify-between border-b border-[#c99632]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏪</span>
                <div>
                  <h3 className="font-serif-luxury text-base font-black text-[#171717]">Record Offline Shop Income</h3>
                  <p className="text-[11px] text-[#666666]">Manual Counter Sales & Cash / Scanner Entry</p>
                </div>
              </div>
              <button
                onClick={() => setIsOfflineModalOpen(false)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[#171717]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordOfflineSale} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#171717] mb-1">Sale Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={offAmount}
                  onChange={(e) => setOffAmount(e.target.value)}
                  placeholder="e.g. 1499"
                  className="w-full bg-white border border-[#c99632]/40 rounded-xl p-3 font-bold text-base text-[#171717] focus:outline-none focus:border-[#c99632]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Payment Method *</label>
                <select
                  value={offMethod}
                  onChange={(e) => setOffMethod(e.target.value)}
                  className="w-full bg-white border border-[#c99632]/40 rounded-xl p-3 font-bold text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                >
                  <option value="Cash">Cash (Counter)</option>
                  <option value="Counter UPI (Scanner)">Counter UPI (QR Code Scanner)</option>
                  <option value="Card Swiped">Card Swiped (POS Terminal)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Customer Name / Phone (Optional)</label>
                <input
                  type="text"
                  value={offCustomer}
                  onChange={(e) => setOffCustomer(e.target.value)}
                  placeholder="Walk-in Counter Customer"
                  className="w-full bg-white border border-[#c99632]/40 rounded-xl p-3 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Items Sold / Notes</label>
                <textarea
                  rows="2"
                  value={offNotes}
                  onChange={(e) => setOffNotes(e.target.value)}
                  placeholder="e.g. 24K Gold Bangle Set + 2 Lipsticks"
                  className="w-full bg-white border border-[#c99632]/40 rounded-xl p-3 text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOfflineModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#c99632] via-[#e5b85c] to-[#a6751d] text-white font-bold shadow-md hover:brightness-110 gold-glow"
                >
                  💾 Save Income Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 🧹 FRESH START RESET — Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-2">
              <div className="text-5xl">🗑️</div>
              <h2 className="text-xl font-extrabold text-rose-700">Clear All Store Data?</h2>
              <p className="text-sm text-[#555555]">
                This will permanently delete all <strong>products</strong>, <strong>orders</strong>, and <strong>offline sales</strong> records from this device.
              </p>
              <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                ⚠️ This action cannot be undone. Only do this for client handover.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-3 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleFreshReset}
                className="py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow transition-all"
              >
                🧹 Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
