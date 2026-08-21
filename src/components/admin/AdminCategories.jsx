import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react';

export const AdminCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.image) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      setEditingCategory(null);
    } else {
      addCategory(formData);
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#c99632]/25 shadow-xs">
        <div>
          <h3 className="text-base font-bold font-serif-luxury text-[#171717]">Store Categories</h3>
          <p className="text-xs text-[#666666]">Manage categories shown on home page and filter menus.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-sm gold-glow"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-[#c99632]/25 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="relative h-36 overflow-hidden bg-[#faf8f5]">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute top-2 right-2 bg-white/90 text-[#c99632] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-[#c99632]/30">
                {cat.itemCount || 0} Products
              </span>
            </div>

            <div className="p-4 space-y-1.5">
              <h4 className="font-bold text-[#171717] text-sm font-serif-luxury">{cat.name}</h4>
              <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">{cat.description}</p>
            </div>

            <div className="p-3 border-t border-[#c99632]/15 flex justify-end gap-2 bg-[#fffcf7]">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="py-1.5 px-3 rounded-xl bg-[#faf8f5] border border-slate-200 text-[#171717] hover:bg-[#fff3c4] text-xs font-bold flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#c99632]" /> Edit
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="py-1.5 px-3 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Category Modal */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-[#c99632]/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-[#171717]">
            <div className="flex justify-between items-center pb-2 border-b border-[#c99632]/20">
              <h3 className="text-base font-bold font-serif-luxury text-[#171717]">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingCategory(null); }} className="text-slate-400 hover:text-[#171717]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#171717] font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-bold mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-medium text-[#171717] focus:outline-none focus:border-[#c99632]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2.5 font-medium text-[#171717] focus:outline-none focus:border-[#c99632] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingCategory(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-[#171717]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#c99632] text-white font-bold text-xs shadow-md hover:brightness-110"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
