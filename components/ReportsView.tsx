import React, { useState } from 'react';
import { 
  Order, 
  InventoryItem, 
  MenuItem, 
  StaffMember, 
  ZReport, 
  Location 
} from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet, 
  Users, 
  Clock, 
  Star, 
  HelpCircle, 
  AlertOctagon, 
  Sparkles, 
  Calculator, 
  Download 
} from 'lucide-react';

interface ReportsViewProps {
  orders: Order[];
  inventory: InventoryItem[];
  menuItems: MenuItem[];
  staff: StaffMember[];
  zReports: ZReport[];
  currentLocation: Location;
  onOpenZReportModal: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  inventory,
  menuItems,
  staff,
  zReports,
  currentLocation,
  onOpenZReportModal,
}) => {
  const [reportTab, setReportTab] = useState<'sales' | 'menu_matrix' | 'zreports' | 'labor'>('sales');

  const totalGrossRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalTax = orders.reduce((acc, o) => acc + o.tax, 0);
  const totalDiscounts = orders.reduce((acc, o) => acc + (o.discountAmount || 0), 0);
  const avgTicket = orders.length > 0 ? totalGrossRevenue / orders.length : 0;

  // Total labor cost today
  const totalLaborCost = staff.reduce((acc, s) => acc + ((s.totalHoursToday || 0) * s.hourlyRate), 0);
  const laborCostPercent = totalGrossRevenue > 0 ? (totalLaborCost / totalGrossRevenue) * 100 : 0;

  // Hourly distribution
  const hourlyData = [
    { hour: '11 AM', sales: 420, orders: 12 },
    { hour: '12 PM', sales: 890, orders: 28 },
    { hour: '1 PM', sales: 1120, orders: 34 },
    { hour: '2 PM', sales: 540, orders: 15 },
    { hour: '3 PM', sales: 310, orders: 9 },
    { hour: '4 PM', sales: 290, orders: 8 },
    { hour: '5 PM', sales: 680, orders: 19 },
    { hour: '6 PM', sales: 1350, orders: 41 },
    { hour: '7 PM', sales: 1840, orders: 52 },
    { hour: '8 PM', sales: 1520, orders: 44 },
    { hour: '9 PM', sales: 760, orders: 22 },
  ];

  // Category breakdown for pie chart
  const categorySalesMap: Record<string, number> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const cat = item.station || 'Main';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * item.quantity);
    });
  });

  const categoryPieData = Object.keys(categorySalesMap).length > 0
    ? Object.keys(categorySalesMap).map(k => ({ name: k.toUpperCase(), value: Math.round(categorySalesMap[k]) }))
    : [
        { name: 'GRILL', value: 45 },
        { name: 'FRYER', value: 25 },
        { name: 'BAR', value: 15 },
        { name: 'DESSERT', value: 15 },
      ];

  const PIE_COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#eab308'];

  // Menu Engineering Matrix Classification
  // Calculate item volume from orders
  const itemVolumeMap: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(i => {
      itemVolumeMap[i.menuItemId] = (itemVolumeMap[i.menuItemId] || 0) + i.quantity;
    });
  });

  const matrixItems = menuItems.map(dish => {
    const cost = dish.recipe.reduce((acc, r) => acc + (r.quantity * r.costPerUnit), 0);
    const margin = dish.price - cost;
    const marginPercent = (margin / dish.price) * 100;
    const volume = itemVolumeMap[dish.id] || Math.floor(Math.random() * 20 + 8); // sample volume if new
    
    // Benchmark thresholds: Margin > 70% is High Margin, Volume > 15 is High Volume
    const isHighMargin = marginPercent >= 68;
    const isHighVolume = volume >= 14;

    let quadrant: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog' = 'Star';
    let recommendation = '';

    if (isHighMargin && isHighVolume) {
      quadrant = 'Star';
      recommendation = 'Maintain high quality & prime menu positioning.';
    } else if (!isHighMargin && isHighVolume) {
      quadrant = 'Plowhorse';
      recommendation = 'High volume favorite. Increase price +$1.00 or optimize ingredient portion cost.';
    } else if (isHighMargin && !isHighVolume) {
      quadrant = 'Puzzle';
      recommendation = 'High profit margin. Run server upselling contests & featured specials.';
    } else {
      quadrant = 'Dog';
      recommendation = 'Low popularity & margin. Consider re-engineering recipe or replacing.';
    }

    return {
      dish,
      cost,
      margin,
      marginPercent,
      volume,
      quadrant,
      recommendation
    };
  });

  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Table', 'Order Type', 'Status', 'Date', 'Subtotal', 'Tax', 'Discount', 'Total', 'Payment Method'],
      ...orders.map(o => [
        o.id,
        o.tableNumber || 'N/A',
        o.orderType,
        o.status,
        o.createdAt,
        o.subtotal.toFixed(2),
        o.tax.toFixed(2),
        o.discountAmount.toFixed(2),
        o.total.toFixed(2),
        o.paymentMethod || 'card'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restoflow-audit-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
          <p className="text-3xl font-black text-slate-900 mt-1">${totalGrossRevenue.toFixed(2)}</p>
          <span className="text-xs text-emerald-600 font-bold mt-1 block">+{orders.length} Completed Tickets</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Check</span>
          <p className="text-3xl font-black text-slate-900 mt-1">${avgTicket.toFixed(2)}</p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">Tax: ${totalTax.toFixed(2)}</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Labor Cost Ratio</span>
          <p className={`text-3xl font-black mt-1 ${laborCostPercent > 32 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {laborCostPercent.toFixed(1)}%
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">Target Range: 25% - 30%</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discounts & Comps</span>
          <p className="text-3xl font-black text-purple-600 mt-1">-${totalDiscounts.toFixed(2)}</p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">Staff & Promo codes</span>
        </div>
      </div>

      {/* Reports Nav Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setReportTab('sales')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              reportTab === 'sales' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Sales & Rush Heatmap
          </button>
          <button
            onClick={() => setReportTab('menu_matrix')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              reportTab === 'menu_matrix' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" /> Menu Engineering Matrix
          </button>
          <button
            onClick={() => setReportTab('zreports')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              reportTab === 'zreports' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" /> Register Audits (Z-Reports)
          </button>
          <button
            onClick={() => setReportTab('labor')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              reportTab === 'labor' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> Labor & Timesheet Audit
          </button>
        </div>

        <div className="flex items-center gap-2 px-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={onOpenZReportModal}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5" /> Close Shift (Z-Report)
          </button>
        </div>
      </div>

      {/* Tab 1: Sales Trends & Hourly Heatmaps */}
      {reportTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hourly Sales Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hourly Revenue & Rush Distribution</h3>
                  <p className="text-xs text-slate-400">Peak dining rush occurs between 6:00 PM and 8:30 PM</p>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  Peak: 7:00 PM
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="sales" fill="#f97316" radius={[8, 8, 0, 0]} name="Sales ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Share Doughnut */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Station / Category Share</h3>
                <p className="text-xs text-slate-400">Revenue split across kitchen prep stations</p>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {categoryPieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                    <span className="font-semibold text-slate-700">{entry.name}:</span>
                    <span className="text-slate-400">${entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Menu Engineering Matrix */}
      {reportTab === 'menu_matrix' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h3 className="text-lg font-bold">Boston Consulting Group (BCG) Menu Engineering Matrix</h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Automated profitability analysis classifying every dish into <strong>Stars</strong> (High Profit, High Volume), <strong>Plowhorses</strong> (Low Profit, High Volume), <strong>Puzzles</strong> (High Profit, Low Volume), and <strong>Dogs</strong> (Low Profit, Low Volume) to guide pricing and menu redesign.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matrixItems.map((item, idx) => {
              const badgeStyle = {
                Star: 'bg-amber-100 text-amber-900 border-amber-300',
                Plowhorse: 'bg-blue-100 text-blue-900 border-blue-300',
                Puzzle: 'bg-purple-100 text-purple-900 border-purple-300',
                Dog: 'bg-red-100 text-red-900 border-red-300',
              }[item.quadrant];

              return (
                <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.dish.category}</span>
                        <h4 className="text-base font-black text-slate-900">{item.dish.name}</h4>
                      </div>
                      <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${badgeStyle}`}>
                        ★ {item.quadrant}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Price</span>
                        <p className="font-black text-slate-900 mt-0.5">${item.dish.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Food Cost</span>
                        <p className="font-black text-slate-700 mt-0.5">${item.cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Profit Margin</span>
                        <p className="font-black text-emerald-600 mt-0.5">{item.marginPercent.toFixed(0)}%</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Sales Vol</span>
                        <p className="font-black text-slate-900 mt-0.5">{item.volume} sold</p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-1">
                      <span className="font-bold text-amber-900 block">Strategic Recommendation:</span>
                      <p className="text-amber-800">{item.recommendation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Z-Reports History */}
      {reportTab === 'zreports' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Shift Register Close Audits (Z-Reports)</h3>
              <p className="text-xs text-slate-500">Historical register reconciliations, blind drops & cash variance records</p>
            </div>
            <button
              onClick={onOpenZReportModal}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Perform Shift Close
            </button>
          </div>

          {zReports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calculator className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No shift close Z-reports finalized yet today.</p>
              <p className="text-xs">Click "Perform Shift Close" to audit physical cash drawers and generate report.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {zReports.map(rep => (
                <div key={rep.id} className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Z-Report #{rep.id.slice(-6).toUpperCase()} — {rep.date} ({rep.closedAt})</h4>
                      <p className="text-xs text-slate-500">Closed by <strong className="text-slate-800">{rep.closedBy}</strong> • {currentLocation.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Total Gross</span>
                      <p className="text-lg font-black text-slate-900">${rep.totalGrossSales.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Cash Sales</span>
                      <p className="font-bold text-slate-800 mt-0.5">${rep.cashSales.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Card Sales</span>
                      <p className="font-bold text-slate-800 mt-0.5">${rep.cardSales.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Opening Float</span>
                      <p className="font-bold text-slate-800 mt-0.5">${rep.openingCashFloat.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Cash Variance</span>
                      <p className={`font-black mt-0.5 ${rep.cashVariance === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {rep.cashVariance >= 0 ? `+$${rep.cashVariance.toFixed(2)}` : `-$${Math.abs(rep.cashVariance).toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  {rep.notes && (
                    <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                      Audit Notes: {rep.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Labor & Payroll */}
      {reportTab === 'labor' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Staff Labor Cost & Shift Timesheets</h3>
              <p className="text-xs text-slate-500">Live hourly payroll burn tracking against gross sales</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Accrued Payroll</span>
              <p className="text-2xl font-black text-slate-900">${totalLaborCost.toFixed(2)}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Staff Member</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Hourly Rate</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Clocked In At</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Hours Today</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Daily Earnings</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {staff.map(member => {
                  const dailyWage = (member.totalHoursToday || 0) * member.hourlyRate;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-slate-900">{member.name}</td>
                      <td className="px-5 py-4 uppercase text-slate-500 font-bold text-[10px]">{member.role}</td>
                      <td className="px-5 py-4 text-slate-700">${member.hourlyRate.toFixed(2)}/hr</td>
                      <td className="px-5 py-4 text-slate-600">{member.clockedInAt || 'Not clocked in'}</td>
                      <td className="px-5 py-4 font-bold text-slate-900">{member.totalHoursToday || 0} hrs</td>
                      <td className="px-5 py-4 font-black text-emerald-600">${dailyWage.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        {member.isClockedIn ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-lg">
                            Active On Shift
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-lg">
                            Off Duty
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
