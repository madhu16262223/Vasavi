import React from 'react';
import { useStore } from '../context/StoreContext';
import { Heart, X, ShoppingBag, Trash2, ArrowRight, Share2, Sparkles } from 'lucide-react';

export const WishlistDrawer = () => {
  const { wishlist = [], toggleWishlist, isWishlistOpen, setIsWishlistOpen, addToCart, setIsCartOpen, storeInfo } = useStore();

  if (!isWishlistOpen) return null;

  const handleMoveAllToCart = () => {
    wishlist.forEach(p => addToCart(p, 1));
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleShareWishlistOnWhatsApp = () => {
    const waNumber = storeInfo?.whatsappNumber || '918309917665';
    let msg = `💖 MY WISHLIST - VASAVI FANCY STORE\n`;
    msg += `────────────────────────\n`;
    msg += `Hello Ramcharan Garu! I have saved these items in my wishlist on your store:\n\n`;

    wishlist.forEach((p, idx) => {
      msg += `${idx + 1}. ${p.name} - ₹${p.price}\n`;
    });

    msg += `\nTotal Estimated: ₹${wishlist.reduce((s, p) => s + (p.price || 0), 0)}\n`;
    msg += `────────────────────────\n`;
    msg += `Please let me know if these are in stock. Thank you! 🙏`;

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-[#fffcf7] h-full shadow-2xl flex flex-col border-l border-[#c99632]/30 text-[#171717] animate-slideInRight">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#c99632]/20 flex items-center justify-between bg-white shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600 border border-pink-200">
              <Heart className="w-4 h-4 fill-pink-500" />
            </div>
            <div>
              <h3 className="font-bold font-serif-luxury text-base text-[#171717]">My Saved Wishlist</h3>
              <p className="text-[11px] text-[#666666]">{wishlist.length} luxury items saved</p>
            </div>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-2 rounded-full hover:bg-[#faf8f5] text-slate-500 hover:text-[#171717]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-5xl">💖</div>
              <h4 className="font-bold text-sm text-[#171717]">Your Wishlist is Empty</h4>
              <p className="text-xs text-[#666666] max-w-xs mx-auto">
                Click the heart icon on any product in our cosmetics, bangles, and jewellery collections to save them here!
              </p>
            </div>
          ) : (
            wishlist.map(product => (
              <div
                key={product.id}
                className="p-3 rounded-2xl bg-white border border-[#c99632]/25 shadow-xs flex items-center gap-3"
              >
                <img
                  src={product.image || product.imageUrl || '/bangles.jpg'}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/bangles.jpg'; }}
                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-[#171717] truncate">{product.name}</h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-sm font-extrabold text-[#c99632]">₹{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <span className="text-[9px] text-emerald-700 font-bold">✔ In Stock</span>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      toggleWishlist(product);
                    }}
                    className="p-2 rounded-xl bg-[#c99632] hover:bg-[#a6751d] text-white shadow-xs"
                    title="Move to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {wishlist.length > 0 && (
          <div className="p-4 bg-white border-t border-[#c99632]/20 space-y-2 shadow-lg">
            <button
              onClick={handleMoveAllToCart}
              className="w-full py-3.5 bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs rounded-xl shadow-md hover:brightness-110 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>MOVE ALL ITEMS TO CART</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleShareWishlistOnWhatsApp}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>SHARE WISHLIST WITH STORE OWNER</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
