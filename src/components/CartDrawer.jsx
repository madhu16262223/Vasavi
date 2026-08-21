import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, ShieldCheck, CreditCard, Lock } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    getCartTotal
  } = useStore();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const totalAmount = getCartTotal();

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
        <div className="w-full max-w-md bg-[#fffcf7] border-l border-[#c99632]/40 h-full flex flex-col justify-between shadow-2xl text-[#171717]">
          
          {/* Header */}
          <div className="p-4 sm:p-6 bg-white border-b border-[#c99632]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#c99632]" />
              <h2 className="text-lg font-bold font-serif-luxury text-[#171717]">Your Shopping Cart</h2>
              <span className="text-xs bg-[#e8c7b5]/50 text-[#171717] px-2.5 py-0.5 rounded-full font-bold">
                {cart.reduce((a, c) => a + c.quantity, 0)} Items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-[#666666] hover:text-[#171717] hover:bg-[#e8c7b5]/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Line Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white border border-[#c99632]/30 flex items-center justify-center mx-auto text-[#c99632] shadow-sm">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-[#666666]">Your shopping cart is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white text-xs font-bold hover:brightness-110 shadow-md"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#c99632]/25 shadow-xs hover:border-[#c99632] transition-all"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-xl bg-[#fffcf7]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#171717] truncate">{item.product.name}</h4>
                    <p className="text-xs text-[#c99632] font-bold mt-0.5">₹{item.product.price}</p>
                    
                    {/* Quantity adjustment */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 rounded bg-[#fffcf7] border border-[#c99632]/40 text-[#171717] flex items-center justify-center text-xs font-bold hover:bg-[#e8c7b5]/30"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-[#171717]">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 rounded bg-[#fffcf7] border border-[#c99632]/40 text-[#171717] flex items-center justify-center text-xs font-bold hover:bg-[#e8c7b5]/30"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#171717] block">₹{item.product.price * item.quantity}</span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[#888888] hover:text-red-500 p-1 mt-1 inline-block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Actions (Single Primary Online Payment Checkout Button) */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#c99632]/20 space-y-4 shadow-lg">
              
              <div className="flex items-center justify-between text-sm font-bold text-[#171717] p-3.5 rounded-2xl bg-[#fffcf7] border border-[#c99632]/30">
                <span>Grand Total:</span>
                <span className="text-xl font-bold text-[#c99632]">₹{totalAmount}</span>
              </div>

              {/* Single Bold Checkout & Online Payment Button */}
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-sm shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow"
              >
                <Lock className="w-4 h-4" />
                <span>CHECKOUT — WhatsApp Order or Cash on Delivery</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#666666] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c99632]" />
                <span>100% Encrypted Payment • Instant Order Confirmation</span>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Checkout & Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
};
