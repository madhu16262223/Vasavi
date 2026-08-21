import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, Award, Truck, ShieldCheck, Headphones } from 'lucide-react';
import { HeroFrameAnimation } from './HeroFrameAnimation';

export const HeroSection = () => {
  const { setActiveTab } = useStore();

  return (
    <section className="relative overflow-hidden py-4 sm:py-6 lg:py-8 min-h-[calc(100vh-80px)] flex flex-col justify-between bg-[#fffcf7]">
      {/* Subtle Warm Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#c99632]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-5 w-[500px] h-[500px] bg-[#e8c7b5]/25 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center w-full">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            
            <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-bold font-serif-luxury text-[#171717] tracking-tight leading-[1.12]">
              BEAUTY THAT <br />
              <span className="gold-gradient-text">DEFINES YOU ✨</span>
            </h1>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center lg:justify-start gap-2 py-1">
              <div className="h-[1px] w-12 bg-[#c99632]" />
              <Sparkles className="w-4 h-4 text-[#c99632]" />
              <div className="h-[1px] w-12 bg-[#c99632]" />
            </div>

            {/* Stylish Attractive Description with Feature Badges */}
            <div className="space-y-3 pt-1">
              <p className="text-xs sm:text-sm text-[#444444] font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                Discover Nandyal’s finest luxury beauty collection. Handpicked authentic <strong className="text-[#171717] font-bold">Temple Jewellery</strong>, <strong className="text-[#171717] font-bold">Matte Lipsticks</strong>, <strong className="text-[#171717] font-bold">Designer Handbags</strong> & <strong className="text-[#171717] font-bold">Bridal Accessories</strong>.
              </p>

              {/* Interactive Category Badges Pill */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-1">
                <span className="text-[10px] font-bold bg-[#fff8ed] text-[#c99632] border border-[#c99632]/30 px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1">
                  ✨ Temple Jewellery
                </span>
                <span className="text-[10px] font-bold bg-[#fff0f2] text-[#e88a9a] border border-[#e88a9a]/30 px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1">
                  💄 Matte Lipsticks
                </span>
                <span className="text-[10px] font-bold bg-[#f0f9ff] text-sky-700 border border-sky-300/40 px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1">
                  👜 Designer Bags
                </span>
                <span className="text-[10px] font-bold bg-[#f6f5ff] text-purple-700 border border-purple-300/40 px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1">
                  👑 Bridal Combs
                </span>
              </div>

              {/* Order Options Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300/50 text-[11px] font-bold text-emerald-800 shadow-2xs">
                <span>💬 Easy WhatsApp Order & 💵 Cash on Delivery (COD)</span>
              </div>
            </div>

            {/* Sleek, Compact & Attractive Gold Capsule Button */}
            <div className="flex items-center justify-center lg:justify-start pt-3">
              <button
                onClick={() => {
                  const catalogElement = document.getElementById('catalog-section');
                  if (catalogElement) {
                    catalogElement.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveTab('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="group relative inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#c99632] to-[#a6751d] text-white font-black text-xs sm:text-sm tracking-[0.12em] uppercase shadow-lg shadow-[#c99632]/30 hover:shadow-[#c99632]/50 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden border border-[#ffe094]/40"
              >
                {/* Shimmer Light Effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <Sparkles className="w-3.5 h-3.5 text-[#fff3c4] animate-pulse" />
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Hero Right Visual Showcase */}
          <div className="lg:col-span-7 relative w-full flex items-center justify-center">
            <HeroFrameAnimation totalFrames={444} fps={24} />
          </div>

        </div>
      </div>

      {/* Trust Badges Row (Extending Left to Right across bottom, exactly matching Image 2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 pb-2 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
          
          <div className="bg-[#f9f6f0] p-3.5 sm:p-4 rounded-2xl border border-[#c99632]/25 shadow-xs flex flex-col items-start justify-center space-y-1">
            <Award className="w-5 h-5 text-[#c99632]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#171717]">100% Quality</h4>
            <p className="text-[10px] sm:text-xs text-[#666666] font-medium">Handpicked items</p>
          </div>

          <div className="bg-[#f9f6f0] p-3.5 sm:p-4 rounded-2xl border border-[#c99632]/25 shadow-xs flex flex-col items-start justify-center space-y-1">
            <Truck className="w-5 h-5 text-[#e88a9a]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#171717]">Fast Delivery</h4>
            <p className="text-[10px] sm:text-xs text-[#666666] font-medium">Same-day Nandyal</p>
          </div>

          <div className="bg-[#f9f6f0] p-3.5 sm:p-4 rounded-2xl border border-[#c99632]/25 shadow-xs flex flex-col items-start justify-center space-y-1">
            <Headphones className="w-5 h-5 text-[#c99632]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#171717]">Easy Orders</h4>
            <p className="text-[10px] sm:text-xs text-[#666666] font-medium">WhatsApp & COD</p>
          </div>

          <div className="bg-[#f9f6f0] p-3.5 sm:p-4 rounded-2xl border border-[#c99632]/25 shadow-xs flex flex-col items-start justify-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-[#c99632]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#171717]">Secure Shopping</h4>
            <p className="text-[10px] sm:text-xs text-[#666666] font-medium">Your data is safe</p>
          </div>

        </div>
      </div>
    </section>
  );
};
