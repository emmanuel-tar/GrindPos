import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ChefHat, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  RefreshCw 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Order, 
  InventoryItem, 
  MenuItem, 
  StaffMember, 
  WasteLog, 
  Location 
} from '../types';
import { getBusinessInsights } from '../geminiService';

interface DashboardProps {
  orders: Order[];
  inventory: InventoryItem[];
  menuItems: MenuItem[];
  staff: StaffMember[];
  wasteLogs: WasteLog[];
  currentLocation: Location;
  onNavigate: (view: string) => void;
  onOpenAiCopilot: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  orders,
  inventory,
  menuItems,
  staff,
  wasteLogs,
  currentLocation,
  onNavigate,
  onOpenAiCopilot,
}) => {
  const [aiInsight, setAiInsight] = useState<string>('Analyzing restaurant telemetry and sales data...');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const fetchAiInsights = async () => {
    setIsAiLoading(true);
    const result = await getBusinessInsights({
      orders,
      inventory,
      menuItems,
      staff,
      wasteLogs,
      branchName: currentLocation.name,
    });
    setAiInsight(result);
    setIsAiLoading(false);
  };

  useEffect(() => {
    fetchAiInsights();
  }, [currentLocation.id]);

  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStock).length;
  const activeStaffCount = staff.filter(s => s.isClockedIn).length;

  const weeklyTrendData = [
    { day: 'Mon', sales: 2400, orders: 85 },
    { day: 'Tue', sales: 2100, orders: 72 },
    { day: 'Wed', sales: 2900, orders: 94 },
    { day: 'Thu', sales: 3400, orders: 110 },
    { day: 'Fri', sales: 4800, orders: 155 },
    { day: 'Sat', sales: 5600, orders: 182 },
    { day: 'Sun', sales: 4200, orders: 140 },
  ];

  return (
    <div className="space-y-6">
      {/* AI Intelligence Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-4 z-10 max-w-3xl">
          <div className="p-3 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl text-white shadow-lg shadow-orange-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                Gemini 3.7 Operations Intelligence
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                {currentLocation.name}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {aiInsight}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0">
          <button
            onClick={fetchAiInsights}
            disabled={isAiLoading}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-40"
            title="Refresh AI Insights"
          >
            <RefreshCw className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenAiCopilot}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/30 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Ask Copilot
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigate('pos')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-orange-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">${totalSales.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs yesterday
          </div>
        </div>

        <div
          onClick={() => onNavigate('kds')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-orange-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kitchen Queue</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{activeOrders.length} Active</p>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-2">
            <Clock className="w-3.5 h-3.5" /> Avg Ticket: 8.5 min
          </div>
        </div>

        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-orange-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Health</span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{lowStockCount} Reorders</p>
          <div className="flex items-center gap-1 text-xs text-red-600 font-bold mt-2">
            {lowStockCount > 0 ? 'Urgent supplier PO needed' : 'All raw stock healthy'}
          </div>
        </div>

        <div
          onClick={() => onNavigate('staff')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-orange-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff On Shift</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{activeStaffCount} Present</p>
          <div className="flex items-center gap-1 text-xs text-blue-600 font-bold mt-2">
            {staff.length} registered on roster
          </div>
        </div>
      </div>

      {/* Main Content Split: Weekly Trend & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Revenue Velocity</h3>
              <p className="text-xs text-slate-400">Weekly trajectory across all sales channels</p>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Peak: Saturday ($5,600)
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Operational Actions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quick Shortcuts</h3>
            <p className="text-xs text-slate-400">Direct operational launchers</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('pos')}
              className="w-full p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200/80 text-orange-950 font-bold text-xs flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                <span>Launch POS Terminal</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-orange-600" />
            </button>

            <button
              onClick={() => onNavigate('kds')}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ChefHat className="w-4 h-4 text-slate-600" />
                <span>Kitchen Display (KDS)</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('tables')}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-600" />
                <span>Table Map & Bookings</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('inventory')}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Restock Purchase Orders</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="p-3 bg-slate-900 text-white rounded-2xl text-xs flex items-center justify-between">
            <span className="text-slate-300">Terminal Status:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              ● Online & Synced
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Completed Tickets</h3>
            <p className="text-xs text-slate-400">Live feed of transactions processed in this shift</p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View Full Audit Log <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3.5 font-bold uppercase text-slate-500">Ticket #</th>
                <th className="px-5 py-3.5 font-bold uppercase text-slate-500">Destination</th>
                <th className="px-5 py-3.5 font-bold uppercase text-slate-500">Items Ordered</th>
                <th className="px-5 py-3.5 font-bold uppercase text-slate-500">Total Check</th>
                <th className="px-5 py-3.5 font-bold uppercase text-slate-500">Payment</th>
                <th className="px-5 py-3.5 font-bold uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.slice(-5).reverse().map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    #{order.orderNumber || order.id.slice(-4)}
                  </td>
                  <td className="px-5 py-4 text-slate-700 font-bold">
                    {order.orderType === 'dine_in' ? `Table #${order.tableNumber || 1}` : order.orderType.toUpperCase()}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="px-5 py-4 font-black text-slate-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 uppercase font-bold text-slate-500 text-[10px]">
                    {order.paymentMethod || 'CARD'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black uppercase text-[10px] rounded-lg">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
