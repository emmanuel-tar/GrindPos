export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'paid' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'digital' | 'split';
export type OrderType = 'dine_in' | 'takeout' | 'delivery';
export type TableStatus = 'vacant' | 'seated' | 'ordered' | 'check_dropped' | 'cleaning' | 'reserved';
export type KitchenStation = 'all' | 'grill' | 'fryer' | 'salad' | 'bar' | 'dessert';
export type UserRole = 'admin' | 'manager' | 'cashier' | 'kitchen' | 'server' | 'bartender' | 'inventory_mgr';

export type PermissionCategory = 'pos' | 'tables' | 'kds' | 'purchasing' | 'inventory' | 'reports' | 'staff' | 'settings';

export type PermissionKey =
  // POS & Register
  | 'pos_create_order'
  | 'pos_apply_discount'
  | 'pos_void_item'
  | 'pos_open_cash_drawer'
  | 'pos_process_refund'
  | 'pos_split_check'
  // Floor & Tables
  | 'tables_manage_floor'
  | 'tables_manage_reservations'
  // Kitchen KDS
  | 'kds_view'
  | 'kds_bump_ticket'
  | 'kds_cancel_ticket'
  // Purchasing & AP
  | 'purchasing_create_po'
  | 'purchasing_approve_po'
  | 'purchasing_receive_grn'
  | 'purchasing_enter_bill'
  | 'purchasing_pay_bill'
  | 'purchasing_create_return'
  | 'purchasing_manage_suppliers'
  // Inventory & BOM
  | 'inventory_view_stock'
  | 'inventory_adjust_stock'
  | 'inventory_edit_bom'
  | 'inventory_log_waste'
  // Reports & Financials
  | 'reports_view_sales'
  | 'reports_generate_zreport'
  | 'reports_view_tax_audit'
  | 'reports_view_food_margins'
  // Staff & Timeclock
  | 'staff_view_roster'
  | 'staff_manage_members'
  | 'staff_edit_timecards'
  | 'staff_manage_rbac'
  // System Settings & Hardware
  | 'settings_company_tax'
  | 'settings_printers_hardware'
  | 'settings_network_sync'
  | 'settings_export_backup';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: PermissionCategory;
}

export interface RoleConfig {
  role: UserRole;
  name: string;
  description: string;
  color: string;
  isSystemRole?: boolean;
  permissions: PermissionKey[];
  maxDiscountPercentAllowed: number;
  requirePinForClockOut: boolean;
}

export interface SecurityAndRbacSettings {
  autoLockMinutes: number;
  requireManagerPinForVoids: boolean;
  requireManagerPinForDiscountsOver: number;
  requireManagerPinForDrawerKick: boolean;
  requireManagerPinForRefunds: boolean;
  requireManagerPinForBillPayments: boolean;
  requireManagerPinForStockAdjustments: boolean;
  roles: RoleConfig[];
}

export interface StaffMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  pin: string;
  hourlyRate: number;
  avatarColor: string;
  isClockedIn: boolean;
  clockedInAt?: string;
  totalHoursToday?: number;
  department?: 'Front of House' | 'Back of House' | 'Management' | 'Procurement' | 'Beverage';
  assignedLocations?: string[];
  dateHired?: string;
  status?: 'active' | 'on_leave' | 'inactive';
  emergencyContact?: string;
  notes?: string;
}

export interface TimeLog {
  id: string;
  staffId: string;
  staffName: string;
  clockIn: string;
  clockOut?: string;
  durationHours?: number;
  earnings?: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  taxRate: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  station: KitchenStation;
  recipe: RecipeIngredient[];
  modifierGroups?: ModifierGroup[];
  isAvailable: boolean;
}

export interface SelectedModifier {
  groupName: string;
  optionName: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  modifiers?: SelectedModifier[];
  station?: KitchenStation;
  isCompletedInKitchen?: boolean;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber?: number;
  orderType: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discountAmount: number;
  discountCode?: string;
  total: number;
  paymentMethod?: PaymentMethod;
  currencyCode?: string;
  currencySymbol?: string;
  exchangeRate?: number;
  foreignTotal?: number;
  createdAt: string;
  completedAt?: string;
  locationId: string;
  serverName?: string;
  guestCount?: number;
  customerName?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  supplierId: string;
  locationId: string;
  lastRestocked?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  categories: string[];
}

export interface PurchaseOrderItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  receivedQty?: number;
  notes?: string;
}

export type PurchaseOrderStatus = 'draft' | 'submitted' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
export type PaymentTerms = 'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 60' | 'Cash on Delivery (COD)' | 'Advance';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal?: number;
  taxAmount?: number;
  totalAmount: number;
  currencyCode?: string;
  currencySymbol?: string;
  exchangeRate?: number;
  foreignTotalAmount?: number;
  status: PurchaseOrderStatus;
  createdAt: string;
  expectedDate: string;
  receivedDate?: string;
  locationId: string;
  paymentTerms?: PaymentTerms;
  notes?: string;
  createdByName?: string;
}

export interface DeliveryNoteItem {
  ingredientId: string;
  ingredientName: string;
  orderedQty: number;
  receivedQty: number;
  rejectedQty: number;
  unit: string;
  unitCost: number;
  condition: 'good' | 'damaged' | 'spoiled' | 'wrong_item';
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface DeliveryNote {
  id: string;
  grnNumber: string; // e.g. GRN-2026-001
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  locationId: string;
  receivedDate: string;
  deliverySlipNumber?: string;
  carrierOrDriver?: string;
  currencyCode?: string;
  currencySymbol?: string;
  exchangeRate?: number;
  items: DeliveryNoteItem[];
  inspectedBy: string;
  status: 'received' | 'partially_accepted' | 'rejected' | 'stored_in_inventory';
  inventoryRestocked: boolean;
  notes?: string;
}

export interface InvoicePaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'bank_transfer' | 'corporate_card' | 'check' | 'ach' | 'cash';
  referenceNumber: string;
  recordedBy: string;
}

export interface VendorInvoiceItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  poId?: string;
  poNumber?: string;
  grnId?: string;
  grnNumber?: string;
  supplierId: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  items: VendorInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currencyCode?: string;
  currencySymbol?: string;
  exchangeRate?: number;
  foreignTotalAmount?: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'disputed';
  threeWayMatchStatus: 'matched' | 'price_discrepancy' | 'qty_discrepancy' | 'unmatched';
  paymentTerms: PaymentTerms;
  paymentRecords: InvoicePaymentRecord[];
  notes?: string;
  locationId: string;
}

export interface PurchaseReturnItem {
  ingredientId: string;
  ingredientName: string;
  returnQty: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  reason: 'damaged_delivery' | 'expired_spoiled' | 'wrong_specification' | 'excess_overshipped' | 'failed_qa';
  notes?: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string; // e.g. DN-2026-001 (Debit Note)
  poId?: string;
  poNumber?: string;
  grnId?: string;
  grnNumber?: string;
  invoiceId?: string;
  supplierId: string;
  supplierName: string;
  returnDate: string;
  items: PurchaseReturnItem[];
  totalRefundAmount: number;
  currencyCode?: string;
  currencySymbol?: string;
  status: 'requested' | 'approved' | 'credit_note_issued' | 'refund_received';
  creditNoteNumber?: string;
  refundMethod?: 'credit_balance' | 'bank_refund' | 'cash';
  processedBy: string;
  locationId: string;
  notes?: string;
}

export interface WasteLog {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  reason: 'spoilage' | 'burnt_prep' | 'dropped_spill' | 'expired' | 'quality_rejection';
  cost: number;
  loggedBy: string;
  date: string;
  locationId: string;
  notes?: string;
}

export interface Table {
  id: number;
  number: number;
  status: TableStatus;
  capacity: number;
  section: 'Dining' | 'Patio' | 'Bar Lounge';
  currentOrderId?: string;
  currentGuestCount?: number;
  serverName?: string;
  seatedSince?: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  tableNumber?: number;
  status: 'confirmed' | 'seated' | 'cancelled';
  notes?: string;
}

export interface ZReport {
  id: string;
  date: string;
  locationId: string;
  closedBy: string;
  openingCashFloat: number;
  cashSales: number;
  cardSales: number;
  digitalSales: number;
  totalGrossSales: number;
  taxCollected: number;
  discountTotal: number;
  actualCashCounted: number;
  cashVariance: number;
  totalOrders: number;
  averageTicket: number;
  notes?: string;
  closedAt: string;
}

export interface IngredientForecast {
  ingredientId: string;
  ingredientName: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  supplierId: string;
  supplierName: string;
  supplierLeadTimeDays: number;
  historicalDailyAvgUsage: number;
  projected7DayUsage: number;
  daysUntilStockout: number;
  stockoutRisk: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  suggestedMinStock: number;
  suggestedOrderQuantity: number;
  estimatedRestockCost: number;
  reasoning: string;
}

export interface DailyDemandForecast {
  dayName: string;
  date: string;
  projectedOrders: number;
  projectedRevenue: number;
  peakStation: string;
}

export interface InventoryForecastResult {
  forecastGeneratedAt: string;
  overallHealthScore: number;
  summaryAnalysis: string;
  topRiskIngredients: string[];
  dailyDemand: DailyDemandForecast[];
  ingredientForecasts: IngredientForecast[];
  totalEstimatedReplenishmentCost: number;
  recommendedActions: string[];
}

export interface BranchTransfer {
  id: string;
  transferNumber: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  status: 'pending' | 'in_transit' | 'received' | 'rejected';
  requestedBy: string;
  requestedAt: string;
  receivedAt?: string;
  notes?: string;
}

export interface AccountingSyncLog {
  id: string;
  platform: 'quickbooks' | 'sage' | 'xero' | 'zoho';
  syncType: 'journal_entry' | 'sales_summary' | 'cogs_depletion' | 'tax_liability';
  totalDebits: number;
  totalCredits: number;
  period: string;
  status: 'synced' | 'pending' | 'failed';
  syncedAt: string;
  referenceId: string;
  entriesCount: number;
}

export interface PayrollSyncBatch {
  id: string;
  platform: 'gusto' | 'adp' | 'paychex' | 'rippling';
  payPeriod: string;
  totalEmployees: number;
  regularHours: number;
  overtimeHours: number;
  grossPayroll: number;
  estimatedTips: number;
  status: 'exported' | 'draft' | 'synced';
  exportedAt: string;
}

export interface DeliveryIntegration {
  id: string;
  channelName: 'UberEats' | 'DoorDash' | 'Deliveroo' | 'Grubhub';
  isActive: boolean;
  commissionRate: number;
  autoAcceptOrders: boolean;
  activeOrdersCount: number;
  dailyRevenue: number;
  averageRating: number;
}

export interface DeliveryRider {
  id: string;
  orderId: string;
  orderNumber: number;
  customerName: string;
  deliveryAddress: string;
  channel: 'UberEats' | 'DoorDash' | 'Deliveroo' | 'Grubhub';
  riderName: string;
  riderPhone: string;
  vehicleType: 'bicycle' | 'motorcycle' | 'car';
  status: 'assigned' | 'arrived_at_restaurant' | 'in_transit' | 'delivered';
  estimatedArrivalMins: number;
  orderTotal: number;
}

export interface CompanyProfile {
  name: string;
  legalName: string;
  slogan: string;
  logoUrl: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  taxId: string;
}

export type SupportedCurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'GHS' | 'KES' | 'ZAR' | 'AED' | 'CNY' | 'JPY' | 'INR' | 'CHF';

export interface TaxAndCurrencySettings {
  currencyCode: SupportedCurrencyCode;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  defaultTaxRate: number; // e.g. 0.075 for 7.5% Nigerian VAT
  serviceChargeRate: number; // e.g. 0.05
  takeawayTaxRate: number; // e.g. 0.05
  pricesIncludeTax: boolean;
  enableMultiCurrency?: boolean;
  enableProcurementFx?: boolean;
  enableSalesFx?: boolean;
  supportedCurrencies?: SupportedCurrencyCode[];
  exchangeRates?: { [key in SupportedCurrencyCode]?: number }; // Rate relative to 1 base currency unit (e.g. 1 USD = 1500 NGN, 1 GBP = 1950 NGN)
  vatTinNumber?: string;
  taxAgencyName?: string;
}

export interface PricingMarginSettings {
  targetGrossMargin: number; // e.g. 70 (%)
  foodCostMultiplier: number; // e.g. 3.3
  autoSuggestPricing: boolean;
  lowMarginWarningThreshold: number; // e.g. 50 (%)
}

export interface ConnectedTerminal {
  id: string;
  name: string;
  ip: string;
  role: 'POS Terminal' | 'Kitchen KDS' | 'Bar Tablet' | 'Hostess Desk' | 'Manager iPad';
  status: 'online' | 'syncing' | 'offline';
  lastSeen: string;
  latencyMs: number;
}

export interface DatabaseNetworkSettings {
  mode: 'server_host' | 'client_terminal';
  hostIp: string;
  port: number;
  terminalId: string;
  terminalName: string;
  syncIntervalSeconds: number;
  offlineSyncEnabled: boolean;
  lastSyncTimestamp: string;
  connectedTerminals: ConnectedTerminal[];
}

export interface PrinterDeviceConfig {
  id: string;
  name: string;
  type: 'receipt_foh' | 'kitchen_kot' | 'bar_kot' | 'dispatch_slip';
  connectionType: 'network_lan' | 'usb' | 'bluetooth' | 'browser_print';
  ipAddress?: string;
  paperWidth: '80mm' | '58mm';
  assignedStations: KitchenStation[];
  autoPrintOnOrder: boolean;
  copies: number;
  status: 'connected' | 'offline' | 'error';
  lastTestPrinted?: string;
}

export interface ReceiptTemplateConfig {
  paperWidth: '80mm' | '58mm';
  headerText: string;
  footerMessage: string;
  showLogo: boolean;
  showOrderNumber: boolean;
  showTableNumber: boolean;
  showServerName: boolean;
  showItemizedTax: boolean;
  showServiceCharge: boolean;
  showBarcode: boolean;
  showWifiInfo: boolean;
  wifiSsid: string;
  wifiPassword: string;
  qrCodeUrl: string;
  fontFamily: 'monospace' | 'sans-serif';
}

export interface AppSettings {
  company: CompanyProfile;
  taxAndCurrency: TaxAndCurrencySettings;
  pricingMargin: PricingMarginSettings;
  network: DatabaseNetworkSettings;
  printers: PrinterDeviceConfig[];
  receiptTemplate: ReceiptTemplateConfig;
  rbac: SecurityAndRbacSettings;
}

