import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { cleanIndianPhone, isValidIndianPhone } from '../utils/phoneUtils';
import { X, CreditCard, ShieldCheck, ArrowRight, Lock, Sparkles, Building, AlertCircle, RefreshCw } from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose }) => {
  const {
    cart = [],
    getCartTotal,
    placeOrder,
    storeInfo,
    currentUser,
    coupons = [],
    t,
    language
  } = useStore();

  const [step, setStep] = useState('DETAILS'); // 'DETAILS' | 'PAYMENT' | 'FAILURE'
  const [paymentMethod, setPaymentMethod] = useState('WHATSAPP'); // 'WHATSAPP' | 'COD'
  
  // Customer Details Form
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [customerCity, setCustomerCity] = useState('Nandyal');
  const [pincode, setPincode] = useState('518501');
  const [customerNotes, setCustomerNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !customerName) setCustomerName(currentUser.name);
      if (currentUser.phone && !customerPhone) setCustomerPhone(currentUser.phone);
      if (currentUser.address && !customerAddress) setCustomerAddress(currentUser.address);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.name, currentUser?.phone, currentUser?.address]);

  if (!isOpen) return null;

  const rawTotal = typeof getCartTotal === 'function' ? getCartTotal() : 0;
  const finalAmount = Math.max(0, rawTotal - (couponDiscount || 0));

  const handleApplyCoupon = () => {
    setCouponMsg('');
    const code = (couponCode || '').trim().toUpperCase();
    if (!code) {
      setCouponMsg(language === 'te' ? 'దయచేసి కూపన్ కోడ్ నమోదు చేయండి.' : 'Please enter a coupon code.');
      return;
    }

    // Check dynamic coupons from database first
    const matchedCoupon = (coupons || []).find(c => c && c.code && c.code.toUpperCase() === code && c.isActive);
    if (matchedCoupon) {
      const minReq = Number(matchedCoupon.minOrderAmount) || 0;
      if (rawTotal < minReq) {
        setCouponMsg(`Min order ₹${minReq} required for ${code}`);
        return;
      }
      let disc = 0;
      if (matchedCoupon.discountType === 'PERCENTAGE') {
        const calculated = Math.round(rawTotal * ((Number(matchedCoupon.discountValue) || 10) / 100));
        const maxLimit = Number(matchedCoupon.maxDiscountAmount) || 9999;
        disc = Math.min(calculated, maxLimit);
        setCouponDiscount(disc);
        setAppliedCoupon(code);
        setCouponMsg(`🎉 ${code} applied! ${matchedCoupon.discountValue}% OFF (Saved ₹${disc})`);
      } else {
        disc = Math.min(rawTotal, Number(matchedCoupon.discountValue) || 0);
        setCouponDiscount(disc);
        setAppliedCoupon(code);
        setCouponMsg(`🎉 ${code} applied! Flat ₹${disc} OFF`);
      }
      return;
    }

    // Fallback static coupons
    if (code === 'WELCOME50') {
      if (rawTotal < 300) {
        setCouponMsg('Min order ₹300 required for WELCOME50');
        return;
      }
      setCouponDiscount(50);
      setAppliedCoupon('WELCOME50');
      setCouponMsg('🎉 WELCOME50 applied! Flat ₹50 OFF');
    } else if (code === 'VASAVI10') {
      if (rawTotal < 500) {
        setCouponMsg('Min order ₹500 required for VASAVI10');
        return;
      }
      const disc = Math.round(rawTotal * 0.10);
      setCouponDiscount(disc);
      setAppliedCoupon('VASAVI10');
      setCouponMsg(`🎉 VASAVI10 applied! 10% OFF (Saved ₹${disc})`);
    } else if (code === 'FESTIVE100') {
      if (rawTotal < 1000) {
        setCouponMsg('Min order ₹1000 required for FESTIVE100');
        return;
      }
      setCouponDiscount(100);
      setAppliedCoupon('FESTIVE100');
      setCouponMsg('🎉 FESTIVE100 applied! Flat ₹100 OFF');
    } else {
      setCouponMsg(language === 'te' ? 'చెల్లని కూపన్ కోడ్. దయచేసి సరైన కోడ్ ఇవ్వండి.' : 'Invalid coupon code. Try WELCOME50 or VASAVI10');
    }
  };

  const handleStepOneSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMessage(language === 'te' ? 'దయచేసి పేరు, ఫోన్ నంబర్ మరియు చిరునామా నమోదు చేయండి.' : 'Please fill out all required fields.');
      return;
    }

    const cleanPhone = cleanIndianPhone(customerPhone);
    if (!isValidIndianPhone(cleanPhone)) {
      setErrorMessage(language === 'te' ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setErrorMessage('');
    setStep('PAYMENT');
  };

  const handleFinalSubmitOrder = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: cleanIndianPhone(customerPhone),
        customerAddress: `${customerAddress.trim()}, ${customerCity.trim()} - ${pincode.trim()}`,
        items: (cart || []).map(i => ({
          productId: i.product?.id || `item-${Math.random()}`,
          productName: i.product?.name || i.productName || 'Vasavi Fancy Store Item',
          quantity: i.quantity || 1,
          price: Number(i.product?.price) || Number(i.price) || 0,
          subtotal: (Number(i.product?.price) || Number(i.price) || 0) * (i.quantity || 1),
          image: i.product?.image || i.product?.imageUrl || '/bangles.jpg'
        })),
        totalAmount: finalAmount,
        discountAmount: couponDiscount,
        couponCode: appliedCoupon || null,
        paymentMethod: paymentMethod, // 'WHATSAPP' | 'COD'
        paymentStatus: 'PENDING',
        notes: customerNotes.trim()
      };

      const result = await placeOrder(orderPayload);

      if (paymentMethod === 'WHATSAPP') {
        const waNumber = storeInfo?.whatsappNumber || '918309917665';
        let msg = `🛍️ *NEW ORDER - VASAVI FANCY STORE*\n`;
        msg += `────────────────────────\n`;
        msg += `📋 *Order ID:* ${result?.orderNumber || result?.id || 'NEW'}\n`;
        msg += `👤 *Customer:* ${customerName.trim()}\n`;
        msg += `📞 *Phone:* ${customerPhone.trim()}\n`;
        msg += `📍 *Delivery Address:* ${customerAddress.trim()}, ${customerCity} - ${pincode}\n\n`;
        msg += `📦 *ITEMS ORDERED:*\n`;

        (cart || []).forEach((item, idx) => {
          const pName = item?.product?.name || item?.productName || 'Product';
          const pPrice = Number(item?.product?.price) || Number(item?.price) || 0;
          const pQty = item?.quantity || 1;
          msg += `${idx + 1}. ${pName} (Qty: ${pQty}) - ₹${pPrice * pQty}\n`;
        });

        msg += `\n💵 *Total Amount:* ₹${finalAmount}\n`;
        if (couponDiscount > 0) {
          msg += `🎟️ *Coupon Applied:* ${appliedCoupon} (-₹${couponDiscount})\n`;
        }
        msg += `💳 *Payment Option:* WhatsApp Order / UPI\n`;
        msg += `────────────────────────\n`;
        msg += `Hello Ramcharan Garu, please confirm this order and share UPI QR / Payment instructions. Thank you! 🙏`;

        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
      }

      setIsProcessing(false);
      onClose();
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Could not process order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#fffcf7] border border-[#c99632]/40 rounded-3xl overflow-hidden shadow-2xl animate-scaleUp">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white border-b border-[#c99632]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#fff3c4] text-[#c99632]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#171717]">
                {language === 'te' ? 'సురక్షిత చెక్అవుట్' : 'Secure Checkout'}
              </h3>
              <p className="text-[11px] text-[#666666]">
                {language === 'te' ? 'వాసవి ఫ్యాన్సీ స్టోర్, నంద్యాల' : 'Vasavi Fancy Store, Nandyal'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#faf8f5] text-slate-500 hover:text-[#171717]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* STEP 1: Customer Details */}
          {step === 'DETAILS' && (
            <form onSubmit={handleStepOneSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#c99632]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. {language === 'te' ? 'కస్టమర్ & డెలివరీ చిరునామా' : 'Customer & Shipping Address'}</span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-customer-name" className="block text-xs font-bold text-[#171717] mb-1">
                    {language === 'te' ? 'పూర్తి పేరు *' : 'Full Name *'}
                  </label>
                  <input
                    id="checkout-customer-name"
                    name="customerName"
                    autoComplete="name"
                    type="text"
                    required
                    placeholder="e.g. Madhavi Latha"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-[#c99632]/30 rounded-xl p-3 text-xs font-medium text-[#171717] placeholder-slate-400 focus:border-[#c99632] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-customer-phone" className="block text-xs font-bold text-[#171717] mb-1">
                    {language === 'te' ? 'మొబైల్ నంబర్ *' : 'Phone Number *'}
                  </label>
                  <input
                    id="checkout-customer-phone"
                    name="customerPhone"
                    autoComplete="tel"
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-[#c99632]/30 rounded-xl p-3 text-xs font-medium text-[#171717] placeholder-slate-400 focus:border-[#c99632] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="checkout-customer-address" className="block text-xs font-bold text-[#171717] mb-1">
                  {language === 'te' ? 'డెలివరీ చిరునామా & ల్యాండ్‌మార్క్ *' : 'Delivery Address & Landmark *'}
                </label>
                <textarea
                  id="checkout-customer-address"
                  name="customerAddress"
                  autoComplete="street-address"
                  required
                  rows={2}
                  placeholder="e.g. Door No. 12/45, Sanjeeva Nagar, Near Temple, Nandyal"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-white border border-[#c99632]/30 rounded-xl p-3 text-xs font-medium text-[#171717] placeholder-slate-400 focus:border-[#c99632] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-customer-city" className="block text-xs font-bold text-[#171717] mb-1">
                    {language === 'te' ? 'పట్టణం / ఊరు' : 'Town / City'}
                  </label>
                  <input
                    id="checkout-customer-city"
                    name="city"
                    autoComplete="address-level2"
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full bg-[#fffcf7] border border-[#c99632]/30 rounded-xl p-2.5 text-xs font-semibold text-[#171717]"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-customer-pincode" className="block text-xs font-bold text-[#171717] mb-1">
                    {language === 'te' ? 'పిన్‌కోడ్' : 'Pincode'}
                  </label>
                  <input
                    id="checkout-customer-pincode"
                    name="pincode"
                    autoComplete="postal-code"
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-[#fffcf7] border border-[#c99632]/30 rounded-xl p-2.5 text-xs font-semibold text-[#171717]"
                  />
                </div>
              </div>

              {/* Coupon Code Box */}
              <div className="p-3.5 rounded-2xl bg-[#fffcf7] border border-[#c99632]/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#171717]">
                  <label htmlFor="checkout-coupon-code" className="flex items-center gap-1.5 text-[#c99632] cursor-pointer">
                    🎟️ {language === 'te' ? 'కూపన్ లేదా ఆఫర్ కోడ్ ఉందా?' : 'Have a Coupon or Offer Code?'}
                  </label>
                  {appliedCoupon && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {appliedCoupon} APPLIED
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    id="checkout-coupon-code"
                    name="couponCode"
                    type="text"
                    placeholder="Enter Code (e.g. WELCOME50, VASAVI10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-white border border-[#c99632]/30 rounded-xl px-3 py-2 text-xs font-bold text-[#171717] uppercase tracking-wider focus:outline-none focus:border-[#c99632]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-[#c99632] hover:bg-[#a6751d] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    {language === 'te' ? 'వర్తించు' : 'Apply'}
                  </button>
                </div>

                {couponMsg && (
                  <p className={`text-[11px] font-bold ${couponMsg.startsWith('🎉') ? 'text-emerald-700' : 'text-red-600'}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#c99632]/30 space-y-2 shadow-xs">
                <div className="flex justify-between text-xs text-[#666666] font-medium">
                  <span>{language === 'te' ? 'కార్ట్ మొత్తం:' : 'Cart Subtotal:'}</span>
                  <span className="font-bold text-[#171717]">₹{rawTotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700 font-bold">
                    <span>{language === 'te' ? 'కూపన్ డిస్కౌంట్' : 'Coupon Discount'} ({appliedCoupon}):</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#c99632]/20">
                  <div>
                    <span className="text-xs text-[#666666] font-medium block">
                      {language === 'te' ? 'చెల్లించవలసిన మొత్తం:' : 'Total Payable:'}
                    </span>
                    <span className="text-xl font-bold text-[#c99632]">₹{finalAmount}</span>
                  </div>
                  <span className="text-xs bg-[#e8c7b5]/50 text-[#171717] px-3 py-1 rounded-full font-bold">
                    {cart.length} {language === 'te' ? 'వస్తువులు' : 'Products'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-sm shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all"
              >
                <span>{language === 'te' ? 'చెల్లింపు విధానాన్ని ఎంచుకోండి' : 'CHOOSE PAYMENT & ORDER METHOD'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Payment Method Selection */}
          {step === 'PAYMENT' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#c99632]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. {language === 'te' ? 'ఆర్డర్ & చెల్లింపు విధానం' : 'Choose Order & Payment Option'}</span>
                </div>
                <button
                  onClick={() => setStep('DETAILS')}
                  className="text-xs text-[#c99632] hover:underline font-bold"
                >
                  ← {language === 'te' ? 'చిరునామా మార్చండి' : 'Edit Address'}
                </button>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                
                {/* WhatsApp Order Option (Recommended) */}
                <div
                  onClick={() => setPaymentMethod('WHATSAPP')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'WHATSAPP'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md'
                      : 'border-[#c99632]/20 bg-white hover:border-[#c99632]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500 text-white font-bold shadow-xs">
                        💬
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                          <span>{language === 'te' ? 'వాట్సాప్ ద్వారా ఆర్డర్ చేయండి (సిఫార్సు)' : 'Order via WhatsApp (Recommended)'}</span>
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">Fastest</span>
                        </h4>
                        <p className="text-[11px] text-[#666666]">
                          {language === 'te' ? 'వాట్సాప్‌లో ఆర్డర్ పంపండి + UPI / GPay / PhonePe ద్వారా నేరుగా ఓనర్‌కి చెల్లించండి' : 'Send order to WhatsApp + Pay via UPI / GPay / PhonePe directly to store owner'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'WHATSAPP'}
                      onChange={() => setPaymentMethod('WHATSAPP')}
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Cash on Delivery (COD) Option */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#c99632] bg-[#fff3c4]/30 shadow-md'
                      : 'border-[#c99632]/20 bg-white hover:border-[#c99632]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#171717]">
                          {language === 'te' ? 'క్యాష్ ఆన్ డెలివరీ (COD)' : 'Cash on Delivery (COD)'}
                        </h4>
                        <p className="text-[11px] text-[#666666]">
                          {language === 'te' ? 'నంద్యాలలో డెలివరీ సమయంలో నేరుగా నగదు చెల్లించండి' : 'Pay cash at your doorstep when delivered in Nandyal'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-4 h-4 accent-[#c99632]"
                    />
                  </div>
                </div>

              </div>

              {/* Order Summary Line */}
              <div className="p-4 rounded-2xl bg-white border border-[#c99632]/30 space-y-2">
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>{language === 'te' ? 'వస్తువుల మొత్తం:' : 'Items Subtotal:'}</span>
                  <span className="font-bold text-[#171717]">₹{rawTotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>{language === 'te' ? 'డిస్కౌంట్' : 'Discount'} ({appliedCoupon}):</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>{language === 'te' ? 'డెలివరీ చార్జీలు (నంద్యాల):' : 'Delivery Charge (Nandyal):'}</span>
                  <span className="font-bold text-emerald-600">{language === 'te' ? 'ఉచితం' : 'FREE'}</span>
                </div>
                <div className="pt-2 border-t border-[#c99632]/20 flex justify-between items-center text-sm font-bold text-[#171717]">
                  <span>{language === 'te' ? 'మొత్తం బిల్లు:' : 'Final Amount:'}</span>
                  <span className="text-xl font-bold text-[#c99632]">₹{finalAmount}</span>
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleFinalSubmitOrder}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'WHATSAPP'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white gold-glow'
                }`}
              >
                <span>
                  {isProcessing
                    ? (language === 'te' ? 'ఆర్డర్ ప్రాసెస్ అవుతోంది...' : 'Processing Order...')
                    : paymentMethod === 'WHATSAPP'
                    ? (language === 'te' ? `వాట్సాప్‌లో ఆర్డర్ పంపండి (₹${finalAmount})` : `SEND ORDER TO WHATSAPP (₹${finalAmount})`)
                    : (language === 'te' ? `COD ఆర్డర్ నిర్ధారించండి (₹${finalAmount})` : `CONFIRM CASH ON DELIVERY ORDER (₹${finalAmount})`)}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Payment Failure / Cancel Handling */}
          {step === 'FAILURE' && (
            <div className="text-center py-8 space-y-6 bg-white p-6 rounded-2xl border border-red-200">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 border border-red-200 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#171717]">
                  {language === 'te' ? 'చెల్లింపు పూర్తికాలేదు.' : 'Payment was not completed.'}
                </h3>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  {errorMessage || 'The payment process was cancelled or encountered an error.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setStep('PAYMENT');
                    handleFinalSubmitOrder();
                  }}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> {language === 'te' ? 'మళ్లీ ప్రయత్నించండి' : 'Try Payment Again'}
                </button>

                <button
                  onClick={() => {
                    setPaymentMethod('COD');
                    setStep('PAYMENT');
                  }}
                  className="py-3 px-4 rounded-xl bg-[#faf8f5] border border-[#c99632]/40 text-[#171717] font-bold text-xs hover:bg-[#fff3c4]/50 flex items-center justify-center gap-2"
                >
                  <Building className="w-4 h-4 text-[#c99632]" /> {language === 'te' ? 'COD తో కొనసాగించండి' : 'Continue with COD'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
