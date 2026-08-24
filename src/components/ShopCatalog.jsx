import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, Sparkles, RefreshCw } from 'lucide-react';

export const ShopCatalog = () => {
  const { products, categories, activeCategory, setActiveCategory, searchQuery, setSearchQuery, t, language } = useStore();

  const [priceRange, setPriceRange] = useState(5000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeCatObj = categories.find(c => c.slug === activeCategory || c.id === activeCategory);

  const getTranslatedCatName = (cat) => {
    if (language !== 'te') return cat.name;
    const nameLower = (cat.name || '').toLowerCase();
    if (nameLower.includes('cosmetic')) return t('cat_cosmetics');
    if (nameLower.includes('jewel')) return t('cat_jewellery');
    if (nameLower.includes('bangle')) return t('cat_bangles');
    if (nameLower.includes('bag')) return t('cat_handbags');
    if (nameLower.includes('hair')) return t('cat_hair');
    if (nameLower.includes('rakhi')) return t('cat_rakhis');
    return cat.name;
  };

  const filteredProducts = products.filter((p) => {
    // activeCategory can be 'all', a slug (e.g. 'jewellery'), or a categoryId (e.g. 'cat-2')
    const matchesCategory =
      activeCategory === 'all' ||
      p.categoryId === activeCategory ||
      (activeCatObj && p.categoryId === activeCatObj.id) ||
      p.slug === activeCategory ||
      (p.category && p.category.toLowerCase().replace(/\s+/g, '-') === activeCategory.toLowerCase().replace(/\s+/g, '-')) ||
      (p.categoryName && p.categoryName.toLowerCase().replace(/\s+/g, '-') === activeCategory.toLowerCase().replace(/\s+/g, '-'));

    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (p.shade && p.shade.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const matchesPrice = p.price <= priceRange;
    const matchesStock = !inStockOnly || p.stock > 0;

    return matchesCategory && matchesSearch && matchesPrice && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    return (b.reviewsCount || 0) - (a.reviewsCount || 0);
  });

  const resetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setPriceRange(5000);
    setInStockOnly(false);
    setSortBy('popular');
  };

  return (
    <section id="catalog-section" className="py-12 bg-[#fffcf7] min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c99632]/20 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e88a9a] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#c99632]" />
              <span>{t('catalog_badge')}</span>
            </div>
            <h2 className="text-3xl font-bold font-serif-luxury text-[#171717]">
              {t('catalog_title')} <span className="gold-gradient-text">{t('catalog_highlight')}</span>
            </h2>
            <p className="text-xs text-[#666666] mt-1 font-medium">
              {t('catalog_showing')} {sortedProducts.length} {t('catalog_of')} {products.length} {t('catalog_items')}
            </p>
          </div>

          {/* Sort Selector & Mobile Filter Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden px-4 py-2 rounded-xl bg-white border border-[#c99632]/40 text-xs font-bold text-[#171717] flex items-center gap-2 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#c99632]" />
              <span>{showMobileFilters ? (language === 'te' ? 'ఫిల్టర్లు దాచు' : 'Hide Filters') : (language === 'te' ? 'ఫిల్టర్లు & క్రమబద్ధీకరించు' : 'Filter & Refine')}</span>
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-[#555555] font-semibold hidden sm:inline">
                {language === 'te' ? 'క్రమబద్ధీకరణ:' : 'Sort By:'}
              </span>
              <div className="relative">
                <label htmlFor="shop-sort-select" className="sr-only">Sort Products</label>
                <select
                  id="shop-sort-select"
                  name="sortBy"
                  aria-label="Sort products"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#c99632]/40 rounded-xl py-2 px-3 pr-8 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#c99632] shadow-xs cursor-pointer"
                >
                  <option value="popular">{t('catalog_sort_popular')}</option>
                  <option value="price-low">{t('catalog_sort_price_low')}</option>
                  <option value="price-high">{t('catalog_sort_price_high')}</option>
                  <option value="rating">{t('catalog_sort_rating')}</option>
                  <option value="newest">{language === 'te' ? 'కొత్తగా వచ్చినవి' : 'Newest Arrivals'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Category Scroll Bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white shadow-xs gold-glow'
                : 'bg-white border border-[#c99632]/30 text-[#666666]'
            }`}
          >
            {t('catalog_filter_all')} ({products.length})
          </button>
          {categories.map((c) => {
            const catCount = products.filter(
              (p) => p.categoryId === c.id || p.categoryName === c.name
            ).length;
            const isSel = activeCategory === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                  isSel
                    ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white shadow-xs gold-glow'
                    : 'bg-white border border-[#c99632]/30 text-[#666666]'
                }`}
              >
                {getTranslatedCatName(c)} ({catCount})
              </button>
            );
          })}
        </div>

        {/* Catalog Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* DESKTOP SIDEBAR FILTERS */}
          <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} lg:col-span-1`}>
            <div className="bg-white border border-[#c99632]/30 rounded-3xl p-5 shadow-lg space-y-6 sticky top-24">
              
              {/* Filter Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#c99632]/20">
                <h3 className="font-serif-luxury text-sm font-bold text-[#171717] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#c99632]" />
                  <span>{t('catalog_filters')}</span>
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#c99632] hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" /> {t('catalog_reset')}
                </button>
              </div>

              {/* Categories Filter */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#171717] block uppercase tracking-wider text-[11px]">
                  {t('cat_explore')}
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      activeCategory === 'all'
                        ? 'bg-[#e8c7b5]/30 text-[#c99632] border border-[#c99632] font-bold'
                        : 'bg-[#faf8f5] text-[#444444] hover:bg-[#fffcf7]'
                    }`}
                  >
                    <span>{t('catalog_filter_all')}</span>
                    <span className="text-[10px] opacity-75">({products.length})</span>
                  </button>

                  {categories.map((c) => {
                    const catCount = products.filter(
                      (p) => p.categoryId === c.id || p.categoryName === c.name
                    ).length;
                    const isSel = activeCategory === c.slug;

                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveCategory(c.slug)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isSel
                            ? 'bg-[#e8c7b5]/30 text-[#c99632] border border-[#c99632] font-bold'
                            : 'bg-[#faf8f5] text-[#444444] hover:bg-[#fffcf7]'
                        }`}
                      >
                        <span>{getTranslatedCatName(c)}</span>
                        <span className="text-[10px] opacity-75">({catCount})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Max Price Filter */}
              <div className="space-y-2 pt-2 border-t border-[#c99632]/20">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="shop-price-range" className="font-bold text-[#171717] uppercase tracking-wider text-[11px] cursor-pointer">
                    {t('catalog_filter_price')}
                  </label>
                  <span className="font-bold text-[#c99632]">₹{priceRange}</span>
                </div>
                <input
                  id="shop-price-range"
                  name="priceRange"
                  aria-label="Price range filter"
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#c99632] bg-[#faf8f5] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#666666]">
                  <span>₹200</span>
                  <span>₹5,000</span>
                </div>
              </div>

              {/* Stock Only Checkbox */}
              <div className="pt-2 border-t border-[#c99632]/20">
                <label htmlFor="shop-instock-only" className="flex items-center gap-2.5 cursor-pointer text-xs text-[#171717] font-semibold">
                  <input
                    id="shop-instock-only"
                    name="inStockOnly"
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-[#c99632] focus:ring-[#c99632] w-4 h-4 accent-[#c99632]"
                  />
                  <span>{t('catalog_filter_stock')}</span>
                </label>
              </div>

            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {sortedProducts.length === 0 ? (
              <div className="bg-white border border-[#c99632]/30 rounded-2xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-[#e8c7b5]/30 text-[#c99632] rounded-full flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-[#171717]">
                  {language === 'te' ? 'ఫిల్టర్లకు సరిపోయే వస్తువులు లేవు' : 'No products found matching filters'}
                </h3>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  {t('catalog_no_items')}
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-full bg-[#c99632] text-white font-bold text-xs hover:bg-[#a6751d] transition-all shadow-md gold-glow"
                >
                  {t('catalog_reset')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {sortedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
