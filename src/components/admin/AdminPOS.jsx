import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { printThermalReceipt } from '../../utils/thermalReceiptGenerator';
import { Search, ShoppingCart, Trash2, Plus, Minus, Printer, CheckCircle2, DollarSign, CreditCard, Sparkles, User, RefreshCw } from 'lucide-react';

export const AdminPOS = () => {
  const { products = [], addOfflineSale } = useStore();
  const [posCart, setPosCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'UPI' | 'Card'
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [lastReceipt, setLastReceipt] = useState(null);

  // Filtered products for quick barcode / item select
  const filteredProducts = products.filter(p => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.brand && p.brand.toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat && p.isActive !== false;
  });

  const addToPosCart = (product) => {
    setPosCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setPosCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromPosCart = (id) => {
    setPosCart(prev => prev.filter(item => item.id !== id));
  };

  const clearPosCart = () => {
    setPosCart([]);
    setTenderedAmount('');
    setDiscountAmount('0');
  };

  const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = Math.min(subtotal, parseFloat(discountAmount) || 0);
  const netTotal = Math.max(0, subtotal - discount);
  const tendered = parseFloat(tenderedAmount) || netTotal;
  const changeReturn = Math.max(0, tendered - netTotal);

  const handleCheckoutAndPrint = () => {
    if (posCart.length === 0) return;

    const receiptNumber = `POS-${Math.floor(10000 + Math.random() * 90000)}`;
    const saleRecord = {
      receiptNumber,
      customerName: customerName.trim() || 'Walk-in Counter Customer',
      items: posCart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal,
      discount,
      totalAmount: netTotal,
      tenderedAmount: tendered,
      changeReturn,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    // 1. Record in Offline Sales Database
    addOfflineSale({
      amount: netTotal,
      paymentMethod,
      customerName: saleRecord.customerName,
      notes: `POS Bill #${receiptNumber} (${posCart.length} items)`,
      date: saleRecord.createdAt
    });

    // 2. Trigger Thermal 80mm Print
    printThermalReceipt(saleRecord);

    setLastReceipt(saleRecord);
    clearPosCart();
  };

  return (
    <div className="space-y-4">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#c99632]/25 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
        <div>
          <h3 className="text-base font-bold font-serif-luxury text-[#171717] flex items-center gap-2">
            <span>🏬 Vasavi Super POS — Fast Counter Billing</span>
            <span className="text-[10px] bg-[#fff3c4] text-[#c99632] px-2.5 py-0.5 rounded-full font-bold">80mm Thermal Ready</span>
          </h3>
          <p className="text-xs text-[#666666]">Rapid barcode item lookup, instant bill printing, and automatic accounting.</p>
        </div>

        {lastReceipt && (
          <button
            onClick={() => printThermalReceipt(lastReceipt)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-[#c99632]" />
            <span>Reprint Last Bill (#{lastReceipt.receiptNumber})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Product Selection Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Quick Search */}
          <div className="bg-white p-3 rounded-2xl border border-[#c99632]/20 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search product name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#c99632]"
              />
              <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-3 py-1 text-xs font-bold text-[#666666] hover:text-[#171717]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Product Items Grid */}
          <div className="bg-white p-4 rounded-2xl border border-[#c99632]/20 max-h-[500px] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => addToPosCart(p)}
                  className="p-2.5 rounded-xl bg-[#fffcf7] border border-[#c99632]/25 hover:border-[#c99632] hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <img
                      src={p.image || p.imageUrl || '/bangles.jpg'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <h4 className="text-[11px] font-bold text-[#171717] line-clamp-2 leading-tight">
                      {p.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#c99632]/15">
                    <span className="text-xs font-extrabold text-[#c99632]">₹{p.price}</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      + Add
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Active POS Cart & Billing Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-4 rounded-2xl border-2 border-[#c99632]/30 space-y-4 shadow-sm">
            
            <div className="flex justify-between items-center border-b border-[#c99632]/20 pb-2">
              <span className="font-extrabold text-xs text-[#171717] flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-[#c99632]" />
                <span>Counter Bill Items ({posCart.length})</span>
              </span>
              {posCart.length > 0 && (
                <button
                  onClick={clearPosCart}
                  className="text-[10px] text-red-600 font-bold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {posCart.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#888888]">
                  Click products on the left to add items to bill.
                </div>
              ) : (
                posCart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 rounded-xl bg-[#faf8f5] text-xs">
                    <div className="flex-1 pr-2">
                      <span className="font-bold text-[#171717] block truncate">{item.name}</span>
                      <span className="text-[10px] text-[#666666]">₹{item.price} each</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5 h-5 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-5 h-5 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-16 text-right font-extrabold text-[#171717]">
                      ₹{item.price * item.quantity}
                    </div>

                    <button
                      onClick={() => removeFromPosCart(item.id)}
                      className="text-slate-400 hover:text-red-600 pl-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Customer & Payment Inputs */}
            <div className="space-y-2.5 pt-2 border-t border-[#c99632]/20 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-[#171717] mb-1">Customer Name / Note:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl p-2 font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {['Cash', 'UPI / PhonePe', 'Card'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                      paymentMethod === m ? 'bg-[#c99632] text-white border-[#c99632]' : 'bg-[#faf8f5] text-[#171717] border-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Bill Totals & Change Calculator */}
              <div className="p-3 rounded-xl bg-[#fffcf7] border border-[#c99632]/30 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal:</span>
                  <span className="font-bold text-[#171717]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount (₹):</span>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-20 bg-white border border-slate-300 rounded-lg p-1 text-right font-bold"
                  />
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#c99632] pt-1 border-t border-[#c99632]/20">
                  <span>Net Payable:</span>
                  <span>₹{netTotal}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span>Cash Received (₹):</span>
                  <input
                    type="number"
                    placeholder={String(netTotal)}
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    className="w-24 bg-white border border-slate-300 rounded-lg p-1 text-right font-bold"
                  />
                </div>
                {changeReturn > 0 && (
                  <div className="flex justify-between text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded-lg">
                    <span>Change to Return:</span>
                    <span>₹{changeReturn}</span>
                  </div>
                )}
              </div>

              {/* Instant Print & Checkout Button */}
              <button
                disabled={posCart.length === 0}
                onClick={handleCheckoutAndPrint}
                className="w-full py-3.5 bg-gradient-to-r from-[#c99632] to-[#a6751d] text-white font-bold text-xs rounded-xl shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT RECEIPT & COMPLETE SALE (₹{netTotal})</span>
              </button>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
