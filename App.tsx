import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import POSView from './components/POSView';
import KDSView from './components/KDSView';
import FloorPlanView from './components/FloorPlanView';
import InventoryView from './components/InventoryView';
import ReportsView from './components/ReportsView';
import StaffView from './components/StaffView';
import Dashboard from './components/Dashboard';
import IntegrationsView from './components/IntegrationsView';
import SettingsView from './components/SettingsView';
import PurchasingView from './components/PurchasingView';
import PinModal from './components/PinModal';
import AiAssistantDrawer from './components/AiAssistantDrawer';
import ZReportModal from './components/ZReportModal';

import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_INVENTORY, 
  INITIAL_TABLES, 
  INITIAL_RESERVATIONS, 
  INITIAL_STAFF, 
  INITIAL_LOCATIONS, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_DELIVERY_NOTES,
  INITIAL_VENDOR_INVOICES,
  INITIAL_PURCHASE_RETURNS,
  INITIAL_WASTE_LOGS, 
  INITIAL_ORDERS, 
  INITIAL_TIME_LOGS, 
  INITIAL_Z_REPORTS,
  INITIAL_BRANCH_TRANSFERS,
  INITIAL_DELIVERY_CHANNELS,
  INITIAL_DELIVERY_RIDERS,
  INITIAL_ACCOUNTING_LOGS,
  INITIAL_PAYROLL_BATCHES,
  DEFAULT_APP_SETTINGS
} from './constants';

import { 
  Order, 
  InventoryItem, 
  MenuItem, 
  Table, 
  Reservation, 
  StaffMember, 
  Location, 
  Supplier, 
  PurchaseOrder, 
  PurchaseOrderStatus,
  DeliveryNote,
  VendorInvoice,
  PurchaseReturn,
  WasteLog, 
  TimeLog, 
  ZReport, 
  OrderStatus, 
  TableStatus,
  BranchTransfer,
  AccountingSyncLog,
  PayrollSyncBatch,
  DeliveryIntegration,
  DeliveryRider,
  AppSettings
} from './types';

export function App() {
  const [activeView, setActiveView] = useState<string>('pos');
  const [activeSubView, setActiveSubView] = useState<string>('overview');

  // Core ERP State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('restoflow_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('restoflow_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('restoflow_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('restoflow_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('restoflow_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('restoflow_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [currentStaff, setCurrentStaff] = useState<StaffMember>(staff[0] || INITIAL_STAFF[0]);

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('restoflow_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [currentLocation, setCurrentLocation] = useState<Location>(locations[0] || INITIAL_LOCATIONS[0]);

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('restoflow_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('restoflow_pos');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>(() => {
    const saved = localStorage.getItem('restoflow_delivery_notes');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_NOTES;
  });

  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>(() => {
    const saved = localStorage.getItem('restoflow_vendor_invoices');
    return saved ? JSON.parse(saved) : INITIAL_VENDOR_INVOICES;
  });

  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() => {
    const saved = localStorage.getItem('restoflow_purchase_returns');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_RETURNS;
  });

  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(() => {
    const saved = localStorage.getItem('restoflow_waste');
    return saved ? JSON.parse(saved) : INITIAL_WASTE_LOGS;
  });

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem('restoflow_timelogs');
    return saved ? JSON.parse(saved) : INITIAL_TIME_LOGS;
  });

  const [zReports, setZReports] = useState<ZReport[]>(() => {
    const saved = localStorage.getItem('restoflow_zreports');
    return saved ? JSON.parse(saved) : INITIAL_Z_REPORTS;
  });

  // Enterprise Integrations & Resilience State
  const [branchTransfers, setBranchTransfers] = useState<BranchTransfer[]>(() => {
    const saved = localStorage.getItem('restoflow_transfers');
    return saved ? JSON.parse(saved) : INITIAL_BRANCH_TRANSFERS;
  });

  const [accountingLogs, setAccountingLogs] = useState<AccountingSyncLog[]>(() => {
    const saved = localStorage.getItem('restoflow_accounting');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTING_LOGS;
  });

  const [payrollBatches, setPayrollBatches] = useState<PayrollSyncBatch[]>(() => {
    const saved = localStorage.getItem('restoflow_payroll');
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL_BATCHES;
  });

  const [deliveryChannels, setDeliveryChannels] = useState<DeliveryIntegration[]>(() => {
    const saved = localStorage.getItem('restoflow_delivery_channels');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_CHANNELS;
  });

  const [deliveryRiders, setDeliveryRiders] = useState<DeliveryRider[]>(() => {
    const saved = localStorage.getItem('restoflow_delivery_riders');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_RIDERS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('restoflow_settings');
    return saved ? JSON.parse(saved) : DEFAULT_APP_SETTINGS;
  });

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Cross-component coordination
  const [selectedTableForPOS, setSelectedTableForPOS] = useState<Table | null>(null);

  // Modals & Drawers
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem('restoflow_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('restoflow_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('restoflow_transfers', JSON.stringify(branchTransfers));
  }, [branchTransfers]);

  useEffect(() => {
    localStorage.setItem('restoflow_accounting', JSON.stringify(accountingLogs));
  }, [accountingLogs]);

  useEffect(() => {
    localStorage.setItem('restoflow_payroll', JSON.stringify(payrollBatches));
  }, [payrollBatches]);

  useEffect(() => {
    localStorage.setItem('restoflow_delivery_channels', JSON.stringify(deliveryChannels));
  }, [deliveryChannels]);

  useEffect(() => {
    localStorage.setItem('restoflow_delivery_riders', JSON.stringify(deliveryRiders));
  }, [deliveryRiders]);


  useEffect(() => {
    localStorage.setItem('restoflow_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('restoflow_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('restoflow_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('restoflow_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('restoflow_pos', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('restoflow_delivery_notes', JSON.stringify(deliveryNotes));
  }, [deliveryNotes]);

  useEffect(() => {
    localStorage.setItem('restoflow_vendor_invoices', JSON.stringify(vendorInvoices));
  }, [vendorInvoices]);

  useEffect(() => {
    localStorage.setItem('restoflow_purchase_returns', JSON.stringify(purchaseReturns));
  }, [purchaseReturns]);

  useEffect(() => {
    localStorage.setItem('restoflow_waste', JSON.stringify(wasteLogs));
  }, [wasteLogs]);

  useEffect(() => {
    localStorage.setItem('restoflow_timelogs', JSON.stringify(timeLogs));
  }, [timeLogs]);

  useEffect(() => {
    localStorage.setItem('restoflow_zreports', JSON.stringify(zReports));
  }, [zReports]);

  // Order Placement Handler with Real-Time Recipe BOM Inventory Depletion
  const handleSendOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);

    // Deplete Raw Inventory based on Bill of Materials (BOM) formulas
    setInventory(prevInventory => {
      let updated = [...prevInventory];

      newOrder.items.forEach(orderItem => {
        const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
        if (menuItem && menuItem.recipe) {
          menuItem.recipe.forEach(ingFormula => {
            const neededQty = ingFormula.quantity * orderItem.quantity;
            updated = updated.map(invItem => {
              if (invItem.id === ingFormula.ingredientId) {
                return {
                  ...invItem,
                  currentStock: Math.max(0, Math.round((invItem.currentStock - neededQty) * 100) / 100)
                };
              }
              return invItem;
            });
          });
        }
      });

      return updated;
    });

    // If dine-in order, update table status to 'ordered'
    if (newOrder.orderType === 'dine_in' && newOrder.tableNumber) {
      setTables(prev => prev.map(t => {
        if (t.number === newOrder.tableNumber) {
          return {
            ...t,
            status: 'ordered',
            serverName: newOrder.serverName || currentStaff.name,
            currentGuestCount: t.currentGuestCount || 2,
          };
        }
        return t;
      }));
    }
  };

  // KDS Order Status Update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // Table Management Handlers
  const handleUpdateTableStatus = (tableId: number, newStatus: TableStatus, extra?: Partial<Table>) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus, ...extra } : t));
  };

  const handleSelectTableForPOS = (table: Table) => {
    setSelectedTableForPOS(table);
    setActiveView('pos');
  };

  const handleAddReservation = (res: Reservation) => {
    setReservations(prev => [res, ...prev]);
  };

  // Inventory Handlers
  const handleUpdateStock = (id: string, newStock: number) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, currentStock: newStock } : i));
  };

  const handleUpdateMinStock = (id: string, newMinStock: number) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, minStock: newMinStock } : i));
  };

  const handleBatchUpdateMinStock = (updates: { id: string; minStock: number }[]) => {
    const updateMap = new Map(updates.map(u => [u.id, u.minStock]));
    setInventory(prev => prev.map(i => {
      if (updateMap.has(i.id)) {
        return { ...i, minStock: updateMap.get(i.id)! };
      }
      return i;
    }));
  };

  const handleAddNewItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  };

  const handleCreatePO = (po: PurchaseOrder) => {
    setPurchaseOrders(prev => [po, ...prev]);
  };

  const handleReceivePO = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    // Mark PO received
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'received' } : p));

    // Increase stock for each item in the PO
    setInventory(prev => {
      let updated = [...prev];
      po.items.forEach(poLine => {
        updated = updated.map(invItem => {
          if (invItem.id === poLine.ingredientId) {
            return {
              ...invItem,
              currentStock: invItem.currentStock + poLine.quantity,
              lastRestocked: new Date().toISOString().split('T')[0]
            };
          }
          return invItem;
        });
      });
      return updated;
    });
  };

  const handleLogWaste = (waste: WasteLog) => {
    setWasteLogs(prev => [waste, ...prev]);
  };

  // Staff & Punch Clock
  const handleToggleClock = (staffId: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id === staffId) {
        const nextState = !s.isClockedIn;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (!nextState) {
          // Clocking out: Record time log
          const hoursWorked = 4.5; // demo duration
          const earnings = hoursWorked * s.hourlyRate;
          const newLog: TimeLog = {
            id: `tl-${Date.now()}`,
            staffId: s.id,
            staffName: s.name,
            date: new Date().toISOString().split('T')[0],
            clockIn: s.clockedInAt || '09:00 AM',
            clockOut: now,
            totalHours: (s.totalHoursToday || 0) + hoursWorked,
            earnings,
          };
          setTimeLogs(tlPrev => [newLog, ...tlPrev]);
          return {
            ...s,
            isClockedIn: false,
            clockedInAt: undefined,
            totalHoursToday: (s.totalHoursToday || 0) + hoursWorked,
          };
        } else {
          return {
            ...s,
            isClockedIn: true,
            clockedInAt: now,
          };
        }
      }
      return s;
    }));
  };

  const handleAddStaff = (newMember: StaffMember) => {
    setStaff(prev => [...prev, newMember]);
  };

  const handleSwitchStaff = (member: StaffMember) => {
    setCurrentStaff(member);
  };

  const handleSaveZReport = (report: ZReport) => {
    setZReports(prev => [report, ...prev]);
  };

  // Enterprise Integrations Handlers
  const handleToggleOfflineMode = () => {
    setIsOfflineMode(prev => !prev);
  };

  const handleSyncAccounting = (platform: 'quickbooks' | 'sage' | 'xero') => {
    const totalGross = orders.reduce((acc, o) => acc + o.total, 0);
    const newLog: AccountingSyncLog = {
      id: `acc-${Date.now()}`,
      platform,
      syncType: platform === 'sage' ? 'cogs_depletion' : 'journal_entry',
      totalDebits: totalGross,
      totalCredits: totalGross,
      period: `Manual Sync (${new Date().toLocaleDateString()})`,
      status: 'synced',
      syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referenceId: `${platform.toUpperCase()}-GL-${Math.floor(10000 + Math.random() * 90000)}`,
      entriesCount: platform === 'sage' ? 14 : 8
    };
    setAccountingLogs(prev => [newLog, ...prev]);
  };

  const handleExportPayroll = (platform: 'gusto' | 'adp') => {
    const totalHours = staff.reduce((acc, s) => acc + (s.totalHoursToday || (s.isClockedIn ? 4.5 : 0)), 0);
    const totalGross = staff.reduce((acc, s) => acc + ((s.totalHoursToday || (s.isClockedIn ? 4.5 : 0)) * s.hourlyRate), 0);
    const newBatch: PayrollSyncBatch = {
      id: `pr-${Date.now()}`,
      platform,
      payPeriod: 'Current Active Shift Batch',
      totalEmployees: staff.length,
      regularHours: totalHours,
      overtimeHours: 0,
      grossPayroll: totalGross,
      estimatedTips: totalGross * 0.18,
      status: 'synced',
      exportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPayrollBatches(prev => [newBatch, ...prev]);
  };

  const handleToggleDeliveryChannel = (channelId: string) => {
    setDeliveryChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, isActive: !ch.isActive } : ch));
  };

  const handleInjectDeliveryOrder = (channel: 'UberEats' | 'DoorDash' | 'Deliveroo') => {
    const orderNum = Math.floor(500 + Math.random() * 400);
    const sampleItem = menuItems[Math.floor(Math.random() * menuItems.length)] || menuItems[0];
    const newDeliveryOrder: Order = {
      id: `del-ord-${Date.now()}`,
      orderNumber: `${orderNum}`,
      orderType: 'delivery',
      items: [
        {
          id: `doi-${Date.now()}-1`,
          menuItemId: sampleItem.id,
          name: sampleItem.name,
          price: sampleItem.price,
          quantity: 2,
          station: sampleItem.station || 'grill'
        }
      ],
      subtotal: sampleItem.price * 2,
      discountAmount: 0,
      tax: (sampleItem.price * 2) * currentLocation.taxRate,
      total: (sampleItem.price * 2) * (1 + currentLocation.taxRate),
      status: 'pending',
      paymentMethod: 'digital',
      createdAt: new Date().toISOString(),
      locationId: currentLocation.id,
      serverName: `${channel} API`,
      customerName: `${channel} Customer #${orderNum}`
    };

    setOrders(prev => [newDeliveryOrder, ...prev]);

    // Also register delivery rider
    const newRider: DeliveryRider = {
      id: `r-${Date.now()}`,
      orderId: newDeliveryOrder.id,
      orderNumber: orderNum,
      customerName: newDeliveryOrder.customerName || 'Delivery Guest',
      deliveryAddress: '742 Evergreen Terrace, App 5',
      channel,
      riderName: 'Alex Swift',
      riderPhone: '(555) 789-0123',
      vehicleType: 'motorcycle',
      status: 'assigned',
      estimatedArrivalMins: 12,
      orderTotal: newDeliveryOrder.total
    };
    setDeliveryRiders(prev => [newRider, ...prev]);
  };

  const handleCreateBranchTransfer = (transfer: BranchTransfer) => {
    setBranchTransfers(prev => [transfer, ...prev]);

    // Deplete stock at origin branch
    setInventory(prev => prev.map(item => {
      if (item.id === transfer.ingredientId) {
        return {
          ...item,
          currentStock: Math.max(0, item.currentStock - transfer.quantity)
        };
      }
      return item;
    }));
  };

  const handleReceiveBranchTransfer = (transferId: string) => {
    const tr = branchTransfers.find(t => t.id === transferId);
    if (!tr) return;

    setBranchTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'received', receivedAt: new Date().toLocaleTimeString() } : t));

    // Increase stock at destination
    setInventory(prev => prev.map(item => {
      if (item.id === tr.ingredientId) {
        return {
          ...item,
          currentStock: item.currentStock + tr.quantity,
          lastRestocked: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // Update active location tax rate if changed
    setLocations(prev => prev.map(l => l.id === currentLocation.id ? { ...l, taxRate: newSettings.taxAndCurrency.defaultTaxRate } : l));
    setCurrentLocation(prev => ({ ...prev, taxRate: newSettings.taxAndCurrency.defaultTaxRate }));
  };

  const handleUpdateMenuItemPrice = (menuItemId: string, newPrice: number) => {
    setMenuItems(prev => prev.map(m => m.id === menuItemId ? { ...m, price: newPrice } : m));
  };

  // Purchasing & Procurement Handlers
  const handleUpdatePOStatus = (poId: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId) {
        return {
          ...po,
          status,
          receivedDate: status === 'received' ? new Date().toISOString().slice(0, 10) : po.receivedDate
        };
      }
      return po;
    }));
  };

  const handleLogDeliveryNote = (grn: DeliveryNote, autoRestock = true) => {
    setDeliveryNotes(prev => [grn, ...prev]);
  };

  const handleCreateVendorInvoice = (invoice: VendorInvoice) => {
    setVendorInvoices(prev => [invoice, ...prev]);
  };

  const handleRecordInvoicePayment = (
    invoiceId: string, 
    payment: { amount: number; method: 'bank_transfer' | 'corporate_card' | 'check' | 'ach' | 'cash'; reference: string }
  ) => {
    setVendorInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newPaid = Number((inv.amountPaid + payment.amount).toFixed(2));
        const newBalance = Math.max(0, Number((inv.totalAmount - newPaid).toFixed(2)));
        const newStatus = newBalance <= 0.01 ? 'paid' : 'partially_paid';
        return {
          ...inv,
          amountPaid: newPaid,
          balanceDue: newBalance,
          paymentStatus: newStatus,
          paymentRecords: [
            ...inv.paymentRecords,
            {
              id: `pay-${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              amount: payment.amount,
              method: payment.method,
              referenceNumber: payment.reference,
              recordedBy: currentStaff.name
            }
          ]
        };
      }
      return inv;
    }));
  };

  const handleCreatePurchaseReturn = (ret: PurchaseReturn, deductStock = true) => {
    setPurchaseReturns(prev => [ret, ...prev]);
    if (deductStock) {
      ret.items.forEach(item => {
        const current = inventory.find(i => i.id === item.ingredientId)?.currentStock || 0;
        handleUpdateStock(item.ingredientId, Math.max(0, current - item.returnQty));
      });
    }
  };

  const handleNavigateView = (view: string, subView?: string) => {
    setActiveView(view);
    if (subView) {
      setActiveSubView(subView);
    }
  };

  // Counters for sidebar badges
  const activeKitchenTicketsCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStock).length;
  const openPoCount = purchaseOrders.filter(p => p.status === 'ordered' || p.status === 'submitted' || p.status === 'partially_received').length;
  const unpaidInvoicesCount = vendorInvoices.filter(i => i.paymentStatus === 'unpaid' || i.paymentStatus === 'partially_paid').length;

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-900 overflow-hidden">
      {/* Persistent Enterprise Sidebar */}
      <Sidebar
        activeView={activeView}
        activeSubView={activeSubView}
        setActiveView={handleNavigateView}
        locations={locations}
        currentLocation={currentLocation}
        onSelectLocation={setCurrentLocation}
        currentStaff={currentStaff}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        activeKitchenTicketsCount={activeKitchenTicketsCount}
        lowStockCount={lowStockCount}
        openPoCount={openPoCount}
        unpaidInvoicesCount={unpaidInvoicesCount}
      />

      {/* Main ERP Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden p-0 sm:p-2 bg-slate-950">
        <div className="flex-1 overflow-y-auto">
          {activeView === 'pos' && (
            <POSView
              menuItems={menuItems}
              tables={tables}
              currentLocation={currentLocation}
              currentStaff={currentStaff}
              settings={settings}
              selectedTableForPOS={selectedTableForPOS}
              onSendOrder={handleSendOrder}
              onResetSelectedTable={() => setSelectedTableForPOS(null)}
            />
          )}

          {activeView === 'kds' && (
            <KDSView
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeView === 'purchasing' && (
            <PurchasingView
              initialTab={activeSubView as any}
              purchaseOrders={purchaseOrders}
              deliveryNotes={deliveryNotes}
              vendorInvoices={vendorInvoices}
              purchaseReturns={purchaseReturns}
              suppliers={suppliers}
              inventory={inventory}
              settings={settings}
              branchName={currentLocation.name}
              currentLocationId={currentLocation.id}
              onCreatePO={handleCreatePO}
              onUpdatePOStatus={handleUpdatePOStatus}
              onLogDeliveryNote={handleLogDeliveryNote}
              onCreateVendorInvoice={handleCreateVendorInvoice}
              onRecordInvoicePayment={handleRecordInvoicePayment}
              onCreatePurchaseReturn={handleCreatePurchaseReturn}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {activeView === 'tables' && (
            <FloorPlanView
              tables={tables}
              reservations={reservations}
              onUpdateTableStatus={handleUpdateTableStatus}
              onSelectTableForPOS={handleSelectTableForPOS}
              onAddReservation={handleAddReservation}
            />
          )}

          {activeView === 'inventory' && (
            <InventoryView
              items={inventory}
              orders={orders}
              menuItems={menuItems}
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              wasteLogs={wasteLogs}
              branchName={currentLocation.name}
              onUpdateStock={handleUpdateStock}
              onUpdateMinStock={handleUpdateMinStock}
              onBatchUpdateMinStock={handleBatchUpdateMinStock}
              onAddNewItem={handleAddNewItem}
              onCreatePO={handleCreatePO}
              onReceivePO={handleReceivePO}
              onLogWaste={handleLogWaste}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView
              orders={orders}
              inventory={inventory}
              menuItems={menuItems}
              staff={staff}
              zReports={zReports}
              currentLocation={currentLocation}
              onOpenZReportModal={() => setIsZReportModalOpen(true)}
            />
          )}

          {activeView === 'staff' && (
            <StaffView
              staff={staff}
              currentStaff={currentStaff}
              timeLogs={timeLogs}
              onToggleClock={handleToggleClock}
              onAddStaff={handleAddStaff}
              onSwitchStaff={handleSwitchStaff}
            />
          )}

          {activeView === 'integrations' && (
            <IntegrationsView
              orders={orders}
              inventory={inventory}
              staff={staff}
              timeLogs={timeLogs}
              locations={locations}
              currentLocation={currentLocation}
              branchTransfers={branchTransfers}
              accountingLogs={accountingLogs}
              payrollBatches={payrollBatches}
              deliveryChannels={deliveryChannels}
              deliveryRiders={deliveryRiders}
              isOfflineMode={isOfflineMode}
              onToggleOfflineMode={handleToggleOfflineMode}
              onSyncAccounting={handleSyncAccounting}
              onExportPayroll={handleExportPayroll}
              onToggleDeliveryChannel={handleToggleDeliveryChannel}
              onInjectDeliveryOrder={handleInjectDeliveryOrder}
              onCreateBranchTransfer={handleCreateBranchTransfer}
              onReceiveBranchTransfer={handleReceiveBranchTransfer}
            />
          )}

          {activeView === 'dashboard' && (
            <Dashboard
              orders={orders}
              inventory={inventory}
              menuItems={menuItems}
              staff={staff}
              wasteLogs={wasteLogs}
              currentLocation={currentLocation}
              onNavigate={setActiveView}
              onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              initialTab={activeSubView}
              settings={settings}
              menuItems={menuItems}
              locations={locations}
              onSaveSettings={handleSaveSettings}
              onUpdateMenuItemPrice={handleUpdateMenuItemPrice}
            />
          )}
        </div>
      </main>

      {/* PIN Switch Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        staffList={staff}
        onSelectStaff={setCurrentStaff}
      />

      {/* AI Operations Copilot Drawer */}
      <AiAssistantDrawer
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        orders={orders}
        inventory={inventory}
        menuItems={menuItems}
        staff={staff}
        wasteLogs={wasteLogs}
        currentLocation={currentLocation}
      />

      {/* End of Day Z-Report Modal */}
      <ZReportModal
        isOpen={isZReportModalOpen}
        onClose={() => setIsZReportModalOpen(false)}
        orders={orders}
        location={currentLocation}
        currentStaff={currentStaff}
        onSaveZReport={handleSaveZReport}
      />
    </div>
  );
}

export default App;
