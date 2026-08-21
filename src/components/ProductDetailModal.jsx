import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShoppingBag, Star, Zap, Check, ShieldCheck, Truck, MessageCircle, Heart, Sparkles, Award } from 'lucide-react';

export const ProductDetailModal = () => {
  const { selectedProduct, setSelectedProduct, addToCart, setIsCartOpen, reviews, storeInfo } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!selectedProduct) return null;

  const productReviews = reviews[selectedProduct.id] || [];
  const isOutOfStock = selectedProduct.stock <= 0;
  const maxAvailable = selectedProduct.stock || 1;

  const discountPercent = selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price
    ? Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleInstantBuyNow = () => {
    addToCart(selectedProduct, quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleWhatsAppQuickOrder = () => {
    const waNumber = storeInfo?.whatsappNumber || '918309917665';
    let msg = `🛍️ *PRODUCT INQUIRY - VASAVI FANCY STORE* 🛍️\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*Hello Ramcharan Garu!* I am interested in buying this item:\n\n`;
    msg += `📦 *Product:* ${selectedProduct.name}\n`;
    msg += `💰 *Unit Price:* ₹${selectedProduct.price} ${selectedProduct.originalPrice ? `(M.R.P. ₹${selectedProduct.originalPrice})` : ''}\n`;
    msg += `🔢 *Quantity:* ${quantity}\n`;
    msg += `💵 *Total Amount:* *₹${selectedProduct.price * quantity}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `✨ _Please confirm stock availability and share payment options. Thank you!_ 🙏`;

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#fffcf7] border border-[#c99632]/40 rounded-3xl overflow-hidden shadow-2xl text-[#171717]">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 text-[#171717] hover:bg-[#e8c7b5]/30 border border-[#c99632]/30 transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image & Badges */}
          <div className="relative bg-gradient-to-b from-amber-50/40 via-white to-white p-6 sm:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#c99632]/20">
            
            {/* Top Badges overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              {discountPercent > 0 && (
                <span className="bg-emerald-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md tracking-wider">
                  SAVE {discountPercent}% OFF
                </span>
              )}
              {selectedProduct.isTrending && (
                <span className="bg-[#c99632] text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> TRENDING
                </span>
              )}
            </div>

            {/* Product Image Display */}
            <div className="w-full max-h-[360px] flex items-center justify-center p-2">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full max-h-[340px] object-contain rounded-2xl shadow-md transition-all duration-300 hover:scale-105"
              />
            </div>

            {/* Micro Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 w-full pt-4 text-[10px] font-bold text-[#555555]">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#fffcf7] border border-[#c99632]/20">
                <ShieldCheck className="w-4 h-4 text-[#c99632] shrink-0" />
                <span>100% Authentic Quality</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#fffcf7] border border-[#c99632]/20">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fast Nandyal Delivery</span>
              </div>
            </div>

          </div>

          {/* Right Column: Details & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-[#fffcf7]">
            <div className="space-y-4">
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#c99632] bg-[#fff8ed] border border-[#c99632]/30 px-2.5 py-0.5 rounded-full">
                    {selectedProduct.categoryName || 'Vasavi Fancy Store'}
                  </span>
                  
                  {/* Stock Tag */}
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isOutOfStock ? 'Out of Stock' : `In Stock (${selectedProduct.stock} left)`}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-[#171717] mt-2 leading-snug">
                  {selectedProduct.name}
                </h2>
              </div>

              {/* Price & Rating Bar */}
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#c99632]/25 shadow-xs">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#171717]">₹{selectedProduct.price}</span>
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="text-xs text-[#888888] line-through font-medium">₹{selectedProduct.originalPrice}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">Inclusive of all taxes • COD Available</span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#fff8ed] px-3 py-1.5 rounded-xl border border-[#c99632]/30">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-[#c99632]">{selectedProduct.rating || '4.9'}</span>
                  <span className="text-[10px] text-[#666666]">({productReviews.length + 12})</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed font-normal">
                {selectedProduct.description || 'Exquisite high-quality item curated directly for Vasavi Fancy Store, Nandyal.'}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-[#171717]">Select Quantity:</span>
                <div className="flex items-center border border-[#c99632]/40 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm font-bold text-[#171717] hover:bg-[#e8c7b5]/30 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-black text-[#171717]">{quantity}</span>
                  <button
                    disabled={quantity >= maxAvailable}
                    onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                    className="px-3 py-1.5 text-sm font-bold text-[#171717] hover:bg-[#e8c7b5]/30 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-3 border-t border-[#c99632]/20">
              
              {/* WhatsApp Direct Order Button */}
              <button
                onClick={handleWhatsAppQuickOrder}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ORDER INSTANTLY VIA WHATSAPP</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs ${
                    isAdded
                      ? 'bg-emerald-50 border border-emerald-500 text-emerald-700 font-bold'
                      : 'bg-white border border-[#c99632] text-[#171717] hover:bg-[#e8c7b5]/30'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#c99632]" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  disabled={isOutOfStock}
                  onClick={handleInstantBuyNow}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md gold-glow"
                >
                  <Zap className="w-4 h-4" /> Instant Buy
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
