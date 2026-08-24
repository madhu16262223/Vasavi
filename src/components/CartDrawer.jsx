import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getTranslatedProductName } from '../utils/translations';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, ShieldCheck, CreditCard, Lock } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    currentUser,
    openAuthModal,
    t,
    language
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
              <h2 className="text-lg font-bold font-serif-luxury text-[#171717]">{t('cart_title')}</h2>
              <span className="text-xs bg-[#e8c7b5]/50 text-[#171717] px-2.5 py-0.5 rounded-full font-bold">
                {cart.reduce((a, c) => a + c.quantity, 0)} {language === 'te' ? 'వస్తువులు' : 'Items'}
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
                <p className="text-sm font-semibold text-[#666666]">{t('cart_empty_title')}</p>
                <p className="text-xs text-[#888888] max-w-xs mx-auto">{t('cart_empty_desc')}</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white text-xs font-bold hover:brightness-110 shadow-md"
                >
                  {t('cart_explore_btn')}
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const prod = item.product || {};
                const prodId = prod.id || `prod-${Math.random()}`;
                const prodPrice = typeof prod.price === 'number' ? prod.price : (parseFloat(prod.price) || 0);
                const prodQty = item.quantity || 1;

                return (
                  <div
                    key={prodId}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#c99632]/25 shadow-xs hover:border-[#c99632] transition-all"
                  >
                    <img
                      src={prod.image || prod.imageUrl || '/bangles.jpg'}
                      alt={prod.name || 'Product'}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/bangles.jpg'; }}
                      className="w-16 h-16 object-cover rounded-xl bg-[#fffcf7]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#171717] truncate">{getTranslatedProductName(prod, language) || 'Vasavi Store Item'}</h4>
                      <p className="text-xs text-[#c99632] font-bold mt-0.5">₹{prodPrice}</p>
                      
                      {/* Quantity adjustment */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(prodId, prodQty - 1)}
                          className="w-5 h-5 rounded bg-[#fffcf7] border border-[#c99632]/40 text-[#171717] flex items-center justify-center text-xs font-bold hover:bg-[#e8c7b5]/30"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-[#171717]">{prodQty}</span>
                        <button
                          onClick={() => updateCartQuantity(prodId, prodQty + 1)}
                          className="w-5 h-5 rounded bg-[#fffcf7] border border-[#c99632]/40 text-[#171717] flex items-center justify-center text-xs font-bold hover:bg-[#e8c7b5]/30"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#171717] block">₹{prodPrice * prodQty}</span>
                      <button
                        onClick={() => removeFromCart(prodId)}
                        className="text-[#888888] hover:text-red-500 p-1 mt-1 inline-block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer Actions (Single Primary Online Payment Checkout Button) */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#c99632]/20 space-y-4 shadow-lg">
              
              <div className="flex items-center justify-between text-sm font-bold text-[#171717] p-3.5 rounded-2xl bg-[#fffcf7] border border-[#c99632]/30">
                <span>{language === 'te' ? 'మొత్తం బిల్లు:' : 'Grand Total:'}</span>
                <span className="text-xl font-bold text-[#c99632]">₹{totalAmount}</span>
              </div>

              {/* Single Bold Checkout & Online Payment Button */}
              <button
                onClick={() => {
                  if (!currentUser) {
                    openAuthModal('login');
                  } else {
                    setIsCheckoutOpen(true);
                  }
                }}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-sm shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all gold-glow"
              >
                <Lock className="w-4 h-4" />
                <span>{currentUser ? t('cart_checkout_btn') : t('cart_login_checkout')}</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>

              {!currentUser && (
                <p className="text-[11px] text-center font-bold text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200">
                  {language === 'te' ? '⚠️ ఆర్డర్ పూర్తి చేయడానికి దయచేసి మీ మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి.' : '⚠️ Please log in or sign up with your phone number to complete your order.'}
                </p>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#666666] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c99632]" />
                <span>{language === 'te' ? '100% సురక్షిత చెల్లింపులు • తక్షణ ఆర్డర్ నిర్ధారణ' : '100% Encrypted Payment • Instant Order Confirmation'}</span>
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
