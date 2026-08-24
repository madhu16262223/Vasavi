import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';
import { formatFullDateTime, cleanIndianPhone } from '../../utils/phoneUtils';
import { Package, Phone, Clock, CheckCircle2, Truck, AlertCircle, Filter, Eye, ChevronDown, FileText, Search, CreditCard, Trash2, MessageCircle, Banknote, CheckCircle, ShieldCheck } from 'lucide-react';

export const AdminOrders = () => {
  const { orders, updateOrderStatus, deleteOrder } = useStore();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'];

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatusFilter === 'ALL' || order.status === selectedStatusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.customerPhone && String(order.customerPhone).includes(q));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold">PENDING</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold">CONFIRMED</span>;
      case 'PROCESSING':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold">PROCESSING</span>;
      case 'READY':
        return <span className="bg-teal-100 text-teal-800 border border-teal-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold">READY</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 border border-red-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold">CANCELLED</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[11px] px-2 py-0.5 rounded font-bold">{status}</span>;
    }
  };

  const getPaymentMethodBadge = (order) => {
    const method = (order.paymentMethod || '').toUpperCase();
    const isPaid = order.paymentStatus === 'PAID';

    if (method === 'WHATSAPP' || method.includes('WHATSAPP')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
          <MessageCircle className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>📲 WhatsApp Order</span>
        </span>
      );
    }

    if (method === 'ONLINE_UPI' || method === 'UPI' || method === 'ONLINE' || isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs">
          <CreditCard className="w-3 h-3 text-blue-600 shrink-0" />
          <span>💳 Online Paid (UPI)</span>
        </span>
      );
    }

    // Default to Cash on Delivery (COD)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
        <Banknote className="w-3 h-3 text-amber-600 shrink-0" />
        <span>💵 Cash on Delivery</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#c99632]/25 shadow-xs">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {statuses.map((status) => {
            const count = status === 'ALL' ? orders.length : orders.filter((o) => o.status === status).length;
            const isActive = selectedStatusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#c99632] text-white shadow-xs gold-glow'
                    : 'bg-[#faf8f5] text-[#555555] hover:bg-white hover:text-[#171717]'
                }`}
              >
                <span>{status}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white text-[#c99632]' : 'bg-[#e8c7b5]/50 text-[#171717]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64">
          <label htmlFor="admin-orders-search" className="sr-only">Search Orders</label>
          <input
            id="admin-orders-search"
            name="searchQuery"
            type="text"
            placeholder="Search order ID, phone, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#faf8f5] border border-[#c99632]/30 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-[#171717] placeholder-slate-400 focus:outline-none focus:border-[#c99632]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#c99632]/25 overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-[#c99632] mx-auto opacity-50" />
            <h4 className="text-base font-bold text-[#171717]">No orders found</h4>
            <p className="text-xs text-[#666666]">There are no customer orders matching the selected filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf8f5] border-b border-[#c99632]/20 text-[#666666] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Total & Payment Method</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c99632]/15 text-[#171717]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fffcf7] transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-medium">
                      <span className="font-bold text-[#c99632] text-sm block">#{order.orderNumber}</span>
                      <span className="text-[10px] text-[#666666] font-semibold block mt-0.5">
                        {formatFullDateTime(order.createdAt)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <h4 className="font-bold text-[#171717]">{order.customerName}</h4>
                      <p className="text-[11px] text-[#666666] font-mono mt-0.5">📞 +91 {order.customerPhone}</p>
                      <p className="text-[10px] text-[#888888] truncate max-w-[180px] mt-0.5">{order.customerAddress}</p>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#171717] block">{order.items?.length || 1} Products</span>
                      <span className="text-[10px] text-[#666666] truncate max-w-[150px] block mt-0.5">
                        {order.items?.map((i) => i.productName).join(', ')}
                      </span>
                    </td>

                    {/* Total & Payment Method with Highlighted Badge & Icon */}
                    <td className="py-3.5 px-4 space-y-1">
                      <span className="font-bold text-[#171717] text-sm block">₹{order.totalAmount}</span>
                      <div>
                        {getPaymentMethodBadge(order)}
                      </div>
                      <span className={`text-[10px] font-extrabold block ${
                        order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {order.paymentStatus === 'PAID' ? '✓ PAID ONLINE' : '⏳ COLLECT CASH (COD)'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="relative inline-block">
                        <select
                          id={`order-status-${order.id}`}
                          name="orderStatus"
                          aria-label={`Update status for order ${order.orderNumber}`}
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-[#faf8f5] border border-[#c99632]/30 text-[#171717] font-bold text-xs rounded-xl py-1 px-2.5 pr-7 appearance-none cursor-pointer focus:outline-none"
                        >
                          {statuses.filter((s) => s !== 'ALL').map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-[#c99632] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => generateInvoicePDF(order)}
                          className="p-1.5 rounded-lg bg-white border border-[#c99632]/40 text-[#c99632] hover:bg-[#fff3c4] shadow-xs"
                          title="Generate PDF Bill Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="p-1.5 rounded-lg bg-[#faf8f5] text-[#171717] hover:bg-[#fff3c4]"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`⚠️ Permanently delete Order #${order.orderNumber} from database? This cannot be undone.`)) {
                              deleteOrder(order.id || order.orderNumber);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-xs"
                          title="Delete Order Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-[#c99632]/40 rounded-3xl p-6 shadow-2xl space-y-4 text-[#171717]">
            <div className="flex items-center justify-between border-b border-[#c99632]/20 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c99632] tracking-wider">ORDER DETAILS</span>
                <h3 className="text-base font-bold font-serif-luxury">Order #{selectedOrderDetails.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1 text-[#888888] hover:text-[#171717]">
                ✕
              </button>
            </div>

            {/* Highlighted Order & Payment Method Card */}
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#c99632]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#666666]">ORDER METHOD & CHANNEL:</span>
                {getPaymentMethodBadge(selectedOrderDetails)}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-xs">
                <span className="font-semibold text-[#666666]">PAYMENT STATUS:</span>
                <span className={`font-black px-2.5 py-0.5 rounded-md ${
                  selectedOrderDetails.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {selectedOrderDetails.paymentStatus === 'PAID' ? '✅ PAID (ONLINE)' : '⚠️ COLLECT CASH AT DOORSTEP'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#666666]">
                <span>Customer Name:</span>
                <span className="font-bold text-[#171717]">{selectedOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Contact Number:</span>
                <span className="font-bold font-mono text-[#171717]">📞 +91 {selectedOrderDetails.customerPhone}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Delivery Address:</span>
                <span className="font-bold text-[#171717] text-right max-w-[260px]">{selectedOrderDetails.customerAddress}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Order Placed Date:</span>
                <span className="font-semibold text-[#171717]">{formatFullDateTime(selectedOrderDetails.createdAt)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#c99632]/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c99632]">Ordered Items:</h4>
              {selectedOrderDetails.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs p-2 rounded-xl bg-[#faf8f5] border border-slate-100">
                  <span className="font-medium text-[#171717]">{item.productName} × {item.quantity}</span>
                  <span className="font-bold text-[#c99632]">₹{item.subtotal || (item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#c99632]/20 flex justify-between items-center text-sm font-bold">
              <span>Total Payable Amount:</span>
              <span className="text-lg font-black text-[#c99632]">₹{selectedOrderDetails.totalAmount}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => generateInvoicePDF(selectedOrderDetails)}
                className="py-2.5 rounded-xl bg-[#c99632] text-white font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-xs gold-glow"
              >
                <FileText className="w-4 h-4" /> Download PDF Bill
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`⚠️ Permanently delete Order #${selectedOrderDetails.orderNumber} from database?`)) {
                    deleteOrder(selectedOrderDetails.id || selectedOrderDetails.orderNumber);
                    setSelectedOrderDetails(null);
                  }
                }}
                className="py-2.5 rounded-xl bg-white border border-red-300 text-red-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" /> Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
