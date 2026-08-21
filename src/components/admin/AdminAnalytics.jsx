import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { TrendingUp, DollarSign, Package, CheckCircle2, Clock, Calendar, BarChart3, PieChart } from 'lucide-react';

export const AdminAnalytics = () => {
  const { orders, products, categories } = useStore();
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'

  // Calculate Key Metrics
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  
  // Total Revenue based on COMPLETED + CONFIRMED orders
  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'CONFIRMED' || o.status === 'READY')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / Math.max(1, completedOrders.length)) : 0;

  // Mock revenue chart data for Daily, Weekly, Monthly
  const chartDataMap = {
    daily: [
      { label: 'Mon', revenue: 4200, orders: 4 },
      { label: 'Tue', revenue: 6800, orders: 6 },
      { label: 'Wed', revenue: 5100, orders: 5 },
      { label: 'Thu', revenue: 8900, orders: 8 },
      { label: 'Fri', revenue: 11200, orders: 11 },
      { label: 'Sat', revenue: 14500, orders: 14 },
      { label: 'Sun', revenue: 12800, orders: 12 }
    ],
    weekly: [
      { label: 'Week 1', revenue: 28500, orders: 28 },
      { label: 'Week 2', revenue: 34200, orders: 32 },
      { label: 'Week 3', revenue: 41000, orders: 39 },
      { label: 'Week 4', revenue: 45280, orders: 42 }
    ],
    monthly: [
      { label: 'May 2026', revenue: 112000, orders: 104 },
      { label: 'Jun 2026', revenue: 128500, orders: 118 },
      { label: 'Jul 2026', revenue: 142000, orders: 135 },
      { label: 'Aug 2026', revenue: 158900, orders: 148 }
    ]
  };

  const activeChartData = chartDataMap[timeframe];
  const maxVal = Math.max(...activeChartData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#c99632]/30 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-[#666666] font-medium">
            <span>Total Sales Revenue</span>
            <div className="p-2 rounded-lg bg-[#c99632]/10 text-[#c99632]"><DollarSign className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#c99632]">₹{totalRevenue.toLocaleString()}</h3>
          <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last month
          </p>
        </div>

        <div className="bg-white border border-[#c99632]/25 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-[#666666] font-medium">
            <span>Total Orders Count</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600"><Package className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#171717]">{orders.length}</h3>
          <p className="text-[11px] text-[#666666] font-medium">{completedOrders.length} completed orders</p>
        </div>

        <div className="bg-white border border-[#c99632]/25 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-[#666666] font-medium">
            <span>Average Order Value</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#171717]">₹{avgOrderValue}</h3>
          <p className="text-[11px] text-[#666666]">Per customer checkout</p>
        </div>

        <div className="bg-white border border-amber-500/30 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-[#666666] font-medium">
            <span>Pending Approvals</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600"><Clock className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-700">{pendingOrders.length}</h3>
          <p className="text-[11px] text-amber-800 font-medium">Requires store action</p>
        </div>
      </div>

      {/* Revenue Performance Chart Card */}
      <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c99632]/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#c99632]">
              <BarChart3 className="w-4 h-4" />
              <span>REVENUE BREAKDOWN REPORT</span>
            </div>
            <h3 className="text-xl font-bold font-serif-luxury text-[#171717] mt-1">Sales & Revenue Performance</h3>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-xl border border-[#c99632]/30">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'daily' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'weekly' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'monthly' ? 'bg-[#c99632] text-white shadow-xs' : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4">
          <div className="h-64 flex items-end justify-between gap-4 border-b border-[#c99632]/20 pb-4 px-2">
            {activeChartData.map((item, idx) => {
              const heightPct = Math.round((item.revenue / maxVal) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[#171717] text-[#fff8ed] border border-[#c99632]/40 px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap z-10 shadow-lg">
                    ₹{item.revenue.toLocaleString()} ({item.orders} orders)
                  </div>

                  {/* Bar pillar */}
                  <div className="w-full max-w-[48px] bg-[#faf8f5] border border-[#c99632]/20 rounded-t-xl overflow-hidden flex items-end h-44">
                    <div
                      style={{ height: `${Math.max(15, heightPct)}%` }}
                      className="w-full bg-gradient-to-t from-[#a6751d] via-[#c99632] to-[#ffd778] group-hover:brightness-110 transition-all rounded-t-xl"
                    />
                  </div>

                  <span className="text-xs text-[#666666] font-bold">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-[#171717] font-serif-luxury uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#c99632]" /> Top Sales Categories
          </h4>
          <div className="space-y-3 text-xs">
            {categories.map((cat, idx) => {
              const percentages = [35, 28, 18, 10, 6, 3];
              const pct = percentages[idx] || 5;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-[#171717]">
                    <span className="font-semibold">{cat.name}</span>
                    <span className="font-bold text-[#c99632]">{pct}% of sales</span>
                  </div>
                  <div className="w-full bg-[#faf8f5] h-2.5 rounded-full overflow-hidden border border-[#c99632]/20">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-gradient-to-r from-[#c99632] to-[#e88a9a] h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#c99632]/25 p-6 rounded-2xl shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-[#171717] font-serif-luxury uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Order Status Distribution
          </h4>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Completed Orders', count: orders.filter((o) => o.status === 'COMPLETED').length, color: 'bg-emerald-500' },
              { label: 'Confirmed / Packing', count: orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length, color: 'bg-blue-500' },
              { label: 'Pending Store Action', count: orders.filter((o) => o.status === 'PENDING').length, color: 'bg-amber-500' },
              { label: 'Cancelled Orders', count: orders.filter((o) => o.status === 'CANCELLED').length, color: 'bg-red-500' }
            ].map((st, idx) => (
              <div key={idx} className="flex items-center justify-between bg-[#faf8f5] p-3 rounded-xl border border-[#c99632]/20">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${st.color}`} />
                  <span className="font-semibold text-[#171717]">{st.label}</span>
                </div>
                <span className="font-bold text-[#171717] text-sm">{st.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
