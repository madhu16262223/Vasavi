import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import { getTranslatedProductName } from '../utils/translations';
import { Package, Search, Clock, CheckCircle2, Truck, AlertCircle, PhoneCall, FileText, User, ShoppingBag, ArrowRight, ExternalLink } from 'lucide-react';

export const OrderTracker = () => {
  const { orders, currentUser, storeInfo, t, language, setActiveTab } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const cleanIndianPhone = (phoneInput) => {
    if (!phoneInput) return '';
    let digits = String(phoneInput).replace(/[^\d]/g, '');
    if (digits.startsWith('91') && digits.length === 12) {
      digits = digits.slice(2);
    }
    if (digits.startsWith('0') && digits.length === 11) {
      digits = digits.slice(1);
    }
    return digits;
  };

  // Filter orders placed by the currently logged in customer
  const cleanUserPhone = currentUser?.phone ? cleanIndianPhone(currentUser.phone) : '';
  const cleanUserEmail = currentUser?.email ? currentUser.email.toLowerCase() : '';

  const userOrders = currentUser
    ? orders.filter((o) => {
        const orderPhone = cleanIndianPhone(o.customerPhone);
        const orderEmail = o.customerEmail ? o.customerEmail.toLowerCase() : '';
        return (
          (cleanUserPhone && orderPhone === cleanUserPhone) ||
          (cleanUserEmail && orderEmail === cleanUserEmail) ||
          (currentUser.name && o.customerName && o.customerName.toLowerCase() === currentUser.name.toLowerCase())
        );
      })
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    const query = searchQuery.trim().toLowerCase();
    const cleanQPhone = cleanIndianPhone(query);
    
    const found = orders.find(
      (o) =>
        (o.orderNumber && o.orderNumber.toLowerCase().includes(query)) ||
        (o.id && o.id.toLowerCase().includes(query)) ||
        (cleanQPhone && cleanIndianPhone(o.customerPhone) === cleanQPhone)
    );

    setSearchedOrder(found || null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {language === 'te' ? 'ఆర్డర్ పెండింగ్‌లో ఉంది' : 'Order Pending'}</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {language === 'te' ? 'ఆర్డర్ నిర్ధారించబడింది' : 'Order Confirmed'}</span>;
      case 'PROCESSING':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {language === 'te' ? 'ప్యాకింగ్ చేస్తున్నారు' : 'Packing & Preparing'}</span>;
      case 'READY':
        return <span className="bg-teal-100 text-teal-800 border border-teal-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {language === 'te' ? 'డెలివరీకి బయలుదేరింది' : 'Out for Delivery'}</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {language === 'te' ? 'డెలివరీ పూర్తయింది' : 'Order Delivered'}</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {language === 'te' ? 'ఆర్డర్ రద్దు చేయబడింది' : 'Order Cancelled'}</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="py-10 bg-[#fffcf7] min-h-[75vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fffcf7] border border-[#c99632]/40 text-xs font-bold text-[#c99632] shadow-xs">
            <Package className="w-3.5 h-3.5 text-[#c99632]" />
            <span>{t('tracker_badge')}</span>
          </div>
          <h2 className="text-3xl font-bold font-serif-luxury text-[#171717]">{t('tracker_title')}</h2>
          <p className="text-xs sm:text-sm text-[#666666]">
            {t('tracker_subtitle')}
          </p>
        </div>

        {/* LOGGED IN USER ORDER HISTORY (Automatic Display) */}
        {currentUser && (
          <div className="bg-white border border-[#c99632]/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c99632]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c99632]/20 border border-[#c99632] flex items-center justify-center text-lg font-bold text-[#c99632]">
                  {currentUser.avatar || '👤'}
                </div>
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-[#171717]">
                    {language === 'te' ? `${currentUser.name} గారి ఆర్డర్లు` : `Orders for ${currentUser.name}`}
                  </h3>
                  <p className="text-xs text-[#666666]">
                    📞 +91 {currentUser.phone} {currentUser.email && `• ${currentUser.email}`}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#fff3c4] border border-[#c99632]/40 text-[#c99632] text-xs font-bold self-start sm:self-auto">
                📦 {userOrders.length} {language === 'te' ? 'ఆర్డర్లు' : 'Orders Found'}
              </span>
            </div>

            {userOrders.length === 0 ? (
              <div className="py-8 text-center space-y-4 bg-[#faf8f5] rounded-2xl border border-dashed border-[#c99632]/30 p-6">
                <ShoppingBag className="w-12 h-12 text-[#c99632]/60 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-[#171717]">
                    {language === 'te' ? 'మీ ఖాతాలో ఇప్పటివరకు ఆర్డర్లు లేవు' : 'No orders placed yet with this account'}
                  </h4>
                  <p className="text-xs text-[#666666] mt-1 max-w-md mx-auto">
                    {language === 'te'
                      ? 'వాసవి ఫ్యాన్సీ స్టోర్‌లో మా సరికొత్త బ్యూటీ & ఫ్యాన్సీ కలెక్షన్స్ షాపింగ్ చేయండి!'
                      : 'Explore our latest fancy, cosmetics, and jewelry collections!'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white text-xs font-bold shadow-md hover:brightness-110 transition-all gold-glow"
                >
                  🛍️ {language === 'te' ? 'షాపింగ్ ప్రారంభించండి' : 'Start Shopping'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div
                    key={order.id || order.orderNumber}
                    className="p-5 rounded-2xl bg-[#faf8f5] border border-[#c99632]/25 hover:border-[#c99632] transition-all space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-black text-[#c99632]">
                            #{order.orderNumber || order.id}
                          </span>
                          <span className="text-[10px] text-[#888888]">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#171717] mt-0.5">
                          {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'} • ₹{order.totalAmount}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1.5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1 text-[#444444]">
                          <span className="font-medium">
                            • {getTranslatedProductName({ name: item.productName }, language) || item.productName} (x{item.quantity})
                          </span>
                          <span className="font-bold text-[#171717]">₹{item.subtotal || (item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                      <div className="text-[11px] font-semibold text-[#666666]">
                        <span>Payment: </span>
                        <strong className={order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}>
                          {order.paymentStatus === 'PAID' ? '💳 Online Paid (UPI)' : '💵 Cash on Delivery'}
                        </strong>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => generateInvoicePDF(order)}
                          className="py-1.5 px-3 rounded-lg bg-white border border-[#c99632]/40 text-[#171717] text-xs font-bold hover:bg-[#fff3c4]/50 flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#c99632]" />
                          <span>{language === 'te' ? 'బిల్లు డౌన్‌లోడ్' : 'Invoice'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSearchedOrder(order);
                            setHasSearched(true);
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }}
                          className="py-1.5 px-3 rounded-lg bg-[#c99632] text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5 transition-all shadow-2xs gold-glow"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{language === 'te' ? 'ట్రాకింగ్ వివరాలు' : 'Track Order'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* General Search Card */}
        <div className="bg-white border border-[#c99632]/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#c99632]" />
            <h3 className="font-serif-luxury text-sm sm:text-base font-bold text-[#171717]">
              {language === 'te' ? 'ఆర్డర్ నంబర్ ద్వారా వెతకండి' : 'Search & Track Any Order'}
            </h3>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tracker_placeholder')}
                className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm font-medium text-[#171717] placeholder-slate-400 focus:outline-none focus:border-[#c99632]"
              />
              <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs sm:text-sm shadow-md hover:brightness-110 transition-all gold-glow"
            >
              {t('tracker_btn')}
            </button>
          </form>
        </div>

        {/* Search Result */}
        {hasSearched && (
          <div>
            {!searchedOrder ? (
              <div className="bg-white border border-red-200 rounded-3xl p-8 text-center space-y-3 shadow-md animate-shake">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h4 className="text-base font-bold text-[#171717]">
                  {language === 'te' ? 'ఆర్డర్ కనుగొనబడలేదు' : 'Order Not Found'}
                </h4>
                <p className="text-xs text-[#666666] max-w-md mx-auto">
                  {language === 'te'
                    ? `"${searchQuery}" తో ఏ ఆర్డర్ మ్యాచ్ కాలేదు. దయచేసి సరైన ఆర్డర్ ID లేదా 10 అంకెల మొబైల్ నంబర్ నమోదు చేసి మళ్లీ ప్రయత్నించండి.`
                    : `No order record matched "${searchQuery}". Please verify your Order ID or phone number and try again.`}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#c99632]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-[#171717] animate-fadeIn">
                
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c99632]/20 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#c99632]">{language === 'te' ? 'ఆర్డర్ ట్రాకింగ్' : 'Order Tracking'}</span>
                    <h3 className="text-xl font-bold font-serif-luxury text-[#171717]">
                      #{searchedOrder.orderNumber || searchedOrder.id}
                    </h3>
                  </div>

                  <div>{getStatusBadge(searchedOrder.status)}</div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#faf8f5] p-4 rounded-2xl border border-[#c99632]/20">
                  <div>
                    <span className="text-[#666666] block">{language === 'te' ? 'కస్టమర్ పేరు:' : 'Customer Name:'}</span>
                    <strong className="text-[#171717] font-bold text-sm">{searchedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-[#666666] block">{language === 'te' ? 'మొబైల్ నంబర్:' : 'Contact Number:'}</span>
                    <strong className="text-[#171717] font-bold font-mono">📞 +91 {searchedOrder.customerPhone}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#666666] block">{language === 'te' ? 'డెలివరీ చిరునామా:' : 'Delivery Address:'}</span>
                    <strong className="text-[#171717] font-bold">{searchedOrder.customerAddress}</strong>
                  </div>
                </div>

                {/* Ordered Items Summary */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c99632]">{language === 'te' ? 'ఆర్డర్ చేసిన వస్తువులు:' : 'Items in Package:'}</h4>
                  <div className="space-y-2">
                    {searchedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#faf8f5] border border-slate-100">
                        <div>
                          <span className="font-bold text-[#171717]">{getTranslatedProductName({ name: item.productName }, language) || item.productName}</span>
                          <span className="text-[#666666] block text-[10px]">Qty: {item.quantity}</span>
                        </div>
                        <span className="font-bold text-[#c99632]">₹{item.subtotal || (item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Action */}
                <div className="pt-4 border-t border-[#c99632]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-[#666666]">{language === 'te' ? 'మొత్తం చెల్లించవలసిన మొత్తం:' : 'Total Payable Amount:'}</span>
                    <h3 className="text-2xl font-bold text-[#171717]">₹{searchedOrder.totalAmount}</h3>
                    <span className={`text-[10px] font-bold ${searchedOrder.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {searchedOrder.paymentStatus === 'PAID' ? '💳 ONLINE PAID' : '💵 CASH ON DELIVERY'}
                    </span>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => generateInvoicePDF(searchedOrder)}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white border border-[#c99632] text-[#171717] font-bold text-xs hover:bg-[#e8c7b5]/30 flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <FileText className="w-4 h-4 text-[#c99632]" />
                      <span>{language === 'te' ? 'బిల్లు ఇన్‌వాయిస్ డౌన్‌లోడ్' : 'Download Invoice PDF'}</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
