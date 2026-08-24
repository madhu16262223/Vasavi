import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, MapPin, Phone, Clock, CreditCard, Heart, Shield } from 'lucide-react';

export const Footer = () => {
  const { storeInfo, setActiveTab, t, language } = useStore();

  return (
    <footer className="bg-white border-t border-[#c99632]/30 pt-12 pb-8 text-[#555555] text-xs shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* INTERACTIVE STORE LOCATION GOOGLE MAPS SECTION */}
        <div className="bg-[#faf8f5] border border-[#c99632]/30 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Store Location Details */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff3c4] border border-[#c99632]/40 text-[#c99632] font-bold text-[11px] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#c99632]" /> {language === 'te' ? 'స్టోర్ లొకేషన్ & చిరునామా' : 'Physical Store Location'}
              </div>

              <h3 className="font-serif-luxury text-2xl font-bold text-[#171717]">
                {language === 'te' ? 'నంద్యాల వాసవి ఫ్యాన్సీ స్టోర్‌ను సందర్శించండి 📍' : 'Visit Vasavi Fancy Store in Nandyal 📍'}
              </h3>

              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                {language === 'te' ? 'మా టెంపుల్ జ్యువెలరీ, మ్యాట్ కాస్మెటిక్స్ మరియు బ్రైడల్ హ్యాండ్‌బ్యాగ్‌ల అద్భుతమైన కలెక్షన్‌ను నేరుగా వచ్చి పరిశీలించండి.' : 'Experience our exquisite collection of Temple Jewellery, Matte Cosmetics, and Bridal Handbags in person.'}
              </p>

              <div className="space-y-2.5 text-xs text-[#171717] font-medium pt-1">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-[#c99632]/30 text-[#c99632] shrink-0 mt-0.5 shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-[#171717]">{language === 'te' ? 'చిరునామా:' : 'Address:'}</strong>
                    <span className="text-[#555555]">{language === 'te' ? (storeInfo.address_te || t('footer_address')) : storeInfo.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-[#c99632]/30 text-[#c99632] shrink-0 shadow-xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-[#171717]">{language === 'te' ? 'ఫోన్ / వాట్సాప్:' : 'Store Phone / WhatsApp:'}</strong>
                    <span className="text-[#555555]">{storeInfo.displayPhone || storeInfo.phone} ({language === 'te' ? 'రామ్‌చరణ్ గారు' : storeInfo.owner})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-600 shrink-0 shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-[#171717]">{language === 'te' ? 'సమయాలు:' : 'Store Timings:'}</strong>
                    <span className="text-emerald-700 font-semibold">{language === 'te' ? 'సోమ - శని: ఉదయం 9:00 - రాత్రి 9:30 | ఆదివారం: ఉదయం 10:00 - సాయంత్రం 4:00' : 'Mon - Sat: 9:00 AM - 9:30 PM | Sun: 10:00 AM - 4:00 PM'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=NK+Rd+Nadigadda+Telugu+peta+Nandyal+Andhra+Pradesh+518501"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 gold-glow transition-all"
                >
                  <MapPin className="w-4 h-4" /> {language === 'te' ? 'గూగుల్ మ్యాప్స్‌లో చూడండి' : 'Open in Google Maps'}
                </a>

                <a
                  href={`https://wa.me/${storeInfo.rawPhone || '918309917665'}?text=Hi%20Ramcharan%20garu,%20I%20want%20to%20visit%20Vasavi%20Fancy%20Store%20Nandyal.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 flex items-center gap-1.5 transition-all"
                >
                  📲 {language === 'te' ? 'ఓనర్ రామ్‌చరణ్ గారితో చాట్ చేయండి' : 'WhatsApp Shop Owner'}
                </a>
              </div>
            </div>

            {/* Right Google Maps Iframe */}
            <div className="lg:col-span-7 h-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#c99632]/40 shadow-md relative bg-white">
              <iframe
                title="Vasavi Fancy Store Location Map"
                src="https://maps.google.com/maps?q=NK%20Rd%2C%20Nadigadda%2C%20Telugu%20peta%2C%20Nandyal%2C%20Andhra%20Pradesh%20518501&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Store Brand Info */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury font-bold text-base text-[#171717]">{language === 'te' ? 'వాసవి ఫ్యాన్సీ స్టోర్' : 'Vasavi Fancy Store'}</h4>
            <p className="leading-relaxed text-[#555555]">
              {t('footer_tagline')}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#171717] uppercase text-xs tracking-wider text-[#c99632]">{t('footer_quick_links')}</h4>
            <ul className="space-y-2 font-medium">
              <li>
                <button onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#c99632] transition-colors">
                  {t('nav_home')}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('shop'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#c99632] transition-colors">
                  {t('nav_shop')}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('track'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#c99632] transition-colors">
                  {t('nav_track')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#171717] uppercase text-xs tracking-wider text-[#c99632]">{t('footer_categories')}</h4>
            <ul className="space-y-2 font-medium">
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#c99632]" /> {t('cat_cosmetics')}</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#c99632]" /> {t('cat_jewellery')}</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#c99632]" /> {t('cat_bangles')}</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#c99632]" /> {t('cat_handbags')}</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#c99632]" /> {t('cat_hair')}</li>
            </ul>
          </div>

          {/* Col 4: Visit Store (Nandyal Location) */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#171717] uppercase text-xs tracking-wider text-[#c99632]">{t('footer_store_info')}</h4>
            <div className="space-y-2.5 font-medium text-[#444444]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#e88a9a] shrink-0 mt-0.5" />
                <span className="leading-snug">{language === 'te' ? (storeInfo.address_te || t('footer_address')) : storeInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#c99632] shrink-0" />
                <span>{storeInfo.displayPhone || storeInfo.phone}</span>
              </div>
              <div className="flex items-start gap-2 pt-0.5">
                <Clock className="w-4 h-4 text-[#c99632] shrink-0 mt-0.5" />
                <div className="flex flex-col text-xs leading-snug">
                  <span className="font-semibold text-[#171717]">{language === 'te' ? 'సోమ - శని: ఉదయం 9:00 - రాత్రి 9:30' : 'Mon - Sat: 9:00 AM - 9:30 PM'}</span>
                  <span className="font-semibold text-[#171717]">{language === 'te' ? 'ఆదివారం: ఉదయం 10:00 - సాయంత్రం 4:00' : 'Sunday: 10:00 AM - 4:00 PM'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Developer Credits */}
        <div className="border-t border-[#c99632]/20 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#666666] font-medium gap-3">
          <p
            onClick={() => { setActiveTab('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="cursor-pointer hover:text-[#c99632] transition-colors"
            title="Owner Portal Access"
          >
            © {new Date().getFullYear()} Vasavi Fancy Store, Nandyal. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-center md:text-right">
            <span className="text-[#666666]">
              Designed & Developed by <strong className="text-[#c99632]">K. Madhu</strong>
            </span>
            <span className="hidden sm:inline text-[#cccccc]">•</span>
            <a
              href={`https://wa.me/${storeInfo.developer?.rawPhone || '919704381790'}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#555555] hover:text-[#c99632] transition-colors font-semibold"
            >
              📞 {storeInfo.developer?.phone || '+91 97043 81790'}
            </a>
            <span className="hidden sm:inline text-[#cccccc]">•</span>
            <a
              href={`mailto:${storeInfo.developer?.email || 'gurumadhukgm@gmail.com'}`}
              className="text-[#555555] hover:text-[#c99632] transition-colors font-semibold"
            >
              ✉️ {storeInfo.developer?.email || 'gurumadhukgm@gmail.com'}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
