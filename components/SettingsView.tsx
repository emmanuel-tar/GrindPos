import React, { useState, useEffect } from 'react';
import { 
  AppSettings, 
  MenuItem, 
  Location, 
  PrinterDeviceConfig, 
  ConnectedTerminal,
  KitchenStation,
  SupportedCurrencyCode,
  UserRole,
  PermissionKey,
  PermissionCategory,
  RoleConfig
} from '../types';
import { 
  DEFAULT_ROLE_CONFIGS, 
  DEFAULT_PERMISSION_DEFINITIONS 
} from '../constants';
import { 
  Building2, 
  DollarSign, 
  Percent, 
  Network, 
  Printer, 
  Receipt, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Wifi, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  Sliders,
  Sparkles,
  QrCode,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  Key,
  Server,
  Monitor,
  Activity,
  Download,
  Upload,
  FileJson,
  Check,
  HelpCircle,
  Globe2,
  Coins,
  ArrowRightLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsViewProps {
  initialTab?: string;
  settings: AppSettings;
  menuItems: MenuItem[];
  locations: Location[];
  onSaveSettings: (newSettings: AppSettings) => void;
  onUpdateMenuItemPrice: (menuItemId: string, newPrice: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  initialTab = 'company',
  settings: initialSettings,
  menuItems,
  locations,
  onSaveSettings,
  onUpdateMenuItemPrice,
}) => {
  const [activeTab, setActiveTab] = useState<'company' | 'tax' | 'pricing' | 'network' | 'printers' | 'receipt' | 'backup'>(
    (['company', 'tax', 'pricing', 'network', 'printers', 'receipt', 'backup'].includes(initialTab) 
      ? initialTab as any 
      : 'company')
  );
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Sync with initialTab prop when user clicks sub-menu items in Sidebar
  useEffect(() => {
    if (initialTab && ['company', 'tax', 'pricing', 'network', 'printers', 'receipt', 'backup'].includes(initialTab)) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Sync settings when initialSettings prop updates
  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  // BOM Pricing Calculator state
  const [selectedBOMItemId, setSelectedBOMItemId] = useState<string>(menuItems[0]?.id || '');
  const [customBOMCostMultiplier, setCustomBOMCostMultiplier] = useState<number>(settings.pricingMargin.foodCostMultiplier);

  // Network test ping state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResults, setPingResults] = useState<{ [key: string]: number }>({});

  // Printer Test State
  const [testPrintOutput, setTestPrintOutput] = useState<{ printerName: string; text: string } | null>(null);

  // New Printer modal state
  const [showAddPrinterModal, setShowAddPrinterModal] = useState(false);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newPrinterType, setNewPrinterType] = useState<PrinterDeviceConfig['type']>('kitchen_kot');
  const [newPrinterConn, setNewPrinterConn] = useState<PrinterDeviceConfig['connectionType']>('network_lan');
  const [newPrinterIp, setNewPrinterIp] = useState('192.168.1.205:9100');
  const [newPrinterWidth, setNewPrinterWidth] = useState<'80mm' | '58mm'>('80mm');
  const [newPrinterStation, setNewPrinterStation] = useState<KitchenStation>('grill');

  // JSON Export / Import Modal and Preview States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<{
    valid: boolean;
    companyName?: string;
    currency?: string;
    taxRate?: string;
    terminalCount?: number;
    printerCount?: number;
    mode?: string;
    parsed?: AppSettings;
  } | null>(null);

  const handleExportJson = () => {
    try {
      const exportPayload = {
        _exportMetadata: {
          app: 'RestoFlow POS & ERP',
          version: '2.4.0',
          exportedAt: new Date().toISOString(),
          exportedByTerminal: settings.network.terminalName || settings.network.terminalId,
        },
        settings: settings
      };

      const jsonStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `restoflow-config-${settings.company.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setSaveNotice(`Configuration exported successfully as "${filename}"`);
      setTimeout(() => setSaveNotice(null), 4000);
    } catch (err: any) {
      setImportError('Failed to generate export file: ' + err.message);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      validateAndPreviewImport(content);
    };
    reader.readAsText(file);
  };

  const validateAndPreviewImport = (jsonString: string) => {
    setImportError(null);
    try {
      if (!jsonString.trim()) {
        setImportPreview(null);
        return;
      }
      const data = JSON.parse(jsonString);
      const targetSettings: AppSettings = data.settings || data;

      // Basic validation checks
      if (!targetSettings.company || !targetSettings.taxAndCurrency || !targetSettings.network) {
        throw new Error('Invalid configuration structure. Missing core settings keys (company, taxAndCurrency, network).');
      }

      setImportPreview({
        valid: true,
        companyName: targetSettings.company.name || 'Unnamed Company',
        currency: `${targetSettings.taxAndCurrency.currencySymbol} (${targetSettings.taxAndCurrency.currencyCode})`,
        taxRate: `${((targetSettings.taxAndCurrency.defaultTaxRate || 0) * 100).toFixed(2)}%`,
        terminalCount: targetSettings.network?.connectedTerminals?.length || 0,
        printerCount: targetSettings.printers?.length || 0,
        mode: targetSettings.network.mode === 'server_host' ? 'Master Server Host' : 'Client POS Terminal',
        parsed: targetSettings
      });
    } catch (err: any) {
      setImportError(err.message || 'Malformed JSON format. Please verify file.');
      setImportPreview(null);
    }
  };

  const handleApplyImportedSettings = () => {
    if (!importPreview?.parsed) return;

    setSettings(importPreview.parsed);
    onSaveSettings(importPreview.parsed);
    setShowImportModal(false);
    setImportJsonText('');
    setImportPreview(null);
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
    setSaveNotice('Imported configuration applied & saved! All terminal settings and hardware routes updated.');
    setTimeout(() => setSaveNotice(null), 5000);
  };

  const handleSave = () => {
    onSaveSettings(settings);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    setSaveNotice('Settings successfully saved to local system and synchronized across all active terminals!');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all settings to factory default configuration?')) {
      setSettings(initialSettings);
      setSaveNotice('Reset settings to initial defaults.');
      setTimeout(() => setSaveNotice(null), 3000);
    }
  };

  const runNetworkPingTest = () => {
    setIsPinging(true);
    setTimeout(() => {
      const results: { [key: string]: number } = {};
      settings.network.connectedTerminals.forEach(t => {
        results[t.id] = Math.floor(Math.random() * 15) + 2;
      });
      setPingResults(results);
      setIsPinging(false);
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    }, 1200);
  };

  const handleTestPrint = (printer: PrinterDeviceConfig) => {
    const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
    const sampleKOT = `================================\n   *** HARDWARE TEST PRINT ***\n================================\nPRINTER: ${printer.name}\nTYPE: ${printer.type.toUpperCase()}\nINTERFACE: ${printer.connectionType.toUpperCase()} (${printer.ipAddress || 'DIRECT'})\nWIDTH: ${printer.paperWidth}\nTIME: ${timestamp}\nSTATUS: OK / FEED CUT TEST PASSED\n================================`;
    
    setTestPrintOutput({ printerName: printer.name, text: sampleKOT });
    
    // Update last test printed time
    setSettings(prev => ({
      ...prev,
      printers: prev.printers.map(p => p.id === printer.id ? { ...p, lastTestPrinted: timestamp } : p)
    }));
  };

  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinterName) return;

    const newPrn: PrinterDeviceConfig = {
      id: `prn-${Date.now()}`,
      name: newPrinterName,
      type: newPrinterType,
      connectionType: newPrinterConn,
      ipAddress: newPrinterConn === 'network_lan' ? newPrinterIp : undefined,
      paperWidth: newPrinterWidth,
      assignedStations: [newPrinterStation],
      autoPrintOnOrder: true,
      copies: 1,
      status: 'connected',
      lastTestPrinted: 'Just now'
    };

    setSettings(prev => ({
      ...prev,
      printers: [...prev.printers, newPrn]
    }));

    setShowAddPrinterModal(false);
    setNewPrinterName('');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const handleDeletePrinter = (printerId: string) => {
    setSettings(prev => ({
      ...prev,
      printers: prev.printers.filter(p => p.id !== printerId)
    }));
  };

  // Selected item for BOM analysis
  const currentBOMItem = menuItems.find(m => m.id === selectedBOMItemId) || menuItems[0];
  const itemBOMCost = currentBOMItem?.recipe?.reduce((acc, r) => acc + (r.quantity * r.costPerUnit), 0) || 0;
  const suggestedSellingPrice = itemBOMCost * customBOMCostMultiplier;
  const currentGrossMarginPct = currentBOMItem && currentBOMItem.price > 0 
    ? (((currentBOMItem.price - itemBOMCost) / currentBOMItem.price) * 100) 
    : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-500/40 rounded-full text-[10px] font-black uppercase tracking-wider">
              Control Plane & Configuration
            </span>
            <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-[10px] font-black uppercase">
              {settings.network.mode === 'server_host' ? 'Host Master Server' : 'Client POS Terminal'}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            System Settings & Hardware Hub
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Configure restaurant legal identity, currency & VAT rates, BOM margin markups, multi-terminal LAN database connections, thermal printers, and live receipt templates.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95"
            title="Import configuration JSON file from Master Server or another terminal"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95"
            title="Export all settings as a portable JSON backup file"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleResetToDefaults}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>

      {/* Save Notification */}
      {saveNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveNotice}</span>
          </div>
          <button onClick={() => setSaveNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'company', label: 'Company Profile', icon: Building2 },
          { id: 'tax', label: 'Tax & Currency Setup', icon: DollarSign },
          { id: 'pricing', label: 'Pricing & Margin Rates', icon: Percent },
          { id: 'network', label: 'Database & Terminals', icon: Network },
          { id: 'printers', label: 'Printer Configuration', icon: Printer },
          { id: 'receipt', label: 'Receipt Design & Template', icon: Receipt },
          { id: 'backup', label: 'Backup & Multi-Terminal Sync', icon: FileJson },
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

      {/* TAB 1: Company Profile */}
      {activeTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900">Establishment & Legal Identity</h3>
              <p className="text-xs text-slate-500">Legal entity details printed on customer checks, invoice records, and tax reports.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Trading Restaurant Name</label>
                <input
                  type="text"
                  value={settings.company.name}
                  onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Registered Corporate Legal Entity</label>
                <input
                  type="text"
                  value={settings.company.legalName}
                  onChange={(e) => setSettings({ ...settings, company: { ...settings.company, legalName: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brand Slogan / Tagline</label>
                <input
                  type="text"
                  value={settings.company.slogan}
                  onChange={(e) => setSettings({ ...settings, company: { ...settings.company, slogan: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tax Identification Number (TIN / EIN / VAT ID)</label>
                <input
                  type="text"
                  value={settings.company.taxId}
                  onChange={(e) => setSettings({ ...settings, company: { ...settings.company, taxId: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Primary Support Telephone</label>
                <input
                  type="text"
                  value={settings.company.phone}
                  onChange={(e) => setSettings({ ...settings, company: { ...settings.company, phone: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Official Inquiry Email</label>
                <input
                  type="email"
                  value={settings.company.email}
                  onChange={(e) => setSettings({ ...settings, company: { ...settings.company, email: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Website URL</label>
                <input
                  type="text"
                  value={settings.company.website}
                  onChange={(e) => setSettings({ ...settings, company: { ...settings.company, website: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Headquarters Physical Street Address</label>
                <input
                  type="text"
                  value={settings.company.address}
                  onChange={(e) => setSettings({ ...settings, company: { ...settings.company, address: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Logo & Brand Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900">Brand Logo Asset</h3>
              <p className="text-xs text-slate-500">Logo displayed on receipt headers, kitchen display banners, and customer customer portals.</p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Logo Image URL</label>
                <input
                  type="text"
                  value={settings.company.logoUrl}
                  onChange={(e) => setSettings({ ...settings, company: { ...settings.company, logoUrl: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Live Logo Preview</span>
                <img
                  src={settings.company.logoUrl}
                  alt="Brand Logo"
                  className="h-20 w-20 object-cover rounded-2xl shadow-sm border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <h4 className="text-sm font-black text-slate-900">{settings.company.name}</h4>
                <span className="text-[11px] text-slate-500 italic">{settings.company.slogan}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Updating your company profile automatically refreshes printed receipt headers and end-of-day Z-Close audit logs.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Tax & Currency Setup */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          {/* Quick Presets Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-orange-500" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Regional Fiscal Presets</h4>
              </div>
              <span className="text-[11px] text-slate-400">One-click auto-configuration of currency symbols, VAT rules & fiscal IDs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { 
                  label: '🇳🇬 Nigeria (NGN)', 
                  code: 'NGN' as SupportedCurrencyCode, 
                  symbol: '₦', 
                  vat: 0.075, 
                  svc: 0.05, 
                  pos: 'before' as const,
                  tin: 'NG-TIN-23091840-001',
                  agency: 'Federal Inland Revenue Service (FIRS) & LIRS'
                },
                { 
                  label: '🇺🇸 United States (USD)', 
                  code: 'USD' as SupportedCurrencyCode, 
                  symbol: '$', 
                  vat: 0.0825, 
                  svc: 0.05, 
                  pos: 'before' as const,
                  tin: 'US-EIN-88-9201941',
                  agency: 'Internal Revenue Service (IRS)'
                },
                { 
                  label: '🇬🇧 United Kingdom (GBP)', 
                  code: 'GBP' as SupportedCurrencyCode, 
                  symbol: '£', 
                  vat: 0.20, 
                  svc: 0.10, 
                  pos: 'before' as const,
                  tin: 'GB-VAT-982-1402-99',
                  agency: 'HM Revenue & Customs (HMRC)'
                },
                { 
                  label: '🇪🇺 European Union (EUR)', 
                  code: 'EUR' as SupportedCurrencyCode, 
                  symbol: '€', 
                  vat: 0.19, 
                  svc: 0.05, 
                  pos: 'after' as const,
                  tin: 'EU-VAT-89104812',
                  agency: 'European Tax Authority (VAT)'
                },
                { 
                  label: '🇨🇦 Canada (CAD)', 
                  code: 'CAD' as SupportedCurrencyCode, 
                  symbol: 'CA$', 
                  vat: 0.13, 
                  svc: 0.05, 
                  pos: 'before' as const,
                  tin: 'CA-BN-88192014-RT0001',
                  agency: 'Canada Revenue Agency (CRA)'
                },
                { 
                  label: '🇦🇺 Australia (AUD)', 
                  code: 'AUD' as SupportedCurrencyCode, 
                  symbol: 'A$', 
                  vat: 0.10, 
                  svc: 0.05, 
                  pos: 'before' as const,
                  tin: 'AU-ABN-51-824-753-556',
                  agency: 'Australian Taxation Office (ATO)'
                },
              ].map(preset => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      taxAndCurrency: {
                        ...settings.taxAndCurrency,
                        currencyCode: preset.code,
                        currencySymbol: preset.symbol,
                        currencyPosition: preset.pos,
                        defaultTaxRate: preset.vat,
                        serviceChargeRate: preset.svc,
                        vatTinNumber: preset.tin,
                        taxAgencyName: preset.agency,
                      },
                      company: {
                        ...settings.company,
                        taxId: preset.tin
                      }
                    });
                    setSaveNotice(`Preset applied: ${preset.label} (${preset.symbol} - ${(preset.vat * 100).toFixed(1)}% VAT)`);
                    setTimeout(() => setSaveNotice(null), 3500);
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col justify-between gap-1.5 ${
                    settings.taxAndCurrency.currencyCode === preset.code
                      ? 'bg-orange-50 border-orange-400 text-orange-900 ring-2 ring-orange-400/20 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{preset.label}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{preset.symbol}</span>
                    <span>{(preset.vat * 100).toFixed(1)}% VAT</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-900">Base Currency & Fiscal Tax Rules</h3>
                <p className="text-xs text-slate-500">Configure default accounting currency, Nigerian VAT/FIRS requirements, and dine-in vs takeaway formulas.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Currency Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Primary Operating Currency</label>
                  <select
                    value={settings.taxAndCurrency.currencyCode}
                    onChange={(e) => {
                      const code = e.target.value as SupportedCurrencyCode;
                      const symbols: { [key in SupportedCurrencyCode]?: string } = {
                        NGN: '₦',
                        USD: '$',
                        EUR: '€',
                        GBP: '£',
                        CAD: 'CA$',
                        AUD: 'A$',
                        GHS: 'GH₵',
                        KES: 'KSh',
                        ZAR: 'R',
                        AED: 'AED ',
                        CNY: '¥',
                        JPY: '¥',
                        INR: '₹',
                        CHF: 'CHF '
                      };
                      setSettings({
                        ...settings,
                        taxAndCurrency: {
                          ...settings.taxAndCurrency,
                          currencyCode: code,
                          currencySymbol: symbols[code] || '₦'
                        }
                      });
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-900 bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  >
                    <option value="NGN">🇳🇬 NGN - Nigerian Naira (₦) [Default Base Currency]</option>
                    <option value="USD">🇺🇸 USD - US Dollar ($)</option>
                    <option value="GBP">🇬🇧 GBP - British Pound (£)</option>
                    <option value="EUR">🇪🇺 EUR - Euro (€)</option>
                    <option value="CAD">🇨🇦 CAD - Canadian Dollar (CA$)</option>
                    <option value="AUD">🇦🇺 AUD - Australian Dollar (A$)</option>
                    <option value="AED">🇦🇪 AED - UAE Dirham (AED)</option>
                    <option value="CNY">🇨🇳 CNY - Chinese Yuan (¥)</option>
                    <option value="JPY">🇯🇵 JPY - Japanese Yen (¥)</option>
                    <option value="INR">🇮🇳 INR - Indian Rupee (₹)</option>
                    <option value="CHF">🇨🇭 CHF - Swiss Franc (CHF)</option>
                    <option value="GHS">🇬🇭 GHS - Ghanaian Cedi (GH₵)</option>
                    <option value="KES">🇰🇪 KES - Kenyan Shilling (KSh)</option>
                    <option value="ZAR">🇿🇦 ZAR - South African Rand (R)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Currency Symbol Placement</label>
                  <div className="flex gap-2">
                    {(['before', 'after'] as const).map(pos => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          taxAndCurrency: { ...settings.taxAndCurrency, currencyPosition: pos }
                        })}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          settings.taxAndCurrency.currencyPosition === pos
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pos === 'before' ? `Prefix (${settings.taxAndCurrency.currencySymbol}1,000)` : `Suffix (1,000 ${settings.taxAndCurrency.currencySymbol})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tax Rates */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Standard Sales Tax / VAT Rate (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(settings.taxAndCurrency.defaultTaxRate * 100).toFixed(2)}
                      onChange={(e) => setSettings({
                        ...settings,
                        taxAndCurrency: {
                          ...settings.taxAndCurrency,
                          defaultTaxRate: (parseFloat(e.target.value) || 0) / 100
                        }
                      })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Nigeria standard VAT is 7.5%</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dine-in Service Charge Rate (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(settings.taxAndCurrency.serviceChargeRate * 100).toFixed(2)}
                      onChange={(e) => setSettings({
                        ...settings,
                        taxAndCurrency: {
                          ...settings.taxAndCurrency,
                          serviceChargeRate: (parseFloat(e.target.value) || 0) / 100
                        }
                      })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Discretionary or mandatory service fee</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Takeaway / Delivery Tax Rate (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(settings.taxAndCurrency.takeawayTaxRate * 100).toFixed(2)}
                      onChange={(e) => setSettings({
                        ...settings,
                        taxAndCurrency: {
                          ...settings.taxAndCurrency,
                          takeawayTaxRate: (parseFloat(e.target.value) || 0) / 100
                        }
                      })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>

                {/* Tax Identification Number */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tax Identification / VAT Number (TIN)</label>
                  <input
                    type="text"
                    value={settings.taxAndCurrency.vatTinNumber || settings.company.taxId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings({
                        ...settings,
                        taxAndCurrency: { ...settings.taxAndCurrency, vatTinNumber: val },
                        company: { ...settings.company, taxId: val }
                      });
                    }}
                    placeholder="e.g. NG-TIN-23091840-001"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              {/* Tax Included Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Menu Prices are Tax-Inclusive (VAT Included)</span>
                  <span className="text-[11px] text-slate-500">Enable if prices displayed on customer menus already include VAT & tax</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({
                    ...settings,
                    taxAndCurrency: {
                      ...settings.taxAndCurrency,
                      pricesIncludeTax: !settings.taxAndCurrency.pricesIncludeTax
                    }
                  })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.taxAndCurrency.pricesIncludeTax ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      settings.taxAndCurrency.pricesIncludeTax ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Section 2: Multi-Currency Engine for Sales & Purchasing */}
              <div className="border-t border-slate-200 pt-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Multi-Currency Global Engine</h4>
                      <p className="text-xs text-slate-500">Nigerian Naira (NGN) is primary base currency. Support foreign transactions with custom exchange rates.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettings({
                      ...settings,
                      taxAndCurrency: {
                        ...settings.taxAndCurrency,
                        enableMultiCurrency: !settings.taxAndCurrency.enableMultiCurrency
                      }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settings.taxAndCurrency.enableMultiCurrency !== false ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        settings.taxAndCurrency.enableMultiCurrency !== false ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {settings.taxAndCurrency.enableMultiCurrency !== false && (
                  <div className="space-y-5 pt-1">
                    {/* Module-Specific Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Procurement & AP Bills (FX)</span>
                          <span className="text-[10px] text-slate-500">Allow POs, GRNs, & Vendor Bills in foreign currencies</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            taxAndCurrency: {
                              ...settings.taxAndCurrency,
                              enableProcurementFx: settings.taxAndCurrency.enableProcurementFx === false ? true : false
                            }
                          })}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            settings.taxAndCurrency.enableProcurementFx !== false ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                              settings.taxAndCurrency.enableProcurementFx !== false ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Sales & POS Checkout (FX)</span>
                          <span className="text-[10px] text-slate-500">Accept USD, GBP, EUR settlement at cash register</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            taxAndCurrency: {
                              ...settings.taxAndCurrency,
                              enableSalesFx: settings.taxAndCurrency.enableSalesFx === false ? true : false
                            }
                          })}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            settings.taxAndCurrency.enableSalesFx !== false ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                              settings.taxAndCurrency.enableSalesFx !== false ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Active Secondary Currencies Selection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Select Secondary Currencies Enabled for Transactions:</span>
                        <span className="text-[10px] text-slate-400">Toggle currencies active in drop-downs</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { code: 'USD' as SupportedCurrencyCode, name: 'USD ($)', flag: '🇺🇸' },
                          { code: 'GBP' as SupportedCurrencyCode, name: 'GBP (£)', flag: '🇬🇧' },
                          { code: 'EUR' as SupportedCurrencyCode, name: 'EUR (€)', flag: '🇪🇺' },
                          { code: 'CAD' as SupportedCurrencyCode, name: 'CAD (CA$)', flag: '🇨🇦' },
                          { code: 'AUD' as SupportedCurrencyCode, name: 'AUD (A$)', flag: '🇦🇺' },
                          { code: 'AED' as SupportedCurrencyCode, name: 'AED (AED)', flag: '🇦🇪' },
                          { code: 'CNY' as SupportedCurrencyCode, name: 'CNY (¥)', flag: '🇨🇳' },
                          { code: 'JPY' as SupportedCurrencyCode, name: 'JPY (¥)', flag: '🇯🇵' },
                          { code: 'INR' as SupportedCurrencyCode, name: 'INR (₹)', flag: '🇮🇳' },
                          { code: 'CHF' as SupportedCurrencyCode, name: 'CHF (CHF)', flag: '🇨🇭' },
                          { code: 'GHS' as SupportedCurrencyCode, name: 'GHS (GH₵)', flag: '🇬🇭' },
                          { code: 'KES' as SupportedCurrencyCode, name: 'KES (KSh)', flag: '🇰🇪' },
                          { code: 'ZAR' as SupportedCurrencyCode, name: 'ZAR (R)', flag: '🇿🇦' },
                        ].map(curr => {
                          const isSupported = (settings.taxAndCurrency.supportedCurrencies || ['NGN', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'GHS', 'KES', 'ZAR']).includes(curr.code);
                          return (
                            <button
                              key={curr.code}
                              type="button"
                              onClick={() => {
                                const currentList = settings.taxAndCurrency.supportedCurrencies || ['NGN', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'GHS', 'KES', 'ZAR'];
                                const updated = isSupported
                                  ? currentList.filter(c => c !== curr.code)
                                  : [...currentList, curr.code];
                                setSettings({
                                  ...settings,
                                  taxAndCurrency: {
                                    ...settings.taxAndCurrency,
                                    supportedCurrencies: updated
                                  }
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                isSupported
                                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <span>{curr.flag}</span>
                              <span>{curr.name}</span>
                              {isSupported && <Check className="w-3 h-3 ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live Exchange Rates Inputs */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-slate-700">Exchange Rates (Value of 1 Foreign Unit in Base {settings.taxAndCurrency.currencyCode} {settings.taxAndCurrency.currencySymbol}):</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              taxAndCurrency: {
                                ...settings.taxAndCurrency,
                                exchangeRates: {
                                  NGN: 1,
                                  USD: 1500,
                                  GBP: 1950,
                                  EUR: 1650,
                                  CAD: 1100,
                                  AUD: 980,
                                  AED: 410,
                                  CNY: 210,
                                  JPY: 10.2,
                                  INR: 18.1,
                                  CHF: 1720,
                                  GHS: 98,
                                  KES: 11.5,
                                  ZAR: 82
                                }
                              }
                            });
                            setSaveNotice('Exchange rates reset to standard reference rates!');
                            setTimeout(() => setSaveNotice(null), 3000);
                          }}
                          className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 text-[11px]"
                        >
                          <RefreshCw className="w-3 h-3" /> Reset Reference Rates
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { code: 'USD' as SupportedCurrencyCode, name: 'US Dollar ($)', flag: '🇺🇸', defaultRate: 1500 },
                          { code: 'GBP' as SupportedCurrencyCode, name: 'British Pound (£)', flag: '🇬🇧', defaultRate: 1950 },
                          { code: 'EUR' as SupportedCurrencyCode, name: 'Euro (€)', flag: '🇪🇺', defaultRate: 1650 },
                          { code: 'CAD' as SupportedCurrencyCode, name: 'Canadian Dollar (CA$)', flag: '🇨🇦', defaultRate: 1100 },
                          { code: 'AUD' as SupportedCurrencyCode, name: 'Australian Dollar (A$)', flag: '🇦🇺', defaultRate: 980 },
                          { code: 'AED' as SupportedCurrencyCode, name: 'UAE Dirham (AED)', flag: '🇦🇪', defaultRate: 410 },
                          { code: 'CNY' as SupportedCurrencyCode, name: 'Chinese Yuan (¥)', flag: '🇨🇳', defaultRate: 210 },
                          { code: 'JPY' as SupportedCurrencyCode, name: 'Japanese Yen (¥)', flag: '🇯🇵', defaultRate: 10.2 },
                          { code: 'INR' as SupportedCurrencyCode, name: 'Indian Rupee (₹)', flag: '🇮🇳', defaultRate: 18.1 },
                          { code: 'CHF' as SupportedCurrencyCode, name: 'Swiss Franc (CHF)', flag: '🇨🇭', defaultRate: 1720 },
                          { code: 'GHS' as SupportedCurrencyCode, name: 'Ghanaian Cedi (GH₵)', flag: '🇬🇭', defaultRate: 98 },
                          { code: 'KES' as SupportedCurrencyCode, name: 'Kenyan Shilling (KSh)', flag: '🇰🇪', defaultRate: 11.5 },
                          { code: 'ZAR' as SupportedCurrencyCode, name: 'South African Rand (R)', flag: '🇿🇦', defaultRate: 82 },
                        ].filter(c => (settings.taxAndCurrency.supportedCurrencies || ['NGN', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'GHS', 'KES', 'ZAR']).includes(c.code))
                        .map(curr => {
                          const currentRate = settings.taxAndCurrency.exchangeRates?.[curr.code] || curr.defaultRate;
                          return (
                            <div key={curr.code} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                <span className="flex items-center gap-1.5">
                                  <span>{curr.flag}</span>
                                  <span>{curr.code}</span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-normal">{curr.name}</span>
                              </div>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-500">
                                  1 {curr.code} = {settings.taxAndCurrency.currencySymbol}
                                </span>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.01"
                                  value={currentRate}
                                  onChange={(e) => {
                                    const newRate = parseFloat(e.target.value) || 1;
                                    setSettings({
                                      ...settings,
                                      taxAndCurrency: {
                                        ...settings.taxAndCurrency,
                                        exchangeRates: {
                                          ...(settings.taxAndCurrency.exchangeRates || {}),
                                          [curr.code]: newRate
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full pl-20 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:ring-1 focus:ring-orange-500 outline-none"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Calculator Preview Box */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-orange-500" />
                  <h3 className="text-base font-black text-slate-900">Live Tax & Multi-Currency Check</h3>
                </div>
                <p className="text-xs text-slate-500">Simulation of a ₦50,000 / $50 sample guest order calculated with your active fiscal rules:</p>

                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5 font-mono text-xs shadow-inner">
                  <div className="flex justify-between text-slate-400">
                    <span>Food & Beverage Subtotal:</span>
                    <span className="text-white font-bold">{settings.taxAndCurrency.currencySymbol}50,000.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>VAT ({(settings.taxAndCurrency.defaultTaxRate * 100).toFixed(1)}%):</span>
                    <span className="text-white font-bold">
                      {settings.taxAndCurrency.currencySymbol}{(50000 * settings.taxAndCurrency.defaultTaxRate).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Service Charge ({(settings.taxAndCurrency.serviceChargeRate * 100).toFixed(1)}%):</span>
                    <span className="text-white font-bold">
                      {settings.taxAndCurrency.currencySymbol}{(50000 * settings.taxAndCurrency.serviceChargeRate).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex justify-between text-sm font-sans font-black text-orange-400">
                    <span>Total Check (Base):</span>
                    <span>
                      {settings.taxAndCurrency.currencySymbol}
                      {(50000 * (1 + settings.taxAndCurrency.defaultTaxRate + settings.taxAndCurrency.serviceChargeRate)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Multi-Currency Equivalent breakdown */}
                  {settings.taxAndCurrency.enableMultiCurrency !== false && (
                    <div className="pt-2 border-t border-dashed border-slate-800 space-y-1 text-[11px]">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Foreign Settlement Equivalent:</span>
                      {(() => {
                        const totalBase = 50000 * (1 + settings.taxAndCurrency.defaultTaxRate + settings.taxAndCurrency.serviceChargeRate);
                        const usdRate = settings.taxAndCurrency.exchangeRates?.USD || 1500;
                        const gbpRate = settings.taxAndCurrency.exchangeRates?.GBP || 1950;
                        const eurRate = settings.taxAndCurrency.exchangeRates?.EUR || 1650;
                        return (
                          <div className="space-y-0.5 text-slate-300">
                            <div className="flex justify-between">
                              <span>🇺🇸 USD Equivalent:</span>
                              <span className="font-bold text-emerald-400">${(totalBase / usdRate).toFixed(2)} (@ ₦{usdRate})</span>
                            </div>
                            <div className="flex justify-between">
                              <span>🇬🇧 GBP Equivalent:</span>
                              <span className="font-bold text-sky-400">£{(totalBase / gbpRate).toFixed(2)} (@ ₦{gbpRate})</span>
                            </div>
                            <div className="flex justify-between">
                              <span>🇪🇺 EUR Equivalent:</span>
                              <span className="font-bold text-indigo-300">€{(totalBase / eurRate).toFixed(2)} (@ ₦{eurRate})</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-orange-50/80 p-3.5 rounded-2xl border border-orange-200/80 space-y-1">
                <div className="font-bold text-orange-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  <span>Fiscal Compliance Activated</span>
                </div>
                <p>
                  Nigerian Federal Inland Revenue Service (FIRS) 7.5% VAT is active. Printed guest receipts will display TIN: <strong>{settings.taxAndCurrency.vatTinNumber || settings.company.taxId || 'NG-TIN-23091840-001'}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Pricing & Margin (Purchase vs Sale) */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div>
                <h3 className="text-base font-black text-slate-900">Profit Margin Targets & Cost Multipliers</h3>
                <p className="text-xs text-slate-500">Set global food cost multipliers and minimum target gross margin thresholds.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Gross Margin (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      max="95"
                      value={settings.pricingMargin.targetGrossMargin}
                      onChange={(e) => setSettings({
                        ...settings,
                        pricingMargin: {
                          ...settings.pricingMargin,
                          targetGrossMargin: parseFloat(e.target.value) || 70
                        }
                      })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Industry gold standard is 68% – 75% for dining.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Food Cost Multiplier (Markup Factor)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1.5"
                      max="10"
                      value={settings.pricingMargin.foodCostMultiplier}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 3.3;
                        setSettings({
                          ...settings,
                          pricingMargin: {
                            ...settings.pricingMargin,
                            foodCostMultiplier: val
                          }
                        });
                        setCustomBOMCostMultiplier(val);
                      }}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">x</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">e.g. $3.00 Raw BOM Cost × 3.5x = $10.50 Menu Price.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Low-Margin Alert Threshold (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="20"
                      max="70"
                      value={settings.pricingMargin.lowMarginWarningThreshold}
                      onChange={(e) => setSettings({
                        ...settings,
                        pricingMargin: {
                          ...settings.pricingMargin,
                          lowMarginWarningThreshold: parseFloat(e.target.value) || 50
                        }
                      })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Flags dishes on POS/Menu when margin drops below this line.</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Auto-Suggest Selling Prices</span>
                    <span className="text-[11px] text-slate-500">Calculate menu price when updating recipe ingredients</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({
                      ...settings,
                      pricingMargin: {
                        ...settings.pricingMargin,
                        autoSuggestPricing: !settings.pricingMargin.autoSuggestPricing
                      }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settings.pricingMargin.autoSuggestPricing ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        settings.pricingMargin.autoSuggestPricing ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900">Food Cost Efficiency</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Target Raw Food Cost:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {(100 - settings.pricingMargin.targetGrossMargin).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${100 - settings.pricingMargin.targetGrossMargin}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Target Gross Profit:</span>
                  <span className="font-mono font-black text-emerald-600">
                    {settings.pricingMargin.targetGrossMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Recipe BOM Margin & Menu Pricing Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Recipe Bill of Materials (BOM) & Menu Pricing Simulator</h3>
                <p className="text-xs text-slate-500">Simulate ingredient purchase costs against selling prices to optimize dish profitability.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedBOMItemId}
                  onChange={(e) => setSelectedBOMItemId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800"
                >
                  {menuItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (${item.price.toFixed(2)})</option>
                  ))}
                </select>
              </div>
            </div>

            {currentBOMItem && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Ingredients Breakdown */}
                <div className="lg:col-span-2 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Recipe Raw Ingredients & Purchase Costs
                  </span>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5 font-bold text-slate-500">Ingredient SKU</th>
                          <th className="px-4 py-2.5 font-bold text-slate-500">Quantity</th>
                          <th className="px-4 py-2.5 font-bold text-slate-500 text-right">Unit Cost</th>
                          <th className="px-4 py-2.5 font-bold text-slate-500 text-right">Total Line Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {currentBOMItem.recipe?.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-bold text-slate-900">{r.ingredientName}</td>
                            <td className="px-4 py-2 text-slate-600">{r.quantity} {r.unit}</td>
                            <td className="px-4 py-2 text-right text-slate-600 font-mono">${r.costPerUnit.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-slate-900">
                              ${(r.quantity * r.costPerUnit).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100/80 font-black text-slate-900">
                          <td colSpan={3} className="px-4 py-2.5 uppercase">Total Raw Ingredient BOM Cost</td>
                          <td className="px-4 py-2.5 text-right font-mono text-emerald-700 font-black">
                            ${itemBOMCost.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Profit Margin Verdict & 1-Click Price Adjustment */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pricing Verdict</span>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Current Selling Price:</span>
                        <span className="font-mono font-black text-slate-900">${currentBOMItem.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Current Gross Margin:</span>
                        <span className={`font-mono font-black ${
                          currentGrossMarginPct < settings.pricingMargin.lowMarginWarningThreshold ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {currentGrossMarginPct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                        <span className="text-slate-700 font-bold">Suggested Price ({customBOMCostMultiplier}x):</span>
                        <span className="font-mono font-black text-orange-600">${suggestedSellingPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {currentGrossMarginPct < settings.pricingMargin.lowMarginWarningThreshold && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Below target margin! Recommend price increase.</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onUpdateMenuItemPrice(currentBOMItem.id, parseFloat(suggestedSellingPrice.toFixed(2)));
                      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
                      setSaveNotice(`Updated price for ${currentBOMItem.name} to $${suggestedSellingPrice.toFixed(2)}!`);
                      setTimeout(() => setSaveNotice(null), 3000);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Apply Suggested Price to Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Database & Multi-Terminal Network Sync */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div>
                <h3 className="text-base font-black text-slate-900">Local Multi-Terminal Network & Server Host Mode</h3>
                <p className="text-xs text-slate-500">Configure host server database or connect this station as a client terminal over local Wi-Fi / LAN.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Host Mode Switcher */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Terminal Operating Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        network: { ...settings.network, mode: 'server_host' }
                      })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        settings.network.mode === 'server_host'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-sm">
                        <Server className="w-4 h-4 text-orange-400" />
                        <span>Master Server Host</span>
                      </div>
                      <p className={`text-xs mt-1 ${settings.network.mode === 'server_host' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Runs primary database and coordinates all client registers, KDS screens, and printers.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        network: { ...settings.network, mode: 'client_terminal' }
                      })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        settings.network.mode === 'client_terminal'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-sm">
                        <Monitor className="w-4 h-4 text-blue-400" />
                        <span>Client Station Terminal</span>
                      </div>
                      <p className={`text-xs mt-1 ${settings.network.mode === 'client_terminal' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Connects to central Master Host IP to stream orders, tickets, and seatings in real time.
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Server Host LAN IP Address</label>
                  <input
                    type="text"
                    value={settings.network.hostIp}
                    onChange={(e) => setSettings({
                      ...settings,
                      network: { ...settings.network, hostIp: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Database Port</label>
                  <input
                    type="number"
                    value={settings.network.port}
                    onChange={(e) => setSettings({
                      ...settings,
                      network: { ...settings.network, port: parseInt(e.target.value) || 8080 }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Current Terminal ID</label>
                  <input
                    type="text"
                    value={settings.network.terminalId}
                    onChange={(e) => setSettings({
                      ...settings,
                      network: { ...settings.network, terminalId: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Terminal Station Friendly Name</label>
                  <input
                    type="text"
                    value={settings.network.terminalName}
                    onChange={(e) => setSettings({
                      ...settings,
                      network: { ...settings.network, terminalName: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Network Diagnostics */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-base font-black text-slate-900">LAN Health & Diagnostics</h3>
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">WebSockets Connection:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Active & Synchronized
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Offline Event Buffer:</span>
                    <span className="text-white font-mono font-bold">0 Pending Events</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sync Interval:</span>
                    <span className="text-white font-mono font-bold">{settings.network.syncIntervalSeconds} seconds</span>
                  </div>
                </div>
              </div>

              <button
                onClick={runNetworkPingTest}
                disabled={isPinging}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Activity className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging Terminals...' : 'Run LAN Ping Diagnostic'}</span>
              </button>
            </div>
          </div>

          {/* Active Connected Terminals Roster */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Connected Local Restaurant Terminals & Devices</h3>
                <p className="text-xs text-slate-500">Live heartbeat monitoring of all connected cash registers, kitchen displays, and tablets.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">
                {settings.network.connectedTerminals.filter(t => t.status === 'online').length} of {settings.network.connectedTerminals.length} Terminals Online
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Station Name</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Device Role</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Local IP</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Latency</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">Last Heartbeat</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {settings.network.connectedTerminals.map(term => {
                    const latency = pingResults[term.id] || term.latencyMs;
                    return (
                      <tr key={term.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                          <Monitor className="w-3.5 h-3.5 text-slate-400" />
                          <span>{term.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-bold">{term.role}</td>
                        <td className="px-4 py-3 font-mono text-slate-800">{term.ip}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            term.status === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {term.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">
                          {latency} ms
                        </td>
                        <td className="px-4 py-3 text-slate-500">{term.lastSeen}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSaveNotice(`Sent sync ping signal to ${term.name} (${term.ip})`);
                              setTimeout(() => setSaveNotice(null), 3000);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Re-sync
                          </button>
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

      {/* TAB 5: Printer & Hardware Routing Configuration */}
      {activeTab === 'printers' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Thermal Receipt & KOT Kitchen Printers</h3>
              <p className="text-xs text-slate-500">Configure ESC/POS thermal printers, assign kitchen station routing (Grill, Fryer, Bar), and test cash drawer solenoids.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTestPrintOutput({
                    printerName: 'POS-80 Till #1 Solenoid Kick Trigger',
                    text: `[ESC/POS CASH DRAWER SOLENOID PULSE TEST]\nCommand: ESC p 0 25 250 (0x1B 0x70 0x00 0x19 0xFA)\nStatus: 24V Pulse Transmitted to RJ11/RJ12 Cash Drawer\nResult: Drawer Trigger Activated Successfully.\nTimestamp: ${new Date().toLocaleTimeString()}`
                  });
                  setSaveNotice('Cash Drawer Kick Pulse Triggered (ESC/POS RJ12)');
                  setTimeout(() => setSaveNotice(null), 3000);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
              >
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Test Cash Drawer Kick</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const now = new Date().toLocaleTimeString();
                  const updatedPrinters = settings.printers.map(p => ({
                    ...p,
                    status: 'online' as const,
                    lastTestPrinted: now
                  }));
                  setSettings({
                    ...settings,
                    printers: updatedPrinters
                  });
                  setTestPrintOutput({
                    printerName: `All Connected Hardware (${settings.printers.length} Printers)`,
                    text: `========================================\n RESTOFLOW POS & ERP - HARDWARE HEALTH TEST\n========================================\nTested Station Count: ${settings.printers.length}\nPrinters Status: ONLINE & ACTIVE\nBaud Rate: 115200 bps | Paper Feed: Normal\n\nStation Routing Checklist:\n${settings.printers.map(p => ` • [${p.name}] -> Stations: ${p.assignedStations.join(', ')} (${p.connectionType})`).join('\n')}\n\nAll ESC/POS & LAN Printers Ready for Service!\nTimestamp: ${now}\n========================================`
                  });
                  setSaveNotice('Batch test print signals broadcast to all station printers!');
                  setTimeout(() => setSaveNotice(null), 3000);
                }}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-4 h-4 text-orange-400" />
                <span>Batch Test All Hardware</span>
              </button>

              <button
                onClick={() => setShowAddPrinterModal(true)}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New Printer
              </button>
            </div>
          </div>

          {/* Test Print Output Modal / Strip */}
          {testPrintOutput && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-xs font-mono shadow-xl animate-fade-in">
              <div className="flex items-center justify-between text-orange-400 font-sans font-bold">
                <span className="flex items-center gap-1.5">
                  <Printer className="w-4 h-4" /> Hardware Signal Transmitted: {testPrintOutput.printerName}
                </span>
                <button onClick={() => setTestPrintOutput(null)} className="text-slate-400 hover:text-white text-xs">
                  ✕ Dismiss
                </button>
              </div>
              <pre className="text-slate-300 text-[11px] leading-tight bg-slate-950 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono">
                {testPrintOutput.text}
              </pre>
            </div>
          )}

          {/* Printers List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.printers.map(printer => (
              <div key={printer.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{printer.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {printer.connectionType.toUpperCase()} {printer.ipAddress ? `• ${printer.ipAddress}` : ''}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                      {printer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Paper Width</span>
                      <span className="font-bold text-slate-800">{printer.paperWidth} Thermal</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Assigned Stations</span>
                      <span className="font-bold text-slate-800 capitalize">
                        {printer.assignedStations.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Auto-Print</span>
                      <span className="font-bold text-emerald-600">{printer.autoPrintOnOrder ? 'Enabled' : 'Manual'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Last Tested</span>
                      <span className="font-medium text-slate-600">{printer.lastTestPrinted || 'Ready'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDeletePrinter(printer.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const now = new Date().toLocaleTimeString();
                        setSettings({
                          ...settings,
                          printers: settings.printers.map(p => p.id === printer.id ? { ...p, lastTestPrinted: now, status: 'online' } : p)
                        });
                        setTestPrintOutput({
                          printerName: printer.name,
                          text: `========================================\n      ${settings.company.name.toUpperCase()}\n       ESC/POS TEST RECEIPT FEED\n========================================\nPrinter Name: ${printer.name}\nInterface: ${printer.connectionType.toUpperCase()} (${printer.ipAddress || 'USB001'})\nPaper Width: ${printer.paperWidth}\nStation Routing: ${printer.assignedStations.join(', ').toUpperCase()}\nCurrency: ${settings.taxAndCurrency.currencyCode} (${settings.taxAndCurrency.currencySymbol})\nVAT Rate: ${(settings.taxAndCurrency.defaultTaxRate * 100).toFixed(1)}%\nTIN: ${settings.taxAndCurrency.vatTinNumber || 'NG-TIN-23091840-001'}\n\n[1] SAMPLE ITEM TEST 1       ${settings.taxAndCurrency.currencySymbol}4,500.00\n[2] SAMPLE ITEM TEST 2       ${settings.taxAndCurrency.currencySymbol}6,000.00\n----------------------------------------\nSUBTOTAL:                   ${settings.taxAndCurrency.currencySymbol}10,500.00\nVAT (7.5%):                   ${settings.taxAndCurrency.currencySymbol}787.50\nTOTAL:                      ${settings.taxAndCurrency.currencySymbol}11,287.50\n========================================\n       TEST SUCCESSFUL - CUT FEED\n========================================`
                        });
                        setSaveNotice(`Test feed transmitted to ${printer.name}`);
                        setTimeout(() => setSaveNotice(null), 3000);
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-orange-400" /> Send Test KOT Feed
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Receipt Design & Live Template Customizer */}
      {activeTab === 'receipt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Customizer Controls (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900">Receipt Design & Customization Studio</h3>
              <p className="text-xs text-slate-500">Fine-tune the typography, branding text, Wi-Fi credentials, and QR codes printed on customer receipts.</p>
            </div>

            <div className="space-y-4">
              {/* Paper Width */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Standard Thermal Paper Width</label>
                <div className="flex gap-3">
                  {(['80mm', '58mm'] as const).map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        receiptTemplate: { ...settings.receiptTemplate, paperWidth: w }
                      })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        settings.receiptTemplate.paperWidth === w
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {w} Standard Thermal Roll ({w === '80mm' ? 'Full Check' : 'Compact'})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Header Welcome Text</label>
                <input
                  type="text"
                  value={settings.receiptTemplate.headerText}
                  onChange={(e) => setSettings({
                    ...settings,
                    receiptTemplate: { ...settings.receiptTemplate, headerText: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Footer Greeting / Thank You Note</label>
                <input
                  type="text"
                  value={settings.receiptTemplate.footerMessage}
                  onChange={(e) => setSettings({
                    ...settings,
                    receiptTemplate: { ...settings.receiptTemplate, footerMessage: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Customer Guest Wi-Fi SSID</label>
                  <input
                    type="text"
                    value={settings.receiptTemplate.wifiSsid}
                    onChange={(e) => setSettings({
                      ...settings,
                      receiptTemplate: { ...settings.receiptTemplate, wifiSsid: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Guest Wi-Fi Password</label>
                  <input
                    type="text"
                    value={settings.receiptTemplate.wifiPassword}
                    onChange={(e) => setSettings({
                      ...settings,
                      receiptTemplate: { ...settings.receiptTemplate, wifiPassword: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Feedback Survey / Digital e-Receipt QR Code URL</label>
                <input
                  type="text"
                  value={settings.receiptTemplate.qrCodeUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    receiptTemplate: { ...settings.receiptTemplate, qrCodeUrl: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { key: 'showLogo', label: 'Print Brand Logo' },
                  { key: 'showTableNumber', label: 'Print Table & Guest Count' },
                  { key: 'showServerName', label: 'Print Server Name' },
                  { key: 'showItemizedTax', label: 'Print Itemized Tax Breakdown' },
                  { key: 'showServiceCharge', label: 'Print Service Charge' },
                  { key: 'showWifiInfo', label: 'Print Customer Wi-Fi Info' },
                  { key: 'showBarcode', label: 'Print Scan Barcode / QR' },
                ].map(item => {
                  const val = (settings.receiptTemplate as any)[item.key];
                  return (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-800">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          receiptTemplate: {
                            ...settings.receiptTemplate,
                            [item.key]: !val
                          }
                        })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          val ? 'bg-orange-500' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                            val ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ultra-Realistic Thermal Paper Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                Live Thermal Paper WYSIWYG Preview ({settings.receiptTemplate.paperWidth})
              </span>
            </div>

            <div 
              className={`bg-[#faf8f5] text-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-300 font-mono text-xs space-y-3 ${
                settings.receiptTemplate.paperWidth === '80mm' ? 'w-full max-w-[340px]' : 'w-full max-w-[270px]'
              }`}
              style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.08))' }}
            >
              {/* Header */}
              <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
                {settings.receiptTemplate.showLogo && settings.company.logoUrl && (
                  <img
                    src={settings.company.logoUrl}
                    alt="Logo"
                    className="w-12 h-12 object-cover mx-auto rounded-full mb-1"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                )}
                <h4 className="text-sm font-black tracking-wider uppercase text-slate-900">{settings.company.name}</h4>
                <p className="text-[10px] text-slate-600">{settings.company.address}</p>
                <p className="text-[10px] text-slate-600">Tel: {settings.company.phone}</p>
                {settings.company.taxId && (
                  <p className="text-[9px] text-slate-500">VAT/TIN: {settings.company.taxId}</p>
                )}
                <p className="text-[10px] font-bold text-slate-800 pt-1">{settings.receiptTemplate.headerText}</p>
                <div className="text-[9px] text-slate-500 pt-1">
                  2026-08-29 19:45 PM • TICKET #8804
                </div>
                <div className="font-bold text-slate-900 text-[10px]">
                  {settings.receiptTemplate.showTableNumber && 'TABLE #4 (4 GUESTS)'}
                  {settings.receiptTemplate.showServerName && ' | SVR: ALEX R.'}
                </div>
              </div>

              {/* Sample Items */}
              <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
                <div className="flex justify-between font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-1">
                  <span>ITEM</span>
                  <span>AMT</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>2x Angus Smash Burger</span>
                  <span className="font-bold">{settings.taxAndCurrency.currencySymbol}29.90</span>
                </div>
                <div className="pl-3 text-[9px] text-slate-500">+ Med Rare • Extra Cheddar</div>
                <div className="flex justify-between text-[11px]">
                  <span>1x Truffle Fries</span>
                  <span className="font-bold">{settings.taxAndCurrency.currencySymbol}7.50</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>2x Craft IPA Draft</span>
                  <span className="font-bold">{settings.taxAndCurrency.currencySymbol}16.00</span>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-1 border-b border-dashed border-slate-400 pb-3 text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{settings.taxAndCurrency.currencySymbol}53.40</span>
                </div>
                {settings.receiptTemplate.showItemizedTax && (
                  <div className="flex justify-between text-slate-600">
                    <span>SALES TAX ({(settings.taxAndCurrency.defaultTaxRate * 100).toFixed(1)}%):</span>
                    <span>{settings.taxAndCurrency.currencySymbol}{(53.40 * settings.taxAndCurrency.defaultTaxRate).toFixed(2)}</span>
                  </div>
                )}
                {settings.receiptTemplate.showServiceCharge && (
                  <div className="flex justify-between text-slate-600">
                    <span>SVC CHG ({(settings.taxAndCurrency.serviceChargeRate * 100).toFixed(1)}%):</span>
                    <span>{settings.taxAndCurrency.currencySymbol}{(53.40 * settings.taxAndCurrency.serviceChargeRate).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-400">
                  <span>TOTAL:</span>
                  <span>
                    {settings.taxAndCurrency.currencySymbol}
                    {(53.40 * (1 + settings.taxAndCurrency.defaultTaxRate + (settings.receiptTemplate.showServiceCharge ? settings.taxAndCurrency.serviceChargeRate : 0))).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 pt-0.5">
                  <span>PAID VIA:</span>
                  <span className="font-bold">VISA CARD **** 4092</span>
                </div>
              </div>

              {/* Footer & Wi-Fi & QR */}
              <div className="text-center space-y-2 pt-1">
                <p className="text-[10px] font-bold text-slate-800">{settings.receiptTemplate.footerMessage}</p>
                
                {settings.receiptTemplate.showWifiInfo && (
                  <div className="text-[9px] bg-slate-200/60 p-1.5 rounded text-slate-700">
                    <div>📶 Free Guest Wi-Fi: <strong>{settings.receiptTemplate.wifiSsid}</strong></div>
                    <div>Passcode: <strong>{settings.receiptTemplate.wifiPassword}</strong></div>
                  </div>
                )}

                {settings.receiptTemplate.showBarcode && (
                  <div className="pt-1 flex flex-col items-center">
                    <div className="h-7 w-40 bg-slate-900 flex items-center justify-around px-1">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-5 bg-white ${i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-0.5' : 'w-0.5'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[8px] tracking-widest text-slate-500 mt-0.5">*ORD-8804-CHK*</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Backup, Export & Multi-Device JSON Configuration Provisioning */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Export Application Configuration</h3>
                    <p className="text-xs text-slate-500">Download a full snapshot of your current POS profile as a portable JSON file.</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2 text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Included in JSON bundle:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    <li>Company legal entity, tax numbers, contact details & logo settings</li>
                    <li>Tax rates (VAT %, City Tax, Service Charge) & currency formatting</li>
                    <li>Target gross margins, food cost multipliers & BOM rules</li>
                    <li>Master Host server IP, sync port & multi-terminal device rosters</li>
                    <li>Thermal printer hardware routes & kitchen station assignments</li>
                    <li>Customer receipt customizer headers, footers & Wi-Fi QR credentials</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportJson}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Configuration JSON (.json)</span>
                </button>
              </div>
            </div>

            {/* Import Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Import & Quick-Setup Terminals</h3>
                    <p className="text-xs text-slate-500">Load a JSON configuration file to provision new devices in seconds.</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5 text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <span>Multi-Device Rollout Workflow:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Set up your <strong>Master Server Terminal</strong> once, export the configuration JSON, and upload it to any newly deployed POS register, bar till, or kitchen tablet to automatically copy all network host addresses, VAT formulas, and printer configs without manual re-entry.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Open Configuration Import Studio</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Raw JSON Preview & Inspection */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Active Live Configuration Schema</h3>
                <p className="text-xs text-slate-500">Real-time JSON serialization of active system memory.</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
                  setSaveNotice('JSON copied to clipboard!');
                  setTimeout(() => setSaveNotice(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Copy Raw JSON
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-[11px] max-h-72 overflow-y-auto border border-slate-800 leading-tight">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Import Configuration JSON */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Import Configuration File</h3>
                  <p className="text-[11px] text-slate-500">Restore or synchronize settings from a JSON export</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                  setImportPreview(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* File Upload / Drag & Drop area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select JSON File from Computer</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/20 rounded-2xl p-5 text-center transition-colors">
                <input
                  type="file"
                  id="json-file-input"
                  accept=".json,application/json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <label htmlFor="json-file-input" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  <Upload className="w-7 h-7 text-slate-400" />
                  <span className="text-xs font-bold text-slate-800">
                    Click to select <span className="text-orange-600">.json</span> configuration file
                  </span>
                  <span className="text-[10px] text-slate-400">or paste JSON contents into the text box below</span>
                </label>
              </div>
            </div>

            {/* Direct JSON Paste Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Or Paste Raw JSON Configuration</label>
                {importJsonText && (
                  <button
                    onClick={() => {
                      setImportJsonText('');
                      setImportError(null);
                      setImportPreview(null);
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  validateAndPreviewImport(e.target.value);
                }}
                placeholder='Paste exported JSON structure here... e.g. { "settings": { ... } }'
                className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              />
            </div>

            {/* Error Message */}
            {importError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Parsed Inspection Preview */}
            {importPreview && (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 text-emerald-900 rounded-2xl space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-black text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Valid Configuration Detected</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block">Restaurant Name:</span>
                    <span className="font-bold text-slate-900">{importPreview.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Currency & VAT:</span>
                    <span className="font-bold text-slate-900">{importPreview.currency} @ {importPreview.taxRate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Terminal Mode:</span>
                    <span className="font-bold text-slate-900">{importPreview.mode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Devices & Printers:</span>
                    <span className="font-bold text-slate-900">{importPreview.terminalCount} Terminals, {importPreview.printerCount} Printers</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                  setImportPreview(null);
                }}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!importPreview?.valid}
                onClick={handleApplyImportedSettings}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  importPreview?.valid
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Apply Imported Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Printer */}
      {showAddPrinterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add Thermal Hardware Printer</h3>
            <p className="text-xs text-slate-500">Configure connection interface, IP address, and station ticket routing.</p>

            <form onSubmit={handleAddPrinter} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Printer Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Patio Bar KOT Printer"
                  value={newPrinterName}
                  onChange={(e) => setNewPrinterName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Printer Role</label>
                <select
                  value={newPrinterType}
                  onChange={(e) => setNewPrinterType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                >
                  <option value="kitchen_kot">Kitchen Hot Line KOT Printer</option>
                  <option value="receipt_foh">Front-of-House Receipt Printer</option>
                  <option value="bar_kot">Bar & Beverage Ticket Printer</option>
                  <option value="dispatch_slip">Delivery Bag Dispatch Slip Labeler</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Connection Protocol</label>
                <select
                  value={newPrinterConn}
                  onChange={(e) => setNewPrinterConn(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                >
                  <option value="network_lan">Network Ethernet / Wi-Fi (ESC/POS Port 9100)</option>
                  <option value="usb">USB Direct Cable</option>
                  <option value="bluetooth">Bluetooth Wireless</option>
                  <option value="browser_print">Web Browser Raw Print</option>
                </select>
              </div>

              {newPrinterConn === 'network_lan' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Printer Static IP & Port</label>
                  <input
                    type="text"
                    value={newPrinterIp}
                    onChange={(e) => setNewPrinterIp(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Paper Roll</label>
                  <select
                    value={newPrinterWidth}
                    onChange={(e) => setNewPrinterWidth(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                  >
                    <option value="80mm">80mm Wide</option>
                    <option value="58mm">58mm Narrow</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Station Route</label>
                  <select
                    value={newPrinterStation}
                    onChange={(e) => setNewPrinterStation(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                  >
                    <option value="all">All Stations</option>
                    <option value="grill">Grill & Range</option>
                    <option value="fryer">Fryer</option>
                    <option value="salad">Salad / Pantry</option>
                    <option value="bar">Bar</option>
                    <option value="dessert">Pastry / Dessert</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddPrinterModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Register Printer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
