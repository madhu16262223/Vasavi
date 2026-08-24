import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ChevronRight } from 'lucide-react';

export const CategoryGrid = () => {
  const { products, categories, activeCategory, setActiveCategory, setActiveTab, t, language } = useStore();

  const handleCategorySelect = (slug) => {
    setActiveCategory(slug);
    const catalogElement = document.getElementById('catalog-section');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getTranslatedCatName = (cat) => {
    if (language !== 'te') return cat.name;
    const nameLower = (cat.name || '').toLowerCase();
    if (nameLower.includes('cosmetic')) return t('cat_cosmetics');
    if (nameLower.includes('jewel')) return t('cat_jewellery');
    if (nameLower.includes('bangle')) return t('cat_bangles');
    if (nameLower.includes('bag')) return t('cat_handbags');
    if (nameLower.includes('hair')) return t('cat_hair');
    if (nameLower.includes('rakhi')) return t('cat_rakhis');
    return cat.name;
  };

  return (
    <section className="py-12 bg-[#fffcf7] border-t border-b border-[#c99632]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#e88a9a] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#c99632]" />
              <span>{t('cat_explore')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-[#171717]">
              {t('cat_shop_by')} <span className="gold-gradient-text">{t('cat_highlight')}</span>
            </h2>
          </div>
          <button
            onClick={() => handleCategorySelect('all')}
            className="text-xs text-[#c99632] hover:text-[#a6751d] font-bold flex items-center gap-1 mt-2 md:mt-0 transition-colors"
          >
            <span>{t('cat_view_all')} ({categories.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            const catName = getTranslatedCatName(cat);
            return (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-[#c99632] gold-glow' : 'hover:border-[#c99632]'
                } bg-white border border-[#c99632]/30 shadow-md hover:shadow-xl`}
              >
                {/* Category Image */}
                <div className="relative h-36 sm:h-40 overflow-hidden bg-[#faf8f5]">
                  <img
                    src={cat.image || cat.imageUrl || '/bangles.jpg'}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/bangles.jpg';
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/80 via-[#171717]/20 to-transparent" />

                  <span className="absolute top-2 right-2 bg-white/95 backdrop-blur-md text-[#171717] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-[#c99632]/30">
                    {products.filter(p => p.categoryId === cat.id || p.categoryName === cat.name).length} items
                  </span>
                </div>

                {/* Info */}
                <div className="p-3 text-center bg-white border-t border-[#c99632]/10">
                  <h3 className="text-xs font-bold text-[#171717] group-hover:text-[#c99632] transition-colors">
                    {catName}
                  </h3>
                  <p className="text-[10px] text-[#666666]">
                    {language === 'te' ? 'కలెక్షన్ చూడండి' : 'Explore collection'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
