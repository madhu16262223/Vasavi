import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';
import { Package, Phone, Clock, CheckCircle2, Truck, AlertCircle, Filter, Eye, ChevronDown, FileText, Search, CreditCard, Trash2 } from 'lucide-react';

const formatFullDateTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return dateInput;
  
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = hours.toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
};

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
          <input
            type="text"
            placeholder="Search order ID, phone..."
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
                  <th className="py-3.5 px-4">Total & Payment</th>
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
                      <p className="text-[11px] text-[#666666]">{order.customerPhone}</p>
                      <p className="text-[10px] text-[#888888] truncate max-w-[180px]">{order.customerAddress}</p>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#171717] block">{order.items?.length || 1} Products</span>
                      <span className="text-[10px] text-[#666666] truncate max-w-[150px] block">
                        {order.items?.map((i) => i.productName).join(', ')}
                      </span>
                    </td>

                    {/* Total & Payment */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#171717] text-sm block">₹{order.totalAmount}</span>
                      <span className={`text-[10px] font-bold ${
                        order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {order.paymentStatus === 'PAID' ? '💳 ONLINE PAID' : '💵 COD / UNPAID'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="relative inline-block">
                        <select
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
              <h3 className="text-base font-bold font-serif-luxury">Order #{selectedOrderDetails.orderNumber}</h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1 text-[#888888] hover:text-[#171717]">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#666666]">
                <span>Customer:</span>
                <span className="font-bold text-[#171717]">{selectedOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Phone:</span>
                <span className="font-bold text-[#171717]">{selectedOrderDetails.customerPhone}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Address:</span>
                <span className="font-bold text-[#171717]">{selectedOrderDetails.customerAddress}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#c99632]/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c99632]">Ordered Items:</h4>
              {selectedOrderDetails.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs p-2 rounded-xl bg-[#faf8f5]">
                  <span>{item.productName} × {item.quantity}</span>
                  <span className="font-bold">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#c99632]/20 flex justify-between items-center text-sm font-bold">
              <span>Total Paid:</span>
              <span className="text-[#c99632]">₹{selectedOrderDetails.totalAmount}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => generateInvoicePDF(selectedOrderDetails)}
                className="py-2.5 rounded-xl bg-[#c99632] text-white font-bold text-xs flex items-center justify-center gap-2"
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
