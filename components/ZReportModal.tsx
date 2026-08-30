import React, { useState } from 'react';
import { Order, Location, ZReport, StaffMember } from '../types';
import { X, DollarSign, Calculator, Printer, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ZReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  location: Location;
  currentStaff: StaffMember;
  onSaveZReport: (report: ZReport) => void;
}

const ZReportModal: React.FC<ZReportModalProps> = ({
  isOpen,
  onClose,
  orders,
  location,
  currentStaff,
  onSaveZReport,
}) => {
  const [openingFloat, setOpeningFloat] = useState<number>(300.00);
  const [countedCash, setCountedCash] = useState<number>(750.00);
  const [notes, setNotes] = useState<string>('All registers audited. Card slips batched out successfully.');
  const [isFinalized, setIsFinalized] = useState(false);

  if (!isOpen) return null;

  // Filter orders for today / location
  const branchOrders = orders.filter(o => o.locationId === location.id);
  const totalOrdersCount = branchOrders.length;
  const totalGrossSales = branchOrders.reduce((acc, o) => acc + o.total, 0);
  const totalTaxCollected = branchOrders.reduce((acc, o) => acc + o.tax, 0);
  const totalDiscounts = branchOrders.reduce((acc, o) => acc + (o.discountAmount || 0), 0);

  // Breakdown by payment
  const cashSales = branchOrders
    .filter(o => o.paymentMethod === 'cash' || !o.paymentMethod)
    .reduce((acc, o) => acc + o.total, 0);

  const cardSales = branchOrders
    .filter(o => o.paymentMethod === 'card')
    .reduce((acc, o) => acc + o.total, 0);

  const digitalSales = branchOrders
    .filter(o => o.paymentMethod === 'digital' || o.paymentMethod === 'split')
    .reduce((acc, o) => acc + o.total, 0);

  const expectedCashInDrawer = openingFloat + cashSales;
  const cashVariance = countedCash - expectedCashInDrawer;
  const averageTicket = totalOrdersCount > 0 ? totalGrossSales / totalOrdersCount : 0;

  const handleCloseDay = () => {
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    const report: ZReport = {
      id: `zrep-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      locationId: location.id,
      closedBy: currentStaff.name,
      openingCashFloat: openingFloat,
      cashSales,
      cardSales,
      digitalSales,
      totalGrossSales,
      taxCollected: totalTaxCollected,
      discountTotal: totalDiscounts,
      actualCashCounted: countedCash,
      cashVariance,
      totalOrders: totalOrdersCount,
      averageTicket,
      notes,
      closedAt: new Date().toLocaleTimeString(),
    };

    onSaveZReport(report);
    setIsFinalized(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 rounded-xl text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">End-of-Day Z-Report Reconciliation</h3>
              <p className="text-xs text-slate-400">{location.name} • Shift Closing by {currentStaff.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Executive Totals Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Sales</span>
              <p className="text-2xl font-black text-slate-900 mt-1">${totalGrossSales.toFixed(2)}</p>
              <span className="text-[10px] text-slate-400">{totalOrdersCount} Completed Tickets</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Ticket Size</span>
              <p className="text-2xl font-black text-slate-900 mt-1">${averageTicket.toFixed(2)}</p>
              <span className="text-[10px] text-slate-400">Tax Collected: ${totalTaxCollected.toFixed(2)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Discounts</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">-${totalDiscounts.toFixed(2)}</p>
              <span className="text-[10px] text-slate-400">Promos & Staff Comps</span>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tender Breakdown</h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-800">Cash Collected</span>
                <p className="text-lg font-black text-emerald-950 mt-1">${cashSales.toFixed(2)}</p>
              </div>
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-800">Credit / Debit Card</span>
                <p className="text-lg font-black text-blue-950 mt-1">${cardSales.toFixed(2)}</p>
              </div>
              <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl">
                <span className="font-bold text-purple-800">Digital / Split Pay</span>
                <p className="text-lg font-black text-purple-950 mt-1">${digitalSales.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Cash Drawer Reconciliation Box */}
          <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-500" /> Physical Cash Drawer Audit
              </h4>
              <span className="text-xs text-slate-500">Blind Drop Protocol</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Opening Float ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Counted Physical Cash in Drawer ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={countedCash}
                  onChange={(e) => setCountedCash(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Expected in Drawer (Float + Cash Sales)</span>
                <p className="text-sm font-bold text-slate-800">${expectedCashInDrawer.toFixed(2)}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500">Cash Variance (Over / Short)</span>
                <p className={`text-base font-black ${
                  cashVariance === 0 ? 'text-emerald-600' : cashVariance > 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {cashVariance >= 0 ? `+$${cashVariance.toFixed(2)}` : `-$${Math.abs(cashVariance).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Manager Shift Closing Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Z-Report
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCloseDay}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Finalize & Lock Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZReportModal;
