import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getTranslatedProductName } from '../utils/translations';
import { getEffectiveProductDetails } from '../utils/variantUtils';
import { ShoppingBag, Star, Eye, Sparkles, Zap, Check, Heart } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart, setSelectedProduct, setIsCartOpen, toggleWishlist, isInWishlist, categories = [], t, language } = useStore();

  const [isAdded, setIsAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(() => (Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants[0] : null));

  if (!product) return null;

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 1;
  const currentVariant = selectedVariant || (Array.isArray(product.variants) ? product.variants[0] : null);
  const { price, originalPrice, stock, discountPct } = getEffectiveProductDetails(product, currentVariant);
  const isOutOfStock = stock <= 0;
  const inWishlist = isInWishlist(product.id);

  // Match category name dynamically and guarantee safe string
  const catObj = (categories || []).find(c => c && (c.id === product.categoryId || c.slug === product.categoryId));
  const rawCat = product.categoryName || catObj?.name || (typeof product.category === 'string' ? product.category : product.category?.name) || 'Vasavi';
  let categoryTitle = typeof rawCat === 'string' ? rawCat : 'Vasavi';
  if (language === 'te') {
    const nameLower = categoryTitle.toLowerCase();
    if (nameLower.includes('cosmetic')) categoryTitle = t('cat_cosmetics');
    else if (nameLower.includes('jewel')) categoryTitle = t('cat_jewellery');
    else if (nameLower.includes('bangle')) categoryTitle = t('cat_bangles');
    else if (nameLower.includes('bag')) categoryTitle = t('cat_handbags');
    else if (nameLower.includes('hair')) categoryTitle = t('cat_hair');
    else if (nameLower.includes('rakhi')) categoryTitle = t('cat_rakhis');
  }

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const success = addToCart(product, 1, currentVariant);
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    const success = addToCart(product, 1, currentVariant);
    if (success) {
      setIsCartOpen(true);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative rounded-2xl overflow-hidden bg-white border border-[#c99632]/30 shadow-md hover:shadow-xl hover:border-[#c99632] flex flex-col justify-between cursor-pointer transition-all duration-300"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#fffcf7]">
        <img
          src={product.image || product.imageUrl || '/bangles.jpg'}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/bangles.jpg'; }}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex flex-col gap-1">
            {product.isTrending && (
              <span className="text-[9px] uppercase font-bold bg-[#e88a9a] text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> {t('card_trending')}
              </span>
            )}
            {product.isBestSeller && !product.isTrending && (
              <span className="text-[9px] uppercase font-bold bg-[#c99632] text-white px-2 py-0.5 rounded-full shadow-md">
                {t('card_bestseller')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {discountPct && (
              <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-md">
                {discountPct}% {t('card_off')}
              </span>
            )}

            {/* Wishlist Heart Button */}
            <button
              onClick={handleWishlistToggle}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                inWishlist ? 'bg-rose-500 text-white shadow-md' : 'bg-white/90 text-[#666666] hover:text-rose-500 border border-slate-200 shadow-sm'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-50 border border-red-500 text-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {t('card_out_of_stock')}
            </span>
          </div>
        )}

        {/* Hover Quick View Button */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="p-2.5 rounded-full bg-white text-[#171717] hover:text-[#c99632] border border-[#c99632]/40 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all font-bold"
            title="Quick View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#c99632] truncate">
              {categoryTitle}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-[#171717]">{product.rating || '5.0'}</span>
            </div>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-[#171717] line-clamp-2 leading-snug group-hover:text-[#c99632] transition-colors mb-1.5">
            {getTranslatedProductName(product, language)}
          </h3>

          {/* Flipkart / Amazon Style Variant Selector Pills */}
          {hasVariants && (
            <div className="flex flex-wrap items-center gap-1.5 my-2" onClick={(e) => e.stopPropagation()}>
              {product.variants.map((v) => {
                const isSelected = (currentVariant?.id || currentVariant?.name) === (v.id || v.name);
                return (
                  <button
                    key={v.id || v.name}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white border-[#c99632] shadow-xs scale-105'
                        : 'bg-[#fffcf7] text-[#555555] border-amber-200/80 hover:border-[#c99632] hover:bg-amber-50'
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Price & Stock */}
        <div className="pt-1.5 sm:pt-2 border-t border-[#c99632]/20">
          <div className="flex items-baseline gap-1.5 mb-2 sm:mb-3">
            <span className="text-sm sm:text-lg font-bold text-[#171717]">₹{price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-[10px] sm:text-xs text-[#888888] line-through">₹{originalPrice}</span>
            )}
            <span className="ml-auto text-[9px] sm:text-[10px] font-medium hidden xs:inline">
              {isOutOfStock ? (
                <span className="text-red-500 font-bold">{t('card_out_of_stock')}</span>
              ) : (
                <span className="text-emerald-700 font-bold">{language === 'te' ? 'స్టాక్ ఉంది' : 'In Stock'}</span>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {/* Add to Cart Button */}
            <button
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`w-full py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : isAdded
                  ? 'bg-emerald-50 border border-emerald-500 text-emerald-700 font-bold'
                  : 'bg-white border border-[#c99632] text-[#171717] hover:bg-[#e8c7b5]/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{language === 'te' ? 'చేర్చబడింది' : 'Added'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3 text-[#c99632]" />
                  <span>{language === 'te' ? '+ కార్ట్' : 'Add'}</span>
                </>
              )}
            </button>

            {/* Buy Now Button */}
            <button
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className={`w-full py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#c99632] to-[#a6751d] hover:brightness-110 text-white shadow-md gold-glow'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>{language === 'te' ? 'కొనండి' : 'Buy'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
