import React, { useState, useMemo } from 'react';
import { 
  PurchaseOrder, 
  PurchaseOrderItem, 
  DeliveryNote, 
  DeliveryNoteItem, 
  VendorInvoice, 
  VendorInvoiceItem, 
  PurchaseReturn, 
  PurchaseReturnItem, 
  Supplier, 
  InventoryItem, 
  AppSettings, 
  PaymentTerms, 
  PurchaseOrderStatus,
  SupportedCurrencyCode
} from '../types';
import { 
  ShoppingBag, 
  Truck, 
  FileText, 
  RotateCcw, 
  Building2, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Filter, 
  Printer, 
  ArrowRight, 
  ChevronRight, 
  Layers, 
  Check, 
  X, 
  CreditCard, 
  ShieldCheck, 
  Eye, 
  Download, 
  Sparkles,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CURRENCY_SYMBOLS: Record<SupportedCurrencyCode, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  AED: 'AED ',
  CNY: '¥',
  JPY: '¥',
  INR: '₹',
  CHF: 'CHF ',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R'
};

interface PurchasingViewProps {
  initialTab?: 'overview' | 'po' | 'grn' | 'invoices' | 'returns' | 'suppliers';
  purchaseOrders: PurchaseOrder[];
  deliveryNotes: DeliveryNote[];
  vendorInvoices: VendorInvoice[];
  purchaseReturns: PurchaseReturn[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  settings?: AppSettings;
  branchName?: string;
  currentLocationId: string;
  onCreatePO: (po: PurchaseOrder) => void;
  onUpdatePOStatus: (poId: string, status: PurchaseOrderStatus) => void;
  onLogDeliveryNote: (grn: DeliveryNote, autoRestock?: boolean) => void;
  onCreateVendorInvoice: (invoice: VendorInvoice) => void;
  onRecordInvoicePayment: (invoiceId: string, payment: { amount: number; method: 'bank_transfer' | 'corporate_card' | 'check' | 'ach' | 'cash'; reference: string }) => void;
  onCreatePurchaseReturn: (ret: PurchaseReturn, deductStock?: boolean) => void;
  onUpdateStock?: (ingredientId: string, newStock: number) => void;
}

export const PurchasingView: React.FC<PurchasingViewProps> = ({
  initialTab = 'overview',
  purchaseOrders,
  deliveryNotes,
  vendorInvoices,
  purchaseReturns,
  suppliers,
  inventory,
  settings,
  branchName = 'Downtown Main Bistro',
  currentLocationId,
  onCreatePO,
  onUpdatePOStatus,
  onLogDeliveryNote,
  onCreateVendorInvoice,
  onRecordInvoicePayment,
  onCreatePurchaseReturn,
  onUpdateStock
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'po' | 'grn' | 'invoices' | 'returns' | 'suppliers'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [showLogGRNModal, setShowLogGRNModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateReturnModal, setShowCreateReturnModal] = useState(false);
  const [selectedPOForView, setSelectedPOForView] = useState<PurchaseOrder | null>(null);
  const [selectedGRNForView, setSelectedGRNForView] = useState<DeliveryNote | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<VendorInvoice | null>(null);
  const [selectedMatchInvoice, setSelectedMatchInvoice] = useState<VendorInvoice | null>(null);

  // Form states for new PO
  const [poSupplierId, setPoSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poExpectedDate, setPoExpectedDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [poPaymentTerms, setPoPaymentTerms] = useState<PaymentTerms>('Net 30');
  const [poNotes, setPoNotes] = useState('');
  const [poCurrencyCode, setPoCurrencyCode] = useState<SupportedCurrencyCode>(
    (settings?.taxAndCurrency?.currencyCode as SupportedCurrencyCode) || 'NGN'
  );
  const [poExchangeRate, setPoExchangeRate] = useState<number>(
    settings?.taxAndCurrency?.exchangeRates?.[(settings?.taxAndCurrency?.currencyCode as SupportedCurrencyCode) || 'NGN'] || 1
  );
  const [poItems, setPoItems] = useState<{ ingredientId: string; quantity: number; unitCost: number }[]>([
    { ingredientId: inventory[0]?.id || '', quantity: 10, unitCost: inventory[0]?.costPerUnit || 1.0 }
  ]);

  // Form states for GRN (Goods Receipt)
  const [grnSelectedPoId, setGrnSelectedPoId] = useState<string>('');
  const [grnCarrier, setGrnCarrier] = useState('');
  const [grnSlipNumber, setGrnSlipNumber] = useState('');
  const [grnInspector, setGrnInspector] = useState('Current Supervisor');
  const [grnNotes, setGrnNotes] = useState('');
  const [grnItems, setGrnItems] = useState<DeliveryNoteItem[]>([]);
  const [grnAutoRestock, setGrnAutoRestock] = useState(true);

  // Form states for Invoice
  const [invNumber, setInvNumber] = useState('');
  const [invPoId, setInvPoId] = useState('');
  const [invSupplierId, setInvSupplierId] = useState(suppliers[0]?.id || '');
  const [invDate, setInvDate] = useState(new Date().toISOString().slice(0, 10));
  const [invDueDate, setInvDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [invTerms, setInvTerms] = useState<PaymentTerms>('Net 30');
  const [invCurrencyCode, setInvCurrencyCode] = useState<SupportedCurrencyCode>(
    (settings?.taxAndCurrency?.currencyCode as SupportedCurrencyCode) || 'NGN'
  );
  const [invExchangeRate, setInvExchangeRate] = useState<number>(
    settings?.taxAndCurrency?.exchangeRates?.[(settings?.taxAndCurrency?.currencyCode as SupportedCurrencyCode) || 'NGN'] || 1
  );
  const [invItems, setInvItems] = useState<VendorInvoiceItem[]>([]);
  const [invNotes, setInvNotes] = useState('');

  // Form states for Payment
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'bank_transfer' | 'corporate_card' | 'check' | 'ach' | 'cash'>('ach');
  const [payReference, setPayReference] = useState('');

  // Form states for Return / Debit Note
  const [retSupplierId, setRetSupplierId] = useState(suppliers[0]?.id || '');
  const [retPoId, setRetPoId] = useState('');
  const [retGrnId, setRetGrnId] = useState('');
  const [retReason, setRetReason] = useState<'damaged_delivery' | 'expired_spoiled' | 'wrong_specification' | 'excess_overshipped' | 'failed_qa'>('damaged_delivery');
  const [retItems, setRetItems] = useState<PurchaseReturnItem[]>([]);
  const [retNotes, setRetNotes] = useState('');

  const currencySymbol = settings?.taxAndCurrency?.currencySymbol || '₦';
  const currencyCode = settings?.taxAndCurrency?.currencyCode || 'NGN';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPIs Calculations
  const stats = useMemo(() => {
    const totalPosCount = purchaseOrders.length;
    const openPos = purchaseOrders.filter(p => p.status === 'ordered' || p.status === 'submitted' || p.status === 'partially_received');
    const openPosValue = openPos.reduce((sum, p) => sum + p.totalAmount, 0);

    const totalInvoices = vendorInvoices.length;
    const unpaidInvoices = vendorInvoices.filter(i => i.paymentStatus === 'unpaid' || i.paymentStatus === 'partially_paid');
    const totalApOutstanding = unpaidInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

    const totalGrnCount = deliveryNotes.length;
    const totalReturnsCount = purchaseReturns.length;
    const totalRefundsValue = purchaseReturns.reduce((sum, r) => sum + r.totalRefundAmount, 0);

    const totalSpendThisMonth = vendorInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalPosCount,
      openPosCount: openPos.length,
      openPosValue,
      totalInvoices,
      unpaidInvoicesCount: unpaidInvoices.length,
      totalApOutstanding,
      totalGrnCount,
      totalReturnsCount,
      totalRefundsValue,
      totalSpendThisMonth
    };
  }, [purchaseOrders, vendorInvoices, deliveryNotes, purchaseReturns]);

  // Handlers for PO Creation
  const handleAddPoItemRow = () => {
    const firstItem = inventory[0];
    setPoItems(prev => [
      ...prev,
      { ingredientId: firstItem?.id || '', quantity: 10, unitCost: firstItem?.costPerUnit || 1.0 }
    ]);
  };

  const handleRemovePoItemRow = (index: number) => {
    setPoItems(prev => prev.filter((_, i) => i !== index));
  };

  const handlePoItemChange = (index: number, field: 'ingredientId' | 'quantity' | 'unitCost', value: any) => {
    setPoItems(prev => {
      const updated = [...prev];
      const row = { ...updated[index] };
      if (field === 'ingredientId') {
        const item = inventory.find(i => i.id === value);
        row.ingredientId = value;
        if (item) row.unitCost = item.costPerUnit;
      } else if (field === 'quantity') {
        row.quantity = Math.max(0.1, Number(value));
      } else if (field === 'unitCost') {
        row.unitCost = Math.max(0, Number(value));
      }
      updated[index] = row;
      return updated;
    });
  };

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === poSupplierId);
    if (!sup) return;

    const formattedItems: PurchaseOrderItem[] = poItems.map(row => {
      const ing = inventory.find(i => i.id === row.ingredientId);
      return {
        ingredientId: row.ingredientId,
        ingredientName: ing?.name || 'Item',
        quantity: row.quantity,
        unit: ing?.unit || 'units',
        unitCost: row.unitCost,
        totalCost: Number((row.quantity * row.unitCost).toFixed(2)),
        receivedQty: 0
      };
    });

    const rawTotal = formattedItems.reduce((s, i) => s + i.totalCost, 0);
    const isForeign = poCurrencyCode !== currencyCode;
    const rate = isForeign ? (poExchangeRate || settings?.taxAndCurrency?.exchangeRates?.[poCurrencyCode] || 1) : 1;
    const baseTotal = isForeign ? Number((rawTotal * rate).toFixed(2)) : rawTotal;
    const foreignTotal = isForeign ? rawTotal : undefined;
    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 101).padStart(3, '0')}`;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: sup.id,
      supplierName: sup.name,
      items: formattedItems,
      subtotal: baseTotal,
      taxAmount: 0,
      totalAmount: baseTotal,
      currencyCode: poCurrencyCode,
      currencySymbol: CURRENCY_SYMBOLS[poCurrencyCode] || currencySymbol,
      exchangeRate: rate,
      foreignTotalAmount: foreignTotal,
      status: 'submitted',
      createdAt: new Date().toISOString().slice(0, 10),
      expectedDate: poExpectedDate,
      locationId: currentLocationId,
      paymentTerms: poPaymentTerms,
      notes: poNotes,
      createdByName: 'Current Manager'
    };

    onCreatePO(newPO);
    setShowCreatePOModal(false);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    showToast(`Purchase Order ${poNumber} created and dispatched to ${sup.name}`);
  };

  // Prepare GRN from PO selection
  const handleSelectPoForGrn = (poId: string) => {
    setGrnSelectedPoId(poId);
    const targetPo = purchaseOrders.find(p => p.id === poId);
    if (targetPo) {
      setGrnItems(
        targetPo.items.map(item => ({
          ingredientId: item.ingredientId,
          ingredientName: item.ingredientName,
          orderedQty: item.quantity,
          receivedQty: item.quantity,
          rejectedQty: 0,
          unit: item.unit,
          unitCost: item.unitCost,
          condition: 'good',
          batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          notes: ''
        }))
      );
    }
  };

  const handleSaveGRN = (e: React.FormEvent) => {
    e.preventDefault();
    const po = purchaseOrders.find(p => p.id === grnSelectedPoId);
    if (!po) return;

    const grnNumber = `GRN-${new Date().getFullYear()}-${String(deliveryNotes.length + 101).padStart(3, '0')}`;
    const hasRejections = grnItems.some(i => i.rejectedQty > 0 || i.condition !== 'good');

    const newGRN: DeliveryNote = {
      id: `grn-${Date.now()}`,
      grnNumber,
      poId: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      locationId: currentLocationId,
      receivedDate: new Date().toISOString().slice(0, 10),
      deliverySlipNumber: grnSlipNumber || `SLIP-${Date.now().toString().slice(-5)}`,
      carrierOrDriver: grnCarrier || 'Courier Delivery',
      inspectedBy: grnInspector,
      currencyCode: po.currencyCode || currencyCode,
      currencySymbol: po.currencySymbol || currencySymbol,
      exchangeRate: po.exchangeRate || 1,
      items: grnItems,
      status: hasRejections ? 'partially_accepted' : 'stored_in_inventory',
      inventoryRestocked: grnAutoRestock,
      notes: grnNotes
    };

    onLogDeliveryNote(newGRN, grnAutoRestock);

    // If auto-restock enabled, automatically increment inventory
    if (grnAutoRestock && onUpdateStock) {
      grnItems.forEach(item => {
        const invItem = inventory.find(i => i.id === item.ingredientId);
        if (invItem && item.receivedQty > 0) {
          onUpdateStock(item.ingredientId, invItem.currentStock + item.receivedQty);
        }
      });
    }

    // Auto-update PO status
    const allReceived = grnItems.every(i => i.receivedQty >= i.orderedQty);
    onUpdatePOStatus(po.id, allReceived ? 'received' : 'partially_received');

    setShowLogGRNModal(false);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    showToast(`Delivery Note ${grnNumber} saved! Inventory stock restocked automatically.`);
  };

  // Pre-fill invoice when PO is selected
  const handleSelectPoForInvoice = (poId: string) => {
    setInvPoId(poId);
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      setInvSupplierId(po.supplierId);
      if (po.paymentTerms) setInvTerms(po.paymentTerms);
      if (po.currencyCode) {
        setInvCurrencyCode(po.currencyCode as SupportedCurrencyCode);
        setInvExchangeRate(po.exchangeRate || settings?.taxAndCurrency?.exchangeRates?.[po.currencyCode as SupportedCurrencyCode] || 1);
      }
      setInvItems(
        po.items.map(item => ({
          ingredientId: item.ingredientId,
          ingredientName: item.ingredientName,
          quantity: item.quantity,
          unit: item.unit,
          unitCost: item.unitCost,
          totalCost: item.totalCost
        }))
      );
    }
  };

  // Vendor Invoice Creation
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === invSupplierId);
    if (!sup) return;

    const po = purchaseOrders.find(p => p.id === invPoId);
    const rawSubtotal = invItems.reduce((acc, i) => acc + i.totalCost, 0);
    const isForeign = invCurrencyCode !== currencyCode;
    const rate = isForeign ? (invExchangeRate || settings?.taxAndCurrency?.exchangeRates?.[invCurrencyCode] || 1) : 1;
    const baseTotal = isForeign ? Number((rawSubtotal * rate).toFixed(2)) : rawSubtotal;
    const foreignTotal = isForeign ? rawSubtotal : undefined;

    const newInvoice: VendorInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber || `INV-${Date.now().toString().slice(-6)}`,
      poId: po?.id,
      poNumber: po?.poNumber,
      supplierId: sup.id,
      supplierName: sup.name,
      invoiceDate: invDate,
      dueDate: invDueDate,
      items: invItems,
      subtotal: baseTotal,
      taxAmount: 0,
      totalAmount: baseTotal,
      currencyCode: invCurrencyCode,
      currencySymbol: CURRENCY_SYMBOLS[invCurrencyCode] || currencySymbol,
      exchangeRate: rate,
      foreignTotalAmount: foreignTotal,
      amountPaid: 0,
      balanceDue: baseTotal,
      paymentStatus: 'unpaid',
      threeWayMatchStatus: po ? 'matched' : 'unmatched',
      paymentTerms: invTerms,
      paymentRecords: [],
      notes: invNotes,
      locationId: currentLocationId
    };

    onCreateVendorInvoice(newInvoice);
    setShowCreateInvoiceModal(false);
    showToast(`Vendor Invoice ${newInvoice.invoiceNumber} recorded in Accounts Payable.`);
  };

  // Invoice Payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    onRecordInvoicePayment(selectedInvoiceForPayment.id, {
      amount: payAmount,
      method: payMethod,
      reference: payReference || `REF-${Date.now().toString().slice(-6)}`
    });

    setShowPaymentModal(false);
    setSelectedInvoiceForPayment(null);
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
    showToast(`Payment of ${currencySymbol}${payAmount.toFixed(2)} recorded successfully.`);
  };

  // Purchase Return / Debit Note
  const handleSavePurchaseReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === retSupplierId);
    if (!sup) return;

    const totalRefund = retItems.reduce((sum, i) => sum + i.totalCost, 0);
    const returnNumber = `DN-${new Date().getFullYear()}-${String(purchaseReturns.length + 101).padStart(3, '0')}`;

    const newReturn: PurchaseReturn = {
      id: `pr-${Date.now()}`,
      returnNumber,
      poId: retPoId || undefined,
      grnId: retGrnId || undefined,
      supplierId: sup.id,
      supplierName: sup.name,
      returnDate: new Date().toISOString().slice(0, 10),
      items: retItems,
      totalRefundAmount: totalRefund,
      status: 'credit_note_issued',
      creditNoteNumber: `CN-${Date.now().toString().slice(-4)}`,
      refundMethod: 'credit_balance',
      processedBy: 'Current Supervisor',
      locationId: currentLocationId,
      notes: retNotes
    };

    onCreatePurchaseReturn(newReturn, true);
    setShowCreateReturnModal(false);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    showToast(`Debit Note ${returnNumber} generated for ${currencySymbol}${totalRefund.toFixed(2)}.`);
  };

  return (
    <div className="flex-1 bg-slate-900 text-white min-h-screen p-4 sm:p-6 overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Purchasing & Procurement Suite
                <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg">
                  Enterprise ERP
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                End-to-end procurement lifecycle from PO generation, Delivery Notes (GRN), 3-Way Match Invoices to Vendor Refunds.
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => {
              // Pre-fill first item
              setPoItems([{ ingredientId: inventory[0]?.id || '', quantity: 20, unitCost: inventory[0]?.costPerUnit || 2.0 }]);
              setShowCreatePOModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Order (PO)</span>
          </button>

          <button
            onClick={() => {
              const eligiblePo = purchaseOrders.find(p => p.status === 'ordered' || p.status === 'submitted');
              if (eligiblePo) handleSelectPoForGrn(eligiblePo.id);
              setShowLogGRNModal(true);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl transition-all border border-slate-700 flex items-center gap-2 active:scale-95"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Receive Delivery (GRN)</span>
          </button>

          <button
            onClick={() => {
              const po = purchaseOrders[0];
              if (po) {
                setInvPoId(po.id);
                setInvSupplierId(po.supplierId);
                setInvItems(po.items.map(i => ({ ingredientId: i.ingredientId, ingredientName: i.ingredientName, quantity: i.quantity, unit: i.unit, unitCost: i.unitCost, totalCost: i.totalCost })));
              }
              setShowCreateInvoiceModal(true);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl transition-all border border-slate-700 flex items-center gap-2 active:scale-95"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Log Vendor Bill</span>
          </button>

          <button
            onClick={() => {
              setRetItems([{ ingredientId: inventory[0]?.id || '', ingredientName: inventory[0]?.name || 'Item', returnQty: 2, unit: inventory[0]?.unit || 'kg', unitCost: inventory[0]?.costPerUnit || 5, totalCost: 10, reason: 'damaged_delivery' }]);
              setShowCreateReturnModal(true);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl transition-all border border-slate-700 flex items-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Debit / Return Note</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-4 border-b border-slate-800 no-scrollbar">
        {[
          { id: 'overview', label: 'Procurement Dashboard', icon: TrendingUp },
          { id: 'po', label: `Purchase Orders (${purchaseOrders.length})`, icon: ShoppingBag, badge: stats.openPosCount > 0 ? `${stats.openPosCount} Open` : null },
          { id: 'grn', label: `Goods Received / GRN (${deliveryNotes.length})`, icon: Truck },
          { id: 'invoices', label: `Vendor Invoices & 3-Way Match (${vendorInvoices.length})`, icon: FileText, badge: stats.unpaidInvoicesCount > 0 ? `${stats.unpaidInvoicesCount} Due` : null },
          { id: 'returns', label: `Returns & Debit Notes (${purchaseReturns.length})`, icon: RotateCcw },
          { id: 'suppliers', label: `Suppliers & Vendors (${suppliers.length})`, icon: Building2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 ml-1">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Views */}
      <div className="py-6 space-y-6">

        {/* TAB 1: OVERVIEW / DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Open PO Commitments</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {currencySymbol}{stats.openPosValue.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-blue-400 font-bold">{stats.openPosCount} POs</span> awaiting vendor fulfillment
                </div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Accounts Payable (Due)</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {currencySymbol}{stats.totalApOutstanding.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-amber-400 font-bold">{stats.unpaidInvoicesCount} bills</span> pending settlement
                </div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Deliveries Logged (GRN)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {stats.totalGrnCount} Shipments
                </div>
                <div className="text-[11px] text-slate-400">
                  Auto-synced into kitchen inventory
                </div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Vendor Credit Notes / Returns</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-400">
                  {currencySymbol}{stats.totalRefundsValue.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-rose-400 font-bold">{stats.totalReturnsCount} Debit Notes</span> issued for QA rejections
                </div>
              </div>
            </div>

            {/* Procurement Lifecycle Pipeline Visualizer */}
            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Automated 4-Stage Procurement Workflow
                  </h3>
                  <p className="text-xs text-slate-400">Integrated tracking from supplier order to invoice clearance</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  SOX & QA Compliant
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400">1. Purchase Order</span>
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">Automated ingredient replenishment or custom order created with unit prices and terms.</p>
                </div>

                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400">2. Delivery GRN & QA</span>
                    <Truck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">Shipment inspected on loading dock. Accepted quantities automatically update ingredient stock.</p>
                </div>

                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400">3. 3-Way Match Invoice</span>
                    <FileText className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">Vendor bill verified against PO unit cost and Delivery Note count to prevent overbilling.</p>
                </div>

                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-400">4. Payment & Debit Note</span>
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">Disburse payment via ACH/Card or apply Debit Note refunds for spoiled/damaged goods.</p>
                </div>
              </div>
            </div>

            {/* Recent Procurement Activities Dual Column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active POs */}
              <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-400" /> Active Purchase Orders
                  </h3>
                  <button onClick={() => setActiveTab('po')} className="text-xs font-bold text-blue-400 hover:text-blue-300">
                    View All →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {purchaseOrders.slice(0, 4).map(po => (
                    <div key={po.id} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{po.poNumber}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            po.status === 'received' ? 'bg-emerald-500/20 text-emerald-400' :
                            po.status === 'ordered' ? 'bg-blue-500/20 text-blue-400' :
                            po.status === 'partially_received' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {po.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">{po.supplierName} • {po.items.length} items</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-white block">{currencySymbol}{po.totalAmount.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500">Exp: {po.expectedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invoices / AP */}
              <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" /> Pending Invoices & Matching
                  </h3>
                  <button onClick={() => setActiveTab('invoices')} className="text-xs font-bold text-amber-400 hover:text-amber-300">
                    View Invoices →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {vendorInvoices.slice(0, 4).map(inv => (
                    <div key={inv.id} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{inv.invoiceNumber}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            inv.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                            inv.paymentStatus === 'unpaid' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            inv.threeWayMatchStatus === 'matched' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {inv.threeWayMatchStatus === 'matched' ? '3-Way Matched' : 'Variance Check'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">{inv.supplierName} • Due: {inv.dueDate}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-white block">{currencySymbol}{inv.totalAmount.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400">Bal: {currencySymbol}{inv.balanceDue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PURCHASE ORDERS */}
        {activeTab === 'po' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search PO # or supplier..."
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="ordered">Ordered</option>
                  <option value="partially_received">Partially Received</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setShowCreatePOModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Create Purchase Order
              </button>
            </div>

            {/* PO List Table */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">PO Number</th>
                      <th className="py-3.5 px-4 font-bold">Supplier</th>
                      <th className="py-3.5 px-4 font-bold">Order Date</th>
                      <th className="py-3.5 px-4 font-bold">Expected Date</th>
                      <th className="py-3.5 px-4 font-bold">Items Count</th>
                      <th className="py-3.5 px-4 font-bold">Total Amount</th>
                      <th className="py-3.5 px-4 font-bold">Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {purchaseOrders
                      .filter(po => {
                        const matchSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) || po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchStatus = statusFilter === 'all' || po.status === statusFilter;
                        return matchSearch && matchStatus;
                      })
                      .map(po => (
                        <tr key={po.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {po.poNumber}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-200">
                            {po.supplierName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">{po.createdAt}</td>
                          <td className="py-3.5 px-4 text-slate-300 font-medium">{po.expectedDate}</td>
                          <td className="py-3.5 px-4">{po.items.length} items</td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            {po.foreignTotalAmount && po.currencyCode && po.currencyCode !== currencyCode ? (
                              <div>
                                <div className="text-white">
                                  {po.currencySymbol || CURRENCY_SYMBOLS[po.currencyCode as SupportedCurrencyCode] || po.currencyCode}
                                  {po.foreignTotalAmount.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  ≈ {currencySymbol}{po.totalAmount.toFixed(2)} (@ ₦{po.exchangeRate || 1})
                                </div>
                              </div>
                            ) : (
                              <span>{currencySymbol}{po.totalAmount.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              po.status === 'received' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              po.status === 'ordered' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              po.status === 'submitted' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                              po.status === 'partially_received' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {po.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedPOForView(po)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                title="View & Print PO Document"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              {po.status !== 'received' && po.status !== 'cancelled' && (
                                <button
                                  onClick={() => {
                                    handleSelectPoForGrn(po.id);
                                    setShowLogGRNModal(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border border-emerald-500/30"
                                  title="Record delivery note for this PO"
                                >
                                  <Truck className="w-3.5 h-3.5" /> Receive GRN
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GOODS RECEIVED / DELIVERY NOTES (GRN) */}
        {activeTab === 'grn' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white">Goods Receipt Notes (GRN) & Inbound Inspections</h3>
                <p className="text-xs text-slate-400">Verify packing slips, log delivery temperature & condition, and auto-restock inventory.</p>
              </div>
              <button
                onClick={() => setShowLogGRNModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Log New Delivery Note
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveryNotes.map(grn => (
                <div key={grn.id} className="p-5 bg-slate-950/90 border border-slate-800 rounded-3xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{grn.grnNumber}</span>
                        <span className="text-[10px] text-slate-400">PO: {grn.poNumber} • Slip: {grn.deliverySlipNumber}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      grn.status === 'stored_in_inventory' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      grn.status === 'partially_accepted' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {grn.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Supplier:</span>
                      <span className="font-bold text-slate-200">{grn.supplierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Received Date:</span>
                      <span>{grn.receivedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Carrier / Driver:</span>
                      <span>{grn.carrierOrDriver}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Inspected By:</span>
                      <span>{grn.inspectedBy}</span>
                    </div>
                  </div>

                  {/* Items breakdown */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Item Intake QA</span>
                    <div className="divide-y divide-slate-800 bg-slate-900/40 rounded-xl p-2 border border-slate-800">
                      {grn.items.map((item, i) => (
                        <div key={i} className="py-1.5 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-white block">{item.ingredientName}</span>
                            <span className="text-slate-400">
                              Received: <strong className="text-emerald-400">{item.receivedQty}</strong> / {item.orderedQty} {item.unit}
                              {item.rejectedQty > 0 && <span className="text-red-400 ml-1">({item.rejectedQty} rejected)</span>}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.condition === 'good' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                          }`}>
                            {item.condition}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {grn.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                      "{grn.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VENDOR INVOICES & 3-WAY MATCH */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white">Accounts Payable Invoices & Automated 3-Way Match</h3>
                <p className="text-xs text-slate-400">Cross-reference vendor invoices against purchase orders and loading dock receipt counts.</p>
              </div>
              <button
                onClick={() => setShowCreateInvoiceModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Enter Vendor Bill
              </button>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Invoice #</th>
                      <th className="py-3.5 px-4 font-bold">Supplier</th>
                      <th className="py-3.5 px-4 font-bold">Ref PO / GRN</th>
                      <th className="py-3.5 px-4 font-bold">Invoice Date</th>
                      <th className="py-3.5 px-4 font-bold">Due Date</th>
                      <th className="py-3.5 px-4 font-bold">Total Amount</th>
                      <th className="py-3.5 px-4 font-bold">3-Way Match</th>
                      <th className="py-3.5 px-4 font-bold">Payment Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {vendorInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{inv.supplierName}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{inv.poNumber || 'Direct'}</td>
                        <td className="py-3.5 px-4 text-slate-400">{inv.invoiceDate}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">{inv.dueDate}</td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {inv.foreignTotalAmount && inv.currencyCode && inv.currencyCode !== currencyCode ? (
                            <div>
                              <div className="text-white">
                                {inv.currencySymbol || CURRENCY_SYMBOLS[inv.currencyCode as SupportedCurrencyCode] || inv.currencyCode}
                                {inv.foreignTotalAmount.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                ≈ {currencySymbol}{inv.totalAmount.toFixed(2)} (@ ₦{inv.exchangeRate || 1})
                              </div>
                            </div>
                          ) : (
                            <span>{currencySymbol}{inv.totalAmount.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedMatchInvoice(inv)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                              inv.threeWayMatchStatus === 'matched'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                                : 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900'
                            }`}
                          >
                            {inv.threeWayMatchStatus === 'matched' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            <span>{inv.threeWayMatchStatus === 'matched' ? 'Matched 100%' : 'Variance'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            inv.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            inv.paymentStatus === 'partially_paid' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.balanceDue > 0 ? (
                              <button
                                onClick={() => {
                                  setSelectedInvoiceForPayment(inv);
                                  setPayAmount(inv.balanceDue);
                                  setShowPaymentModal(true);
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                              >
                                <CreditCard className="w-3 h-3" /> Pay ({currencySymbol}{inv.balanceDue.toFixed(2)})
                              </button>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Settled
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RETURNS & DEBIT NOTES */}
        {activeTab === 'returns' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white">Purchase Returns & Vendor Debit Notes</h3>
                <p className="text-xs text-slate-400">Issue debit memos for rejected deliveries, quality failures, or overshipped stock.</p>
              </div>
              <button
                onClick={() => setShowCreateReturnModal(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Issue Debit Note / Return
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchaseReturns.map(ret => (
                <div key={ret.id} className="p-5 bg-slate-950/90 border border-slate-800 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{ret.returnNumber}</span>
                        <span className="text-[10px] text-slate-400">Supplier: {ret.supplierName}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-400 bg-rose-950 px-2.5 py-1 rounded-full border border-rose-800">
                      {currencySymbol}{ret.totalRefundAmount.toFixed(2)} Refund
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span>{ret.returnDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Credit Note Ref:</span>
                      <span className="font-mono text-emerald-400">{ret.creditNoteNumber || 'Pending Vendor Approval'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Refund Settlement:</span>
                      <span className="capitalize">{ret.refundMethod?.replace('_', ' ') || 'Credit Balance'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Processed By:</span>
                      <span>{ret.processedBy}</span>
                    </div>
                  </div>

                  {/* Return items */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Returned Ingredients</span>
                    <div className="divide-y divide-slate-800 bg-slate-900/40 rounded-xl p-2 border border-slate-800">
                      {ret.items.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between items-center text-[11px]">
                          <div>
                            <span className="font-bold text-white block">{item.ingredientName}</span>
                            <span className="text-slate-400">Qty: {item.returnQty} {item.unit} • Reason: {item.reason.replace('_', ' ')}</span>
                          </div>
                          <span className="font-bold text-rose-400">{currencySymbol}{item.totalCost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {ret.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                      "{ret.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SUPPLIERS & VENDORS */}
        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white">Approved Food & Beverage Suppliers</h3>
                <p className="text-xs text-slate-400">Manage vendor contact personnel, lead times, payment terms, and product categories.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map(sup => (
                <div key={sup.id} className="p-5 bg-slate-950/90 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                        {sup.leadTimeDays} Day Lead Time
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-white">{sup.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-slate-500" /> {sup.contactPerson}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sup.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sup.email}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sup.categories.map((c, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-md">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setPoSupplierId(sup.id);
                        setShowCreatePOModal(true);
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-400" /> Create PO for {sup.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE PURCHASE ORDER                                            */}
      {/* ========================================================================= */}
      {showCreatePOModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Generate Purchase Order (PO)</h3>
                  <p className="text-[11px] text-slate-400">Order ingredients and supplies from approved vendors</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreatePOModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePO} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Select Supplier</label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={poExpectedDate}
                    onChange={(e) => setPoExpectedDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Payment Terms</label>
                  <select
                    value={poPaymentTerms}
                    onChange={(e) => setPoPaymentTerms(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Cash on Delivery (COD)">COD</option>
                  </select>
                </div>
              </div>

              {/* Multi-Currency Selection for PO */}
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-blue-400" /> Transaction Currency
                  </label>
                  <select
                    value={poCurrencyCode}
                    onChange={(e) => {
                      const code = e.target.value as SupportedCurrencyCode;
                      setPoCurrencyCode(code);
                      const defaultRate = settings?.taxAndCurrency?.exchangeRates?.[code] || (code === currencyCode ? 1 : 1500);
                      setPoExchangeRate(defaultRate);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {(settings?.taxAndCurrency?.supportedCurrencies || ['NGN', 'USD', 'GBP', 'EUR', 'CNY', 'AED']).map(c => (
                      <option key={c} value={c}>
                        {c} ({CURRENCY_SYMBOLS[c as SupportedCurrencyCode] || c}) {c === currencyCode ? '- Base System Currency' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {poCurrencyCode !== currencyCode ? (
                  <div>
                    <label className="text-xs font-bold text-amber-300 mb-1 flex items-center justify-between">
                      <span>FX Rate (1 {poCurrencyCode} = {currencyCode})</span>
                      <span className="text-[10px] text-slate-400">Customizable</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={poExchangeRate}
                      onChange={(e) => setPoExchangeRate(Math.max(0.0001, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-amber-500/50 text-amber-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-slate-400 pt-5">
                    <span>Transacting in primary base currency ({currencyCode} {currencySymbol}).</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Order Items & Quantities ({CURRENCY_SYMBOLS[poCurrencyCode] || currencySymbol})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPoItemRow}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Ingredient Row
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {poItems.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                      <select
                        value={row.ingredientId}
                        onChange={(e) => handlePoItemChange(idx, 'ingredientId', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      >
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} (Stock: {inv.currentStock} {inv.unit})
                          </option>
                        ))}
                      </select>

                      <div className="w-24">
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          value={row.quantity}
                          onChange={(e) => handlePoItemChange(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none text-right"
                          required
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.unitCost}
                          onChange={(e) => handlePoItemChange(idx, 'unitCost', e.target.value)}
                          placeholder="Cost"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none text-right"
                          required
                        />
                      </div>

                      <div className="w-24 text-right font-bold text-white text-xs">
                        {CURRENCY_SYMBOLS[poCurrencyCode] || currencySymbol}{(row.quantity * row.unitCost).toFixed(2)}
                      </div>

                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePoItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Notes / Delivery Instructions</label>
                <textarea
                  rows={2}
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="e.g., Deliver to back kitchen dock before 11 AM..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold">Estimated Total PO Commitment:</span>
                <div className="text-right">
                  <div className="text-base font-black text-blue-400">
                    {CURRENCY_SYMBOLS[poCurrencyCode] || currencySymbol}
                    {poItems.reduce((sum, r) => sum + (r.quantity * r.unitCost), 0).toFixed(2)}
                    {poCurrencyCode !== currencyCode && ` ${poCurrencyCode}`}
                  </div>
                  {poCurrencyCode !== currencyCode && (
                    <div className="text-[11px] font-semibold text-slate-400">
                      ≈ {currencySymbol}{(poItems.reduce((sum, r) => sum + (r.quantity * r.unitCost), 0) * (poExchangeRate || 1)).toFixed(2)} Base ({currencyCode})
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePOModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
                >
                  <Check className="w-4 h-4" /> Issue & Dispatch Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LOG DELIVERY NOTE (GRN)                                          */}
      {/* ========================================================================= */}
      {showLogGRNModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Log Inbound Delivery & QA (GRN)</h3>
                  <p className="text-[11px] text-slate-400">Inspect arriving shipment, verify quantities & restock kitchen</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogGRNModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGRN} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Select Open PO</label>
                  <select
                    value={grnSelectedPoId}
                    onChange={(e) => handleSelectPoForGrn(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  >
                    <option value="">-- Choose PO --</option>
                    {purchaseOrders.map(po => (
                      <option key={po.id} value={po.id}>{po.poNumber} ({po.supplierName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Delivery Slip #</label>
                  <input
                    type="text"
                    value={grnSlipNumber}
                    onChange={(e) => setGrnSlipNumber(e.target.value)}
                    placeholder="e.g. SLIP-99120"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Carrier / Driver</label>
                  <input
                    type="text"
                    value={grnCarrier}
                    onChange={(e) => setGrnCarrier(e.target.value)}
                    placeholder="e.g. Freight Direct"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Items QA Inspection Table */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Itemized Intake & QA Inspection</label>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {grnItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{item.ingredientName}</span>
                        <span className="text-slate-400">Ordered: <strong>{item.orderedQty} {item.unit}</strong></span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Received Qty</label>
                          <input
                            type="number"
                            step="any"
                            value={item.receivedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setGrnItems(prev => {
                                const up = [...prev];
                                up[idx].receivedQty = val;
                                return up;
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs text-right"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">Rejected Qty</label>
                          <input
                            type="number"
                            step="any"
                            value={item.rejectedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setGrnItems(prev => {
                                const up = [...prev];
                                up[idx].rejectedQty = val;
                                return up;
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs text-right text-red-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">Condition</label>
                          <select
                            value={item.condition}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setGrnItems(prev => {
                                const up = [...prev];
                                up[idx].condition = val;
                                return up;
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs"
                          >
                            <option value="good">Good Condition</option>
                            <option value="damaged">Damaged Box</option>
                            <option value="spoiled">Temperature Spoiled</option>
                            <option value="wrong_item">Wrong Specification</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto Restock Checkbox */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Auto-Increment Kitchen Inventory</span>
                  <span className="text-[11px] text-slate-400">Instantly update stock numbers in Inventory & BOM module upon submission.</span>
                </div>
                <input
                  type="checkbox"
                  checked={grnAutoRestock}
                  onChange={(e) => setGrnAutoRestock(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogGRNModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!grnSelectedPoId}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Save Delivery Note & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2.5: CREATE VENDOR INVOICE / BILL                                  */}
      {/* ========================================================================= */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Record Vendor Bill / Invoice</h3>
                  <p className="text-[11px] text-slate-400">Post incoming vendor invoice into Accounts Payable</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateInvoiceModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Link to Purchase Order (Optional)</label>
                  <select
                    value={invPoId}
                    onChange={(e) => handleSelectPoForInvoice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  >
                    <option value="">Direct Bill (No PO Link)</option>
                    {purchaseOrders.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.poNumber} — {p.supplierName} ({currencySymbol}{p.totalAmount.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Vendor / Supplier</label>
                  <select
                    value={invSupplierId}
                    onChange={(e) => setInvSupplierId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    disabled={!!invPoId}
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Invoice / Bill #</label>
                  <input
                    type="text"
                    value={invNumber}
                    onChange={(e) => setInvNumber(e.target.value)}
                    placeholder="e.g. INV-2026-881"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Multi-Currency Selection for Vendor Invoice */}
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> Billed Currency
                  </label>
                  <select
                    value={invCurrencyCode}
                    onChange={(e) => {
                      const code = e.target.value as SupportedCurrencyCode;
                      setInvCurrencyCode(code);
                      const defaultRate = settings?.taxAndCurrency?.exchangeRates?.[code] || (code === currencyCode ? 1 : 1500);
                      setInvExchangeRate(defaultRate);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  >
                    {(settings?.taxAndCurrency?.supportedCurrencies || ['NGN', 'USD', 'GBP', 'EUR', 'CNY', 'AED']).map(c => (
                      <option key={c} value={c}>
                        {c} ({CURRENCY_SYMBOLS[c as SupportedCurrencyCode] || c}) {c === currencyCode ? '- Base System Currency' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {invCurrencyCode !== currencyCode ? (
                  <div>
                    <label className="text-xs font-bold text-amber-300 mb-1 flex items-center justify-between">
                      <span>FX Rate (1 {invCurrencyCode} = {currencyCode})</span>
                      <span className="text-[10px] text-slate-400">Customizable</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={invExchangeRate}
                      onChange={(e) => setInvExchangeRate(Math.max(0.0001, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-amber-500/50 text-amber-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-slate-400 pt-5">
                    <span>Vendor billed in primary base currency ({currencyCode} {currencySymbol}).</span>
                  </div>
                )}
              </div>

              {/* Invoice Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Billed Line Items ({CURRENCY_SYMBOLS[invCurrencyCode] || currencySymbol})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const first = inventory[0];
                      setInvItems(prev => [
                        ...prev,
                        {
                          ingredientId: first?.id || '',
                          ingredientName: first?.name || 'Item',
                          quantity: 1,
                          unit: first?.unit || 'units',
                          unitCost: first?.costPerUnit || 1,
                          totalCost: first?.costPerUnit || 1
                        }
                      ]);
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Billed Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {invItems.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500 bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
                      No items entered yet. Click "+ Add Billed Item" or select a Purchase Order to auto-populate.
                    </div>
                  ) : (
                    invItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                        <select
                          value={item.ingredientId}
                          onChange={(e) => {
                            const ing = inventory.find(i => i.id === e.target.value);
                            setInvItems(prev => {
                              const updated = [...prev];
                              updated[idx] = {
                                ...updated[idx],
                                ingredientId: e.target.value,
                                ingredientName: ing?.name || 'Item',
                                unit: ing?.unit || 'units'
                              };
                              return updated;
                            });
                          }}
                          className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none"
                        >
                          {inventory.map(inv => (
                            <option key={inv.id} value={inv.id}>{inv.name}</option>
                          ))}
                        </select>

                        <div className="w-24">
                          <input
                            type="number"
                            step="any"
                            min="0.01"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Math.max(0.01, Number(e.target.value));
                              setInvItems(prev => {
                                const updated = [...prev];
                                updated[idx] = {
                                  ...updated[idx],
                                  quantity: val,
                                  totalCost: Number((val * updated[idx].unitCost).toFixed(2))
                                };
                                return updated;
                              });
                            }}
                            placeholder="Qty"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none text-right"
                            required
                          />
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setInvItems(prev => {
                                const updated = [...prev];
                                updated[idx] = {
                                  ...updated[idx],
                                  unitCost: val,
                                  totalCost: Number((updated[idx].quantity * val).toFixed(2))
                                };
                                return updated;
                              });
                            }}
                            placeholder="Cost"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none text-right"
                            required
                          />
                        </div>

                        <div className="w-24 text-right font-bold text-white text-xs">
                          {CURRENCY_SYMBOLS[invCurrencyCode] || currencySymbol}{item.totalCost.toFixed(2)}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setInvItems(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-1 text-slate-400 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="e.g., Net 30 wire transfer upon delivery verification..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold">Total Accounts Payable Liability:</span>
                <div className="text-right">
                  <div className="text-base font-black text-amber-400">
                    {CURRENCY_SYMBOLS[invCurrencyCode] || currencySymbol}
                    {invItems.reduce((sum, r) => sum + r.totalCost, 0).toFixed(2)}
                    {invCurrencyCode !== currencyCode && ` ${invCurrencyCode}`}
                  </div>
                  {invCurrencyCode !== currencyCode && (
                    <div className="text-[11px] font-semibold text-slate-400">
                      ≈ {currencySymbol}{(invItems.reduce((sum, r) => sum + r.totalCost, 0) * (invExchangeRate || 1)).toFixed(2)} Base ({currencyCode})
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={invItems.length === 0}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Save Vendor Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: 3-WAY MATCH VERIFICATION DETAIL                                  */}
      {/* ========================================================================= */}
      {selectedMatchInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">3-Way Match Audit Verification</h3>
                  <p className="text-[11px] text-slate-400">PO Price vs. GRN Loading Dock Count vs. Vendor Bill</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMatchInvoice(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="grid grid-cols-3 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Invoice #:</span>
                  <span className="font-bold text-white">{selectedMatchInvoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ref PO #:</span>
                  <span className="font-bold text-white">{selectedMatchInvoice.poNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Match Status:</span>
                  <span className={`font-bold ${selectedMatchInvoice.threeWayMatchStatus === 'matched' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedMatchInvoice.threeWayMatchStatus === 'matched' ? '100% Fully Matched' : 'Variance Detected'}
                  </span>
                </div>
              </div>

              {selectedMatchInvoice.foreignTotalAmount && selectedMatchInvoice.currencyCode && selectedMatchInvoice.currencyCode !== currencyCode && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-amber-300 text-[11px]">
                  <span>Foreign Bill Total ({selectedMatchInvoice.currencyCode}):</span>
                  <span className="font-bold font-mono">
                    {selectedMatchInvoice.currencySymbol || selectedMatchInvoice.currencyCode}{selectedMatchInvoice.foreignTotalAmount.toFixed(2)}
                    {' '}(Exchange Rate: ₦{selectedMatchInvoice.exchangeRate} → Base: {currencySymbol}{selectedMatchInvoice.totalAmount.toFixed(2)})
                  </span>
                </div>
              )}
            </div>

            {/* Line Items Comparison */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Line Item Audit Matrix</span>
              <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Item Name</th>
                      <th className="p-2.5 text-right">Billed Qty</th>
                      <th className="p-2.5 text-right">Billed Rate</th>
                      <th className="p-2.5 text-right">Total</th>
                      <th className="p-2.5 text-center">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {selectedMatchInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-white">{item.ingredientName}</td>
                        <td className="p-2.5 text-right">{item.quantity} {item.unit}</td>
                        <td className="p-2.5 text-right">{currencySymbol}{item.unitCost.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-bold">{currencySymbol}{item.totalCost.toFixed(2)}</td>
                        <td className="p-2.5 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedMatchInvoice(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RECORD PAYMENT                                                   */}
      {/* ========================================================================= */}
      {showPaymentModal && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Disburse Vendor Payment</h3>
                  <p className="text-[11px] text-slate-400">Invoice #{selectedInvoiceForPayment.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Payment Amount ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedInvoiceForPayment.balanceDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-black focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Remaining balance due: {currencySymbol}{selectedInvoiceForPayment.balanceDue.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="ach">Corporate ACH Wire</option>
                  <option value="corporate_card">Corporate Credit Card</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Direct Bank Transfer</option>
                  <option value="cash">Petty Cash</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Reference / Transaction #</label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. WIRE-881923"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
                >
                  <Check className="w-4 h-4" /> Confirm & Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PURCHASE RETURN & DEBIT NOTE                                     */}
      {/* ========================================================================= */}
      {showCreateReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Generate Debit Note / Return Memo</h3>
                  <p className="text-[11px] text-slate-400">Debit vendor for spoiled, damaged, or rejected inventory</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateReturnModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePurchaseReturn} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Supplier</label>
                  <select
                    value={retSupplierId}
                    onChange={(e) => setRetSupplierId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Primary Reason</label>
                  <select
                    value={retReason}
                    onChange={(e) => setRetReason(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                  >
                    <option value="damaged_delivery">Damaged in Transit</option>
                    <option value="expired_spoiled">Expired / Temperature Spoiled</option>
                    <option value="wrong_specification">Wrong Item Specification</option>
                    <option value="excess_overshipped">Overshipped Count</option>
                    <option value="failed_qa">Failed Kitchen QA Audit</option>
                  </select>
                </div>
              </div>

              {/* Items for return */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Rejected Line Items</label>
                <div className="space-y-2">
                  {retItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-2 text-xs">
                      <select
                        value={item.ingredientId}
                        onChange={(e) => {
                          const ing = inventory.find(i => i.id === e.target.value);
                          setRetItems(prev => {
                            const up = [...prev];
                            up[idx].ingredientId = e.target.value;
                            if (ing) {
                              up[idx].ingredientName = ing.name;
                              up[idx].unit = ing.unit;
                              up[idx].unitCost = ing.costPerUnit;
                              up[idx].totalCost = up[idx].returnQty * ing.costPerUnit;
                            }
                            return up;
                          });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs outline-none"
                      >
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id}>{inv.name}</option>
                        ))}
                      </select>

                      <div className="w-20">
                        <input
                          type="number"
                          step="any"
                          value={item.returnQty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setRetItems(prev => {
                              const up = [...prev];
                              up[idx].returnQty = val;
                              up[idx].totalCost = val * up[idx].unitCost;
                              return up;
                            });
                          }}
                          placeholder="Qty"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs text-right"
                        />
                      </div>

                      <div className="w-20 text-right font-bold text-rose-400">
                        {currencySymbol}{item.totalCost.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Return Notes / Claim Description</label>
                <textarea
                  rows={2}
                  value={retNotes}
                  onChange={(e) => setRetNotes(e.target.value)}
                  placeholder="Describe rejection reason for vendor claim..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Total Debit / Refund Claim:</span>
                <span className="text-base font-black text-rose-400">
                  {currencySymbol}{retItems.reduce((s, i) => s + i.totalCost, 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateReturnModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
                >
                  <Check className="w-4 h-4" /> Issue Debit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: PO VIEW & PRINT                                                  */}
      {/* ========================================================================= */}
      {selectedPOForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header & Logo */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {settings?.company?.name || 'RestoFlow Bistro'}
                </h2>
                <p className="text-xs text-slate-500">{settings?.company?.address || '104 Market Street'}</p>
                <p className="text-xs text-slate-500">VAT/TIN: {settings?.company?.vatNumber || 'US-9912048'}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-blue-600 block">{selectedPOForView.poNumber}</span>
                <span className="text-xs text-slate-500">Date: {selectedPOForView.createdAt}</span>
                <span className="text-xs text-slate-500 block">Terms: {selectedPOForView.paymentTerms || 'Net 30'}</span>
              </div>
            </div>

            {/* Vendor Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-500 block uppercase text-[10px]">Vendor / Supplier</span>
              <span className="font-black text-sm text-slate-900 block mt-0.5">{selectedPOForView.supplierName}</span>
              <span className="text-slate-600">Expected Delivery: {selectedPOForView.expectedDate}</span>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Ingredient Item</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Unit Rate</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPOForView.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-slate-900">{item.ingredientName}</td>
                      <td className="p-3 text-right">{item.quantity} {item.unit}</td>
                      <td className="p-3 text-right">{currencySymbol}{item.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-right font-black text-slate-900">{currencySymbol}{item.totalCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Block */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
              <span className="font-bold text-slate-600">Total Purchase Order Value:</span>
              <span className="text-xl font-black text-blue-600">{currencySymbol}{selectedPOForView.totalAmount.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedPOForView(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" /> Print Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasingView;
