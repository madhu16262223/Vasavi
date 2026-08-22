import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Star, Eye, Sparkles, Zap, Check } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart, setSelectedProduct, setIsCartOpen } = useStore();

  const [isAdded, setIsAdded] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const success = addToCart(product, 1);
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    const success = addToCart(product, 1);
    if (success) {
      setIsCartOpen(true);
    }
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative rounded-2xl overflow-hidden bg-white border border-[#c99632]/30 shadow-md hover:shadow-xl hover:border-[#c99632] flex flex-col justify-between cursor-pointer transition-all duration-300"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#fffcf7]">
        <img
          src={product.image || product.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex flex-col gap-1">
            {product.isTrending && (
              <span className="text-[9px] uppercase font-bold bg-[#e88a9a] text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Trending
              </span>
            )}
            {product.isBestSeller && !product.isTrending && (
              <span className="text-[9px] uppercase font-bold bg-[#c99632] text-white px-2 py-0.5 rounded-full shadow-md">
                Bestseller
              </span>
            )}
          </div>

          {discountPct && (
            <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-md">
              {discountPct}% OFF
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-50 border border-red-500 text-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Out of Stock
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
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3 bg-white">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#666666] mb-1">
            <span className="uppercase tracking-wider text-[#c99632] font-bold truncate max-w-[90px] sm:max-w-none">{product.categoryName || 'Vasavi'}</span>
            <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating || '4.9'}</span>
            </div>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-[#171717] group-hover:text-[#c99632] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price & Stock */}
        <div className="pt-1.5 sm:pt-2 border-t border-[#c99632]/20">
          <div className="flex items-baseline gap-1.5 mb-2 sm:mb-3">
            <span className="text-sm sm:text-lg font-bold text-[#171717]">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-[#888888] line-through">₹{product.originalPrice}</span>
            )}
            <span className="ml-auto text-[9px] sm:text-[10px] font-medium hidden xs:inline">
              {isOutOfStock ? (
                <span className="text-red-500 font-bold">Stock: 0</span>
              ) : (
                <span className="text-emerald-700 font-bold">In Stock</span>
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
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3 text-[#c99632]" />
                  <span>Add</span>
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
              <span>Buy</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
