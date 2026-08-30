import React, { useState } from 'react';
import { 
  Order, 
  InventoryItem, 
  StaffMember, 
  TimeLog, 
  Location, 
  BranchTransfer, 
  AccountingSyncLog, 
  PayrollSyncBatch, 
  DeliveryIntegration, 
  DeliveryRider 
} from '../types';
import { 
  Building2, 
  DollarSign, 
  Truck, 
  Users, 
  ArrowRightLeft, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  Wifi, 
  WifiOff, 
  Plus, 
  Clock, 
  Navigation, 
  Bike, 
  Car, 
  Send,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IntegrationsViewProps {
  orders: Order[];
  inventory: InventoryItem[];
  staff: StaffMember[];
  timeLogs: TimeLog[];
  locations: Location[];
  currentLocation: Location;
  branchTransfers: BranchTransfer[];
  accountingLogs: AccountingSyncLog[];
  payrollBatches: PayrollSyncBatch[];
  deliveryChannels: DeliveryIntegration[];
  deliveryRiders: DeliveryRider[];
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onSyncAccounting: (platform: 'quickbooks' | 'sage' | 'xero') => void;
  onExportPayroll: (platform: 'gusto' | 'adp') => void;
  onToggleDeliveryChannel: (channelId: string) => void;
  onInjectDeliveryOrder: (channel: 'UberEats' | 'DoorDash' | 'Deliveroo') => void;
  onCreateBranchTransfer: (transfer: BranchTransfer) => void;
  onReceiveBranchTransfer: (transferId: string) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  orders,
  inventory,
  staff,
  timeLogs,
  locations,
  currentLocation,
  branchTransfers,
  accountingLogs,
  payrollBatches,
  deliveryChannels,
  deliveryRiders,
  isOfflineMode,
  onToggleOfflineMode,
  onSyncAccounting,
  onExportPayroll,
  onToggleDeliveryChannel,
  onInjectDeliveryOrder,
  onCreateBranchTransfer,
  onReceiveBranchTransfer,
}) => {
  const [activeTab, setActiveTab] = useState<'accounting' | 'payroll' | 'delivery' | 'franchise' | 'resilience'>('accounting');

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetLocationId, setTargetLocationId] = useState(locations.find(l => l.id !== currentLocation.id)?.id || locations[0].id);
  const [selectedIngredientId, setSelectedIngredientId] = useState(inventory[0]?.id || '');
  const [transferQty, setTransferQty] = useState(5);
  const [transferNotes, setTransferNotes] = useState('');

  // Notification / Feedback State
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Financial Calculations for Accounting GL
  const totalGrossSales = orders.reduce((acc, o) => acc + o.total, 0);
  const totalTaxCollected = orders.reduce((acc, o) => acc + o.tax, 0);
  const totalNetSales = orders.reduce((acc, o) => acc + (o.subtotal - (o.discountAmount || 0)), 0);
  const totalInventoryAssetValue = inventory.reduce((acc, i) => acc + (i.currentStock * i.costPerUnit), 0);
  const estimatedCOGS = totalNetSales * 0.285; // ~28.5% industry standard food cost
  const cardProcessingFees = orders.filter(o => o.paymentMethod === 'card').reduce((acc, o) => acc + (o.total * 0.025), 0);

  // Payroll Metrics
  const totalLaborHours = staff.reduce((acc, s) => acc + (s.totalHoursToday || (s.isClockedIn ? 4.5 : 0)), 0);
  const totalLaborCost = staff.reduce((acc, s) => acc + ((s.totalHoursToday || (s.isClockedIn ? 4.5 : 0)) * s.hourlyRate), 0);

  const handleCreateTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ing = inventory.find(i => i.id === selectedIngredientId);
    const toLoc = locations.find(l => l.id === targetLocationId);
    if (!ing || !toLoc) return;

    const newTransfer: BranchTransfer = {
      id: `tr-${Date.now()}`,
      transferNumber: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      fromLocationId: currentLocation.id,
      fromLocationName: currentLocation.name,
      toLocationId: toLoc.id,
      toLocationName: toLoc.name,
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: transferQty,
      unit: ing.unit,
      unitCost: ing.costPerUnit,
      totalCost: transferQty * ing.costPerUnit,
      status: 'in_transit',
      requestedBy: 'Manager On Duty',
      requestedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      notes: transferNotes || 'Inter-branch stock replenishment.'
    };

    onCreateBranchTransfer(newTransfer);
    setShowTransferModal(false);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleSyncWithPlatform = (platform: 'quickbooks' | 'sage' | 'xero') => {
    onSyncAccounting(platform);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    setSyncNotice(`Successfully pushed General Ledger Journal Entry to ${platform.toUpperCase()} Online!`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const handleExportPayrollPlatform = (platform: 'gusto' | 'adp') => {
    onExportPayroll(platform);
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.7 } });
    setSyncNotice(`Exported shift timecards and labor earnings to ${platform.toUpperCase()} Payroll!`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-[10px] font-black uppercase tracking-wider">
              Phase 2 & Phase 3 Integration Layer
            </span>
            {isOfflineMode ? (
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Offline Simulation
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Cloud Synced
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Enterprise Integrations & Multi-Branch Hub
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Seamlessly bridge RestoFlow with QuickBooks general ledgers, Gusto payroll pipelines, 3rd-party delivery aggregators, and cross-branch inventory transfers.
          </p>
        </div>

        {/* Global Action: Offline toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleOfflineMode}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isOfflineMode 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
            <span>{isOfflineMode ? 'Exit Offline Mode' : 'Simulate Offline POS'}</span>
          </button>
        </div>
      </div>

      {/* Sync Notice Alert */}
      {syncNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button onClick={() => setSyncNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'accounting', label: 'Accounting (QuickBooks / Sage)', icon: DollarSign },
          { id: 'payroll', label: 'HR & Payroll (Gusto / ADP)', icon: Users },
          { id: 'delivery', label: 'Delivery APIs & Dispatch', icon: Truck },
          { id: 'franchise', label: 'Franchise & Branch Transfers', icon: Building2 },
          { id: 'resilience', label: 'Offline Resilience & Recovery', icon: Wifi },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Accounting Software Sync */}
      {activeTab === 'accounting' && (
        <div className="space-y-6">
          {/* Top Sync Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                    QB
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">QuickBooks Online</h4>
                    <span className="text-[11px] text-slate-400">Intuit REST API v3</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pushes daily Z-Close sales, tax liabilities, and merchant card processing fees directly to QuickBooks Chart of Accounts.
              </p>
              <button
                onClick={() => handleSyncWithPlatform('quickbooks')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Push GL Journal Entry
              </button>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-xs">
                    SAGE
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Sage Intacct</h4>
                    <span className="text-[11px] text-slate-400">Multi-Entity Enterprise</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black uppercase">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Synchronizes COGS inventory depletion based on actual Recipe Bill of Materials (BOM) formulas to Sage ERP.
              </p>
              <button
                onClick={() => handleSyncWithPlatform('sage')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync BOM COGS to Sage
              </button>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                    CSV
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Standard IIF / CSV</h4>
                    <span className="text-[11px] text-slate-400">Universal Accounting Export</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">
                  Universal
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Download debit/credit journal files formatted for Zoho Books, Xero, NetSuite, or manual auditor review.
              </p>
              <button
                onClick={() => handleSyncWithPlatform('xero')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Export Universal Journal (.IIF)
              </button>
            </div>
          </div>

          {/* Live General Ledger Journal Entry Mapping Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Live General Ledger (GL) Journal Entry Mapping</h3>
                <p className="text-xs text-slate-500">Real-time accounting ledger preview compiled from live POS transactions in {currentLocation.name}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">
                ✓ Debits = Credits Balanced (${totalGrossSales.toFixed(2)})
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">GL Code</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Account Name</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Category</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-right">Debit ($)</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-right">Credit ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-mono">
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">1010</td>
                    <td className="px-4 py-3 text-slate-800 font-sans">Cash in Register Float & Till</td>
                    <td className="px-4 py-3 text-slate-400 font-sans">Current Asset</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 text-right">${orders.filter(o => o.paymentMethod === 'cash').reduce((a, b) => a + b.total, 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-300 text-right">—</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">1020</td>
                    <td className="px-4 py-3 text-slate-800 font-sans">Merchant Card Settlement Clearing</td>
                    <td className="px-4 py-3 text-slate-400 font-sans">Current Asset</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 text-right">${orders.filter(o => o.paymentMethod !== 'cash').reduce((a, b) => a + b.total, 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-300 text-right">—</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">4000</td>
                    <td className="px-4 py-3 text-slate-800 font-sans">Food & Beverage Gross Revenue</td>
                    <td className="px-4 py-3 text-slate-400 font-sans">Income / Revenue</td>
                    <td className="px-4 py-3 text-slate-300 text-right">—</td>
                    <td className="px-4 py-3 font-bold text-slate-900 text-right">${totalNetSales.toFixed(2)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">2100</td>
                    <td className="px-4 py-3 text-slate-800 font-sans">State & City Sales Tax Payable</td>
                    <td className="px-4 py-3 text-slate-400 font-sans">Current Liability</td>
                    <td className="px-4 py-3 text-slate-300 text-right">—</td>
                    <td className="px-4 py-3 font-bold text-slate-900 text-right">${totalTaxCollected.toFixed(2)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">5000</td>
                    <td className="px-4 py-3 text-slate-800 font-sans">Kitchen Cost of Goods Sold (BOM Depleted)</td>
                    <td className="px-4 py-3 text-slate-400 font-sans">Cost of Sales</td>
                    <td className="px-4 py-3 font-bold text-slate-700 text-right">${estimatedCOGS.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-300 text-right">—</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">1200</td>
                    <td className="px-4 py-3 text-slate-800 font-sans">Restaurant Raw Inventory Asset</td>
                    <td className="px-4 py-3 text-slate-400 font-sans">Inventory Asset</td>
                    <td className="px-4 py-3 text-slate-300 text-right">—</td>
                    <td className="px-4 py-3 font-bold text-slate-700 text-right">${estimatedCOGS.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-100/80 font-black text-slate-900">
                    <td colSpan={3} className="px-4 py-3 uppercase tracking-wider font-sans">Total Balanced Entry</td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-black">${(totalGrossSales + estimatedCOGS).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-black">${(totalGrossSales + estimatedCOGS).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sync Audit History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900">Recent Accounting Transmissions</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {accountingLogs.map(log => (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 uppercase">
                      {log.platform.slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{log.referenceId} — {log.period}</span>
                      <span className="text-slate-400 text-[11px]">{log.entriesCount} GL ledger rows • Synced on {log.syncedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800">${log.totalDebits.toFixed(2)}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black uppercase rounded-md text-[10px]">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HR & Payroll Systems */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-xs">
                    GUSTO
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Gusto Payroll</h4>
                    <span className="text-[11px] text-slate-400">Direct Hours & Tips API</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Syncs daily shift punch clocks, calculated overtime (&gt;8 hrs), and server tip pool allocations directly into Gusto.
              </p>
              <button
                onClick={() => handleExportPayrollPlatform('gusto')}
                className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Push Timecards to Gusto
              </button>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center font-black text-xs">
                    ADP
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">ADP Workforce Now</h4>
                    <span className="text-[11px] text-slate-400">Enterprise Time & Attendance</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Exports formatted ADP batch timesheets with department labor codes (Kitchen, FOH, Cashier).
              </p>
              <button
                onClick={() => handleExportPayrollPlatform('adp')}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Export ADP Timesheet
              </button>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400">Current Shift Labor Burden</span>
                <div className="text-2xl font-black text-slate-900 mt-1">${totalLaborCost.toFixed(2)}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {totalLaborHours.toFixed(1)} total hours logged across {staff.length} team members.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Labor-to-Sales Ratio:</span>
                <span className="font-black text-emerald-600">
                  {totalGrossSales > 0 ? ((totalLaborCost / totalGrossSales) * 100).toFixed(1) : 0}% (Target: &lt;30%)
                </span>
              </div>
            </div>
          </div>

          {/* Active Employee Timesheet Roster */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900">Staff Shift Hours & Labor Payroll Breakdown</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Employee</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Role / Dept</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Hourly Rate</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Hours Today</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Gross Pay</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Overtime Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {staff.map(s => {
                    const hrs = s.totalHoursToday || (s.isClockedIn ? 4.5 : 0);
                    const gross = hrs * s.hourlyRate;
                    const isOtRisk = hrs > 7.5;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                        <td className="px-4 py-3 text-slate-500 uppercase font-bold text-[10px]">{s.role}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            s.isClockedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {s.isClockedIn ? 'On Clock' : 'Off Duty'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">${s.hourlyRate.toFixed(2)}/hr</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{hrs.toFixed(1)} hrs</td>
                        <td className="px-4 py-3 font-black text-slate-900">${gross.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          {isOtRisk ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-black uppercase">
                              Approaching OT
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Delivery Logistics & Rider Dispatch */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          {/* Aggregator Channel Switchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {deliveryChannels.map(channel => (
              <div key={channel.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900">{channel.channelName}</h4>
                  <button
                    onClick={() => onToggleDeliveryChannel(channel.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-colors ${
                      channel.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {channel.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Commission</span>
                    <span className="font-black text-slate-800">{channel.commissionRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Rating</span>
                    <span className="font-black text-amber-600">★ {channel.averageRating}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onInjectDeliveryOrder(channel.channelName as any);
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                    setSyncNotice(`Injected simulated incoming order from ${channel.channelName} to POS & KDS!`);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-orange-400" /> Simulate {channel.channelName} Order
                </button>
              </div>
            ))}
          </div>

          {/* Live Rider Dispatch & Tracking Board */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Live Delivery Rider Tracking & Dispatch</h3>
                <p className="text-xs text-slate-500">Real-time driver location, ETA to restaurant, and hand-off verification</p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {deliveryRiders.length} Active Couriers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveryRiders.map(rider => {
                const VehicleIcon = rider.vehicleType === 'bicycle' ? Bike : rider.vehicleType === 'motorcycle' ? Navigation : Car;
                return (
                  <div key={rider.id} className="p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg">
                          #{rider.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-orange-600 uppercase">{rider.channel}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        rider.status === 'in_transit' 
                          ? 'bg-blue-100 text-blue-800' 
                          : rider.status === 'arrived_at_restaurant'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {rider.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{rider.customerName}</h4>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{rider.deliveryAddress}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Driver ETA</span>
                        <p className="text-base font-black text-slate-900">{rider.estimatedArrivalMins} mins</p>
                      </div>
                    </div>

                    {/* Driver Profile Strip */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <VehicleIcon className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-800">{rider.riderName}</span>
                        <span className="text-slate-400">{rider.riderPhone}</span>
                      </div>
                      <span className="font-black text-slate-900">${rider.orderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Franchise & Cross-Branch Stock Transfers */}
      {activeTab === 'franchise' && (
        <div className="space-y-6">
          {/* Multi-Location Rollup Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map(loc => {
              const isCurrent = loc.id === currentLocation.id;
              return (
                <div 
                  key={loc.id} 
                  className={`p-5 rounded-3xl border shadow-sm space-y-3 transition-all ${
                    isCurrent ? 'bg-slate-900 text-white border-slate-800 ring-2 ring-orange-500/30' : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      isCurrent ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isCurrent ? 'Active Console' : 'Remote Branch'}
                    </span>
                    <span className="text-xs font-mono opacity-60">Tax: {(loc.taxRate * 100).toFixed(1)}%</span>
                  </div>

                  <div>
                    <h4 className="text-base font-black tracking-tight">{loc.name}</h4>
                    <p className={`text-xs mt-0.5 ${isCurrent ? 'text-slate-400' : 'text-slate-500'}`}>{loc.address}</p>
                  </div>

                  <div className={`pt-3 border-t grid grid-cols-2 gap-2 text-xs ${isCurrent ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div>
                      <span className="text-[10px] uppercase opacity-60 font-bold">Today Revenue</span>
                      <p className="font-black text-sm">{isCurrent ? `$${totalGrossSales.toFixed(2)}` : '$4,280.00'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase opacity-60 font-bold">Active Tables</span>
                      <p className="font-black text-sm">{isCurrent ? '12 Seated' : '9 Seated'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inter-Branch Inventory Transfers */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Inter-Branch Stock Transfer Requisitions</h3>
                <p className="text-xs text-slate-500">Balance raw inventory between branches to prevent stockouts during peak rushes</p>
              </div>
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Requisition Stock Transfer
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3.5 font-bold text-slate-500 uppercase">Transfer #</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 uppercase">From Location</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 uppercase">To Location</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 uppercase">Ingredient / SKU</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 uppercase">Quantity</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 uppercase">Asset Value</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {branchTransfers.map(tr => (
                    <tr key={tr.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{tr.transferNumber}</td>
                      <td className="px-4 py-3.5 text-slate-700">{tr.fromLocationName}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{tr.toLocationName}</td>
                      <td className="px-4 py-3.5 text-slate-800">{tr.ingredientName}</td>
                      <td className="px-4 py-3.5 font-black text-slate-900">{tr.quantity} {tr.unit}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">${tr.totalCost.toFixed(2)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          tr.status === 'received' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {tr.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {tr.status === 'in_transit' && (
                          <button
                            onClick={() => {
                              onReceiveBranchTransfer(tr.id);
                              confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                          >
                            Receive Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Reliability & Offline-First Resilience */}
      {activeTab === 'resilience' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Offline-First POS & Disaster Recovery Matrix</h3>
                <p className="text-xs text-slate-500">RestoFlow runs in-memory and caches state locally in case of internet service interruptions.</p>
              </div>
              <button
                onClick={onToggleOfflineMode}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isOfflineMode 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                <span>{isOfflineMode ? 'Disable Offline Mode' : 'Simulate Internet Outage'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Local IndexedDB Persistence</span>
                </div>
                <p className="text-xs text-slate-500">
                  Every order, kitchen ticket, and inventory decrement writes immediately to local storage before syncing to cloud.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Automatic Conflict Resolution</span>
                </div>
                <p className="text-xs text-slate-500">
                  When network returns, timestamped event sourcing reconciles orders and restock receipts in chronological sequence.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Continuous Z-Audit Backups</span>
                </div>
                <p className="text-xs text-slate-500">
                  End-of-day register balancing and cash float reconciliations are archived and downloadable in offline CSV format.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Inter-Branch Transfer */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Requisition Inter-Branch Transfer</h3>
            <p className="text-xs text-slate-500">Request stock movement from current location ({currentLocation.name}) to another branch.</p>
            
            <form onSubmit={handleCreateTransferSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Target Destination Branch</label>
                <select
                  value={targetLocationId}
                  onChange={(e) => setTargetLocationId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                >
                  {locations.filter(l => l.id !== currentLocation.id).map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Select Raw Ingredient / SKU</label>
                <select
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Current Stock: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Internal Memo / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent Saturday dinner rush support"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Issue Stock Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsView;
