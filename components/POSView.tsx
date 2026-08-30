import React, { useState, useEffect } from 'react';
import { 
  MenuItem, 
  OrderItem, 
  Order, 
  Table, 
  OrderType, 
  SelectedModifier, 
  Location, 
  StaffMember,
  AppSettings
} from '../types';
import ModifierModal from './ModifierModal';
import SplitBillModal from './SplitBillModal';
import ReceiptModal from './ReceiptModal';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CreditCard, 
  Banknote, 
  Split, 
  Percent, 
  Sparkles, 
  UtensilsCrossed, 
  ShoppingBag, 
  Car, 
  Flame, 
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface POSViewProps {
  menuItems: MenuItem[];
  tables: Table[];
  currentLocation: Location;
  currentStaff: StaffMember;
  settings?: AppSettings;
  selectedTableForPOS?: Table | null;
  onSendOrder: (order: Order) => void;
  onResetSelectedTable?: () => void;
}

const POSView: React.FC<POSViewProps> = ({
  menuItems,
  tables,
  currentLocation,
  currentStaff,
  settings,
  selectedTableForPOS,
  onSendOrder,
  onResetSelectedTable,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(1);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');

  // Modifiers modal
  const [modifierItem, setModifierItem] = useState<MenuItem | null>(null);

  // Split bill modal
  const [showSplitModal, setShowSplitModal] = useState<boolean>(false);

  // Receipt modal
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Discounts
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [appliedPromoName, setAppliedPromoName] = useState<string>('');

  // Sync selected table from floor plan if passed
  useEffect(() => {
    if (selectedTableForPOS) {
      setOrderType('dine_in');
      setSelectedTableNumber(selectedTableForPOS.number);
    }
  }, [selectedTableForPOS]);

  const categories = ['All', 'Mains', 'Starters', 'Salads', 'Desserts', 'Beverages'];

  const filteredMenuItems = menuItems.filter(item => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddItemDirectly = (item: MenuItem) => {
    // If item has modifier options, open modifier modal
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setModifierItem(item);
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id && (!i.modifiers || i.modifiers.length === 0) && !i.notes);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      const newItem: OrderItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        station: item.station,
      };
      return [...prev, newItem];
    });
  };

  const handleAddWithModifiers = (item: MenuItem, modifiers: SelectedModifier[], notes: string) => {
    const calculatedDelta = modifiers.reduce((acc, m) => acc + m.priceDelta, 0);
    const unitPrice = item.price + calculatedDelta;

    const newItem: OrderItem = {
      id: `cart-${Date.now()}-${Math.random()}`,
      menuItemId: item.id,
      name: item.name,
      price: unitPrice,
      quantity: 1,
      station: item.station,
      modifiers,
      notes,
    };

    setCart(prev => [...prev, newItem]);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  // Promo code validation
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setDiscountPercent(0.10);
      setAppliedPromoName('WELCOME10 (10% Off)');
      setPromoCode('');
    } else if (code === 'HAPPYHOUR20' || code === 'HAPPY20') {
      setDiscountPercent(0.20);
      setAppliedPromoName('HAPPY20 (20% Off)');
      setPromoCode('');
    } else if (code === 'VIP15') {
      setDiscountPercent(0.15);
      setAppliedPromoName('VIP15 (15% Off)');
      setPromoCode('');
    } else {
      alert('Invalid promo code. Try WELCOME10 or HAPPY20');
    }
  };

  // Currency symbol and rates
  const baseCurrencySymbol = settings?.taxAndCurrency?.currencySymbol || '₦';
  const baseCurrencyCode = settings?.taxAndCurrency?.currencyCode || 'NGN';
  const [selectedCheckoutCurrency, setSelectedCheckoutCurrency] = useState<string>(baseCurrencyCode);

  useEffect(() => {
    if (settings?.taxAndCurrency?.currencyCode) {
      setSelectedCheckoutCurrency(settings.taxAndCurrency.currencyCode);
    }
  }, [settings?.taxAndCurrency?.currencyCode]);

  const currencySymbol = selectedCheckoutCurrency === 'USD' ? '$'
    : selectedCheckoutCurrency === 'GBP' ? '£'
    : selectedCheckoutCurrency === 'EUR' ? '€'
    : selectedCheckoutCurrency === 'CAD' ? 'CA$'
    : selectedCheckoutCurrency === 'AUD' ? 'A$'
    : selectedCheckoutCurrency === 'GHS' ? 'GH₵'
    : selectedCheckoutCurrency === 'KES' ? 'KSh'
    : selectedCheckoutCurrency === 'ZAR' ? 'R'
    : baseCurrencySymbol;

  const exchangeRate = (selectedCheckoutCurrency !== baseCurrencyCode && settings?.taxAndCurrency?.exchangeRates?.[selectedCheckoutCurrency as any])
    ? settings.taxAndCurrency.exchangeRates[selectedCheckoutCurrency as any]
    : 1;

  const effectiveTaxRate = settings?.taxAndCurrency?.defaultTaxRate !== undefined 
    ? settings.taxAndCurrency.defaultTaxRate 
    : currentLocation.taxRate;

  // Pricing calculations (in Base Currency)
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const discountAmount = subtotal * discountPercent;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * effectiveTaxRate;
  const total = taxableAmount + tax;

  // Foreign converted values if foreign currency selected
  const foreignTotal = selectedCheckoutCurrency !== baseCurrencyCode ? (total / exchangeRate) : undefined;

  const handleFinalizeOrder = (paymentMethod: 'cash' | 'card' | 'digital' | 'split') => {
    if (cart.length === 0) return;

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    const orderNumber = String(Math.floor(100 + Math.random() * 900));
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tableNumber: orderType === 'dine_in' ? selectedTableNumber : undefined,
      orderType,
      items: cart,
      subtotal,
      discountAmount,
      discountCode: appliedPromoName,
      tax,
      total,
      currencyCode: selectedCheckoutCurrency,
      currencySymbol,
      exchangeRate: exchangeRate !== 1 ? exchangeRate : undefined,
      foreignTotalAmount: foreignTotal,
      status: 'pending',
      paymentMethod,
      createdAt: new Date().toISOString(),
      locationId: currentLocation.id,
      serverName: currentStaff.name,
      customerName: customerName || (orderType === 'dine_in' ? `Table ${selectedTableNumber}` : 'Guest'),
    };

    onSendOrder(newOrder);
    setLastCompletedOrder(newOrder);
    setShowReceiptModal(true);

    // Reset Cart
    setCart([]);
    setDiscountPercent(0);
    setAppliedPromoName('');
    setCustomerName('');
    if (onResetSelectedTable) onResetSelectedTable();
  };

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      {/* Left: Menu & Categories */}
      <div className="flex-1 flex flex-col gap-5 overflow-hidden">
        {/* Top Control Header */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          {/* Order Type Switch */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                orderType === 'dine_in' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" /> Dine-In
            </button>
            <button
              onClick={() => setOrderType('takeout')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                orderType === 'takeout' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Takeout
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                orderType === 'delivery' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Delivery
            </button>
          </div>

          {/* Table Selector (if Dine-In) */}
          {orderType === 'dine_in' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Table:</span>
              <select
                value={selectedTableNumber}
                onChange={(e) => setSelectedTableNumber(parseInt(e.target.value) || 1)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.number}>
                    Table #{t.number} ({t.section} - {t.capacity} Pax)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Customer Name / Order Tag"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
          )}

          {/* Search Bar */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
          {filteredMenuItems.map(dish => {
            const hasModifiers = dish.modifierGroups && dish.modifierGroups.length > 0;

            return (
              <div
                key={dish.id}
                onClick={() => handleAddItemDirectly(dish)}
                className="group bg-white rounded-3xl border border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer select-none"
              >
                {/* Food Image */}
                <div className="relative h-36 bg-slate-100 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                    {dish.category}
                  </span>
                  {hasModifiers && (
                    <span className="absolute bottom-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" /> Modifiers
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {dish.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {dish.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-base font-black text-slate-900">
                      {currencySymbol}{dish.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      className="p-1.5 bg-slate-100 group-hover:bg-orange-600 group-hover:text-white rounded-xl text-slate-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Active Order Cart Sidebar */}
      <div className="w-96 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Cart Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">Current Ticket</h3>
              <span className="text-[10px] uppercase font-bold bg-orange-500 px-2 py-0.5 rounded-md">
                {orderType === 'dine_in' ? `Table ${selectedTableNumber}` : orderType.toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Server: {currentStaff.name} • {cart.length} items
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 transition-colors"
              title="Clear Ticket"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <UtensilsCrossed className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Ticket is empty</p>
              <p className="text-xs text-slate-400">Select items from the menu to build the order.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="pt-3 first:pt-0 flex flex-col space-y-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    <span className="text-xs text-slate-500 block">{currencySymbol}{item.price.toFixed(2)} each</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* Modifiers List */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="space-y-0.5">
                    {item.modifiers.map((m, mIdx) => (
                      <span key={mIdx} className="text-[11px] text-slate-500 block">
                        + {m.optionName} {m.priceDelta > 0 ? `(+${currencySymbol}${m.priceDelta.toFixed(2)})` : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="text-[11px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md font-medium">
                    ⚠️ {item.notes}
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl">
                    <button
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="p-1 hover:bg-white rounded-lg transition-colors text-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 px-1">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="p-1 hover:bg-white rounded-lg transition-colors text-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code Input */}
        {cart.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code (e.g. WELCOME10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs uppercase text-slate-900"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Apply
              </button>
            </form>
          </div>
        )}

        {/* Cart Totals & Checkout Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
          {/* Multi-Currency Selection Toggle */}
          {settings?.taxAndCurrency?.enableMultiCurrency !== false && (
            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-orange-500" /> Currency:
              </span>
              <select
                value={selectedCheckoutCurrency}
                onChange={(e) => setSelectedCheckoutCurrency(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-800 outline-none"
              >
                <option value={baseCurrencyCode}>🇳🇬 {baseCurrencyCode} ({baseCurrencySymbol}) [Base]</option>
                <option value="USD">🇺🇸 USD ($) [@ ₦{settings?.taxAndCurrency?.exchangeRates?.USD || 1500}]</option>
                <option value="GBP">🇬🇧 GBP (£) [@ ₦{settings?.taxAndCurrency?.exchangeRates?.GBP || 1950}]</option>
                <option value="EUR">🇪🇺 EUR (€) [@ ₦{settings?.taxAndCurrency?.exchangeRates?.EUR || 1650}]</option>
                <option value="CAD">🇨🇦 CAD (CA$)</option>
                <option value="AUD">🇦🇺 AUD (A$)</option>
              </select>
            </div>
          )}

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{baseCurrencySymbol}{subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({appliedPromoName})</span>
                <span>-{baseCurrencySymbol}{discountAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Tax ({(effectiveTaxRate * 100).toFixed(1)}%)</span>
              <span className="font-semibold text-slate-900">{baseCurrencySymbol}{tax.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Check</span>
              <span className="text-xl text-orange-600">{baseCurrencySymbol}{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>

            {selectedCheckoutCurrency !== baseCurrencyCode && foreignTotal !== undefined && (
              <div className="flex justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <span>Settlement in {selectedCheckoutCurrency}:</span>
                <span className="font-mono">{currencySymbol}{foreignTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* Split Bill Button */}
            <button
              disabled={cart.length === 0}
              onClick={() => setShowSplitModal(true)}
              className="w-full py-2 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Split className="w-3.5 h-3.5 text-orange-500" /> Split Check Across Guests
            </button>

            {/* Quick Pay / Send to Kitchen */}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={cart.length === 0}
                onClick={() => handleFinalizeOrder('cash')}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Banknote className="w-4 h-4" /> Cash Pay
              </button>

              <button
                disabled={cart.length === 0}
                onClick={() => handleFinalizeOrder('card')}
                className="py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-2xl text-xs font-black shadow-md shadow-slate-900/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" /> Card Pay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modifiers Modal */}
      {modifierItem && (
        <ModifierModal
          item={modifierItem}
          isOpen={!!modifierItem}
          onClose={() => setModifierItem(null)}
          onConfirm={handleAddWithModifiers}
        />
      )}

      {/* Split Bill Modal */}
      {showSplitModal && (
        <SplitBillModal
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          cart={cart}
          subtotal={subtotal}
          tax={tax}
          discount={discountAmount}
          total={total}
          onCompleteSplit={() => handleFinalizeOrder('split')}
        />
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          order={lastCompletedOrder}
          location={currentLocation}
          settings={settings}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};

export default POSView;
