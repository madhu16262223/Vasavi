import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle, X, Send, Sparkles, MapPin, Truck, Award, ShieldCheck, ChevronRight } from 'lucide-react';

export const WhatsAppWidget = () => {
  const { storeInfo, language } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const waNumber = storeInfo?.whatsappNumber || '918309917665';

  const quickActions = [
    {
      icon: '✨',
      label: language === 'te' ? 'బ్రైడల్ బ్యాంగిల్స్ & జ్యువెలరీ స్టాక్ చూడండి' : 'Check Bridal Bangles & Jewellery Stock',
      msg: 'Hello Ramcharan Garu! I want to check bridal bangles and gold jewellery collections.'
    },
    {
      icon: '🚚',
      label: language === 'te' ? 'నా ఆర్డర్ డెలివరీ స్టేటస్ తెలుసుకోండి' : 'Track My Order Delivery Status',
      msg: 'Hello! Could you please update me on my order delivery status in Nandyal?'
    },
    {
      icon: '📍',
      label: language === 'te' ? 'షాప్ లొకేషన్ & గూగుల్ మ్యాప్స్' : 'Store Location & Timings in Nandyal',
      msg: 'Hello! Where is Vasavi Fancy Store located in Nandyal, and what are your opening timings?'
    },
    {
      icon: '👑',
      label: language === 'te' ? 'ఓనర్ చరణ్ గారితో నేరుగా మాట్లాడండి' : 'Direct Chat with Store Owner',
      msg: 'Hello Ramcharan Garu! I have a question about shopping at your store.'
    }
  ];

  const handleSendWhatsApp = (text) => {
    const message = text || customMsg || 'Hello Vasavi Fancy Store!';
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Concierge Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white border border-[#c99632]/40 rounded-3xl shadow-2xl overflow-hidden text-[#171717] animate-slideInUp">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#171717] to-[#2a2a2a] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#c99632] flex items-center justify-center text-lg font-bold text-white shadow-md">
                  👑
                </div>
                <span className="w-3 h-3 bg-emerald-500 rounded-full absolute bottom-0 right-0 border-2 border-black" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-serif-luxury text-[#fff8ed]">Vasavi Store VIP Help</h4>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  ● Online • Nandyal, AP
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 bg-[#faf8f5] space-y-3">
            <div className="p-3 bg-white rounded-2xl border border-[#c99632]/20 text-xs text-[#555555] leading-relaxed shadow-2xs">
              🙏 <b>Namaste!</b> Welcome to Vasavi Fancy Store. How can Ramcharan Garu assist you today?
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c99632]">
                Instant Quick Inquiries:
              </span>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendWhatsApp(action.msg)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#c99632]/20 hover:border-[#c99632] hover:bg-[#fffcf7] text-left text-xs font-bold text-[#171717] flex items-center justify-between shadow-2xs transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span>{action.icon}</span>
                    <span className="text-[11px]">{action.label}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#c99632]" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customMsg.trim()) handleSendWhatsApp(customMsg);
              }}
              className="flex gap-1.5 pt-1"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="flex-1 bg-white border border-[#c99632]/30 rounded-xl px-3 py-2 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="p-2 bg-white text-center text-[10px] text-[#888888] font-medium border-t border-[#c99632]/15">
            Instant Reply on WhatsApp • +91 83099 17665
          </div>

        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-4 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-2xl hover:scale-105 transition-all flex items-center justify-center border-2 border-white gold-glow"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white text-[9px] font-bold text-white items-center justify-center">1</span>
        </span>
      </button>

    </div>
  );
};
