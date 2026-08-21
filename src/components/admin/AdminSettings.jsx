import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Settings, Save, CheckCircle, Phone, MessageCircle, Truck, Megaphone } from 'lucide-react';

export const AdminSettings = () => {
  const { storeSettings, updateStoreSettings, resetStoreToCleanState } = useStore();

  const [whatsappNumber, setWhatsappNumber] = useState(storeSettings.whatsappNumber || '918309917665');
  const [displayPhone, setDisplayPhone] = useState(storeSettings.displayPhone || '+91 83099 17665');
  const [deliveryFee, setDeliveryFee] = useState(storeSettings.deliveryFee || 0);
  const [announcementBanner, setAnnouncementBanner] = useState(
    storeSettings.announcementBanner || 'Order directly on WhatsApp — Instant Confirmation & Delivery in Nandyal!'
  );
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateStoreSettings({
      whatsappNumber,
      displayPhone,
      deliveryFee: Number(deliveryFee),
      announcementBanner
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl bg-white border border-[#c99632]/25 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-[#171717]">
      
      <div className="flex items-center gap-3 pb-4 border-b border-[#c99632]/20">
        <div className="p-3 rounded-2xl bg-[#c99632]/10 text-[#c99632]">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-serif-luxury text-[#171717]">Store Configuration & Settings</h3>
          <p className="text-xs text-[#666666]">Manage WhatsApp order recipient (Ramcharan), delivery charges, and store notices.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Store settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
        
        <div>
          <label className="block text-[#171717] font-bold mb-1 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Store WhatsApp Order Number (Country Code + 10 Digits) *</span>
          </label>
          <input
            type="text"
            required
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="918309917665"
            className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-3 text-[#171717] font-medium focus:outline-none focus:border-[#c99632]"
          />
          <p className="text-[11px] text-[#666666] mt-1">This is Ramcharan's WhatsApp number that receives all customer order notifications.</p>
        </div>

        <div>
          <label className="block text-[#171717] font-bold mb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>Display Contact Phone Number *</span>
          </label>
          <input
            type="text"
            required
            value={displayPhone}
            onChange={(e) => setDisplayPhone(e.target.value)}
            placeholder="+91 83099 17665"
            className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-3 text-[#171717] font-medium focus:outline-none focus:border-[#c99632]"
          />
        </div>

        <div>
          <label className="block text-[#171717] font-bold mb-1 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#e88a9a]" />
            <span>Delivery Fee (₹)</span>
          </label>
          <input
            type="number"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            placeholder="0"
            className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-3 text-[#171717] font-medium focus:outline-none focus:border-[#c99632]"
          />
          <p className="text-[11px] text-[#666666] mt-1">Set to 0 for Free Local Delivery in Nandyal.</p>
        </div>

        <div>
          <label className="block text-[#171717] font-bold mb-1 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-amber-600" />
            <span>Top Header Announcement Banner Text</span>
          </label>
          <textarea
            rows={2}
            value={announcementBanner}
            onChange={(e) => setAnnouncementBanner(e.target.value)}
            className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-3 text-[#171717] font-medium focus:outline-none focus:border-[#c99632] resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:brightness-110 gold-glow"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>

      </form>

      {/* FRESH CLIENT HANDOVER & DEMO DATA RESET CARD */}
      <div className="pt-6 border-t border-red-200 space-y-3">
        <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
          <span className="text-lg">🧹</span>
          <h4>Store Client Handover & Data Reset</h4>
        </div>
        <p className="text-xs text-[#666666]">
          Clicking this button will clear all test/demo orders, offline sales entries, test reviews, and cart state so that Ramcharan receives a 100% fresh, clean production store ready for real customer orders.
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Are you sure you want to clear all demo orders, products and offline sales entries to give the client a fresh clean store?")) {
              resetStoreToCleanState();
              window.location.reload();
            }
          }}
          className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          ✨ Clear All Demo Orders & Sales (Fresh Slate for Client)
        </button>
      </div>

    </div>
  );
};
