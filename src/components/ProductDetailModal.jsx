import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getTranslatedProductName, getTranslatedProductDesc } from '../utils/translations';
import { X, ShoppingBag, Star, Zap, Check, ShieldCheck, Truck, MessageCircle, Heart, Sparkles, Award } from 'lucide-react';

export const ProductDetailModal = () => {
  const { selectedProduct, setSelectedProduct, addToCart, setIsCartOpen, reviewsList = [], addReview, currentUser, openAuthModal, storeInfo, toggleWishlist, isInWishlist, language, categories = [], t } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState(currentUser?.name || '');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!selectedProduct) return null;

  const inWishlist = isInWishlist(selectedProduct.id);
  const productReviews = reviewsList.filter((r) => r.productId === selectedProduct.id);
  const avgRating = productReviews.length
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : (selectedProduct.rating || 5.0);

  const isOutOfStock = selectedProduct.stock <= 0;
  const discountPercent = selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price
    ? Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)
    : 0;

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    if (!reviewComment.trim()) return;

    addReview({
      productId: selectedProduct.id,
      rating: reviewRating,
      customerName: reviewName.trim() || currentUser.name || 'Verified Customer',
      customerPhone: currentUser?.phone || null,
      comment: reviewComment.trim()
    });

    setReviewSuccess(true);
    setReviewComment('');
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const handleInstantBuyNow = () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    addToCart(selectedProduct, quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleWhatsAppInquiry = () => {
    let msg = `Hello Vasavi Fancy Store 👋\n`;
    msg += `I am interested in buying *${selectedProduct.name}* (Price: ₹${selectedProduct.price}).\n`;
    msg += `Is this item currently available in stock? Thank you!`;
    const waNumber = storeInfo?.whatsappNumber || '918309917665';
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#fffcf7] border border-[#c99632]/40 rounded-3xl overflow-hidden shadow-2xl animate-scaleUp">
        
        {/* Close & Wishlist Top Actions */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => toggleWishlist(selectedProduct)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
              inWishlist
                ? 'bg-pink-50 text-pink-600 border border-pink-300'
                : 'bg-white/90 text-[#666666] hover:text-pink-600 border border-[#c99632]/30'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-pink-500 text-pink-500' : ''}`} />
          </button>

          <button
            onClick={() => setSelectedProduct(null)}
            className="p-2.5 rounded-full bg-white/90 text-[#171717] hover:bg-[#e8c7b5]/30 border border-[#c99632]/30 transition-all shadow-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                  <Sparkles className="w-3 h-3" /> {t('card_trending')}
                </span>
              )}
            </div>

            {/* Product Image Display */}
            <div className="w-full relative flex items-center justify-center">
              <img
                src={selectedProduct.image || selectedProduct.imageUrl || '/bangles.jpg'}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/bangles.jpg'; }}
                className="w-full max-h-[340px] object-contain rounded-2xl shadow-md transition-all duration-300 hover:scale-105"
              />
            </div>

            {/* Micro Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 w-full pt-4 text-[10px] font-bold text-[#555555]">
              <div className="flex items-center gap-1.5 bg-[#faf8f5] p-2 rounded-xl border border-[#c99632]/20">
                <Award className="w-4 h-4 text-[#c99632] shrink-0" />
                <span>{language === 'te' ? '100% ఒరిజినల్ క్వాలిటీ' : '100% Authentic Quality'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#faf8f5] p-2 rounded-xl border border-[#c99632]/20">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'te' ? 'నంద్యాలలో వేగవంతమైన డెలివరీ' : 'Fast Nandyal Delivery'}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Details & Purchasing */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4 max-h-[550px] overflow-y-auto">
            
            {/* Header Tabs (Overview vs Reviews) */}
            <div className="flex items-center gap-2 border-b border-[#c99632]/20 pb-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'details' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
                }`}
              >
                {t('modal_details_tab')}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'reviews' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
                }`}
              >
                <span>⭐ {t('modal_reviews_tab')}</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
                  {productReviews.length}
                </span>
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#fff3c4] text-[#8a6200] px-2 py-0.5 rounded-md border border-[#c99632]/40">
                      {selectedProduct.categoryName || categories.find(c => c.id === selectedProduct.categoryId || c.slug === selectedProduct.categoryId)?.name || selectedProduct.category || 'Luxury Item'}
                    </span>
                    {selectedProduct.brand && (
                      <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                        • {selectedProduct.brand}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-serif-luxury text-[#171717] mt-0.5 leading-tight">
                    {getTranslatedProductName(selectedProduct, language)}
                  </h3>
                  
                  {/* Social Proof Urgency Badge */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-xl">
                    <span>🔥</span>
                    <span>{t('modal_live_viewers')}</span>
                  </div>

                  {/* Rating summary */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center text-amber-500 text-xs">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-xs font-bold text-[#171717]">{avgRating} / 5</span>
                    <span className="text-xs text-[#888888]">({productReviews.length} {language === 'te' ? 'కస్టమర్ రివ్యూలు' : 'customer reviews'})</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 p-3 rounded-2xl bg-white border border-[#c99632]/20">
                  <span className="text-2xl font-black text-[#c99632]">₹{selectedProduct.price}</span>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-xs text-slate-400 line-through">
                      M.R.P: ₹{selectedProduct.originalPrice}
                    </span>
                  )}
                  <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isOutOfStock ? (language === 'te' ? 'స్టాక్ అయిపోయింది' : 'Out of Stock') : (language === 'te' ? `స్టాక్ ఉంది: ${selectedProduct.stock}` : `In Stock: ${selectedProduct.stock} units`)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#555555] leading-relaxed">
                  {getTranslatedProductDesc(selectedProduct, language)}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-[#171717]">{t('modal_quantity')}:</span>
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
                      disabled={quantity >= (selectedProduct.stock || 99)}
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-sm font-bold text-[#171717] hover:bg-[#e8c7b5]/30 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={isOutOfStock}
                      onClick={() => {
                        addToCart(selectedProduct, quantity);
                        setIsAdded(true);
                        setTimeout(() => setIsAdded(false), 2000);
                      }}
                      className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-[#c99632] text-[#171717] hover:bg-[#e8c7b5]/20 shadow-xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" /> {language === 'te' ? 'కార్ట్‌కి చేర్చబడింది!' : 'Added to Cart!'}
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[#c99632]" /> {t('modal_add_to_cart')}
                        </>
                      )}
                    </button>

                    <button
                      disabled={isOutOfStock}
                      onClick={handleInstantBuyNow}
                      className="py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md gold-glow"
                    >
                      <Zap className="w-4 h-4" /> {currentUser ? t('modal_buy_now') : t('modal_login_to_buy')}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* REVIEWS TAB VIEW */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                
                {/* Write Review Box */}
                <form onSubmit={handleReviewSubmit} className="p-3.5 rounded-2xl bg-white border border-[#c99632]/30 space-y-2.5 text-xs">
                  <h4 className="font-bold text-[#171717] flex items-center justify-between">
                    <span>Write a Product Review</span>
                    {reviewSuccess && <span className="text-emerald-700 text-[11px] font-bold">✔ Review submitted!</span>}
                  </h4>

                  {/* Rating Stars Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#666666] font-medium">Your Rating:</span>
                    <div className="flex gap-1 text-lg cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={star <= reviewRating ? 'text-amber-500' : 'text-slate-300'}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-[#fffcf7] border border-[#c99632]/30 rounded-xl p-2 font-medium text-xs text-[#171717] focus:outline-none focus:border-[#c99632]"
                  />

                  <textarea
                    rows={2}
                    required
                    placeholder="Share your experience with this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-[#fffcf7] border border-[#c99632]/30 rounded-xl p-2 font-medium text-xs text-[#171717] focus:outline-none focus:border-[#c99632] resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#c99632] text-white font-bold text-xs rounded-xl hover:brightness-110 shadow-xs transition-all"
                  >
                    Submit Customer Review
                  </button>
                </form>

                {/* Customer Reviews List */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                    Customer Feedback ({productReviews.length})
                  </h4>

                  {productReviews.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-2xl border border-slate-100 text-xs text-[#888888]">
                      No reviews yet for this product. Be the first to review!
                    </div>
                  ) : (
                    productReviews.map((rev) => (
                      <div key={rev.id} className="p-3 rounded-2xl bg-white border border-[#c99632]/20 space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#171717]">{rev.customerName}</span>
                          <div className="text-amber-500 text-xs font-bold">
                            {'★'.repeat(rev.rating || 5)}
                          </div>
                        </div>
                        <p className="text-[#555555] text-[11px] leading-relaxed">{rev.comment}</p>
                        <span className="text-[9px] text-[#999999] block pt-0.5">
                          {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
