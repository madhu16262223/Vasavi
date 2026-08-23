import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, CreditCard, ShieldCheck, ArrowRight, Lock, Sparkles, Building, AlertCircle, RefreshCw } from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose }) => {
  const {
    cart,
    getCartTotal,
    placeOrder,
    storeInfo,
    currentUser
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

  const rawTotal = getCartTotal();
  const finalAmount = Math.max(0, rawTotal - couponDiscount);

  const handleApplyCoupon = () => {
    setCouponMsg('');
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMsg('Please enter a coupon code.');
      return;
    }

    if (code === 'WELCOME50') {
      if (rawTotal < 200) {
        setCouponMsg('Min order ₹200 required for WELCOME50');
        return;
      }
      setCouponDiscount(50);
      setAppliedCoupon('WELCOME50');
      setCouponMsg('🎉 WELCOME50 applied! ₹50 OFF');
    } else if (code === 'VASAVI10') {
      if (rawTotal < 300) {
        setCouponMsg('Min order ₹300 required for VASAVI10');
        return;
      }
      const disc = Math.min(200, Math.round(rawTotal * 0.10));
      setCouponDiscount(disc);
      setAppliedCoupon('VASAVI10');
      setCouponMsg(`🎉 VASAVI10 applied! 10% OFF (Saved ₹${disc})`);
    } else if (code === 'FESTIVE100') {
      if (rawTotal < 500) {
        setCouponMsg('Min order ₹500 required for FESTIVE100');
        return;
      }
      setCouponDiscount(100);
      setAppliedCoupon('FESTIVE100');
      setCouponMsg('🎉 FESTIVE100 applied! ₹100 OFF');
    } else {
      setCouponMsg('❌ Invalid or expired coupon code.');
    }
  };

  const sanitizeText = (val) => {
    if (!val || typeof val !== 'string') return '';
    return val.replace(/[<>]/g, '').trim();
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    const cleanName = sanitizeText(customerName);
    const cleanPhone = customerPhone.replace(/[^\d]/g, '');
    const cleanAddress = sanitizeText(customerAddress);
    const cleanPincode = pincode.replace(/[^\d]/g, '');

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter a valid Full Name.');
      return;
    }

    // Strict 10-digit Indian Mobile Number validation
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    if (!cleanAddress || cleanAddress.length < 5) {
      setErrorMessage('Please enter your complete delivery address (House No, Street/Colony).');
      return;
    }

    if (!/^\d{6}$/.test(cleanPincode)) {
      setErrorMessage('Please enter a valid 6-digit postal PIN code (e.g. 518501).');
      return;
    }

    setCustomerName(cleanName);
    setCustomerPhone(cleanPhone);
    setCustomerAddress(cleanAddress);
    setPincode(cleanPincode);
    setErrorMessage('');
    setStep('PAYMENT');
  };

  /**
   * SUBMIT ORDER: WHATSAPP ORDER OR CASH ON DELIVERY (COD)
   */
  const handleFinalSubmitOrder = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    const formattedItems = cart.map(item => {
      const p = item.product || item;
      return {
        productId: p.id || 'custom-prod',
        productName: sanitizeText(p.name) || 'Vasavi Store Item',
        quantity: Math.max(1, parseInt(item.quantity) || 1),
        price: typeof p.price === 'number' ? p.price : (parseFloat(p.price) || 0)
      };
    });

    const cleanAddress = sanitizeText(customerAddress);
    const cleanCity = sanitizeText(customerCity);
    const fullAddress = `${cleanAddress}, ${cleanCity} - ${pincode}`;
    const orderNum = `VSV-${Math.floor(10000 + Math.random() * 90000)}`;

    if (paymentMethod === 'WHATSAPP') {
      try {
        // Save order locally / DB
        const newOrder = placeOrder({
          name: customerName,
          phone: customerPhone,
          address: fullAddress,
          city: customerCity,
          pincode,
          notes: customerNotes,
          paymentMethod: 'WHATSAPP',
          paymentStatus: 'UNPAID',
          orderNumber: orderNum
        });

        // Format Clean, Highly Professional WhatsApp Message without star artifacts
        let message = `🛍️ NEW ORDER - VASAVI FANCY STORE\n`;
        message += `────────────────────────\n`;
        message += `Hello Ramcharan Garu! I have placed a new order on your store website.\n\n`;

        message += `📋 ORDER DETAILS:\n`;
        message += `• Order ID: #${orderNum}\n`;
        message += `• Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n`;
        message += `• Payment: WhatsApp Order (UPI / Scanner)\n\n`;

        message += `👤 CUSTOMER INFORMATION:\n`;
        message += `• Name: ${customerName}\n`;
        message += `• Phone: +91 ${customerPhone}\n`;
        message += `• Address: ${fullAddress}\n`;
        if (customerNotes) {
          message += `• Landmark / Note: ${customerNotes}\n`;
        }
        message += `\n`;

        message += `📦 ITEMS ORDERED:\n`;
        message += `────────────────────────\n`;
        cart.forEach((item, index) => {
          const p = item.product || item;
          message += `${index + 1}. ${p.name}\n`;
          message += `   Qty: ${item.quantity} × ₹${p.price} = ₹${p.price * item.quantity}\n`;
        });
        message += `────────────────────────\n\n`;

        message += `💳 BILL SUMMARY:\n`;
        message += `• Items Total: ₹${totalAmount}\n`;
        message += `• Delivery Charge: FREE (Nandyal)\n`;
        message += `• TOTAL PAYABLE: ₹${totalAmount}\n\n`;

        message += `────────────────────────\n`;
        message += `Please confirm my order and share your UPI QR / PhonePe number for payment. Thank you! 🙏`;

        const waNumber = storeInfo?.whatsappNumber || '918309917665';
        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

        setIsProcessing(false);
        onClose();
        window.open(waUrl, '_blank');
      } catch (err) {
        setIsProcessing(false);
        setErrorMessage('Could not initialize WhatsApp order. Please try again.');
      }
    } else {
      // CASH ON DELIVERY (COD)
      try {
        placeOrder({
          name: customerName,
          phone: customerPhone,
          address: fullAddress,
          city: customerCity,
          pincode,
          notes: customerNotes,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          orderNumber: orderNum
        });
        setIsProcessing(false);
        onClose();
      } catch (err) {
        setIsProcessing(false);
        setErrorMessage('Failed to place Cash on Delivery order.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#fffcf7] border border-[#c99632]/40 rounded-3xl overflow-hidden shadow-2xl text-[#171717]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#c99632]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#c99632]" />
            <div>
              <h2 className="text-lg font-bold font-serif-luxury text-[#171717]">Complete Your Order</h2>
              <p className="text-[11px] text-[#666666] font-medium">Vasavi Fancy Store • WhatsApp & COD Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#fffcf7] text-[#171717] hover:bg-[#e8c7b5]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6">

          {/* STEP 1: Customer Shipping Details */}
          {step === 'DETAILS' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#c99632]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. Customer & Shipping Address</span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhavi Latha"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-[#c99632]/30 rounded-xl p-3 text-xs font-medium text-[#171717] placeholder-slate-400 focus:border-[#c99632] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Phone Number *</label>
                  <input
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
                <label className="block text-xs font-bold text-[#171717] mb-1">Delivery Address & Landmark *</label>
                <textarea
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
                  <label className="block text-xs font-bold text-[#171717] mb-1">Town / City</label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full bg-[#fffcf7] border border-[#c99632]/30 rounded-xl p-2.5 text-xs font-semibold text-[#171717]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Pincode</label>
                  <input
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
                  <span className="flex items-center gap-1.5 text-[#c99632]">
                    🎟️ Have a Coupon or Offer Code?
                  </span>
                  {appliedCoupon && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {appliedCoupon} APPLIED
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
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
                    Apply
                  </button>
                </div>

                {couponMsg && (
                  <p className={`text-[11px] font-bold ${couponMsg.startsWith('🎉') ? 'text-emerald-700' : 'text-red-600'}`}>
                    {couponMsg}
                  </p>
                )}

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => { setCouponCode('WELCOME50'); }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-[#c99632]/30 text-[#c99632] hover:bg-[#fff3c4]"
                  >
                    WELCOME50 (₹50 OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCouponCode('VASAVI10'); }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-[#c99632]/30 text-[#c99632] hover:bg-[#fff3c4]"
                  >
                    VASAVI10 (10% OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCouponCode('FESTIVE100'); }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-[#c99632]/30 text-[#c99632] hover:bg-[#fff3c4]"
                  >
                    FESTIVE100 (₹100 OFF)
                  </button>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#c99632]/30 space-y-2 shadow-xs">
                <div className="flex justify-between text-xs text-[#666666] font-medium">
                  <span>Cart Subtotal:</span>
                  <span className="font-bold text-[#171717]">₹{rawTotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700 font-bold">
                    <span>Coupon Discount ({appliedCoupon}):</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#c99632]/20">
                  <div>
                    <span className="text-xs text-[#666666] font-medium block">Total Payable:</span>
                    <span className="text-xl font-bold text-[#c99632]">₹{finalAmount}</span>
                  </div>
                  <span className="text-xs bg-[#e8c7b5]/50 text-[#171717] px-3 py-1 rounded-full font-bold">
                    {cart.length} Products
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-sm shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all"
              >
                <span>CHOOSE PAYMENT & ORDER METHOD</span>
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
                  <span>2. Choose Order & Payment Option</span>
                </div>
                <button
                  onClick={() => setStep('DETAILS')}
                  className="text-xs text-[#c99632] hover:underline font-bold"
                >
                  ← Edit Address
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
                          <span>Order via WhatsApp (Recommended)</span>
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">Fastest</span>
                        </h4>
                        <p className="text-[11px] text-[#666666]">Send order to WhatsApp + Pay via UPI / GPay / PhonePe directly to store owner</p>
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
                        <h4 className="text-sm font-bold text-[#171717]">Cash on Delivery (COD)</h4>
                        <p className="text-[11px] text-[#666666]">Pay cash at your doorstep when delivered in Nandyal</p>
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
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-[#171717]">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>Delivery Charge (Nandyal):</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="pt-2 border-t border-[#c99632]/20 flex justify-between items-center text-sm font-bold text-[#171717]">
                  <span>Final Amount:</span>
                  <span className="text-xl font-bold text-[#c99632]">₹{totalAmount}</span>
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
                    ? 'Processing Order...'
                    : paymentMethod === 'WHATSAPP'
                    ? `SEND ORDER TO WHATSAPP (₹${totalAmount})`
                    : 'CONFIRM CASH ON DELIVERY ORDER'}
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
                <h3 className="text-xl font-bold text-[#171717]">Payment was not completed.</h3>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  {errorMessage || 'The payment process was cancelled or encountered a gateway error.'}
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
                  <RefreshCw className="w-4 h-4" /> Try Payment Again
                </button>

                <button
                  onClick={() => {
                    setPaymentMethod('COD');
                    setStep('PAYMENT');
                  }}
                  className="py-3 px-4 rounded-xl bg-[#faf8f5] border border-[#c99632]/40 text-[#171717] font-bold text-xs hover:bg-[#fff3c4]/50 flex items-center justify-center gap-2"
                >
                  <Building className="w-4 h-4 text-[#c99632]" /> Continue with COD
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
