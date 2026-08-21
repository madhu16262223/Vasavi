import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Search, Shield, Menu, X, Package, Home, Store, User, Crown } from 'lucide-react';

export const Header = () => {
  const {
    getCartCount,
    setIsCartOpen,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isAdminLoggedIn,
    currentUser,
    openAuthModal,
    logoutCustomer
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = getCartCount();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Secret Admin Shortcut Handler (Ctrl + Shift + A or #admin URL hash)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setActiveTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    if (window.location.hash === '#admin') {
      setActiveTab('admin');
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  return (
    <header className="sticky top-0 z-40 bg-[#fffcf7]/95 backdrop-blur-md border-b border-[#c99632]/30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {/* Vasavi Logo */}
            <div className="relative flex items-center justify-center w-14 h-14 shrink-0 rounded-full overflow-hidden border border-[#c99632]/60 shadow-sm">
              <img
                src="/vasavi_logo.png"
                alt="Vasavi Fancy Store Logo"
                className="w-[115%] h-[115%] object-cover"
              />
            </div>

            <div>
              <h1 className="font-serif-luxury text-2xl font-black tracking-wider text-[#171717] group-hover:text-[#c99632] transition-colors leading-none">
                VASAVI
              </h1>
              <p className="text-[12px] font-sans font-black text-[#c99632] tracking-[0.2em] uppercase mt-1 leading-none">
                FANCY STORE
              </p>
              <p className="text-[9px] text-[#666666] tracking-widest uppercase font-bold mt-1 leading-none">
                COSMETICS • JEWELLERY • HANDBAGS
              </p>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search lipsticks, jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (activeTab !== 'admin') setActiveTab('shop');
                }}
                className="w-full bg-white border border-[#c99632]/40 rounded-full py-2 pl-10 pr-4 text-xs font-medium text-[#171717] placeholder-[#777777] focus:outline-none focus:border-[#c99632] focus:ring-1 focus:ring-[#c99632] transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#171717]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                activeTab === 'home' ? 'text-[#c99632]' : 'text-[#333333] hover:text-[#c99632]'
              }`}
            >
              <Home className="w-4 h-4 text-[#c99632]" /> Home
            </button>

            <button
              onClick={() => handleNavClick('shop')}
              className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                activeTab === 'shop' ? 'text-[#c99632]' : 'text-[#333333] hover:text-[#c99632]'
              }`}
            >
              <Store className="w-4 h-4 text-[#c99632]" /> Shop Products
            </button>

            <button
              onClick={() => handleNavClick('track')}
              className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                activeTab === 'track' ? 'text-[#c99632]' : 'text-[#333333] hover:text-[#c99632]'
              }`}
            >
              <Package className="w-4 h-4 text-[#c99632]" /> Track Order
            </button>
          </nav>

          {/* Action Buttons (Cart, Customer Auth & Mobile Menu) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Customer User Account / Sign In Button with Dropdown */}
            {currentUser ? (
              <div className="relative group">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fff3c4]/80 border border-[#c99632]/50 hover:bg-[#fff3c4] transition-all gold-glow text-xs font-bold text-[#8a6200] shadow-xs"
                  title="Click to view account"
                >
                  <span className="w-6 h-6 rounded-full bg-[#c99632] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    {currentUser.avatar || '👤'}
                  </span>
                  <span className="hidden sm:inline font-bold truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                </button>

                {/* Dropdown Menu on Hover/Click */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#c99632]/30 rounded-2xl shadow-xl p-2 hidden group-hover:block transition-all z-50">
                  <div className="p-3 border-b border-[#c99632]/15 bg-[#fffcf7] rounded-xl mb-1">
                    <p className="text-xs font-bold text-[#171717] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#666666] truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ Active Customer
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('track');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-bold text-[#171717] hover:bg-[#faf8f5] flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-[#c99632]" />
                    <span>Track My Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      logoutCustomer();
                    }}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <span>🚪</span>
                    <span>Sign Out / Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#c99632]/40 hover:border-[#c99632] text-xs font-bold text-[#171717] hover:text-[#c99632] transition-all shadow-xs gold-glow"
              >
                <User className="w-4 h-4 text-[#c99632]" />
                <span className="hidden sm:inline">Sign In / Register</span>
              </button>
            )}

            {/* Cart Icon Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-white border border-[#c99632]/40 hover:border-[#c99632] text-[#171717] hover:text-[#c99632] transition-all shadow-xs gold-glow flex items-center justify-center"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#c99632]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#e88a9a] to-[#c99632] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white border border-[#c99632]/30 text-[#171717]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fffcf7] border-b border-[#c99632]/30 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          {/* Customer Account Status in Mobile */}
          {currentUser ? (
            <div className="p-3 bg-white border border-[#c99632]/30 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#c99632] text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.avatar || '👤'}
                </span>
                <div>
                  <p className="text-xs font-bold text-[#171717]">{currentUser.name}</p>
                  <p className="text-[10px] text-[#666666]">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logoutCustomer();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('login');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          )}

          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setActiveTab('shop');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-white border border-[#c99632]/40 rounded-lg py-2 pl-9 pr-4 text-xs font-medium text-[#171717] placeholder-[#777777]"
            />
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`p-2.5 rounded-lg text-left text-xs uppercase font-bold flex items-center gap-2 ${
                activeTab === 'home' ? 'bg-[#e8c7b5]/50 text-[#c99632]' : 'text-[#171717]'
              }`}
            >
              <Home className="w-4 h-4" /> Home
            </button>
            <button
              onClick={() => handleNavClick('shop')}
              className={`p-2.5 rounded-lg text-left text-xs uppercase font-bold flex items-center gap-2 ${
                activeTab === 'shop' ? 'bg-[#e8c7b5]/50 text-[#c99632]' : 'text-[#171717]'
              }`}
            >
              <Store className="w-4 h-4" /> Shop Catalog
            </button>
            <button
              onClick={() => handleNavClick('track')}
              className={`p-2.5 rounded-lg text-left text-xs uppercase font-bold flex items-center gap-2 ${
                activeTab === 'track' ? 'bg-[#e8c7b5]/50 text-[#c99632]' : 'text-[#171717]'
              }`}
            >
              <Package className="w-4 h-4" /> Track Order Status
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className={`p-2.5 rounded-lg text-left text-xs uppercase font-bold flex items-center gap-2 ${
                activeTab === 'admin' ? 'bg-[#e8c7b5]/50 text-[#c99632]' : 'text-[#171717]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#c99632]" /> Admin Control Panel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
