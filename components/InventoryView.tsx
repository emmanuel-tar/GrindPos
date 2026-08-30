import React, { useState, useEffect, useMemo } from 'react';
import { 
  InventoryItem, 
  Order,
  MenuItem, 
  Supplier, 
  PurchaseOrder, 
  PurchaseOrderItem, 
  WasteLog,
  InventoryForecastResult,
  IngredientForecast 
} from '../types';
import { 
  AlertTriangle, 
  PackagePlus, 
  Minus, 
  Plus, 
  Layers, 
  FileText, 
  Trash2, 
  Truck, 
  DollarSign, 
  CheckCircle2, 
  Search, 
  TrendingDown, 
  ArrowUpRight,
  Sparkles,
  Receipt,
  Calendar,
  Zap,
  TrendingUp,
  RefreshCw,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Check,
  ShoppingBag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';
import confetti from 'canvas-confetti';
import { generateInventoryForecast } from '../geminiService';

interface InventoryViewProps {
  items: InventoryItem[];
  orders?: Order[];
  menuItems: MenuItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  wasteLogs: WasteLog[];
  branchName?: string;
  onUpdateStock: (id: string, newStock: number) => void;
  onUpdateMinStock?: (id: string, newMinStock: number) => void;
  onBatchUpdateMinStock?: (updates: { id: string; minStock: number }[]) => void;
  onAddNewItem: (item: InventoryItem) => void;
  onCreatePO: (po: PurchaseOrder) => void;
  onReceivePO: (poId: string) => void;
  onLogWaste: (waste: WasteLog) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  orders = [],
  menuItems,
  suppliers,
  purchaseOrders,
  wasteLogs,
  branchName = "Downtown Flagship",
  onUpdateStock,
  onUpdateMinStock,
  onBatchUpdateMinStock,
  onAddNewItem,
  onCreatePO,
  onReceivePO,
  onLogWaste,
}) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'forecast' | 'recipes' | 'po' | 'waste'>('ingredients');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // AI Forecasting State
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [rushMultiplier, setRushMultiplier] = useState<number>(1.0);
  const [forecastResult, setForecastResult] = useState<InventoryForecastResult | null>(null);
  const [forecastSearch, setForecastSearch] = useState('');
  const [forecastFilterRisk, setForecastFilterRisk] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'HEALTHY'>('ALL');
  const [appliedParItems, setAppliedParItems] = useState<Set<string>>(new Set());
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);

  // New Ingredient form
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState('Produce');
  const [newIngStock, setNewIngStock] = useState(20);
  const [newIngMinStock, setNewIngMinStock] = useState(10);
  const [newIngUnit, setNewIngUnit] = useState('kg');
  const [newIngCost, setNewIngCost] = useState(2.50);

  // New PO form
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || '');
  const [poLines, setPoLines] = useState<{ ingredientId: string; quantity: number }[]>([
    { ingredientId: items[0]?.id || '', quantity: 20 }
  ]);

  // Waste form
  const [wasteIngId, setWasteIngId] = useState(items[0]?.id || '');
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState<'spoilage' | 'burnt_prep' | 'dropped_spill' | 'expired'>('spoilage');
  const [wasteNotes, setWasteNotes] = useState('');

  // Initial and reactive AI forecast generator
  const runForecast = async (multiplier = rushMultiplier) => {
    setIsGeneratingForecast(true);
    try {
      const res = await generateInventoryForecast({
        orders,
        inventory: items,
        menuItems,
        suppliers,
        wasteLogs,
        rushMultiplier: multiplier,
        branchName,
      });
      setForecastResult(res);
    } catch (e) {
      console.error("Forecasting error:", e);
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  useEffect(() => {
    runForecast(rushMultiplier);
  }, [items.length, orders.length, rushMultiplier]);

  // Calculations
  const lowStockItems = items.filter(i => i.currentStock <= i.minStock);
  const totalStockValue = items.reduce((acc, i) => acc + (i.currentStock * i.costPerUnit), 0);
  const totalWastedCost = wasteLogs.reduce((acc, w) => acc + w.cost, 0);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(i => {
    const matchCat = selectedCategory === 'All' || i.category === selectedCategory;
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredForecastList = useMemo(() => {
    if (!forecastResult) return [];
    return forecastResult.ingredientForecasts.filter(f => {
      const matchSearch = f.ingredientName.toLowerCase().includes(forecastSearch.toLowerCase()) || 
                          f.supplierName.toLowerCase().includes(forecastSearch.toLowerCase()) ||
                          f.category.toLowerCase().includes(forecastSearch.toLowerCase());
      const matchRisk = forecastFilterRisk === 'ALL' || f.stockoutRisk === forecastFilterRisk;
      return matchSearch && matchRisk;
    });
  }, [forecastResult, forecastSearch, forecastFilterRisk]);

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName) return;
    const newItem: InventoryItem = {
      id: `ing-${Date.now()}`,
      name: newIngName,
      category: newIngCategory,
      currentStock: Number(newIngStock),
      minStock: Number(newIngMinStock),
      unit: newIngUnit,
      costPerUnit: Number(newIngCost),
      supplierId: suppliers[0]?.id || 'sup-1',
      locationId: 'loc-1',
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    onAddNewItem(newItem);
    setShowAddIngredientModal(false);
    setNewIngName('');
  };

  const handleAddPOLine = () => {
    setPoLines(prev => [...prev, { ingredientId: items[0]?.id || '', quantity: 10 }]);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === poSupplierId) || suppliers[0];
    const poItems: PurchaseOrderItem[] = poLines.map(line => {
      const ing = items.find(i => i.id === line.ingredientId);
      const unitCost = ing?.costPerUnit || 2.00;
      return {
        ingredientId: line.ingredientId,
        ingredientName: ing?.name || 'Raw Ingredient',
        quantity: line.quantity,
        unit: ing?.unit || 'units',
        unitCost,
        totalCost: line.quantity * unitCost,
      };
    });

    const totalAmount = poItems.reduce((acc, i) => acc + i.totalCost, 0);
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      items: poItems,
      totalAmount,
      status: 'ordered',
      createdAt: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + sup.leadTimeDays * 86400000).toISOString().split('T')[0],
      locationId: 'loc-1',
    };

    onCreatePO(newPO);
    setShowPOModal(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleLogWasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ing = items.find(i => i.id === wasteIngId);
    if (!ing) return;

    const cost = wasteQty * ing.costPerUnit;
    const newWaste: WasteLog = {
      id: `w-${Date.now()}`,
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: wasteQty,
      unit: ing.unit,
      reason: wasteReason,
      cost,
      loggedBy: 'Marco Rossi',
      date: new Date().toISOString().split('T')[0],
      locationId: 'loc-1',
      notes: wasteNotes,
    };

    onLogWaste(newWaste);
    onUpdateStock(ing.id, Math.max(0, ing.currentStock - wasteQty));
    setShowWasteModal(false);
    setWasteNotes('');
  };

  // AI-Specific Actions
  const handleApplySinglePar = (forecast: IngredientForecast) => {
    if (onUpdateMinStock) {
      onUpdateMinStock(forecast.ingredientId, forecast.suggestedMinStock);
    }
    setAppliedParItems(prev => new Set(prev).add(forecast.ingredientId));
    setSuccessToast(`Updated reorder point for "${forecast.ingredientName}" to ${forecast.suggestedMinStock} ${forecast.unit}`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleApplyAllSuggestedPars = () => {
    if (!forecastResult) return;
    const updates = forecastResult.ingredientForecasts.map(f => ({
      id: f.ingredientId,
      minStock: f.suggestedMinStock
    }));

    if (onBatchUpdateMinStock) {
      onBatchUpdateMinStock(updates);
    } else if (onUpdateMinStock) {
      updates.forEach(u => onUpdateMinStock(u.id, u.minStock));
    }

    const allIds = new Set(updates.map(u => u.id));
    setAppliedParItems(allIds);
    confetti({ particleCount: 40, spread: 50 });
    setSuccessToast(`Successfully optimized reorder points for all ${updates.length} raw ingredients!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleQuickCreatePOForForecast = (f: IngredientForecast) => {
    const sup = suppliers.find(s => s.id === f.supplierId) || suppliers[0];
    const qty = f.suggestedOrderQuantity > 0 ? f.suggestedOrderQuantity : Math.ceil(f.projected7DayUsage);
    const lineCost = qty * f.costPerUnit;

    const newPO: PurchaseOrder = {
      id: `po-ai-${Date.now()}`,
      poNumber: `PO-AI-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      items: [
        {
          ingredientId: f.ingredientId,
          ingredientName: f.ingredientName,
          quantity: qty,
          unit: f.unit,
          unitCost: f.costPerUnit,
          totalCost: lineCost
        }
      ],
      totalAmount: lineCost,
      status: 'ordered',
      createdAt: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + sup.leadTimeDays * 86400000).toISOString().split('T')[0],
      locationId: 'loc-1',
    };

    onCreatePO(newPO);
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
    setSuccessToast(`Drafted AI Purchase Order (${newPO.poNumber}) for ${qty} ${f.unit} of ${f.ingredientName}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleAutoCreateAllCriticalPOs = () => {
    if (!forecastResult) return;
    const criticalForecasts = forecastResult.ingredientForecasts.filter(f => f.stockoutRisk === 'CRITICAL' || f.stockoutRisk === 'WARNING');
    if (criticalForecasts.length === 0) {
      setSuccessToast("No critical stockout items currently detected.");
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    // Group items by supplier
    const supplierGroups: Record<string, IngredientForecast[]> = {};
    criticalForecasts.forEach(f => {
      const sId = f.supplierId || 'sup-1';
      if (!supplierGroups[sId]) supplierGroups[sId] = [];
      supplierGroups[sId].push(f);
    });

    let poCount = 0;
    Object.entries(supplierGroups).forEach(([supId, fList], idx) => {
      const sup = suppliers.find(s => s.id === supId) || suppliers[0];
      const poItems: PurchaseOrderItem[] = fList.map(f => {
        const qty = f.suggestedOrderQuantity > 0 ? f.suggestedOrderQuantity : Math.ceil(f.projected7DayUsage);
        return {
          ingredientId: f.ingredientId,
          ingredientName: f.ingredientName,
          quantity: qty,
          unit: f.unit,
          unitCost: f.costPerUnit,
          totalCost: qty * f.costPerUnit
        };
      });

      const totalAmount = poItems.reduce((acc, i) => acc + i.totalCost, 0);
      const newPO: PurchaseOrder = {
        id: `po-auto-${Date.now()}-${idx}`,
        poNumber: `PO-AI-${Math.floor(2000 + Math.random() * 8000)}`,
        supplierId: sup.id,
        supplierName: sup.name,
        items: poItems,
        totalAmount,
        status: 'ordered',
        createdAt: new Date().toISOString().split('T')[0],
        expectedDate: new Date(Date.now() + sup.leadTimeDays * 86400000).toISOString().split('T')[0],
        locationId: 'loc-1',
      };

      onCreatePO(newPO);
      poCount++;
    });

    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    setSuccessToast(`Auto-created ${poCount} Purchase Orders for all ${criticalForecasts.length} replenishment items!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const criticalCount = forecastResult?.ingredientForecasts.filter(f => f.stockoutRisk === 'CRITICAL').length || 0;
  const warningCount = forecastResult?.ingredientForecasts.filter(f => f.stockoutRisk === 'WARNING').length || 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-100">{successToast}</span>
        </div>
      )}

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Raw SKUs</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{items.length} Ingredients</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Warnings</span>
            <p className="text-2xl font-black text-red-600 mt-1">{lowStockItems.length} SKUs Alert</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">7-Day Demand Status</span>
            <p className="text-2xl font-black text-indigo-600 mt-1">
              {forecastResult ? `${forecastResult.overallHealthScore}% Safe` : 'Analyzing...'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shrinkage / Waste</span>
            <p className="text-2xl font-black text-amber-600 mt-1">${totalWastedCost.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ingredients'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" /> Raw Stock & Reorders ({items.length})
          </button>
          
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'forecast'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> 
            <span>AI 7-Day Demand & Reorder Forecast</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'recipes'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" /> Recipe Bill of Materials (BOM)
          </button>
          <button
            onClick={() => setActiveTab('po')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'po'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4" /> Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('waste')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'waste'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-4 h-4" /> Spoilage & Waste Log ({wasteLogs.length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-2">
          {activeTab === 'forecast' && (
            <button
              onClick={() => runForecast()}
              disabled={isGeneratingForecast}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingForecast ? 'animate-spin' : ''}`} />
              {isGeneratingForecast ? 'Recalculating...' : 'Refresh AI Model'}
            </button>
          )}
          {activeTab === 'ingredients' && (
            <button
              onClick={() => setShowAddIngredientModal(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <PackagePlus className="w-4 h-4" /> Add Ingredient
            </button>
          )}
          {activeTab === 'po' && (
            <button
              onClick={() => setShowPOModal(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" /> Create Purchase Order
            </button>
          )}
          {activeTab === 'waste' && (
            <button
              onClick={() => setShowWasteModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Log Waste Incident
            </button>
          )}
        </div>
      </div>

      {/* Tab: AI 7-Day Forecasting (Feature Spotlight) */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Executive Forecast Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white p-7 shadow-xl border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gemini 3.7 Flash Predictive Intelligence Engine</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white">
                  7-Day Predictive Order Volume & Dynamic Reorder Engine
                </h3>
                <p className="text-xs text-indigo-200/90 leading-relaxed">
                  Analyzes historical POS tickets, Recipe BOM component velocities, and supplier lead times to suggest dynamic safety pars and stockout-preventing reorder points.
                </p>
                {forecastResult && (
                  <p className="text-[11px] text-indigo-300/70 font-mono">
                    Telemetry grounded at {forecastResult.forecastGeneratedAt} • {orders.length} order history sample window
                  </p>
                )}
              </div>

              {/* Demand Multiplier Controls */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-3 min-w-[280px]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> Demand Surge Simulator
                  </span>
                  <span className="font-mono font-black text-amber-300">{rushMultiplier}x Volume</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '-20%', val: 0.8 },
                    { label: '1.0x', val: 1.0 },
                    { label: '+25%', val: 1.25 },
                    { label: '+50%', val: 1.5 },
                  ].map(scenario => (
                    <button
                      key={scenario.label}
                      onClick={() => setRushMultiplier(scenario.val)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                        rushMultiplier === scenario.val
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-white/5 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      {scenario.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Adjust for holidays, rain forecasts, or weekend food festivals.
                </p>
              </div>
            </div>

            {/* Strategic Summary & AI Recommendations */}
            {forecastResult && (
              <div className="mt-6 pt-6 border-t border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Executive Analysis
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {forecastResult.summaryAnalysis}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 md:col-span-2">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" /> AI Recommended Supply Chain Playbook
                  </span>
                  <div className="space-y-1.5">
                    {forecastResult.recommendedActions.map((action, idx) => (
                      <div key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 7-Day Demand Velocity Chart & KPI Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" /> Projected 7-Day Ticket Demand & Velocity
                  </h4>
                  <p className="text-xs text-slate-500">Projected meal counts mapped across stations for the next week</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  Total 7-Day Run: {forecastResult?.dailyDemand.reduce((acc, d) => acc + d.projectedOrders, 0) || 0} Tickets
                </span>
              </div>

              <div className="h-64 w-full">
                {forecastResult && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastResult.dailyDemand} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="orderDemandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                        formatter={(value: any, name: any) => [`${value} tickets`, 'Projected Orders']}
                        labelFormatter={(label) => `Day: ${label}`}
                      />
                      <Area type="monotone" dataKey="projectedOrders" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#orderDemandGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Quick Actions & High-Risk Summary */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Stockout Runway Status</h4>
                  <span className="text-xs font-bold text-slate-500">Next 7 Days</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-red-900">Critical Stockout Risk</p>
                        <p className="text-[11px] text-red-700">Depleted in &lt; 3 days</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-red-600">{criticalCount} SKUs</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-amber-900">Moderate Runway</p>
                        <p className="text-[11px] text-amber-700">Depleted in 3–5 days</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-amber-600">{warningCount} SKUs</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-600">Total Projected Restock Cost</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        ${forecastResult?.totalEstimatedReplenishmentCost.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <DollarSign className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Bulk Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={handleApplyAllSuggestedPars}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> Apply All AI Suggested Pars
                </button>

                <button
                  onClick={handleAutoCreateAllCriticalPOs}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" /> Auto-Draft POs for Critical SKUs
                </button>
              </div>
            </div>
          </div>

          {/* AI Reorder Points & Par Recommendation Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  AI Reorder Points & Purchase Recommendation Matrix
                </h4>
                <p className="text-xs text-slate-500">
                  Dynamically calculated based on recipe consumption, vendor lead times, and demand forecast
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Risk Filter Buttons */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {[
                    { key: 'ALL', label: 'All Items' },
                    { key: 'CRITICAL', label: 'Critical' },
                    { key: 'WARNING', label: 'Warning' },
                    { key: 'HEALTHY', label: 'Safe' },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setForecastFilterRisk(f.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        forecastFilterRisk === f.key
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by ingredient, supplier..."
                    value={forecastSearch}
                    onChange={(e) => setForecastSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-slate-500">Ingredient / Supplier</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-slate-500">Current Stock</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-slate-500">7-Day Projected Burn</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-slate-500">Stock Runway</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-slate-500">Current Par</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/50">
                      AI Suggested Reorder Point
                    </th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-slate-500">Recommended Order Qty</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredForecastList.map(forecast => {
                    const isApplied = appliedParItems.has(forecast.ingredientId);
                    const parDiff = forecast.suggestedMinStock - forecast.minStock;

                    return (
                      <tr key={forecast.ingredientId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{forecast.ingredientName}</span>
                            <span className="text-[11px] text-slate-400">
                              {forecast.supplierName} • <strong className="text-slate-600">{forecast.supplierLeadTimeDays}d lead</strong>
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-black text-slate-800">
                          {forecast.currentStock} <span className="text-slate-400 font-normal">{forecast.unit}</span>
                        </td>

                        <td className="px-4 py-3.5 text-slate-700">
                          <span className="font-bold text-slate-900">{forecast.projected7DayUsage}</span> {forecast.unit}
                          <span className="block text-[10px] text-slate-400">~{forecast.historicalDailyAvgUsage} {forecast.unit}/day</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                            forecast.stockoutRisk === 'CRITICAL'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : forecast.stockoutRisk === 'WARNING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {forecast.daysUntilStockout > 30 ? '30+ Days' : `${forecast.daysUntilStockout} Days`}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-slate-500 font-medium">
                          {forecast.minStock} {forecast.unit}
                        </td>

                        <td className="px-4 py-3.5 bg-indigo-50/30">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-indigo-900">
                              {forecast.suggestedMinStock} {forecast.unit}
                            </span>
                            {parDiff !== 0 && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                parDiff > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {parDiff > 0 ? `+${parDiff}` : parDiff}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {forecast.suggestedOrderQuantity > 0 ? (
                            <div>
                              <span>{forecast.suggestedOrderQuantity} {forecast.unit}</span>
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Est. ${forecast.estimatedRestockCost.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal text-xs">No immediate order</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApplySinglePar(forecast)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                isApplied
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                              }`}
                              title="Update ingredient safety minimum to AI suggested par"
                            >
                              {isApplied ? (
                                <>
                                  <Check className="w-3 h-3" /> Par Set
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 text-indigo-600" /> Apply Par
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleQuickCreatePOForForecast(forecast)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                              title="Draft Purchase Order with suggested quantity"
                            >
                              <Truck className="w-3 h-3" /> Draft PO
                            </button>
                          </div>
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

      {/* Tab 1: Raw Stock */}
      {activeTab === 'ingredients' && (
        <div className="space-y-4">
          {/* AI Reorder Alert Banner */}
          {criticalCount > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-300/60 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    AI Demand Alert: {criticalCount} Ingredients Nearing Stockout
                  </h4>
                  <p className="text-xs text-slate-600">
                    Order volume models project stock exhaustion within supplier lead time windows.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('forecast')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> View 7-Day Forecast & Reorder Plan
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search raw items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Ingredient Name</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Current Stock</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Safety Min (Par)</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Unit Cost</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Asset Value</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500 text-right">Adjust Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredItems.map(item => {
                    const isLow = item.currentStock <= item.minStock;
                    const itemValue = item.currentStock * item.costPerUnit;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">{item.name}</td>
                        <td className="px-5 py-4 text-slate-500">{item.category}</td>
                        <td className="px-5 py-4 font-black text-slate-800">
                          {item.currentStock} <span className="text-slate-400 font-normal">{item.unit}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-bold">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="px-5 py-4 text-slate-700">${item.costPerUnit.toFixed(2)}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">${itemValue.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          {isLow ? (
                            <span className="px-2.5 py-1 bg-red-100 text-red-700 font-black uppercase text-[10px] rounded-lg border border-red-200">
                              Reorder Urgently
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-black uppercase text-[10px] rounded-lg border border-emerald-200">
                              Adequate
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onUpdateStock(item.id, Math.max(0, item.currentStock - 1))}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onUpdateStock(item.id, item.currentStock + 1)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Tab 2: Recipe Bill of Materials (BOM) */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold">Menu Food Costing & Recipe BOM</h3>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Every dish maps directly to raw inventory weights and unit prices. Placing an order in the POS terminal depletes the exact raw ingredients in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {menuItems.map(dish => {
              const portionCost = dish.recipe.reduce((acc, r) => acc + (r.quantity * r.costPerUnit), 0);
              const grossProfit = dish.price - portionCost;
              const foodCostPercent = (portionCost / dish.price) * 100;
              const marginPercent = ((grossProfit) / dish.price) * 100;

              return (
                <div key={dish.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{dish.category}</span>
                        <h4 className="text-base font-black text-slate-900">{dish.name}</h4>
                      </div>
                      <span className="text-lg font-black text-slate-900">${dish.price.toFixed(2)}</span>
                    </div>

                    {/* Financial Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Portion Cost</span>
                        <p className="text-xs font-black text-slate-800 mt-0.5">${portionCost.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Food Cost %</span>
                        <p className={`text-xs font-black mt-0.5 ${foodCostPercent > 32 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {foodCostPercent.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Margin</span>
                        <p className="text-xs font-black text-emerald-600 mt-0.5">{marginPercent.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* BOM Ingredients List */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ingredient Formula:</span>
                      <div className="space-y-1.5">
                        {dish.recipe.map((ing, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                            <span className="font-semibold text-slate-800">{ing.ingredientName}</span>
                            <span className="text-slate-500 font-mono">
                              {ing.quantity} {ing.unit} (${(ing.quantity * ing.costPerUnit).toFixed(2)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                    <span>Kitchen Station: <strong className="text-slate-700 uppercase">{dish.station}</strong></span>
                    <span className="text-emerald-600 font-bold">✓ Real-time POS Depletion Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Purchase Orders */}
      {activeTab === 'po' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Purchase Orders & Inbound Dock</h3>
            <button
              onClick={() => setShowPOModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" /> Draft New PO
            </button>
          </div>

          <div className="space-y-4">
            {purchaseOrders.map(po => {
              const isReceived = po.status === 'received';
              return (
                <div key={po.id} className="p-5 rounded-2xl border-2 border-slate-200/80 bg-slate-50/50 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900">{po.poNumber}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isReceived ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {po.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supplier: <strong className="text-slate-800">{po.supplierName}</strong> • Ordered on {po.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Total PO Value</span>
                        <p className="text-lg font-black text-slate-900">${po.totalAmount.toFixed(2)}</p>
                      </div>

                      {!isReceived && (
                        <button
                          onClick={() => onReceivePO(po.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Receive & Restock
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 divide-y divide-slate-100 text-xs">
                    {po.items.map((line, idx) => (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between">
                        <span>{line.quantity} {line.unit} — {line.ingredientName}</span>
                        <span className="font-bold text-slate-800">${line.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Waste & Spoilage */}
      {activeTab === 'waste' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Kitchen Waste & Spoilage Log</h3>
              <p className="text-xs text-slate-500">Track shrinkage, prep spills, and expiration write-offs</p>
            </div>
            <button
              onClick={() => setShowWasteModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Log Waste
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Ingredient</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Quantity Lost</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Financial Loss</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Reason</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Logged By</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {wasteLogs.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-500">{w.date}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{w.ingredientName}</td>
                    <td className="px-5 py-4 font-black text-red-600">{w.quantity} {w.unit}</td>
                    <td className="px-5 py-4 font-black text-slate-900">${w.cost.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold uppercase text-[10px] rounded-lg">
                        {w.reason.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{w.loggedBy}</td>
                    <td className="px-5 py-4 text-slate-500 italic">{w.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Ingredient */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Raw Ingredient</h3>
            <form onSubmit={handleAddIngredient} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Truffle Oil"
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Category</label>
                  <select
                    value={newIngCategory}
                    onChange={(e) => setNewIngCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Meat">Meat</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Sauces">Sauces</option>
                    <option value="Dry Goods">Dry Goods</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Unit of Measure</label>
                  <input
                    type="text"
                    placeholder="kg, liters, pcs..."
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Initial Qty</label>
                  <input
                    type="number"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Min Alert</label>
                  <input
                    type="number"
                    value={newIngMinStock}
                    onChange={(e) => setNewIngMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddIngredientModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create PO */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Create Supplier Purchase Order</h3>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Select Supplier</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactPerson}) - {s.leadTimeDays}d lead</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase">Order Lines</span>
                  <button
                    type="button"
                    onClick={handleAddPOLine}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line
                  </button>
                </div>

                {poLines.map((line, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={line.ingredientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPoLines(prev => prev.map((l, i) => i === idx ? { ...l, ingredientId: val } : l));
                      }}
                      className="flex-1 px-3 py-2 border rounded-xl text-xs"
                    >
                      {items.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name} (${ing.costPerUnit}/{ing.unit})</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setPoLines(prev => prev.map((l, i) => i === idx ? { ...l, quantity: val } : l));
                      }}
                      className="w-24 px-3 py-2 border rounded-xl text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Waste */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Record Spoilage / Prep Loss</h3>
            <form onSubmit={handleLogWasteSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Ingredient</label>
                <select
                  value={wasteIngId}
                  onChange={(e) => setWasteIngId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                >
                  {items.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name} (Stock: {ing.currentStock} {ing.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Quantity Lost</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={wasteQty}
                    onChange={(e) => setWasteQty(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Reason</label>
                  <select
                    value={wasteReason}
                    onChange={(e) => setWasteReason(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  >
                    <option value="spoilage">Spoilage</option>
                    <option value="burnt_prep">Burnt / Prep Error</option>
                    <option value="dropped_spill">Floor Drop / Spill</option>
                    <option value="expired">Expired Date</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Fridge temperature fluctuation"
                  value={wasteNotes}
                  onChange={(e) => setWasteNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowWasteModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Confirm Write-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
