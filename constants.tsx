import { 
  MenuItem, 
  Table, 
  Location, 
  InventoryItem, 
  StaffMember, 
  Supplier, 
  PurchaseOrder, 
  DeliveryNote,
  VendorInvoice,
  PurchaseReturn,
  WasteLog, 
  Reservation,
  Order,
  TimeLog,
  ZReport,
  BranchTransfer,
  DeliveryIntegration,
  DeliveryRider,
  AccountingSyncLog,
  PayrollSyncBatch,
  AppSettings,
  PermissionDefinition,
  RoleConfig
} from './types';

export const LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'Victoria Island Flagship Bistro', address: 'Plot 14 Victoria Island, Lagos', phone: '+234 1 234 5678', taxRate: 0.075 },
  { id: 'loc-2', name: 'Ikoyi Waterfront Lounge', address: '28 Alfred Rewane Road, Ikoyi, Lagos', phone: '+234 1 345 6789', taxRate: 0.075 },
  { id: 'loc-3', name: 'MM2 Airport Express Kiosk', address: 'Terminal 2 Concourse B, Ikeja, Lagos', phone: '+234 1 890 1234', taxRate: 0.075 },
];

export const DEFAULT_PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // POS & Register
  { key: 'pos_create_order', label: 'Create & Fire Orders', description: 'Open new guest checks, add menu items, and send to kitchen/bar.', category: 'pos' },
  { key: 'pos_apply_discount', label: 'Apply Promo & Discounts', description: 'Apply percentage or fixed promotional discounts to tickets.', category: 'pos' },
  { key: 'pos_void_item', label: 'Void Line Items & Orders', description: 'Cancel placed order items or void full active checks.', category: 'pos' },
  { key: 'pos_open_cash_drawer', label: 'No Sale / Open Cash Drawer', description: 'Manually trigger receipt printer kick-out for cash float adjustments.', category: 'pos' },
  { key: 'pos_process_refund', label: 'Process Payments & Refunds', description: 'Take settlements, split tender, and execute card/cash refunds.', category: 'pos' },
  { key: 'pos_split_check', label: 'Split Tickets & Checks', description: 'Split checks evenly or by individual seat line items.', category: 'pos' },

  // Floor & Tables
  { key: 'tables_manage_floor', label: 'Floor Plan & Table Status', description: 'Change table occupancy, merge tables, and reassign servers.', category: 'tables' },
  { key: 'tables_manage_reservations', label: 'Reservation Bookings', description: 'Create, confirm, seat, or cancel guest dining reservations.', category: 'tables' },

  // Kitchen KDS
  { key: 'kds_view', label: 'View Kitchen Display (KDS)', description: 'Access live kitchen display tickets across cooking stations.', category: 'kds' },
  { key: 'kds_bump_ticket', label: 'Bump & Complete Tickets', description: 'Mark dishes or whole tickets as cooked and ready for pickup.', category: 'kds' },
  { key: 'kds_cancel_ticket', label: 'Recall / Modify Kitchen Orders', description: 'Reprint KOT chits or pull back completed kitchen tickets.', category: 'kds' },

  // Purchasing & AP
  { key: 'purchasing_create_po', label: 'Draft Purchase Orders', description: 'Create replenishment orders and select vendor terms.', category: 'purchasing' },
  { key: 'purchasing_approve_po', label: 'Approve & Submit POs', description: 'Commit financial purchase orders to suppliers.', category: 'purchasing' },
  { key: 'purchasing_receive_grn', label: 'Log Receiving (GRN)', description: 'Verify incoming dock shipments, counts, and QC inspection.', category: 'purchasing' },
  { key: 'purchasing_enter_bill', label: 'Record Vendor Invoices', description: 'Post vendor bills into accounts payable ledger.', category: 'purchasing' },
  { key: 'purchasing_pay_bill', label: 'Authorize Vendor Payments', description: 'Record outgoing wire transfers, checks, and ACH disbursements.', category: 'purchasing' },
  { key: 'purchasing_create_return', label: 'Debit Notes & Returns', description: 'Issue supplier return slips for damaged or rejected goods.', category: 'purchasing' },
  { key: 'purchasing_manage_suppliers', label: 'Manage Vendor Directory', description: 'Add, edit, or deactivate supplier contracts and pricing terms.', category: 'purchasing' },

  // Inventory & BOM
  { key: 'inventory_view_stock', label: 'View Stock & Par Levels', description: 'Inspect stock levels, valuation, and ingredient reorder alerts.', category: 'inventory' },
  { key: 'inventory_adjust_stock', label: 'Manual Stock Adjustments', description: 'Override ingredient inventory counts following physical audits.', category: 'inventory' },
  { key: 'inventory_edit_bom', label: 'Edit Recipes & BOM Yields', description: 'Configure sub-recipes, ingredient yields, and theoretical costs.', category: 'inventory' },
  { key: 'inventory_log_waste', label: 'Log Waste & Spoilage', description: 'Record kitchen waste, expired goods, and spillages.', category: 'inventory' },

  // Reports & Financials
  { key: 'reports_view_sales', label: 'View Sales & Revenue Analytics', description: 'Access hourly sales trends, category mix, and payment breakdowns.', category: 'reports' },
  { key: 'reports_generate_zreport', label: 'Run End-of-Day Z-Report', description: 'Perform shift cash drawer reconciliations and print Z-readings.', category: 'reports' },
  { key: 'reports_view_tax_audit', label: 'Tax & VAT Audit Reports', description: 'Generate monthly FIRS/LIRS compliant tax audit summaries.', category: 'reports' },
  { key: 'reports_view_food_margins', label: 'Cost of Goods & Margin Analysis', description: 'Inspect gross margin analytics and food cost % KPIs.', category: 'reports' },

  // Staff & Timeclock
  { key: 'staff_view_roster', label: 'View Staff Roster & Clock Status', description: 'See who is currently clocked in, shifts, and basic profile info.', category: 'staff' },
  { key: 'staff_manage_members', label: 'Add & Edit Team Members', description: 'Create employee records, assign wages, and change PINs.', category: 'staff' },
  { key: 'staff_edit_timecards', label: 'Edit Timecards & Shift Hours', description: 'Manual adjustments to clock-in/out timestamps and break times.', category: 'staff' },
  { key: 'staff_manage_rbac', label: 'RBAC Roles & Security Matrix', description: 'Configure permissions per role and manager override rules.', category: 'staff' },

  // System Settings & Hardware
  { key: 'settings_company_tax', label: 'Company & Tax Engine Settings', description: 'Modify restaurant legal details, VAT rates, and currency FX.', category: 'settings' },
  { key: 'settings_printers_hardware', label: 'Thermal Printers & Hardware', description: 'Configure ESC/POS network printers, cash drawers, and stations.', category: 'settings' },
  { key: 'settings_network_sync', label: 'LAN Network & Multi-Terminal Sync', description: 'Manage local host server, connected tablets, and offline mesh.', category: 'settings' },
  { key: 'settings_export_backup', label: 'JSON Backup & Configuration Sync', description: 'Export full ERP database backups and restore configurations.', category: 'settings' },
];

export const DEFAULT_ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'admin',
    name: 'Executive Owner / System Admin',
    description: 'Unrestricted master access to all ERP modules, financial audits, security policies, and configuration settings.',
    color: 'bg-purple-600',
    isSystemRole: true,
    maxDiscountPercentAllowed: 100,
    requirePinForClockOut: false,
    permissions: DEFAULT_PERMISSION_DEFINITIONS.map(p => p.key),
  },
  {
    role: 'manager',
    name: 'Shift General Manager',
    description: 'Full floor oversight, discount authorizations, vendor payments, purchase order approvals, and staff scheduling.',
    color: 'bg-orange-500',
    isSystemRole: true,
    maxDiscountPercentAllowed: 35,
    requirePinForClockOut: true,
    permissions: [
      'pos_create_order', 'pos_apply_discount', 'pos_void_item', 'pos_open_cash_drawer', 'pos_process_refund', 'pos_split_check',
      'tables_manage_floor', 'tables_manage_reservations',
      'kds_view', 'kds_bump_ticket', 'kds_cancel_ticket',
      'purchasing_create_po', 'purchasing_approve_po', 'purchasing_receive_grn', 'purchasing_enter_bill', 'purchasing_pay_bill', 'purchasing_create_return', 'purchasing_manage_suppliers',
      'inventory_view_stock', 'inventory_adjust_stock', 'inventory_edit_bom', 'inventory_log_waste',
      'reports_view_sales', 'reports_generate_zreport', 'reports_view_tax_audit', 'reports_view_food_margins',
      'staff_view_roster', 'staff_manage_members', 'staff_edit_timecards',
      'settings_printers_hardware', 'settings_company_tax'
    ],
  },
  {
    role: 'cashier',
    name: 'FOH Cashier & Front Desk',
    description: 'Order taking, table settlements, payment collection, and end-of-day register drawer reconciliation.',
    color: 'bg-emerald-500',
    isSystemRole: true,
    maxDiscountPercentAllowed: 15,
    requirePinForClockOut: true,
    permissions: [
      'pos_create_order', 'pos_apply_discount', 'pos_open_cash_drawer', 'pos_process_refund', 'pos_split_check',
      'tables_manage_floor', 'tables_manage_reservations',
      'reports_generate_zreport', 'staff_view_roster'
    ],
  },
  {
    role: 'server',
    name: 'Floor Server / Waitstaff',
    description: 'Handheld table ordering, split tickets, reservation seating, and dining room guest service.',
    color: 'bg-blue-500',
    isSystemRole: true,
    maxDiscountPercentAllowed: 10,
    requirePinForClockOut: true,
    permissions: [
      'pos_create_order', 'pos_split_check',
      'tables_manage_floor', 'tables_manage_reservations',
      'staff_view_roster'
    ],
  },
  {
    role: 'bartender',
    name: 'Head Bartender / Mixologist',
    description: 'Bar lounge order taking, beverage ticket management, cocktail BOM wastage logging, and bar cash register.',
    color: 'bg-pink-500',
    isSystemRole: true,
    maxDiscountPercentAllowed: 15,
    requirePinForClockOut: true,
    permissions: [
      'pos_create_order', 'pos_apply_discount', 'pos_open_cash_drawer', 'pos_split_check',
      'kds_view', 'kds_bump_ticket',
      'inventory_view_stock', 'inventory_log_waste',
      'staff_view_roster'
    ],
  },
  {
    role: 'kitchen',
    name: 'Head Chef / Line Cook',
    description: 'Kitchen Display System (KDS) order fulfillment, prep station routing, and kitchen waste logging.',
    color: 'bg-red-500',
    isSystemRole: true,
    maxDiscountPercentAllowed: 0,
    requirePinForClockOut: true,
    permissions: [
      'kds_view', 'kds_bump_ticket', 'kds_cancel_ticket',
      'inventory_view_stock', 'inventory_log_waste',
      'staff_view_roster'
    ],
  },
  {
    role: 'inventory_mgr',
    name: 'Procurement & Stores Officer',
    description: 'Supplier orders, receiving dock inspection, stock count audits, recipe costing, and vendor invoices.',
    color: 'bg-amber-600',
    isSystemRole: true,
    maxDiscountPercentAllowed: 0,
    requirePinForClockOut: true,
    permissions: [
      'purchasing_create_po', 'purchasing_approve_po', 'purchasing_receive_grn', 'purchasing_enter_bill', 'purchasing_create_return', 'purchasing_manage_suppliers',
      'inventory_view_stock', 'inventory_adjust_stock', 'inventory_edit_bom', 'inventory_log_waste',
      'reports_view_food_margins', 'staff_view_roster'
    ],
  }
];

export const STAFF_MEMBERS: StaffMember[] = [
  { 
    id: 'staff-1', 
    name: 'Alex Rivera', 
    email: 'alex.rivera@restoflow.com',
    phone: '+234 802 111 2233',
    role: 'manager', 
    pin: '1234', 
    hourlyRate: 28.50, 
    avatarColor: 'bg-orange-500', 
    isClockedIn: true, 
    clockedInAt: '08:00 AM', 
    totalHoursToday: 6.5,
    department: 'Management',
    assignedLocations: ['loc-1', 'loc-2'],
    dateHired: '2023-04-15',
    status: 'active',
    emergencyContact: 'Maria Rivera (+234 802 999 1122)'
  },
  { 
    id: 'staff-2', 
    name: 'Marco Rossi', 
    email: 'marco.rossi@restoflow.com',
    phone: '+234 803 222 3344',
    role: 'kitchen', 
    pin: '2345', 
    hourlyRate: 24.00, 
    avatarColor: 'bg-red-500', 
    isClockedIn: true, 
    clockedInAt: '09:30 AM', 
    totalHoursToday: 5.0,
    department: 'Back of House',
    assignedLocations: ['loc-1'],
    dateHired: '2023-09-01',
    status: 'active',
    emergencyContact: 'Giulia Rossi (+234 803 888 7766)'
  },
  { 
    id: 'staff-3', 
    name: 'Elena Chen', 
    email: 'elena.chen@restoflow.com',
    phone: '+234 805 333 4455',
    role: 'cashier', 
    pin: '3456', 
    hourlyRate: 19.50, 
    avatarColor: 'bg-emerald-500', 
    isClockedIn: true, 
    clockedInAt: '10:00 AM', 
    totalHoursToday: 4.5,
    department: 'Front of House',
    assignedLocations: ['loc-1'],
    dateHired: '2024-01-10',
    status: 'active',
    emergencyContact: 'Wei Chen (+234 805 777 6655)'
  },
  { 
    id: 'staff-4', 
    name: 'Sam Taylor', 
    email: 'sam.taylor@restoflow.com',
    phone: '+234 807 444 5566',
    role: 'server', 
    pin: '4567', 
    hourlyRate: 16.00, 
    avatarColor: 'bg-blue-500', 
    isClockedIn: true, 
    clockedInAt: '11:00 AM', 
    totalHoursToday: 3.5,
    department: 'Front of House',
    assignedLocations: ['loc-1'],
    dateHired: '2024-03-20',
    status: 'active',
    emergencyContact: 'Linda Taylor (+234 807 666 5544)'
  },
  { 
    id: 'staff-5', 
    name: 'Victoria Vance', 
    email: 'victoria.vance@restoflow.com',
    phone: '+234 809 555 6677',
    role: 'admin', 
    pin: '0000', 
    hourlyRate: 35.00, 
    avatarColor: 'bg-purple-600', 
    isClockedIn: false, 
    totalHoursToday: 0,
    department: 'Management',
    assignedLocations: ['loc-1', 'loc-2', 'loc-3'],
    dateHired: '2022-01-05',
    status: 'active',
    emergencyContact: 'Edward Vance (+234 809 333 2211)'
  },
  { 
    id: 'staff-6', 
    name: 'Tunde Adebayo', 
    email: 'tunde.adebayo@restoflow.com',
    phone: '+234 812 666 7788',
    role: 'inventory_mgr', 
    pin: '5678', 
    hourlyRate: 26.00, 
    avatarColor: 'bg-amber-600', 
    isClockedIn: true, 
    clockedInAt: '08:30 AM', 
    totalHoursToday: 6.0,
    department: 'Procurement',
    assignedLocations: ['loc-1', 'loc-2'],
    dateHired: '2023-11-15',
    status: 'active',
    emergencyContact: 'Folake Adebayo (+234 812 555 4433)'
  },
  { 
    id: 'staff-7', 
    name: 'Zoe Martinez', 
    email: 'zoe.martinez@restoflow.com',
    phone: '+234 814 777 8899',
    role: 'bartender', 
    pin: '6789', 
    hourlyRate: 20.00, 
    avatarColor: 'bg-pink-500', 
    isClockedIn: false, 
    totalHoursToday: 0,
    department: 'Beverage',
    assignedLocations: ['loc-1'],
    dateHired: '2024-05-02',
    status: 'active',
    emergencyContact: 'Carlos Martinez (+234 814 444 3322)'
  },
];

export const INITIAL_STAFF = STAFF_MEMBERS;

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Prime Meats & Poultry Co.', contactPerson: 'Dave Miller', email: 'orders@primemeats.com', phone: '(555) 301-4400', leadTimeDays: 1, categories: ['Meats', 'Poultry'] },
  { id: 'sup-2', name: 'Golden Harvest Produce', contactPerson: 'Sarah Jenkins', email: 'sales@goldenharvest.com', phone: '(555) 702-8811', leadTimeDays: 1, categories: ['Produce', 'Dairy'] },
  { id: 'sup-3', name: 'Artisan Bakery Supplies', contactPerson: 'Leo Dupont', email: 'leo@artisanbakery.com', phone: '(555) 904-1223', leadTimeDays: 2, categories: ['Bakery', 'Dry Goods'] },
  { id: 'sup-4', name: 'Beverage Direct Ltd', contactPerson: 'Rachel Adams', email: 'help@beveragedirect.com', phone: '(555) 880-9900', leadTimeDays: 3, categories: ['Beverages', 'Spirits', 'Coffee'] },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'ing-1', name: 'Angus Beef Patties (8oz)', category: 'Meat', currentStock: 64, minStock: 25, unit: 'pcs', costPerUnit: 2.75, supplierId: 'sup-1', locationId: 'loc-1', lastRestocked: '2026-08-28' },
  { id: 'ing-2', name: 'Brioche Burger Buns', category: 'Bakery', currentStock: 18, minStock: 30, unit: 'pcs', costPerUnit: 0.65, supplierId: 'sup-3', locationId: 'loc-1', lastRestocked: '2026-08-27' },
  { id: 'ing-3', name: 'Cheddar Cheese Slices', category: 'Dairy', currentStock: 85, minStock: 40, unit: 'slices', costPerUnit: 0.30, supplierId: 'sup-2', locationId: 'loc-1', lastRestocked: '2026-08-28' },
  { id: 'ing-4', name: 'Romaine Lettuce', category: 'Produce', currentStock: 14, minStock: 10, unit: 'heads', costPerUnit: 1.20, supplierId: 'sup-2', locationId: 'loc-1', lastRestocked: '2026-08-29' },
  { id: 'ing-5', name: 'Caesar Dressing', category: 'Sauces', currentStock: 8, minStock: 5, unit: 'liters', costPerUnit: 4.50, supplierId: 'sup-2', locationId: 'loc-1', lastRestocked: '2026-08-25' },
  { id: 'ing-6', name: 'Espresso Coffee Beans', category: 'Beverage', currentStock: 12, minStock: 8, unit: 'kg', costPerUnit: 18.00, supplierId: 'sup-4', locationId: 'loc-1', lastRestocked: '2026-08-26' },
  { id: 'ing-7', name: 'Whole Milk', category: 'Dairy', currentStock: 9, minStock: 15, unit: 'liters', costPerUnit: 1.80, supplierId: 'sup-2', locationId: 'loc-1', lastRestocked: '2026-08-28' },
  { id: 'ing-8', name: 'Pizza Flour (00)', category: 'Dry Goods', currentStock: 45, minStock: 25, unit: 'kg', costPerUnit: 1.40, supplierId: 'sup-3', locationId: 'loc-1', lastRestocked: '2026-08-24' },
  { id: 'ing-9', name: 'Fresh Mozzarella Ball', category: 'Dairy', currentStock: 22, minStock: 15, unit: 'pcs', costPerUnit: 2.10, supplierId: 'sup-2', locationId: 'loc-1', lastRestocked: '2026-08-28' },
  { id: 'ing-10', name: 'Chicken Wings (Raw)', category: 'Meat', currentStock: 35, minStock: 20, unit: 'kg', costPerUnit: 4.80, supplierId: 'sup-1', locationId: 'loc-1', lastRestocked: '2026-08-28' },
  { id: 'ing-11', name: 'Buffalo Hot Sauce', category: 'Sauces', currentStock: 11, minStock: 6, unit: 'liters', costPerUnit: 3.20, supplierId: 'sup-2', locationId: 'loc-1', lastRestocked: '2026-08-27' },
  { id: 'ing-12', name: 'Belgian Dark Chocolate', category: 'Dessert Prep', currentStock: 16, minStock: 10, unit: 'kg', costPerUnit: 12.50, supplierId: 'sup-3', locationId: 'loc-1', lastRestocked: '2026-08-22' },
  { id: 'ing-13', name: 'French Fries (Frozen)', category: 'Sides', currentStock: 40, minStock: 20, unit: 'kg', costPerUnit: 1.95, supplierId: 'sup-2', locationId: 'loc-1', lastRestocked: '2026-08-28' },
  { id: 'ing-14', name: 'Fresh Basil Bunch', category: 'Produce', currentStock: 6, minStock: 8, unit: 'bunches', costPerUnit: 1.50, supplierId: 'sup-2', locationId: 'loc-1', lastRestocked: '2026-08-29' },
];

export const MENU_CATEGORIES = ['All', 'Main Course', 'Appetizers', 'Beverages', 'Desserts', 'Sides'];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Classic Smash Angus Burger',
    category: 'Main Course',
    price: 14.95,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    description: 'Double Angus beef patty, toasted brioche bun, melted cheddar, house pickle relish & secret burger sauce.',
    station: 'grill',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Angus Beef Patties (8oz)', quantity: 1, unit: 'pcs', costPerUnit: 2.75 },
      { ingredientId: 'ing-2', ingredientName: 'Brioche Burger Buns', quantity: 1, unit: 'pcs', costPerUnit: 0.65 },
      { ingredientId: 'ing-3', ingredientName: 'Cheddar Cheese Slices', quantity: 2, unit: 'slices', costPerUnit: 0.30 },
    ],
    modifierGroups: [
      {
        id: 'mod-temp',
        name: 'Cooking Temperature',
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 't1', name: 'Medium Rare', priceDelta: 0 },
          { id: 't2', name: 'Medium Well', priceDelta: 0 },
          { id: 't3', name: 'Well Done', priceDelta: 0 },
        ]
      },
      {
        id: 'mod-addons',
        name: 'Burger Upgrades',
        minSelect: 0,
        maxSelect: 3,
        options: [
          { id: 'a1', name: 'Extra Cheddar Slice', priceDelta: 1.25 },
          { id: 'a2', name: 'Crispy Bacon Strips', priceDelta: 2.00 },
          { id: 'a3', name: 'Sautéed Mushrooms', priceDelta: 1.50 },
        ]
      }
    ]
  },
  {
    id: 'm2',
    name: 'Artisan Caesar Salad',
    category: 'Appetizers',
    price: 9.50,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&auto=format&fit=crop&q=80',
    description: 'Crisp romaine hearts, toasted garlic croutons, aged shaved parmesan, tossed in emulsified Caesar dressing.',
    station: 'salad',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-4', ingredientName: 'Romaine Lettuce', quantity: 0.5, unit: 'heads', costPerUnit: 1.20 },
      { ingredientId: 'ing-5', ingredientName: 'Caesar Dressing', quantity: 0.08, unit: 'liters', costPerUnit: 4.50 },
    ],
    modifierGroups: [
      {
        id: 'mod-salad-protein',
        name: 'Add Protein',
        minSelect: 0,
        maxSelect: 1,
        options: [
          { id: 'sp1', name: 'Grilled Chicken Breast', priceDelta: 4.50 },
          { id: 'sp2', name: 'Pan-Seared Jumbo Shrimp', priceDelta: 6.00 },
        ]
      }
    ]
  },
  {
    id: 'm3',
    name: 'Fire-Roasted Buffalo Wings (8pcs)',
    category: 'Appetizers',
    price: 12.95,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy fried chicken wings tossed in tangy cayenne butter sauce, served with celery and blue cheese dip.',
    station: 'fryer',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-10', ingredientName: 'Chicken Wings (Raw)', quantity: 0.4, unit: 'kg', costPerUnit: 4.80 },
      { ingredientId: 'ing-11', ingredientName: 'Buffalo Hot Sauce', quantity: 0.08, unit: 'liters', costPerUnit: 3.20 },
    ],
    modifierGroups: [
      {
        id: 'mod-spice',
        name: 'Spice Level',
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'sl1', name: 'Mild Honey Buffalo', priceDelta: 0 },
          { id: 'sl2', name: 'Original Spicy', priceDelta: 0 },
          { id: 'sl3', name: 'Ghost Pepper Inferno', priceDelta: 0.75 },
        ]
      }
    ]
  },
  {
    id: 'm4',
    name: 'Neapolitan Margherita Pizza',
    category: 'Main Course',
    price: 16.50,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80',
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, aromatic sweet basil, extra virgin olive oil.',
    station: 'grill',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-8', ingredientName: 'Pizza Flour (00)', quantity: 0.25, unit: 'kg', costPerUnit: 1.40 },
      { ingredientId: 'ing-9', ingredientName: 'Fresh Mozzarella Ball', quantity: 1, unit: 'pcs', costPerUnit: 2.10 },
      { ingredientId: 'ing-14', ingredientName: 'Fresh Basil Bunch', quantity: 0.2, unit: 'bunches', costPerUnit: 1.50 },
    ]
  },
  {
    id: 'm5',
    name: 'Molten Belgian Lava Cake',
    category: 'Desserts',
    price: 8.75,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    description: 'Decadent dark chocolate soufflé cake with a flowing molten center, dusted with Dutch cocoa and vanilla bean gelato.',
    station: 'dessert',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-12', ingredientName: 'Belgian Dark Chocolate', quantity: 0.12, unit: 'kg', costPerUnit: 12.50 },
    ]
  },
  {
    id: 'm6',
    name: 'Iced Vanilla Oat Latte',
    category: 'Beverages',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    description: 'Double ristretto espresso poured over artisanal whole milk and Madagascar vanilla syrup over ice.',
    station: 'bar',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-6', ingredientName: 'Espresso Coffee Beans', quantity: 0.03, unit: 'kg', costPerUnit: 18.00 },
      { ingredientId: 'ing-7', ingredientName: 'Whole Milk', quantity: 0.25, unit: 'liters', costPerUnit: 1.80 },
    ],
    modifierGroups: [
      {
        id: 'mod-milk',
        name: 'Milk Substitute',
        minSelect: 0,
        maxSelect: 1,
        options: [
          { id: 'm-oat', name: 'Barista Oat Milk', priceDelta: 0.80 },
          { id: 'm-almond', name: 'Almond Milk', priceDelta: 0.80 },
        ]
      }
    ]
  },
  {
    id: 'm7',
    name: 'Truffle Parmesan Hand-Cut Fries',
    category: 'Sides',
    price: 6.95,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    description: 'Double-fried Idaho russet potatoes tossed in black truffle oil, fine parsley, and freshly grated Parmigiano.',
    station: 'fryer',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-13', ingredientName: 'French Fries (Frozen)', quantity: 0.35, unit: 'kg', costPerUnit: 1.95 },
    ]
  },
];

export const TABLES: Table[] = [
  // Dining Room
  { id: 1, number: 1, status: 'vacant', capacity: 2, section: 'Dining' },
  { id: 2, number: 2, status: 'occupied' as any, capacity: 4, section: 'Dining', currentGuestCount: 3, serverName: 'Sam Taylor', seatedSince: '45m ago' },
  { id: 3, number: 3, status: 'ordered' as any, capacity: 4, section: 'Dining', currentGuestCount: 4, serverName: 'Sam Taylor', seatedSince: '20m ago' },
  { id: 4, number: 4, status: 'vacant', capacity: 6, section: 'Dining' },
  { id: 5, number: 5, status: 'check_dropped', capacity: 4, section: 'Dining', currentGuestCount: 2, serverName: 'Elena Chen', seatedSince: '1h 10m ago' },
  { id: 6, number: 6, status: 'cleaning', capacity: 2, section: 'Dining' },
  
  // Patio
  { id: 7, number: 7, status: 'vacant', capacity: 4, section: 'Patio' },
  { id: 8, number: 8, status: 'seated', capacity: 4, section: 'Patio', currentGuestCount: 4, serverName: 'Sam Taylor', seatedSince: '8m ago' },
  { id: 9, number: 9, status: 'reserved', capacity: 6, section: 'Patio', notes: 'Birthday Party @ 8:00 PM' },
  { id: 10, number: 10, status: 'vacant', capacity: 2, section: 'Patio' },

  // Bar Lounge
  { id: 11, number: 11, status: 'occupied' as any, capacity: 2, section: 'Bar Lounge', currentGuestCount: 2, serverName: 'Elena Chen', seatedSince: '30m ago' },
  { id: 12, number: 12, status: 'vacant', capacity: 2, section: 'Bar Lounge' },
  { id: 13, number: 13, status: 'vacant', capacity: 4, section: 'Bar Lounge' },
  { id: 14, number: 14, status: 'vacant', capacity: 4, section: 'Bar Lounge' },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'res-1', customerName: 'Jonathan Davies', phone: '(555) 778-9901', guests: 6, date: 'Today', time: '08:00 PM', tableNumber: 9, status: 'confirmed', notes: 'Corner booth preferred, celebrating 30th birthday' },
  { id: 'res-2', customerName: 'Dr. Clara Sterling', phone: '(555) 441-2390', guests: 2, date: 'Today', time: '08:30 PM', tableNumber: 4, status: 'confirmed', notes: 'Quiet table for anniversary dinner' },
  { id: 'res-3', customerName: 'TechCorp Executive Dinner', phone: '(555) 889-0012', guests: 8, date: 'Tomorrow', time: '07:00 PM', status: 'confirmed', notes: 'Pre-ordered wine pairing, invoice to corporate card' },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-089',
    supplierId: 'sup-1',
    supplierName: 'Prime Meats & Poultry Co.',
    status: 'ordered',
    createdAt: '2026-08-28',
    expectedDate: '2026-08-30',
    totalAmount: 345.00,
    locationId: 'loc-1',
    items: [
      { ingredientId: 'ing-1', ingredientName: 'Angus Beef Patties (8oz)', quantity: 80, unit: 'pcs', unitCost: 2.75, totalCost: 220.00 },
      { ingredientId: 'ing-10', ingredientName: 'Chicken Wings (Raw)', quantity: 25, unit: 'kg', unitCost: 5.00, totalCost: 125.00 }
    ]
  },
  {
    id: 'po-100',
    poNumber: 'PO-2026-088',
    supplierId: 'sup-3',
    supplierName: 'Artisan Bakery Supplies',
    status: 'received',
    createdAt: '2026-08-26',
    expectedDate: '2026-08-27',
    receivedDate: '2026-08-27',
    totalAmount: 138.50,
    locationId: 'loc-1',
    items: [
      { ingredientId: 'ing-2', ingredientName: 'Brioche Burger Buns', quantity: 120, unit: 'pcs', unitCost: 0.65, totalCost: 78.00 },
      { ingredientId: 'ing-8', ingredientName: 'Pizza Flour (00)', quantity: 40, unit: 'kg', unitCost: 1.50, totalCost: 60.50 }
    ]
  }
];

export const INITIAL_DELIVERY_NOTES: DeliveryNote[] = [
  {
    id: 'grn-101',
    grnNumber: 'GRN-2026-042',
    poId: 'po-100',
    poNumber: 'PO-2026-088',
    supplierId: 'sup-3',
    supplierName: 'Artisan Bakery Supplies',
    locationId: 'loc-1',
    receivedDate: '2026-08-27',
    deliverySlipNumber: 'PKG-789012',
    carrierOrDriver: 'Express Freight (Driver: Tom H.)',
    inspectedBy: 'Marco Rossi',
    status: 'stored_in_inventory',
    inventoryRestocked: true,
    notes: 'Bakery shipment received in pristine condition. Ambient temperature checked.',
    items: [
      {
        ingredientId: 'ing-2',
        ingredientName: 'Brioche Burger Buns',
        orderedQty: 120,
        receivedQty: 120,
        rejectedQty: 0,
        unit: 'pcs',
        unitCost: 0.65,
        condition: 'good',
        batchNumber: 'BUN-2608-A',
        expiryDate: '2026-09-05'
      },
      {
        ingredientId: 'ing-8',
        ingredientName: 'Pizza Flour (00)',
        orderedQty: 40,
        receivedQty: 40,
        rejectedQty: 0,
        unit: 'kg',
        unitCost: 1.50,
        condition: 'good',
        batchNumber: 'FLR-00-991',
        expiryDate: '2026-11-20'
      }
    ]
  },
  {
    id: 'grn-102',
    grnNumber: 'GRN-2026-043',
    poId: 'po-101',
    poNumber: 'PO-2026-089',
    supplierId: 'sup-1',
    supplierName: 'Prime Meats & Poultry Co.',
    locationId: 'loc-1',
    receivedDate: '2026-08-29',
    deliverySlipNumber: 'DN-MEAT-4451',
    carrierOrDriver: 'Refrigerated Direct (Driver: Carlos)',
    inspectedBy: 'Elena Chen',
    status: 'partially_accepted',
    inventoryRestocked: true,
    notes: '5kg of chicken wings showed damaged vacuum seal; rejected during QA intake.',
    items: [
      {
        ingredientId: 'ing-1',
        ingredientName: 'Angus Beef Patties (8oz)',
        orderedQty: 80,
        receivedQty: 80,
        rejectedQty: 0,
        unit: 'pcs',
        unitCost: 2.75,
        condition: 'good',
        batchNumber: 'MEAT-8812',
        expiryDate: '2026-09-08'
      },
      {
        ingredientId: 'ing-10',
        ingredientName: 'Chicken Wings (Raw)',
        orderedQty: 25,
        receivedQty: 20,
        rejectedQty: 5,
        unit: 'kg',
        unitCost: 5.00,
        condition: 'damaged',
        batchNumber: 'WNG-4410',
        expiryDate: '2026-09-04',
        notes: '5kg packaging broken, temperature 9°C (over 4°C limit). Rejected for return.'
      }
    ]
  }
];

export const INITIAL_VENDOR_INVOICES: VendorInvoice[] = [
  {
    id: 'inv-sup-101',
    invoiceNumber: 'INV-ABS-2026-88',
    poId: 'po-100',
    poNumber: 'PO-2026-088',
    grnId: 'grn-101',
    grnNumber: 'GRN-2026-042',
    supplierId: 'sup-3',
    supplierName: 'Artisan Bakery Supplies',
    invoiceDate: '2026-08-27',
    dueDate: '2026-09-11',
    subtotal: 138.50,
    taxAmount: 0.00,
    totalAmount: 138.50,
    amountPaid: 138.50,
    balanceDue: 0.00,
    paymentStatus: 'paid',
    threeWayMatchStatus: 'matched',
    paymentTerms: 'Net 15',
    locationId: 'loc-1',
    notes: 'Paid via Corporate ACH',
    paymentRecords: [
      {
        id: 'pay-rec-1',
        date: '2026-08-28',
        amount: 138.50,
        method: 'ach',
        referenceNumber: 'ACH-889123',
        recordedBy: 'Victoria Vance'
      }
    ],
    items: [
      { ingredientId: 'ing-2', ingredientName: 'Brioche Burger Buns', quantity: 120, unit: 'pcs', unitCost: 0.65, totalCost: 78.00 },
      { ingredientId: 'ing-8', ingredientName: 'Pizza Flour (00)', quantity: 40, unit: 'kg', unitCost: 1.50, totalCost: 60.50 }
    ]
  },
  {
    id: 'inv-sup-102',
    invoiceNumber: 'INV-PMP-2026-901',
    poId: 'po-101',
    poNumber: 'PO-2026-089',
    grnId: 'grn-102',
    grnNumber: 'GRN-2026-043',
    supplierId: 'sup-1',
    supplierName: 'Prime Meats & Poultry Co.',
    invoiceDate: '2026-08-29',
    dueDate: '2026-09-28',
    subtotal: 320.00,
    taxAmount: 0.00,
    totalAmount: 320.00,
    amountPaid: 0.00,
    balanceDue: 320.00,
    paymentStatus: 'unpaid',
    threeWayMatchStatus: 'price_discrepancy',
    paymentTerms: 'Net 30',
    locationId: 'loc-1',
    notes: 'Awaiting debit note credit of $25 for 5kg rejected chicken wings.',
    paymentRecords: [],
    items: [
      { ingredientId: 'ing-1', ingredientName: 'Angus Beef Patties (8oz)', quantity: 80, unit: 'pcs', unitCost: 2.75, totalCost: 220.00 },
      { ingredientId: 'ing-10', ingredientName: 'Chicken Wings (Raw)', quantity: 20, unit: 'kg', unitCost: 5.00, totalCost: 100.00 }
    ]
  }
];

export const INITIAL_PURCHASE_RETURNS: PurchaseReturn[] = [
  {
    id: 'pr-101',
    returnNumber: 'DN-2026-009',
    poId: 'po-101',
    poNumber: 'PO-2026-089',
    grnId: 'grn-102',
    grnNumber: 'GRN-2026-043',
    invoiceId: 'inv-sup-102',
    supplierId: 'sup-1',
    supplierName: 'Prime Meats & Poultry Co.',
    returnDate: '2026-08-29',
    totalRefundAmount: 25.00,
    status: 'credit_note_issued',
    creditNoteNumber: 'CN-PMP-441',
    refundMethod: 'credit_balance',
    processedBy: 'Elena Chen',
    locationId: 'loc-1',
    notes: '5kg spoiled chicken wings rejected upon delivery truck arrival. Supplier issued credit note.',
    items: [
      {
        ingredientId: 'ing-10',
        ingredientName: 'Chicken Wings (Raw)',
        returnQty: 5,
        unit: 'kg',
        unitCost: 5.00,
        totalCost: 25.00,
        reason: 'damaged_delivery',
        notes: 'Temperature spike in transport container'
      }
    ]
  }
];

export const INITIAL_WASTE_LOGS: WasteLog[] = [
  {
    id: 'w-1',
    ingredientId: 'ing-7',
    ingredientName: 'Whole Milk',
    quantity: 2,
    unit: 'liters',
    reason: 'expired',
    cost: 3.60,
    loggedBy: 'Marco Rossi',
    date: '2026-08-28',
    locationId: 'loc-1',
    notes: 'Past use-by date during morning inventory check'
  },
  {
    id: 'w-2',
    ingredientId: 'ing-1',
    ingredientName: 'Angus Beef Patties (8oz)',
    quantity: 2,
    unit: 'pcs',
    reason: 'burnt_prep',
    cost: 5.50,
    loggedBy: 'Marco Rossi',
    date: '2026-08-29',
    locationId: 'loc-1',
    notes: 'Grill flare-up during dinner rush rush hour'
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = MENU_ITEMS;
export const INITIAL_TABLES: Table[] = TABLES;
export const INITIAL_STAFF: StaffMember[] = STAFF_MEMBERS;
export const INITIAL_LOCATIONS: Location[] = LOCATIONS;

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 401,
    tableNumber: 3,
    orderType: 'dine_in',
    items: [
      {
        id: 'oi-1',
        menuItemId: 'm1',
        name: 'Classic Smash Angus Burger',
        price: 16.20,
        quantity: 2,
        station: 'grill',
        modifiers: [{ groupName: 'Cooking Temperature', optionName: 'Medium Well', priceDelta: 0 }, { groupName: 'Burger Upgrades', optionName: 'Extra Cheddar Slice', priceDelta: 1.25 }],
        notes: 'Extra napkins please'
      },
      {
        id: 'oi-2',
        menuItemId: 'm7',
        name: 'Truffle Parmesan Hand-Cut Fries',
        price: 6.95,
        quantity: 1,
        station: 'fryer',
      }
    ],
    subtotal: 39.35,
    discountAmount: 0,
    tax: 3.25,
    total: 42.60,
    status: 'preparing',
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    locationId: 'loc-1',
    serverName: 'Sam Taylor',
    customerName: 'Table 3'
  },
  {
    id: 'ord-102',
    orderNumber: 402,
    tableNumber: 8,
    orderType: 'dine_in',
    items: [
      {
        id: 'oi-3',
        menuItemId: 'm4',
        name: 'Neapolitan Margherita Pizza',
        price: 16.50,
        quantity: 1,
        station: 'grill',
      },
      {
        id: 'oi-4',
        menuItemId: 'm6',
        name: 'Iced Vanilla Oat Latte',
        price: 6.30,
        quantity: 2,
        station: 'bar',
        modifiers: [{ groupName: 'Milk Substitute', optionName: 'Barista Oat Milk', priceDelta: 0.80 }]
      }
    ],
    subtotal: 29.10,
    discountAmount: 0,
    tax: 2.40,
    total: 31.50,
    status: 'pending',
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    locationId: 'loc-1',
    serverName: 'Sam Taylor',
    customerName: 'Table 8'
  },
  {
    id: 'ord-103',
    orderNumber: 403,
    orderType: 'takeout',
    items: [
      {
        id: 'oi-5',
        menuItemId: 'm3',
        name: 'Fire-Roasted Buffalo Wings (8pcs)',
        price: 12.95,
        quantity: 2,
        station: 'fryer',
        modifiers: [{ groupName: 'Spice Level', optionName: 'Original Spicy', priceDelta: 0 }]
      },
      {
        id: 'oi-6',
        menuItemId: 'm5',
        name: 'Molten Belgian Lava Cake',
        price: 8.75,
        quantity: 1,
        station: 'dessert'
      }
    ],
    subtotal: 34.65,
    discountAmount: 3.46,
    discountCode: 'WELCOME10',
    tax: 2.57,
    total: 33.76,
    status: 'completed',
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    locationId: 'loc-1',
    serverName: 'Elena Chen',
    customerName: 'David K.'
  }
];

export const INITIAL_TIME_LOGS: TimeLog[] = [
  { id: 'tl-1', staffId: 'staff-1', staffName: 'Alex Rivera', date: '2026-08-29', clockIn: '08:00 AM', clockOut: '02:30 PM', durationHours: 6.5, earnings: 185.25 },
  { id: 'tl-2', staffId: 'staff-2', staffName: 'Marco Rossi', date: '2026-08-29', clockIn: '09:30 AM', clockOut: '02:30 PM', durationHours: 5.0, earnings: 120.00 },
  { id: 'tl-3', staffId: 'staff-3', staffName: 'Elena Chen', date: '2026-08-29', clockIn: '10:00 AM', clockOut: '02:30 PM', durationHours: 4.5, earnings: 87.75 },
];

export const INITIAL_Z_REPORTS: ZReport[] = [
  {
    id: 'zrep-20260828',
    date: '2026-08-28',
    locationId: 'loc-1',
    closedBy: 'Alex Rivera',
    openingCashFloat: 300.00,
    cashSales: 1240.00,
    cardSales: 4180.50,
    digitalSales: 320.00,
    totalGrossSales: 5740.50,
    taxCollected: 473.59,
    discountTotal: 184.20,
    actualCashCounted: 1540.00,
    cashVariance: 0.00,
    totalOrders: 142,
    averageTicket: 40.42,
    notes: 'Register balanced with $0 variance. Evening shift completed smoothly.',
    closedAt: '11:15 PM'
  }
];

export const PROMO_CODES: Record<string, { discountPercent: number; name: string }> = {
  'HAPPYHOUR': { discountPercent: 15, name: 'Happy Hour Special (15%)' },
  'STAFF': { discountPercent: 25, name: 'Staff Meal Discount (25%)' },
  'VIP10': { discountPercent: 10, name: 'VIP Patron Perk (10%)' },
  'WELCOME': { discountPercent: 20, name: 'New Guest Welcome (20%)' },
};

export const INITIAL_BRANCH_TRANSFERS: BranchTransfer[] = [
  {
    id: 'tr-101',
    transferNumber: 'TRF-8801',
    fromLocationId: 'loc-1',
    fromLocationName: 'Downtown Main Bistro',
    toLocationId: 'loc-2',
    toLocationName: 'Westfield Uptown Branch',
    ingredientId: 'ing-1',
    ingredientName: 'Angus Beef Patties (8oz)',
    quantity: 15,
    unit: 'pcs',
    unitCost: 2.75,
    totalCost: 41.25,
    status: 'in_transit',
    requestedBy: 'Elena Chen',
    requestedAt: '2026-08-29 11:30 AM',
    notes: 'Urgent weekend replenishment due to cater order.'
  },
  {
    id: 'tr-102',
    transferNumber: 'TRF-8800',
    fromLocationId: 'loc-1',
    fromLocationName: 'Downtown Main Bistro',
    toLocationId: 'loc-3',
    toLocationName: 'Airport Express Kiosk',
    ingredientId: 'ing-6',
    ingredientName: 'Espresso Coffee Beans',
    quantity: 4,
    unit: 'kg',
    unitCost: 18.00,
    totalCost: 72.00,
    status: 'received',
    requestedBy: 'Sam Taylor',
    requestedAt: '2026-08-28 02:15 PM',
    receivedAt: '2026-08-28 05:00 PM',
    notes: 'Morning rush bean restock.'
  }
];

export const INITIAL_DELIVERY_CHANNELS: DeliveryIntegration[] = [
  { id: 'del-1', channelName: 'UberEats', isActive: true, commissionRate: 25, autoAcceptOrders: true, activeOrdersCount: 3, dailyRevenue: 482.50, averageRating: 4.8 },
  { id: 'del-2', channelName: 'DoorDash', isActive: true, commissionRate: 22, autoAcceptOrders: true, activeOrdersCount: 2, dailyRevenue: 395.00, averageRating: 4.9 },
  { id: 'del-3', channelName: 'Deliveroo', isActive: true, commissionRate: 20, autoAcceptOrders: false, activeOrdersCount: 1, dailyRevenue: 188.00, averageRating: 4.7 },
  { id: 'del-4', channelName: 'Grubhub', isActive: false, commissionRate: 24, autoAcceptOrders: false, activeOrdersCount: 0, dailyRevenue: 0.00, averageRating: 4.6 },
];

export const INITIAL_DELIVERY_RIDERS: DeliveryRider[] = [
  {
    id: 'r-1',
    orderId: 'ord-103',
    orderNumber: 403,
    customerName: 'David K.',
    deliveryAddress: '450 Pine St, Apt 4B',
    channel: 'UberEats',
    riderName: 'Marcus Davis',
    riderPhone: '(555) 321-7789',
    vehicleType: 'motorcycle',
    status: 'in_transit',
    estimatedArrivalMins: 8,
    orderTotal: 33.76
  },
  {
    id: 'r-2',
    orderId: 'ord-104',
    orderNumber: 404,
    customerName: 'Sarah Lin',
    deliveryAddress: '120 Grand Ave, Suite 300',
    channel: 'DoorDash',
    riderName: 'Jessica Patel',
    riderPhone: '(555) 432-8890',
    vehicleType: 'car',
    status: 'arrived_at_restaurant',
    estimatedArrivalMins: 2,
    orderTotal: 58.20
  }
];

export const INITIAL_ACCOUNTING_LOGS: AccountingSyncLog[] = [
  {
    id: 'acc-1',
    platform: 'quickbooks',
    syncType: 'journal_entry',
    totalDebits: 5740.50,
    totalCredits: 5740.50,
    period: '2026-08-28 (Daily Z-Close)',
    status: 'synced',
    syncedAt: '2026-08-28 11:20 PM',
    referenceId: 'QB-JE-89021',
    entriesCount: 8
  },
  {
    id: 'acc-2',
    platform: 'sage',
    syncType: 'cogs_depletion',
    totalDebits: 1420.80,
    totalCredits: 1420.80,
    period: '2026-08-28 (BOM Inventory Depletion)',
    status: 'synced',
    syncedAt: '2026-08-28 11:22 PM',
    referenceId: 'SAGE-COGS-4402',
    entriesCount: 14
  }
];

export const INITIAL_PAYROLL_BATCHES: PayrollSyncBatch[] = [
  {
    id: 'pr-1',
    platform: 'gusto',
    payPeriod: 'Aug 16 - Aug 29, 2026',
    totalEmployees: 5,
    regularHours: 182.5,
    overtimeHours: 6.0,
    grossPayroll: 4580.00,
    estimatedTips: 1240.00,
    status: 'synced',
    exportedAt: '2026-08-29 02:00 PM'
  }
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  company: {
    name: 'RestoFlow Bistro & Grill Lagos',
    legalName: 'RestoFlow Hospitality Nigeria Ltd',
    slogan: 'Artisanal Dining • Craft Kitchens & Grill',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160&auto=format&fit=crop&q=80',
    phone: '+234 1 234 5678',
    email: 'contact@restoflow.ng',
    website: 'https://restoflow.ng',
    address: 'Plot 14 Victoria Island, Lagos, Nigeria',
    taxId: 'NG-TIN-23091840-001 (FIRS / LIRS VAT)'
  },
  taxAndCurrency: {
    currencyCode: 'NGN',
    currencySymbol: '₦',
    currencyPosition: 'before',
    defaultTaxRate: 0.075, // 7.5% Nigerian VAT (FIRS standard)
    serviceChargeRate: 0.05, // 5.00%
    takeawayTaxRate: 0.05, // 5.00%
    pricesIncludeTax: false,
    enableMultiCurrency: true,
    supportedCurrencies: ['NGN', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'GHS', 'KES', 'ZAR'],
    exchangeRates: {
      NGN: 1,
      USD: 1500, // 1 USD = ₦1,500
      GBP: 1950, // 1 GBP = ₦1,950
      EUR: 1650, // 1 EUR = ₦1,650
      CAD: 1100, // 1 CAD = ₦1,100
      AUD: 980,  // 1 AUD = ₦980
      GHS: 98,   // 1 GHS = ₦98
      KES: 11.5, // 1 KES = ₦11.5
      ZAR: 82    // 1 ZAR = ₦82
    },
    vatTinNumber: 'NG-TIN-23091840-001',
    taxAgencyName: 'Federal Inland Revenue Service (FIRS) & LIRS'
  },
  pricingMargin: {
    targetGrossMargin: 72, // 72% Target Gross Margin
    foodCostMultiplier: 3.5, // 3.5x Cost Multiplier
    autoSuggestPricing: true,
    lowMarginWarningThreshold: 55 // Below 55% alerts
  },
  network: {
    mode: 'server_host',
    hostIp: '192.168.1.120',
    port: 8080,
    terminalId: 'TERM-POS-01',
    terminalName: 'Main Counter POS (Server Host)',
    syncIntervalSeconds: 5,
    offlineSyncEnabled: true,
    lastSyncTimestamp: 'Just now (Continuous Local WebSockets)',
    connectedTerminals: [
      { id: 'term-1', name: 'Main Counter Register (Self)', ip: '192.168.1.120', role: 'POS Terminal', status: 'online', lastSeen: 'Active', latencyMs: 1 },
      { id: 'term-2', name: 'Kitchen KDS Touchscreen', ip: '192.168.1.144', role: 'Kitchen KDS', status: 'online', lastSeen: '2s ago', latencyMs: 4 },
      { id: 'term-3', name: 'Bar Lounge iPad Station', ip: '192.168.1.156', role: 'Bar Tablet', status: 'online', lastSeen: '5s ago', latencyMs: 8 },
      { id: 'term-4', name: 'Floor Waiter Handheld 01', ip: '192.168.1.182', role: 'POS Terminal', status: 'online', lastSeen: '12s ago', latencyMs: 14 },
      { id: 'term-5', name: 'Hostess Reception Stand', ip: '192.168.1.190', role: 'Hostess Desk', status: 'syncing', lastSeen: '45s ago', latencyMs: 22 }
    ]
  },
  printers: [
    {
      id: 'prn-1',
      name: 'FOH Cashier Thermal Receipt Printer',
      type: 'receipt_foh',
      connectionType: 'network_lan',
      ipAddress: '192.168.1.200:9100',
      paperWidth: '80mm',
      assignedStations: ['all'],
      autoPrintOnOrder: true,
      copies: 1,
      status: 'connected',
      lastTestPrinted: '2026-08-29 06:14 PM'
    },
    {
      id: 'prn-2',
      name: 'Kitchen Hot Line KOT Printer (Grill/Fryer)',
      type: 'kitchen_kot',
      connectionType: 'network_lan',
      ipAddress: '192.168.1.201:9100',
      paperWidth: '80mm',
      assignedStations: ['grill', 'fryer', 'salad'],
      autoPrintOnOrder: true,
      copies: 1,
      status: 'connected',
      lastTestPrinted: '2026-08-29 05:30 PM'
    },
    {
      id: 'prn-3',
      name: 'Bar Drink Ticket Printer',
      type: 'bar_kot',
      connectionType: 'bluetooth',
      paperWidth: '58mm',
      assignedStations: ['bar'],
      autoPrintOnOrder: true,
      copies: 1,
      status: 'connected',
      lastTestPrinted: '2026-08-29 04:12 PM'
    },
    {
      id: 'prn-4',
      name: 'Delivery Bag Dispatch Labeler',
      type: 'dispatch_slip',
      connectionType: 'usb',
      paperWidth: '80mm',
      assignedStations: ['all'],
      autoPrintOnOrder: false,
      copies: 1,
      status: 'connected',
      lastTestPrinted: '2026-08-28 09:00 PM'
    }
  ],
  receiptTemplate: {
    paperWidth: '80mm',
    headerText: 'WELCOME TO RESTOFLOW BISTRO',
    footerMessage: 'Thank you for dining with us! Please come back soon.',
    showLogo: true,
    showOrderNumber: true,
    showTableNumber: true,
    showServerName: true,
    showItemizedTax: true,
    showServiceCharge: true,
    showBarcode: true,
    showWifiInfo: true,
    wifiSsid: 'RestoFlow_Guest_HighSpeed',
    wifiPassword: 'freshfood2026',
    qrCodeUrl: 'https://restoflow.app/review/bistro-main',
    fontFamily: 'monospace'
  },
  rbac: {
    autoLockMinutes: 5,
    requireManagerPinForVoids: true,
    requireManagerPinForDiscountsOver: 15,
    requireManagerPinForDrawerKick: true,
    requireManagerPinForRefunds: true,
    requireManagerPinForBillPayments: true,
    requireManagerPinForStockAdjustments: true,
    roles: DEFAULT_ROLE_CONFIGS
  }
};

