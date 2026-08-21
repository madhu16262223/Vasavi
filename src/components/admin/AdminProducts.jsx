import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Edit2, Trash2, Search, Sparkles, Check, X, AlertCircle } from 'lucide-react';

export const AdminProducts = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    price: '',
    originalPrice: '',
    stock: '15',
    image: '',
    description: '',
    shade: '',
    brand: 'Vasavi Collection',
    isTrending: false,
    isBestSeller: false
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory || p.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || 'Cosmetics',
      price: '',
      originalPrice: '',
      stock: '15',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      description: '',
      shade: '',
      brand: 'Vasavi Collection',
      isTrending: false,
      isBestSeller: false
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId || '',
      categoryName: product.categoryName || '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      stock: product.stock,
      image: product.image,
      description: product.description || '',
      shade: product.shade || '',
      brand: product.brand || 'Vasavi Collection',
      isTrending: product.isTrending || false,
      isBestSeller: product.isBestSeller || false
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const catObj = categories.find((c) => c.id === formData.categoryId) || categories[0];
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      stock: parseInt(formData.stock, 10),
      categoryName: catObj?.name || formData.categoryName
    };

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...payload });
      setEditingProduct(null);
    } else {
      addProduct(payload);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#c99632]/25 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-[#171717] placeholder-slate-400 focus:outline-none focus:border-[#c99632]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#faf8f5] border border-[#c99632]/30 rounded-xl py-2 px-3 text-xs font-bold text-[#171717] focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#faf8f5] p-1 rounded-xl border border-[#c99632]/30 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              🎴 Grid Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              📋 Table List
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-sm hover:brightness-110 flex items-center justify-center gap-1.5 transition-all gold-glow shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* COMPACT GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-[#c99632]/25 p-2.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
              <div className="space-y-1.5">
                <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden bg-[#faf8f5]">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
                    {p.isTrending && <span className="bg-[#e88a9a] text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">Trending</span>}
                    {p.isBestSeller && <span className="bg-[#c99632] text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">Bestseller</span>}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-[#c99632] block truncate">{p.categoryName}</span>
                  <h4 className="text-[11px] font-bold text-[#171717] line-clamp-1 leading-tight" title={p.name}>{p.name}</h4>
                  <div className="flex items-baseline justify-between mt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-[#171717]">₹{p.price}</span>
                      {p.originalPrice && <span className="text-[9px] text-slate-400 line-through">₹{p.originalPrice}</span>}
                    </div>
                    <span className={`text-[9px] font-bold ${p.stock <= 5 ? 'text-red-600 bg-red-50 px-1 rounded' : 'text-emerald-700'}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-2 mt-2 border-t border-[#c99632]/15">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="py-1 px-1.5 rounded-lg bg-[#faf8f5] border border-slate-200 text-[#171717] hover:bg-[#fff3c4] text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3 h-3 text-[#c99632]" /> Edit
                </button>
                <button
                  onClick={() => setDeletingProductId(p.id)}
                  className="py-1 px-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPACT TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#c99632]/25 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf8f5] border-b border-[#c99632]/20 text-[#666666] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">Product Name & Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c99632]/15 text-[#171717]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fffcf7] transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#faf8f5] border border-[#c99632]/30 shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <h4 className="font-bold text-[#171717]">{p.name}</h4>
                      <p className="text-[10px] text-[#666666]">{p.brand || 'Vasavi Collection'} {p.shade ? `• ${p.shade}` : ''}</p>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="bg-[#fff3c4] text-[#c99632] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#c99632]/30">
                        {p.categoryName}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#171717]">
                      ₹{p.price}
                      {p.originalPrice && <span className="text-[10px] text-slate-400 font-normal line-through ml-1.5">₹{p.originalPrice}</span>}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock <= 5 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {p.stock <= 5 ? `⚠️ Low Stock (${p.stock})` : `In Stock (${p.stock})`}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1 rounded-lg bg-[#faf8f5] border border-slate-200 text-[#171717] hover:bg-[#fff3c4] text-[11px] font-bold flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3 text-[#c99632]" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingProductId(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal (A to Z Complete Rich Product Editor) */}
      {(isAddModalOpen || editingProduct) && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) { setIsAddModalOpen(false); setEditingProduct(null); } }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-[#c99632]/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-[#171717] my-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#c99632]/20 pb-3">
              <div>
                <h3 className="text-lg font-bold font-serif-luxury text-[#171717] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#c99632]" />
                  <span>{editingProduct ? 'Edit Store Product (A to Z Settings)' : 'Add New Product (A to Z Settings)'}</span>
                </h3>
                <p className="text-xs text-[#666666]">Configure complete product attributes, pricing, stock, badges, and image links.</p>
              </div>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                className="p-1.5 rounded-full bg-[#faf8f5] text-slate-400 hover:text-[#171717] hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Row 1: Product Title & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1 text-[#171717]">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                    placeholder="e.g. 24K Gold Plated Antique Temple Necklace Set"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                    placeholder="e.g. Vasavi Heritage"
                  />
                </div>
              </div>

              {/* Row 2: Category, Shade/Variant, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setFormData({ ...formData, categoryId: e.target.value, categoryName: cat?.name || '' });
                    }}
                    className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-bold text-[#171717] focus:outline-none focus:border-[#c99632]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Shade / Variant / Size</label>
                  <input
                    type="text"
                    value={formData.shade}
                    onChange={(e) => setFormData({ ...formData, shade: e.target.value })}
                    className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                    placeholder="e.g. Velvet Rose Red / 24K Gold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-bold text-[#171717] focus:outline-none focus:border-[#c99632]"
                  />
                </div>
              </div>

              {/* Row 3: Pricing & Instant Discount Calculator */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[#faf8f5] border border-[#c99632]/20">
                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white border border-[#c99632]/40 rounded-xl p-2.5 font-bold text-[#171717] text-sm focus:outline-none focus:border-[#c99632]"
                    placeholder="e.g. 1899"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#171717]">Original MRP Price (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full bg-white border border-[#c99632]/40 rounded-xl p-2.5 font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                    placeholder="e.g. 2499"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="font-bold text-[#666666]">Calculated Discount:</span>
                  {formData.price && formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full w-fit mt-1">
                      SAVE {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% OFF
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 mt-1">Regular Price (No discount badge)</span>
                  )}
                </div>
              </div>

              {/* Row 4: Image URL & Direct Device Upload & Sample Presets */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-[#faf8f5] border border-[#c99632]/25">
                <label className="block font-bold text-[#171717] text-xs">Product Image (Choose 1 of 3 Options below) *</label>

                {/* Direct File Upload vs Image URL Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Method A: Device File Upload */}
                  <div className="p-3 bg-white rounded-xl border border-[#c99632]/30 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-[#c99632] block text-[11px]">OPTION A: Upload Photo from Phone / PC</span>
                      <p className="text-[10px] text-[#666666]">Select any photo directly from your mobile gallery or computer files.</p>
                    </div>
                    <label className="cursor-pointer py-2 px-3 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs shadow-xs hover:brightness-110 flex items-center justify-center gap-1.5 gold-glow transition-all">
                      <span>📁 Choose Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Method B: Web URL Input */}
                  <div className="p-3 bg-white rounded-xl border border-[#c99632]/30 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-[#c99632] block text-[11px]">OPTION B: Paste Web Image Link (Google/Unsplash)</span>
                      <p className="text-[10px] text-[#666666]">Paste direct image URL from Google Images or photo link.</p>
                    </div>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2 font-mono text-[11px] text-[#171717] focus:outline-none focus:border-[#c99632]"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                </div>

                {/* Live Thumbnail Preview & Sample Presets */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#c99632]/20">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[10px] font-bold text-[#666666] shrink-0">OPTION C: Sample Presets:</span>
                    {[
                      { label: '💄 Lipstick', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80' },
                      { label: '👑 Gold Necklace', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80' },
                      { label: '👜 Potli Bag', url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80' },
                      { label: '⌚ Rose Gold Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
                      { label: '🌹 Rose Perfume', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80' },
                      { label: '🌸 Hair Comb', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className="px-2 py-0.5 rounded-lg bg-white border border-[#c99632]/30 text-[10px] font-bold hover:bg-[#fff3c4] shrink-0"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Thumbnail Preview */}
                  {formData.image && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-emerald-700">✓ Loaded:</span>
                      <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-emerald-500 bg-white shadow-xs">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Product Description */}
              <div>
                <label className="block font-bold mb-1 text-[#171717]">Full Product Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-medium text-[#171717] focus:outline-none focus:border-[#c99632] resize-none"
                  placeholder="Exquisite traditional design handcrafted with Lakshmi motif, ruby red stones, and matching hanging Jhumkas..."
                />
              </div>

              {/* Row 6: Badges & Tags */}
              <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#c99632]/20 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    className="rounded border-[#c99632] text-[#c99632] focus:ring-[#c99632]"
                  />
                  <span className="font-bold text-[#171717]">🔥 Mark Trending Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded border-[#c99632] text-[#c99632] focus:ring-[#c99632]"
                  />
                  <span className="font-bold text-[#171717]">⭐ Mark Bestseller Badge</span>
                </label>
              </div>

              {/* LIVE STOREFRONT CARD PREVIEW */}
              <div className="pt-2">
                <span className="font-bold text-xs text-[#c99632] uppercase tracking-wider block mb-2">Live Storefront Card Preview:</span>
                <div className="bg-[#faf8f5] border border-[#c99632]/30 p-3 rounded-2xl max-w-xs flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-white">
                      {formData.image ? (
                        <img src={formData.image} alt={formData.name || 'Preview'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">Image Preview</div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {formData.isTrending && <span className="bg-[#e88a9a] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Trending</span>}
                        {formData.isBestSeller && <span className="bg-[#c99632] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Bestseller</span>}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#c99632]">{formData.categoryName || 'Category'}</span>
                      <h4 className="text-xs font-bold text-[#171717] line-clamp-1">{formData.name || 'Product Title Placeholder'}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold text-[#171717]">₹{formData.price || '0'}</span>
                        {formData.originalPrice && <span className="text-[10px] text-slate-400 line-through">₹{formData.originalPrice}</span>}
                        <span className="ml-auto text-[10px] font-bold text-emerald-600">Stock: {formData.stock}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-sm shadow-md hover:brightness-110 mt-4 gold-glow transition-all"
              >
                Save Product to Store Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center border border-red-200">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h4 className="font-bold text-base">Delete Product?</h4>
            <p className="text-xs text-slate-500">Are you sure you want to permanently remove this item from store inventory?</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeletingProductId(null)} className="flex-1 py-2 rounded-xl bg-slate-100 font-bold text-xs">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold text-xs">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
