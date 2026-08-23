import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Search, Shield, Menu, X, Package, Home, Store, User, ArrowRight, Sparkles, Mic, MicOff, Heart, Globe } from 'lucide-react';

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
    logoutCustomer,
    products,
    setSelectedProduct,
    wishlist = [],
    setIsWishlistOpen,
    language,
    toggleLanguage
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);

  // Voice Search Handler (Web Speech Recognition)
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice Search is not supported by your browser. Please type in search bar.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setShowSuggestions(true);
      setActiveTab('shop');
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const cartCount = getCartCount();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setShowSuggestions(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute live search suggestions
  const matchingProducts = searchQuery.trim()
    ? products.filter(p => {
        const q = searchQuery.toLowerCase().trim();
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.shade && p.shade.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('shop');
      setShowSuggestions(false);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectProductFromSearch = (product) => {
    setSelectedProduct(product);
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current && !searchContainerRef.current.contains(e.target) &&
        mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Secret Admin Shortcut Handler (Ctrl + Shift + A or #admin URL hash)
  useEffect(() => {
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group"
          >
              {/* Vasavi Logo */}
              <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full overflow-hidden border border-[#c99632]/60 shadow-sm">
                <img
                  src="/vasavi_logo.png"
                  alt="Vasavi Fancy Store Logo"
                  className="w-[115%] h-[115%] object-cover"
                />
              </div>

              <div>
                <h1 className="font-serif-luxury text-xl sm:text-2xl font-black tracking-wider text-[#171717] group-hover:text-[#c99632] transition-colors leading-none">
                  VASAVI
                </h1>
                <p className="text-[11px] sm:text-[12px] font-sans font-black text-[#c99632] tracking-[0.2em] uppercase mt-1 leading-none">
                  FANCY STORE
                </p>
                <p className="hidden sm:block text-[9px] text-[#666666] tracking-widest uppercase font-bold mt-1 leading-none">
                  {language === 'te' ? 'గాజులు • సౌందర్య సాధనాలు • జ్యువెలరీ' : 'COSMETICS • BANGLES • JEWELLERY'}
                </p>
              </div>
            </div>

            {/* Search Bar (Desktop) with Voice Search & Live Interactive Suggestions */}
            <div ref={searchContainerRef} className="hidden md:block relative flex-1 max-w-[240px] lg:max-w-xs xl:max-w-sm mx-3 lg:mx-6 shrink">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder={language === 'te' ? 'లిప్‌స్టిక్, గాజులు, నెక్లెస్ సెర్చ్ చేయండి...' : 'Search lipsticks, bangles, jewellery...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim()) setShowSuggestions(true);
                  }}
                  className="w-full bg-white border border-[#c99632]/40 rounded-full py-2.5 pl-10 pr-16 text-xs font-medium text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#c99632] focus:ring-1 focus:ring-[#c99632] transition-all shadow-xs"
                />
                <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                
                {/* Voice Search Mic Button */}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${
                    isListening ? 'bg-red-500 text-white animate-bounce shadow-md' : 'text-[#888888] hover:text-[#c99632]'
                  }`}
                  title={isListening ? 'Listening to your voice...' : 'Search with Voice (English / తెలుగు)'}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#171717]"
                  >
                    ✕
                  </button>
                )}
              </form>

              {/* Desktop Live Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#c99632]/30 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  <div className="p-2.5 bg-[#faf8f5] border-b border-[#c99632]/20 flex items-center justify-between text-[11px] font-bold text-[#888888]">
                    <span>MATCHING PRODUCTS ({matchingProducts.length})</span>
                    <span className="text-[10px] text-[#c99632]">Press Enter to view all</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {matchingProducts.length > 0 ? (
                      matchingProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProductFromSearch(p)}
                          className="p-3 hover:bg-[#fff9ee] cursor-pointer flex items-center gap-3 transition-colors group"
                        >
                          <img
                            src={p.image || p.imageUrl || '/bangles.jpg'}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-[#c99632]/20 shrink-0"
                            onError={(e) => { e.target.src = '/vasavi_logo.png'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#171717] group-hover:text-[#c99632] truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-[#777777] truncate">
                              {p.category} {p.shade ? `• ${p.shade}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-[#171717]">₹{p.price}</p>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <p className="text-[10px] text-gray-400 line-through">₹{p.originalPrice}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[#777777]">
                        No products found for "{searchQuery}". Press Enter to browse catalog.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
                  >
                    <span>View all results for "{searchQuery}" in Shop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-4 shrink-0">
              <button
                onClick={() => handleNavClick('home')}
                className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'home' ? 'text-[#c99632]' : 'text-[#333333] hover:text-[#c99632]'
                }`}
              >
                <Home className="w-4 h-4 text-[#c99632]" />
                <span>{language === 'te' ? 'హోమ్' : 'Home'}</span>
              </button>

              <button
                onClick={() => handleNavClick('shop')}
                className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'shop' ? 'text-[#c99632]' : 'text-[#333333] hover:text-[#c99632]'
                }`}
              >
                <Store className="w-4 h-4 text-[#c99632]" />
                <span>{language === 'te' ? 'షాప్ ప్రొడక్ట్స్' : 'Shop Products'}</span>
              </button>

              <button
                onClick={() => handleNavClick('track')}
                className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'track' ? 'text-[#c99632]' : 'text-[#333333] hover:text-[#c99632]'
                }`}
              >
                <Package className="w-4 h-4 text-[#c99632]" />
                <span>{language === 'te' ? 'ఆర్డర్ ట్రాకింగ్' : 'Track Order'}</span>
              </button>
            </nav>

            {/* Action Buttons (Language, Wishlist, Cart, Customer Auth & Mobile Menu) */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 pl-2">
              
              {/* Language Switcher Toggle Button */}
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1.5 rounded-full bg-white border border-[#c99632]/40 hover:border-[#c99632] text-[11px] font-extrabold text-[#c99632] flex items-center gap-1 shadow-xs transition-all"
                title="Switch Language (English / తెలుగు)"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
              </button>

              {/* Wishlist Button with Heart Badge */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2.5 rounded-full bg-white border border-[#c99632]/40 hover:border-[#c99632] text-pink-600 transition-all shadow-xs flex items-center justify-center"
                title="Saved Wishlist"
              >
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {wishlist.length}
                  </span>
                )}
              </button>

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

              {/* Customer User Account / Sign In Button */}
              {currentUser ? (
                <div className="relative group">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#fff3c4]/80 border border-[#c99632]/50 hover:bg-[#fff3c4] transition-all gold-glow text-xs font-bold text-[#8a6200] shadow-xs"
                    title="Click to view account"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#c99632] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                      {currentUser.avatar || '👤'}
                    </span>
                    <span className="hidden sm:inline font-bold truncate max-w-[100px]">{(currentUser.name || 'Account').split(' ')[0]}</span>
                  </button>

                  {/* Dropdown Menu on Hover */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#c99632]/30 rounded-2xl shadow-xl p-2 hidden group-hover:block transition-all z-50">
                    <div className="p-3 border-b border-[#c99632]/15 bg-[#fffcf7] rounded-xl mb-1">
                      <p className="text-xs font-bold text-[#171717] truncate">{currentUser.name || 'Customer'}</p>
                      <p className="text-[11px] text-[#666666] truncate">{currentUser.email || currentUser.phone}</p>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white border border-[#c99632]/40 hover:border-[#c99632] text-xs font-bold text-[#171717] hover:text-[#c99632] transition-all shadow-xs gold-glow"
                >
                  <User className="w-4 h-4 text-[#c99632]" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-white border border-[#c99632]/30 text-[#171717]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Dedicated Search Bar with Voice Button */}
          <div ref={mobileSearchContainerRef} className="md:hidden pb-3 relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder={language === 'te' ? 'లిప్‌స్టిక్, గాజులు, నెక్లెస్ సెర్చ్ చేయండి...' : 'Search products, jewellery, bangles...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSuggestions(true);
                }}
                className="w-full bg-white border border-[#c99632]/40 rounded-full py-2 pl-9 pr-14 text-xs font-medium text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#c99632] shadow-xs"
              />
              <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`absolute right-7 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                  isListening ? 'bg-red-500 text-white animate-bounce' : 'text-[#888888]'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888]"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Mobile Live Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#c99632]/30 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-2 bg-[#faf8f5] border-b border-[#c99632]/20 flex items-center justify-between text-[11px] font-bold text-[#888888]">
                  <span>MATCHING PRODUCTS ({matchingProducts.length})</span>
                  <span className="text-[10px] text-[#c99632]">Tap to view</span>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                  {matchingProducts.length > 0 ? (
                    matchingProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProductFromSearch(p)}
                        className="p-2.5 hover:bg-[#fff9ee] active:bg-[#fff3c4] cursor-pointer flex items-center gap-2.5 transition-colors"
                      >
                        <img
                          src={p.image || p.imageUrl || '/bangles.jpg'}
                          alt={p.name}
                          className="w-9 h-9 object-cover rounded-lg border border-[#c99632]/20 shrink-0"
                          onError={(e) => { e.target.src = '/vasavi_logo.png'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#171717] truncate">{p.name}</p>
                          <p className="text-[10px] text-[#777777] truncate">{p.category}</p>
                        </div>
                        <span className="text-xs font-black text-[#171717] shrink-0">₹{p.price}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[#777777]">
                      No matching items. Press Enter to view catalog.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-2 px-3 bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>View all in Shop Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Mobile Drawer Menu (Navigation & Account Only) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fffcf7] border-b border-[#c99632]/30 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-fadeIn">
          {/* Customer Account Status in Mobile */}
          {currentUser ? (
            <div className="p-3 bg-white border border-[#c99632]/30 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#c99632] text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.avatar || '👤'}
                </span>
                <div>
                  <p className="text-xs font-bold text-[#171717]">{currentUser.name || 'Customer'}</p>
                  <p className="text-[10px] text-[#666666]">{currentUser.email || currentUser.phone || ''}</p>
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

          <div className="flex flex-col space-y-2 pt-1">
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
