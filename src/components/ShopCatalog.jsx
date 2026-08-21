import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, Sparkles, RefreshCw } from 'lucide-react';

export const ShopCatalog = () => {
  const { products, categories, activeCategory, setActiveCategory, searchQuery, setSearchQuery } = useStore();

  const [priceRange, setPriceRange] = useState(5000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredProducts = products.filter((p) => {
    // activeCategory can be 'all', a slug (e.g. 'jewellery'), or a categoryId (e.g. 'cat-2')
    const matchesCategory =
      activeCategory === 'all' ||
      p.categoryId === activeCategory ||
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
              <span>COLLECTION CATALOG</span>
            </div>
            <h2 className="text-3xl font-bold font-serif-luxury text-[#171717]">
              Explore Our <span className="gold-gradient-text">Products</span>
            </h2>
            <p className="text-xs text-[#666666] mt-1 font-medium">
              Showing {sortedProducts.length} of {products.length} items available in store
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
              <span>{showMobileFilters ? 'Hide Filters' : 'Filter & Refine'}</span>
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-[#555555] font-semibold hidden sm:inline">Sort By:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#c99632]/40 rounded-xl py-2 px-3 pr-8 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#c99632] shadow-xs cursor-pointer"
                >
                  <option value="popular">Most Popular & Bestselling</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Customer Rating</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Category Scroll Bar (Flipkart / Amazon App style) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              activeCategory === 'all'
                ? 'bg-[#c99632] text-white shadow-md'
                : 'bg-white text-[#444444] border border-[#c99632]/30 hover:bg-[#fffcf7]'
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((c) => {
            const isSel = activeCategory === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSel
                    ? 'bg-[#c99632] text-white shadow-md'
                    : 'bg-white text-[#444444] border border-[#c99632]/30 hover:bg-[#fffcf7]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Catalog Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filter Sidebar (Desktop Sticky + Mobile Collapsible) */}
          <div className={`lg:col-span-1 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white border border-[#c99632]/30 rounded-2xl p-5 space-y-6 shadow-md lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-[#c99632]/20 pb-3">
                <h3 className="text-sm font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#c99632]" />
                  <span>Filter Products</span>
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#c99632] hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Categories Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#171717] block uppercase tracking-wider text-[11px]">
                  Category
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      activeCategory === 'all'
                        ? 'bg-[#e8c7b5]/30 text-[#c99632] border border-[#c99632] font-bold'
                        : 'bg-[#faf8f5] text-[#444444] hover:bg-[#fffcf7]'
                    }`}
                  >
                    <span>All Products</span>
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
                        <span>{c.name}</span>
                        <span className="text-[10px] opacity-75">({catCount})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Max Price Filter */}
              <div className="space-y-2 pt-2 border-t border-[#c99632]/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#171717] uppercase tracking-wider text-[11px]">Max Price</span>
                  <span className="font-bold text-[#c99632]">₹{priceRange}</span>
                </div>
                <input
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
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#171717] font-semibold">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-[#c99632] focus:ring-[#c99632] w-4 h-4 accent-[#c99632]"
                  />
                  <span>Show In-Stock Only</span>
                </label>
              </div>

            </div>
          </div>

          {/* Product Grid Area - Large single column on mobile like Amazon/Flipkart */}
          <div className="lg:col-span-3">
            {sortedProducts.length === 0 ? (
              <div className="bg-white border border-[#c99632]/30 rounded-2xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-[#e8c7b5]/30 text-[#c99632] rounded-full flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-[#171717]">No products found matching filters</h3>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  Try adjusting your search query, price range, or category filter to view available items.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-full bg-[#c99632] text-white font-bold text-xs hover:bg-[#a6751d] transition-all shadow-md gold-glow"
                >
                  Reset All Filters
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
