import React from 'react';
import { useStore } from '../context/StoreContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import { CheckCircle2, MessageCircle, Package, Copy, X, FileText, ShieldCheck, CreditCard } from 'lucide-react';

export const OrderConfirmationModal = () => {
  const { isOrderConfirmedModal, setIsOrderConfirmedModal, lastPlacedOrder, setActiveTab, storeInfo } = useStore();

  if (!isOrderConfirmedModal || !lastPlacedOrder) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(lastPlacedOrder.orderNumber);
    alert(`Order ID ${lastPlacedOrder.orderNumber} copied to clipboard!`);
  };

  const isPaidOnline = lastPlacedOrder.paymentMethod === 'ONLINE_UPI' || lastPlacedOrder.paymentStatus === 'PAID';
  const paymentId = lastPlacedOrder.paymentId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#fffcf7] border border-[#c99632]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 text-[#171717]">
        
        <button
          onClick={() => setIsOrderConfirmedModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-[#666666] hover:text-[#171717] hover:bg-[#e8c7b5]/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 gold-glow shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> ORDER CONFIRMED & SERVER VERIFIED
          </span>
          <h2 className="text-2xl font-bold font-serif-luxury text-[#171717] mt-1">Order #{lastPlacedOrder.orderNumber}</h2>
          <p className="text-xs text-[#666666] mt-2 font-medium">
            Thank you, {lastPlacedOrder.customerName}! Your order has been recorded and will be processed immediately.
          </p>
        </div>

        {/* Payment & Order Details Card */}
        <div className="bg-white p-4 rounded-2xl border border-[#c99632]/30 text-left space-y-2 text-xs shadow-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[#c99632]/20">
            <span className="text-[#666666] font-semibold">Order Method:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
              lastPlacedOrder.paymentMethod === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {lastPlacedOrder.paymentMethod === 'WHATSAPP' ? '💬 WHATSAPP ORDER' : '💵 CASH ON DELIVERY'}
            </span>
          </div>

          <div className="flex justify-between text-[#666666]">
            <span>Payment Method:</span>
            <span className="text-[#171717] font-bold">
              {lastPlacedOrder.paymentMethod === 'WHATSAPP' ? 'WhatsApp Order & UPI Pay' : 'Pay Cash on Delivery'}
            </span>
          </div>

          {isPaidOnline && (
            <div className="flex justify-between text-[#666666]">
              <span>Transaction Ref ID:</span>
              <span className="text-[#c99632] font-mono font-bold">{paymentId}</span>
            </div>
          )}

          <div className="flex justify-between text-[#666666]">
            <span>Customer Name:</span>
            <span className="text-[#171717] font-bold">{lastPlacedOrder.customerName}</span>
          </div>
          <div className="flex justify-between text-[#666666]">
            <span>Phone Number:</span>
            <span className="text-[#171717] font-bold">{lastPlacedOrder.customerPhone}</span>
          </div>
          <div className="flex justify-between text-[#666666]">
            <span>Delivery Address:</span>
            <span className="text-[#171717] font-bold truncate max-w-[200px]">{lastPlacedOrder.customerAddress}</span>
          </div>
          <div className="flex justify-between text-[#666666] border-t border-[#c99632]/20 pt-2 font-bold text-sm">
            <span>Amount Paid:</span>
            <span className="text-[#c99632] text-base">₹{lastPlacedOrder.totalAmount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => generateInvoicePDF(lastPlacedOrder)}
            className="w-full py-3 px-4 rounded-xl bg-white border border-[#c99632]/40 text-[#171717] hover:bg-[#e8c7b5]/30 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <FileText className="w-4 h-4 text-[#c99632]" />
            <span>Download Official PDF Bill Invoice</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyOrderId}
              className="py-3 px-3 rounded-xl bg-white border border-slate-200 text-[#171717] font-semibold text-xs flex items-center justify-center gap-1 hover:bg-slate-50 transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-[#c99632]" /> Copy Order ID
            </button>

            <button
              onClick={() => {
                setIsOrderConfirmedModal(false);
                setActiveTab('track');
              }}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md hover:brightness-110 transition-all"
            >
              <Package className="w-3.5 h-3.5" /> Track Order Status
            </button>
          </div>

          <a
            href={`https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(`Hello Vasavi Fancy Store, my Order ID is ${lastPlacedOrder.orderNumber}!`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-all block mt-2"
          >
            <MessageCircle className="w-4 h-4" /> Send Confirmation on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
};
