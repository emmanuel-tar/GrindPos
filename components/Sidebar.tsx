import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ChefHat, 
  Layers, 
  FileText, 
  Users, 
  MapPin, 
  Lock, 
  Sparkles, 
  Grid3X3, 
  UtensilsCrossed,
  Globe2,
  Settings,
  ChevronDown,
  ChevronRight,
  Truck,
  RotateCcw,
  Receipt,
  FileSpreadsheet,
  Clock,
  DollarSign,
  TrendingUp,
  Cpu,
  Printer,
  FileJson,
  CalendarDays,
  Flame,
  Wine,
  PackageCheck,
  Percent,
  Shield
} from 'lucide-react';
import { Location, StaffMember } from '../types';

interface SidebarProps {
  activeView: string;
  activeSubView?: string;
  setActiveView: (view: string, subView?: string) => void;
  locations: Location[];
  currentLocation: Location;
  onSelectLocation: (loc: Location) => void;
  currentStaff: StaffMember;
  onOpenPinModal: () => void;
  onOpenAiCopilot: () => void;
  activeKitchenTicketsCount: number;
  lowStockCount: number;
  openPoCount?: number;
  unpaidInvoicesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  activeSubView,
  setActiveView,
  locations,
  currentLocation,
  onSelectLocation,
  currentStaff,
  onOpenPinModal,
  onOpenAiCopilot,
  activeKitchenTicketsCount,
  lowStockCount,
  openPoCount = 1,
  unpaidInvoicesCount = 1,
}) => {
  // Track open dropdowns per menu item
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    pos: true,
    purchasing: true,
    inventory: false,
    kds: false,
    tables: false,
    reports: false,
    staff: false,
    integrations: false,
    dashboard: false,
    settings: false,
  });

  const toggleMenu = (menuId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const navMenuItems = [
    { 
      id: 'pos', 
      label: 'POS Terminal', 
      icon: ShoppingBag,
      subItems: [
        { id: 'register', label: 'Order & Menu Grid', icon: UtensilsCrossed },
        { id: 'orders', label: 'Active Orders & Tabs', icon: Receipt },
        { id: 'split', label: 'Split Check & Payments', icon: DollarSign },
      ]
    },
    { 
      id: 'kds', 
      label: 'Kitchen KDS', 
      icon: ChefHat, 
      badge: activeKitchenTicketsCount > 0 ? activeKitchenTicketsCount : null,
      badgeColor: 'bg-orange-500 text-white',
      subItems: [
        { id: 'all', label: 'All Active Tickets', icon: ChefHat },
        { id: 'grill', label: 'Grill Station', icon: Flame },
        { id: 'fryer', label: 'Fryer Station', icon: Flame },
        { id: 'bar', label: 'Bar & Beverages', icon: Wine },
      ]
    },
    { 
      id: 'purchasing', 
      label: 'Purchasing & POs', 
      icon: Truck,
      badge: openPoCount > 0 ? `${openPoCount} PO` : null,
      badgeColor: 'bg-blue-500 text-white',
      subItems: [
        { id: 'overview', label: 'Procurement Overview', icon: TrendingUp },
        { id: 'po', label: 'Purchase Orders (PO)', icon: ShoppingBag },
        { id: 'grn', label: 'Delivery Notes (GRN)', icon: PackageCheck },
        { id: 'invoices', label: 'Vendor Invoices (3-Way)', icon: FileText },
        { id: 'returns', label: 'Debit Notes & Returns', icon: RotateCcw },
        { id: 'suppliers', label: 'Vendor Directory', icon: Globe2 },
      ]
    },
    { 
      id: 'inventory', 
      label: 'Inventory & BOM', 
      icon: Layers, 
      badge: lowStockCount > 0 ? `${lowStockCount} Alert` : null,
      badgeColor: 'bg-red-500 text-white',
      subItems: [
        { id: 'ingredients', label: 'Stock & Par Levels', icon: Layers },
        { id: 'forecast', label: 'AI Demand Forecast', icon: Sparkles },
        { id: 'recipes', label: 'Recipe BOM Costing', icon: FileSpreadsheet },
        { id: 'waste', label: 'Waste & Spoilage Log', icon: RotateCcw },
      ]
    },
    { 
      id: 'tables', 
      label: 'Floor & Tables', 
      icon: Grid3X3,
      subItems: [
        { id: 'floor', label: 'Live Floor Grid', icon: Grid3X3 },
        { id: 'reservations', label: 'Reservation Book', icon: CalendarDays },
      ]
    },
    { 
      id: 'reports', 
      label: 'Reports & Audits', 
      icon: FileText,
      subItems: [
        { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp },
        { id: 'zreport', label: 'End-of-Day Z-Report', icon: FileText },
        { id: 'tax', label: 'Tax & VAT Audit', icon: DollarSign },
      ]
    },
    { 
      id: 'staff', 
      label: 'Staff & Clock', 
      icon: Users,
      subItems: [
        { id: 'roster', label: 'Staff Roster', icon: Users },
        { id: 'rbac', label: 'RBAC Roles & Matrix', icon: Shield },
        { id: 'timelogs', label: 'Time Logs & Hours', icon: Clock },
      ]
    },
    { 
      id: 'integrations', 
      label: 'Integrations & Hub', 
      icon: Globe2,
      subItems: [
        { id: 'accounting', label: 'QuickBooks & Sage', icon: FileSpreadsheet },
        { id: 'payroll', label: 'Gusto & ADP Payroll', icon: DollarSign },
        { id: 'delivery', label: 'DoorDash & UberEats', icon: Globe2 },
      ]
    },
    { 
      id: 'dashboard', 
      label: 'Executive KPI', 
      icon: LayoutDashboard,
      subItems: [
        { id: 'live', label: 'Live Sales Dashboard', icon: LayoutDashboard },
        { id: 'margins', label: 'Food Cost Margins', icon: TrendingUp },
      ]
    },
    { 
      id: 'settings', 
      label: 'Settings & Hardware', 
      icon: Settings,
      subItems: [
        { id: 'company', label: 'Restaurant Profile', icon: Settings },
        { id: 'tax', label: 'Tax & Currency Engine', icon: DollarSign },
        { id: 'pricing', label: 'BOM Pricing & Margins', icon: Percent },
        { id: 'rbac', label: 'RBAC & PIN Security', icon: Shield },
        { id: 'network', label: 'LAN Multi-Terminal', icon: Cpu },
        { id: 'printers', label: 'Thermal Printers', icon: Printer },
        { id: 'receipt', label: 'Receipt Template', icon: Receipt },
        { id: 'backup', label: 'JSON Backup & Sync', icon: FileJson },
      ]
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-white flex flex-col justify-between p-3.5 border-r border-slate-800 select-none h-screen max-h-screen">
      {/* Brand & Location Selector (Fixed top) */}
      <div className="space-y-4 shrink-0 pb-3 border-b border-slate-900">
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="p-2.5 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/20 text-white shrink-0">
            <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 truncate">
              RestoFlow <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-950 px-1.5 py-0.5 rounded border border-orange-800">ERP</span>
            </h1>
            <span className="text-[11px] text-slate-400 font-medium truncate block">Full Resto & Purchasing</span>
          </div>
        </div>

        {/* Location Dropdown Switcher */}
        <div className="p-2 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-orange-400" /> Location</span>
            <span className="text-emerald-400">Online</span>
          </div>
          <select
            value={currentLocation.id}
            onChange={(e) => {
              const loc = locations.find(l => l.id === e.target.value);
              if (loc) onSelectLocation(loc);
            }}
            className="w-full bg-slate-800/80 hover:bg-slate-800 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 border border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nav Links Container (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1.5 pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {navMenuItems.map(item => {
          const Icon = item.icon;
          const isParentActive = activeView === item.id;
          const isExpanded = !!expandedMenus[item.id];

          return (
            <div key={item.id} className="space-y-1">
              {/* Main Parent Item */}
              <div
                onClick={() => {
                  setActiveView(item.id);
                  if (!isExpanded) toggleMenu(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer group ${
                  isParentActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.subItems && (
                    <button
                      type="button"
                      onClick={(e) => toggleMenu(item.id, e)}
                      className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Submenu Dropdown */}
              {isExpanded && item.subItems && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-800 ml-3.5">
                  {item.subItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = isParentActive && activeSubView === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveView(item.id, sub.id);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all text-left ${
                          isSubActive
                            ? 'bg-slate-800 text-orange-400 font-bold border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }`}
                      >
                        <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-orange-400' : 'text-slate-500'}`} />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section: AI Copilot & Fast Staff Switcher (Fixed bottom) */}
      <div className="space-y-2.5 pt-3 border-t border-slate-900 shrink-0">
        {/* AI Operations Copilot Trigger */}
        <button
          onClick={onOpenAiCopilot}
          className="w-full p-2.5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent hover:from-orange-500/20 hover:via-amber-500/20 border border-orange-500/30 rounded-2xl text-left transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500 rounded-xl text-white shadow-sm shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-orange-400 transition-colors">
                AI Copilot
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Ask Gemini Assistant</span>
            </div>
          </div>
        </button>

        {/* Current Logged In Staff Card */}
        <div
          onClick={onOpenPinModal}
          className="p-2.5 bg-slate-900 hover:bg-slate-800/90 rounded-2xl border border-slate-800 cursor-pointer transition-all flex items-center justify-between group"
          title="Click to Switch Staff PIN"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-xl ${currentStaff.avatarColor} text-white font-black flex items-center justify-center text-[11px] shadow-sm shrink-0`}>
              {currentStaff.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {currentStaff.name}
              </span>
              <span className="text-[10px] uppercase font-bold text-orange-400 block truncate">
                {currentStaff.role}
              </span>
            </div>
          </div>

          <div className="p-1.5 bg-slate-800 group-hover:bg-slate-700 rounded-lg text-slate-400 group-hover:text-white transition-colors shrink-0">
            <Lock className="w-3 h-3" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
