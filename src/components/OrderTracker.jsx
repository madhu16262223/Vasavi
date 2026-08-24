import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import { getTranslatedProductName } from '../utils/translations';
import { Package, Search, Clock, CheckCircle2, Truck, AlertCircle, PhoneCall, FileText } from 'lucide-react';

export const OrderTracker = () => {
  const { orders, storeInfo, t, language } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    const query = searchQuery.trim().toLowerCase();
    
    const found = orders.find(
      (o) =>
        (o.orderNumber && o.orderNumber.toLowerCase().includes(query)) ||
        (o.id && o.id.toLowerCase().includes(query)) ||
        (o.customerPhone && String(o.customerPhone).includes(query))
    );

    setSearchedOrder(found || null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {language === 'te' ? 'ఆర్డర్ పెండింగ్‌లో ఉంది' : 'Order Pending Confirmation'}</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {language === 'te' ? 'ఆర్డర్ నిర్ధారించబడింది' : 'Order Confirmed'}</span>;
      case 'PROCESSING':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {language === 'te' ? 'ప్యాకింగ్ చేస్తున్నారు' : 'Packing & Preparing'}</span>;
      case 'READY':
        return <span className="bg-teal-100 text-teal-800 border border-teal-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {language === 'te' ? 'డెలివరీకి బయలుదేరింది' : 'Out for Delivery'}</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {language === 'te' ? 'డెలివరీ పూర్తయింది' : 'Order Delivered & Completed'}</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {language === 'te' ? 'ఆర్డర్ రద్దు చేయబడింది' : 'Order Cancelled'}</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="py-12 bg-[#fffcf7] min-h-[75vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fffcf7] border border-[#c99632]/40 text-xs font-bold text-[#c99632] shadow-xs">
            <Package className="w-3.5 h-3.5 text-[#c99632]" />
            <span>{t('tracker_badge')}</span>
          </div>
          <h2 className="text-3xl font-bold font-serif-luxury text-[#171717]">{t('tracker_title')}</h2>
          <p className="text-xs sm:text-sm text-[#666666]">
            {t('tracker_subtitle')}
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white border border-[#c99632]/30 rounded-3xl p-6 shadow-xl mb-8">
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
              <div className="bg-white border border-red-200 rounded-3xl p-8 text-center space-y-3 shadow-md">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h4 className="text-base font-bold text-[#171717]">
                  {language === 'te' ? 'ఆర్డర్ కనుగొనబడలేదు' : 'Order Not Found'}
                </h4>
                <p className="text-xs text-[#666666] max-w-md mx-auto">
                  {language === 'te'
                    ? `"${searchQuery}" తో ఏ ఆర్డర్ మ్యాచ్ కాలేదు. దయచేసి సరైన ఆర్డర్ ID లేదా ఫోన్ నంబర్ నమోదు చేసి మళ్లీ ప్రయత్నించండి.`
                    : `No order record matched "${searchQuery}". Please verify your Order ID or phone number and try again.`}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#c99632]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-[#171717]">
                
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c99632]/20 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#c99632]">{language === 'te' ? 'ఆర్డర్ ట్రాకింగ్' : 'Order Tracking'}</span>
                    <h3 className="text-xl font-bold font-serif-luxury text-[#171717]">
                      #{searchedOrder.orderNumber}
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
                    <strong className="text-[#171717] font-bold">{searchedOrder.customerPhone}</strong>
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
                        <span className="font-bold text-[#c99632]">₹{item.subtotal}</span>
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
                      <span>{language === 'te' ? 'బిల్లు ఇన్‌వాయిస్ డౌన్‌లోడ్ చేయండి' : 'Download Bill Invoice'}</span>
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
