import React, { useState, useMemo } from 'react';
import { 
  StaffMember, 
  TimeLog, 
  UserRole, 
  AppSettings, 
  PermissionKey, 
  RoleConfig, 
  SecurityAndRbacSettings,
  PermissionCategory,
  PermissionDefinition
} from '../types';
import { 
  DEFAULT_ROLE_CONFIGS, 
  DEFAULT_PERMISSION_DEFINITIONS 
} from '../constants';
import { 
  Users, 
  Clock, 
  UserPlus, 
  Shield, 
  CheckCircle2, 
  DollarSign, 
  Key, 
  Calendar, 
  Timer, 
  Lock,
  Search,
  Filter,
  Sliders,
  Check,
  X,
  Edit3,
  Trash2,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  Phone,
  Mail,
  UserCheck,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Plus,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StaffViewProps {
  staff: StaffMember[];
  currentStaff: StaffMember;
  timeLogs: TimeLog[];
  settings: AppSettings;
  initialTab?: string;
  onToggleClock: (staffId: string) => void;
  onAddStaff: (newStaff: StaffMember) => void;
  onUpdateStaff?: (updatedStaff: StaffMember) => void;
  onDeleteStaff?: (staffId: string) => void;
  onSwitchStaff: (staff: StaffMember) => void;
  onSaveRbacSettings?: (newRbac: SecurityAndRbacSettings) => void;
  onAddManualTimeLog?: (log: TimeLog) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  staff,
  currentStaff,
  timeLogs,
  settings,
  initialTab = 'roster',
  onToggleClock,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onSwitchStaff,
  onSaveRbacSettings,
  onAddManualTimeLog,
}) => {
  // Navigation tabs: 'roster' | 'rbac' | 'timelogs'
  const [activeTab, setActiveTab] = useState<'roster' | 'rbac' | 'timelogs'>(
    initialTab === 'rbac' || initialTab === 'timelogs' ? initialTab : 'roster'
  );

  // Sync tab if initialTab changes
  React.useEffect(() => {
    if (initialTab && ['roster', 'rbac', 'timelogs'].includes(initialTab)) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Currency helper
  const currencySymbol = settings?.taxAndCurrency?.currencySymbol || '₦';
  const currencyCode = settings?.taxAndCurrency?.currencyCode || 'NGN';

  // --- ROSTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_clock' | 'clocked_out'>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    department: 'Front of House' | 'Back of House' | 'Management' | 'Procurement' | 'Beverage';
    hourlyRate: number;
    pin: string;
    emergencyContact: string;
    dateHired: string;
    notes: string;
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'server',
    department: 'Front of House',
    hourlyRate: 16.50,
    pin: '1234',
    emergencyContact: '',
    dateHired: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // --- RBAC STATE ---
  const [rbacSettings, setRbacSettings] = useState<SecurityAndRbacSettings>(() => {
    return settings?.rbac || {
      autoLockMinutes: 5,
      requireManagerPinForVoids: true,
      requireManagerPinForDiscountsOver: 15,
      requireManagerPinForDrawerKick: true,
      requireManagerPinForRefunds: true,
      requireManagerPinForBillPayments: true,
      requireManagerPinForStockAdjustments: true,
      roles: DEFAULT_ROLE_CONFIGS
    };
  });

  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<UserRole>('manager');
  const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<string>('all');
  const [rbacNotice, setRbacNotice] = useState<string | null>(null);

  // --- TIMELOGS STATE ---
  const [timeLogStaffFilter, setTimeLogStaffFilter] = useState<string>('all');
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [manualLogStaffId, setManualLogStaffId] = useState<string>(staff[0]?.id || '');
  const [manualLogDate, setManualLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualLogClockIn, setManualLogClockIn] = useState<string>('09:00 AM');
  const [manualLogClockOut, setManualLogClockOut] = useState<string>('05:30 PM');
  const [manualLogDuration, setManualLogDuration] = useState<number>(8.5);

  // Active statistics
  const activeStaffCount = staff.filter(s => s.isClockedIn).length;
  const totalHourlyBurn = staff
    .filter(s => s.isClockedIn)
    .reduce((acc, s) => acc + s.hourlyRate, 0);

  // Filtered staff roster
  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.phone && member.phone.includes(searchQuery));
      
      const matchDept = departmentFilter === 'all' || member.department === departmentFilter;
      const matchStatus = statusFilter === 'all' || 
        (statusFilter === 'on_clock' && member.isClockedIn) ||
        (statusFilter === 'clocked_out' && !member.isClockedIn);

      return matchSearch && matchDept && matchStatus;
    });
  }, [staff, searchQuery, departmentFilter, statusFilter]);

  // Current selected role config
  const currentRoleConfig = useMemo(() => {
    return rbacSettings.roles.find(r => r.role === selectedRoleForEdit) || DEFAULT_ROLE_CONFIGS.find(r => r.role === selectedRoleForEdit) || DEFAULT_ROLE_CONFIGS[0];
  }, [rbacSettings.roles, selectedRoleForEdit]);

  // Grouped permission definitions
  const groupedPermissions = useMemo(() => {
    const categories: Record<PermissionCategory, PermissionDefinition[]> = {
      pos: [],
      tables: [],
      kds: [],
      purchasing: [],
      inventory: [],
      reports: [],
      staff: [],
      settings: [],
    };

    DEFAULT_PERMISSION_DEFINITIONS.forEach(p => {
      if (categories[p.category]) {
        categories[p.category].push(p);
      }
    });

    return categories;
  }, []);

  const categoryTitles: Record<PermissionCategory, { label: string; icon: any; desc: string }> = {
    pos: { label: 'POS & Register Checkout', icon: DollarSign, desc: 'Sales entry, line voids, drawer kick, refunds & discounts' },
    tables: { label: 'Floor Plan & Tables', icon: Users, desc: 'Table seating, floor occupancy & reservation ledger' },
    kds: { label: 'Kitchen Display (KDS)', icon: Timer, desc: 'Live ticket bump, station cooking chits & kitchen recall' },
    purchasing: { label: 'Purchasing & Accounts Payable', icon: FileSpreadsheet, desc: 'Purchase orders, delivery notes, vendor bills & 3-way match' },
    inventory: { label: 'Inventory & Recipe BOM', icon: Building2, desc: 'Stock audit count, physical overrides, recipe yields & waste' },
    reports: { label: 'Financial & Audit Reports', icon: Sparkles, desc: 'Daily revenue, end-of-shift Z-reports & tax/VAT audit' },
    staff: { label: 'Staff Management & Timeclock', icon: Shield, desc: 'Staff directory, wages, shift hours & RBAC matrix policies' },
    settings: { label: 'System & Hardware Settings', icon: Sliders, desc: 'Tax rates, currency FX, ESC/POS printers & LAN sync' },
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'server',
      department: 'Front of House',
      hourlyRate: 16.50,
      pin: '1234',
      emergencyContact: '',
      dateHired: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      department: member.department || 'Front of House',
      hourlyRate: member.hourlyRate,
      pin: member.pin,
      emergencyContact: member.emergencyContact || '',
      dateHired: member.dateHired || new Date().toISOString().split('T')[0],
      notes: member.notes || '',
    });
    setShowAddModal(true);
  };

  // Save staff member (Create or Edit)
  const handleSaveStaffForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-orange-600', 'bg-purple-600', 'bg-pink-600', 'bg-amber-600', 'bg-cyan-600'];

    if (editingStaff) {
      const updated: StaffMember = {
        ...editingStaff,
        name: formData.name,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@restoflow.com`,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        hourlyRate: Number(formData.hourlyRate),
        pin: formData.pin,
        emergencyContact: formData.emergencyContact,
        dateHired: formData.dateHired,
        notes: formData.notes,
      };

      if (onUpdateStaff) {
        onUpdateStaff(updated);
      }
    } else {
      const member: StaffMember = {
        id: `staff-${Date.now()}`,
        name: formData.name,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@restoflow.com`,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        pin: formData.pin,
        hourlyRate: Number(formData.hourlyRate),
        isClockedIn: false,
        totalHoursToday: 0,
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
        emergencyContact: formData.emergencyContact,
        dateHired: formData.dateHired,
        status: 'active',
        notes: formData.notes,
      };

      onAddStaff(member);
    }

    setShowAddModal(false);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  // Delete staff
  const handleConfirmDelete = (id: string) => {
    if (onDeleteStaff) {
      onDeleteStaff(id);
    }
    setShowDeleteConfirm(null);
  };

  // Punch clock action
  const handlePunchClock = (id: string) => {
    onToggleClock(id);
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
  };

  // --- RBAC MUTATIONS ---
  const handleTogglePermission = (role: UserRole, permissionKey: PermissionKey) => {
    setRbacSettings(prev => {
      const updatedRoles = prev.roles.map(r => {
        if (r.role === role) {
          const hasPerm = r.permissions.includes(permissionKey);
          const newPerms = hasPerm
            ? r.permissions.filter(p => p !== permissionKey)
            : [...r.permissions, permissionKey];
          return { ...r, permissions: newPerms };
        }
        return r;
      });
      return { ...prev, roles: updatedRoles };
    });
  };

  const handleToggleCategory = (role: UserRole, category: PermissionCategory) => {
    const permsInCategory = groupedPermissions[category].map(p => p.key);
    setRbacSettings(prev => {
      const updatedRoles = prev.roles.map(r => {
        if (r.role === role) {
          const allIncluded = permsInCategory.every(p => r.permissions.includes(p));
          let newPerms: PermissionKey[];
          if (allIncluded) {
            newPerms = r.permissions.filter(p => !permsInCategory.includes(p));
          } else {
            const missing = permsInCategory.filter(p => !r.permissions.includes(p));
            newPerms = [...r.permissions, ...missing];
          }
          return { ...r, permissions: newPerms };
        }
        return r;
      });
      return { ...prev, roles: updatedRoles };
    });
  };

  const handleGrantAll = (role: UserRole) => {
    setRbacSettings(prev => ({
      ...prev,
      roles: prev.roles.map(r => r.role === role ? {
        ...r,
        permissions: DEFAULT_PERMISSION_DEFINITIONS.map(p => p.key)
      } : r)
    }));
  };

  const handleRevokeAll = (role: UserRole) => {
    setRbacSettings(prev => ({
      ...prev,
      roles: prev.roles.map(r => r.role === role ? {
        ...r,
        permissions: []
      } : r)
    }));
  };

  const handleResetRoleToPreset = (role: UserRole) => {
    const preset = DEFAULT_ROLE_CONFIGS.find(r => r.role === role);
    if (!preset) return;
    setRbacSettings(prev => ({
      ...prev,
      roles: prev.roles.map(r => r.role === role ? { ...preset } : r)
    }));
    setRbacNotice(`Role "${preset.name}" reset to recommended security defaults.`);
    setTimeout(() => setRbacNotice(null), 3500);
  };

  const handleUpdateRoleDiscountCap = (role: UserRole, cap: number) => {
    setRbacSettings(prev => ({
      ...prev,
      roles: prev.roles.map(r => r.role === role ? { ...r, maxDiscountPercentAllowed: cap } : r)
    }));
  };

  const handleSaveRbacToGlobal = () => {
    if (onSaveRbacSettings) {
      onSaveRbacSettings(rbacSettings);
    }
    setRbacNotice('Security Matrix & RBAC policies saved successfully!');
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setRbacNotice(null), 4000);
  };

  // Add manual timelog
  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStaff = staff.find(s => s.id === manualLogStaffId);
    if (!targetStaff) return;

    const wage = targetStaff.hourlyRate * manualLogDuration;
    const newLog: TimeLog = {
      id: `tl-man-${Date.now()}`,
      staffId: targetStaff.id,
      staffName: targetStaff.name,
      date: manualLogDate,
      clockIn: manualLogClockIn,
      clockOut: manualLogClockOut,
      durationHours: manualLogDuration,
      earnings: wage,
    };

    if (onAddManualTimeLog) {
      onAddManualTimeLog(newLog);
    }
    setShowAddLogModal(false);
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
  };

  // Export Timecard to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Staff Name', 'Clock In', 'Clock Out', 'Duration (Hours)', 'Hourly Rate', 'Total Earnings'];
    const rows = timeLogs.map(log => {
      const dur = log.durationHours ?? (log as any).totalHours ?? 0;
      const rate = staff.find(s => s.id === log.staffId)?.hourlyRate || 0;
      const earnings = log.earnings ?? (dur * rate);
      return [
        log.date,
        `"${log.staffName}"`,
        `"${log.clockIn}"`,
        `"${log.clockOut || 'Active'}"`,
        dur.toFixed(2),
        rate.toFixed(2),
        earnings.toFixed(2)
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RestoFlow_Timecards_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Timecard calculations
  const totalShiftHours = timeLogs.reduce((acc, l) => acc + (l.durationHours ?? (l as any).totalHours ?? 0), 0);
  const totalShiftEarnings = timeLogs.reduce((acc, l) => acc + (l.earnings ?? 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-20">
      {/* Top High-Level KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active on Shift</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{activeStaffCount} / {staff.length} Present</p>
            <span className="text-[11px] font-bold text-emerald-600">
              {Math.round((activeStaffCount / (staff.length || 1)) * 100)}% Floor Coverage
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hourly Payroll Burn</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{currencySymbol}{totalHourlyBurn.toFixed(2)}/hr</p>
            <span className="text-[11px] font-medium text-slate-500">Live active wages</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configured Roles</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{rbacSettings.roles.length} System Roles</p>
            <span className="text-[11px] font-medium text-purple-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 32 Granular Permissions
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Session</span>
            <p className="text-lg font-black text-slate-900 mt-1 truncate">{currentStaff.name}</p>
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">
              {currentStaff.role} • PIN: {currentStaff.pin}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl ${currentStaff.avatarColor || 'bg-orange-500'} text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0`}>
            {currentStaff.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'roster'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Staff Roster & Profiles ({staff.length})
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'rbac'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            RBAC Roles & Security Matrix
          </button>

          <button
            onClick={() => setActiveTab('timelogs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'timelogs'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Timecards & Shift Logs ({timeLogs.length})
          </button>
        </div>

        {activeTab === 'roster' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Add Team Member
          </button>
        )}

        {activeTab === 'rbac' && (
          <button
            onClick={handleSaveRbacToGlobal}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Save RBAC Configuration
          </button>
        )}

        {activeTab === 'timelogs' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddLogModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Log Manual Shift
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Save / Status Notice */}
      {rbacNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{rbacNotice}</span>
          </div>
          <button onClick={() => setRbacNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: STAFF ROSTER & PROFILES */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, role, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1">Dept:</span>
              {['all', 'Management', 'Front of House', 'Back of House', 'Procurement', 'Beverage'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setDepartmentFilter(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    departmentFilter === dept
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {dept === 'all' ? 'All Depts' : dept}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              <span className="text-xs font-bold text-slate-400 uppercase mr-1">Shift:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">All Status</option>
                <option value="on_clock">● On Clock Only</option>
                <option value="clocked_out">○ Clocked Out</option>
              </select>
            </div>
          </div>

          {/* Staff Roster Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredStaff.map(member => {
              const isCurrentUser = member.id === currentStaff.id;
              const roleCfg = rbacSettings.roles.find(r => r.role === member.role);
              const permsCount = roleCfg?.permissions?.length || 0;

              return (
                <div
                  key={member.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 bg-white ${
                    isCurrentUser
                      ? 'border-orange-500 shadow-md ring-2 ring-orange-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${member.avatarColor || 'bg-slate-700'} text-white font-black flex items-center justify-center text-base shadow-sm shrink-0`}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                            {member.name}
                            {isCurrentUser && (
                              <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                                Current
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${roleCfg?.color || 'bg-slate-600'}`}>
                              {roleCfg?.name || member.role.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {member.department || 'General'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                        member.isClockedIn
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {member.isClockedIn ? '● On Shift' : '○ Clocked Out'}
                      </span>
                    </div>

                    {/* Contact & Meta info */}
                    <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {member.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-200/60">
                        <span>PIN: <strong className="font-mono text-slate-800 tracking-wider">••••</strong> ({member.pin})</span>
                        <span>{permsCount} RBAC Permissions</span>
                      </div>
                    </div>

                    {/* Details Strip */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs mt-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Wage Rate</span>
                        <p className="font-bold text-slate-800 mt-0.5">{currencySymbol}{member.hourlyRate.toFixed(2)}/h</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Clocked In</span>
                        <p className="font-bold text-slate-800 mt-0.5">{member.clockedInAt || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Hours Today</span>
                        <p className="font-black text-emerald-600 mt-0.5">{member.totalHoursToday || 0} hrs</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePunchClock(member.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          member.isClockedIn
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {member.isClockedIn ? 'Clock Out' : 'Punch In Shift'}
                      </button>

                      <button
                        onClick={() => onSwitchStaff(member)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                        title="Switch active user session"
                      >
                        Switch PIN
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 px-1">
                      <button
                        onClick={() => {
                          setSelectedRoleForEdit(member.role);
                          setActiveTab('rbac');
                        }}
                        className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 text-[11px]"
                      >
                        <Shield className="w-3 h-3" /> View Role Permissions
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className="text-slate-500 hover:text-slate-800 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit staff details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {staff.length > 1 && (
                          <button
                            onClick={() => setShowDeleteConfirm(member.id)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RBAC ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Role Switcher Ribbon */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  Role-Based Access Control (RBAC) Architecture
                </h3>
                <p className="text-xs text-slate-500">
                  Select a role below to audit, customize or override permission policies across all 8 ERP domains
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResetRoleToPreset(selectedRoleForEdit)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset to Recommended Spec
                </button>
              </div>
            </div>

            {/* Role Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {rbacSettings.roles.map(r => {
                const isSelected = r.role === selectedRoleForEdit;
                const membersCount = staff.filter(s => s.role === r.role).length;

                return (
                  <button
                    key={r.role}
                    onClick={() => setSelectedRoleForEdit(r.role)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 shadow-sm ring-2 ring-purple-600/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`w-3 h-3 rounded-full ${r.color}`} />
                      <span className="text-[10px] font-bold text-slate-400">{membersCount} Staff</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">{r.name.split('/')[0]}</p>
                    <span className="text-[10px] text-slate-500 font-medium capitalize block">{r.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Role Configuration Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-white text-xs font-black ${currentRoleConfig.color}`}>
                    {currentRoleConfig.role.toUpperCase()}
                  </span>
                  <h4 className="text-base font-black text-slate-900">{currentRoleConfig.name}</h4>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl">{currentRoleConfig.description}</p>
              </div>

              {/* Discount Limit Slider & Pin policy */}
              <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-purple-200/60 shrink-0">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Max Discount Allowed</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentRoleConfig.maxDiscountPercentAllowed}
                      onChange={(e) => handleUpdateRoleDiscountCap(currentRoleConfig.role, Number(e.target.value))}
                      className="w-24 accent-purple-600"
                    />
                    <span className="text-xs font-black text-purple-700 w-12">{currentRoleConfig.maxDiscountPercentAllowed}%</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200" />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGrantAll(currentRoleConfig.role)}
                    className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    Grant All
                  </button>
                  <button
                    onClick={() => handleRevokeAll(currentRoleConfig.role)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Revoke All
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1">Filter Domain:</span>
              <button
                onClick={() => setPermissionCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  permissionCategoryFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Domains (32)
              </button>
              {(Object.keys(groupedPermissions) as PermissionCategory[]).map(cat => {
                const count = groupedPermissions[cat].length;
                const activeCount = groupedPermissions[cat].filter(p => currentRoleConfig.permissions.includes(p.key)).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setPermissionCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      permissionCategoryFilter === cat
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {categoryTitles[cat].label.split('&')[0]} ({activeCount}/{count})
                  </button>
                );
              })}
            </div>

            {/* Granular Permission Grid by Category */}
            <div className="space-y-6">
              {(Object.keys(groupedPermissions) as PermissionCategory[])
                .filter(cat => permissionCategoryFilter === 'all' || permissionCategoryFilter === cat)
                .map(cat => {
                  const perms = groupedPermissions[cat];
                  const info = categoryTitles[cat];
                  const Icon = info.icon;
                  const allActive = perms.every(p => currentRoleConfig.permissions.includes(p.key));
                  const someActive = perms.some(p => currentRoleConfig.permissions.includes(p.key));

                  return (
                    <div key={cat} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">{info.label}</h5>
                            <span className="text-[11px] text-slate-500">{info.desc}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleCategory(currentRoleConfig.role, cat)}
                          className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-white border border-purple-200 px-3 py-1 rounded-xl transition-colors shadow-2xs"
                        >
                          {allActive ? 'Disable All' : 'Enable Category'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                        {perms.map(perm => {
                          const isChecked = currentRoleConfig.permissions.includes(perm.key);

                          return (
                            <div
                              key={perm.key}
                              onClick={() => handleTogglePermission(currentRoleConfig.role, perm.key)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                isChecked
                                  ? 'bg-white border-purple-300 shadow-2xs'
                                  : 'bg-white/60 border-slate-200 hover:border-slate-300 opacity-75'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                                isChecked
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-200 text-transparent'
                              }`}>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>

                              <div className="space-y-0.5">
                                <span className={`text-xs font-bold block ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                                  {perm.label}
                                </span>
                                <p className="text-[11px] text-slate-500 leading-snug">{perm.description}</p>
                                <span className="text-[9px] font-mono text-slate-400 block pt-1">{perm.key}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* System Security & Manager PIN Threshold Policies */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-600" />
                Manager PIN Security & Authorization Thresholds
              </h3>
              <p className="text-xs text-slate-500">
                Configure when non-manager staff (Cashiers, Servers, Bartenders) require a 4-digit Manager PIN override
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Require PIN for Line Item Voids</span>
                  <input
                    type="checkbox"
                    checked={rbacSettings.requireManagerPinForVoids}
                    onChange={(e) => setRbacSettings(prev => ({ ...prev, requireManagerPinForVoids: e.target.checked }))}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Prevents unauthorized cancellation of fired kitchen food items.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Require PIN for Cash Drawer Kick</span>
                  <input
                    type="checkbox"
                    checked={rbacSettings.requireManagerPinForDrawerKick}
                    onChange={(e) => setRbacSettings(prev => ({ ...prev, requireManagerPinForDrawerKick: e.target.checked }))}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Triggers manager approval when popping cash register with no active sale.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Require PIN for Card/Cash Refunds</span>
                  <input
                    type="checkbox"
                    checked={rbacSettings.requireManagerPinForRefunds}
                    onChange={(e) => setRbacSettings(prev => ({ ...prev, requireManagerPinForRefunds: e.target.checked }))}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Enforces managerial oversight for reversal of completed payments.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Require PIN for Vendor Payments</span>
                  <input
                    type="checkbox"
                    checked={rbacSettings.requireManagerPinForBillPayments}
                    onChange={(e) => setRbacSettings(prev => ({ ...prev, requireManagerPinForBillPayments: e.target.checked }))}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Locks supplier wire and ACH disbursement posting behind manager auth.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Require PIN for Stock Audit Count</span>
                  <input
                    type="checkbox"
                    checked={rbacSettings.requireManagerPinForStockAdjustments}
                    onChange={(e) => setRbacSettings(prev => ({ ...prev, requireManagerPinForStockAdjustments: e.target.checked }))}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Requires supervisor PIN when adjusting physical inventory counts.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Manager Override Discount Floor</span>
                  <span className="text-xs font-bold text-orange-600">{rbacSettings.requireManagerPinForDiscountsOver}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={rbacSettings.requireManagerPinForDiscountsOver}
                  onChange={(e) => setRbacSettings(prev => ({ ...prev, requireManagerPinForDiscountsOver: Number(e.target.value) }))}
                  className="w-full accent-orange-600"
                />
                <p className="text-[11px] text-slate-500">Discounts above this threshold require Manager PIN sign-off.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIMECARDS & SHIFT AUDIT LOGS */}
      {activeTab === 'timelogs' && (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Shift Hours Logged</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{totalShiftHours.toFixed(1)} Hours</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Shift Wages</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{currencySymbol}{totalShiftEarnings.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Hourly Wage</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {currencySymbol}{(totalShiftEarnings / (totalShiftHours || 1)).toFixed(2)}/hr
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Time Logs Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Shift Punch Logs & Timecard Audit</h3>
                <p className="text-xs text-slate-500">Employee clock-in timestamps, duration metrics, and automated wage ledger</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Staff Filter:</span>
                <select
                  value={timeLogStaffFilter}
                  onChange={(e) => setTimeLogStaffFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">All Employees ({timeLogs.length})</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="px-5 py-3.5 font-bold uppercase">Date</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Employee</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Clock In</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Clock Out</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Duration</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Rate</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Total Pay</th>
                    <th className="px-5 py-3.5 font-bold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {timeLogs
                    .filter(log => timeLogStaffFilter === 'all' || log.staffId === timeLogStaffFilter)
                    .map(log => {
                      const dur = log.durationHours ?? (log as any).totalHours ?? 0;
                      const emp = staff.find(s => s.id === log.staffId);
                      const rate = emp?.hourlyRate || 0;
                      const earnings = log.earnings ?? (dur * rate);

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 text-slate-500 font-mono">{log.date}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${emp?.avatarColor || 'bg-slate-600'}`} />
                              <span className="font-bold text-slate-900">{log.staffName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-700 font-mono">{log.clockIn}</td>
                          <td className="px-5 py-4 text-slate-700 font-mono">{log.clockOut || '● Active On Shift'}</td>
                          <td className="px-5 py-4 font-bold text-slate-900">{dur.toFixed(1)} hrs</td>
                          <td className="px-5 py-4 text-slate-500">{currencySymbol}{rate.toFixed(2)}/hr</td>
                          <td className="px-5 py-4 font-black text-emerald-600">{currencySymbol}{earnings.toFixed(2)}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              log.clockOut
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-emerald-100 text-emerald-800 animate-pulse'
                            }`}>
                              {log.clockOut ? 'Completed' : 'Active Shift'}
                            </span>
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

      {/* MODAL: ADD / EDIT STAFF MEMBER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-600" />
                {editingStaff ? 'Edit Staff Profile' : 'Add Team Member'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffForm} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chimamanda Eze"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Assigned Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const nextRole = e.target.value as UserRole;
                      let defaultDept: any = 'Front of House';
                      if (nextRole === 'kitchen') defaultDept = 'Back of House';
                      if (nextRole === 'manager' || nextRole === 'admin') defaultDept = 'Management';
                      if (nextRole === 'inventory_mgr') defaultDept = 'Procurement';
                      if (nextRole === 'bartender') defaultDept = 'Beverage';

                      setFormData(prev => ({ ...prev, role: nextRole, department: defaultDept }));
                    }}
                    className="w-full px-3 py-2.5 border rounded-xl font-bold bg-slate-50"
                  >
                    {rbacSettings.roles.map(r => (
                      <option key={r.role} value={r.role}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value as any }))}
                    className="w-full px-3 py-2.5 border rounded-xl font-bold bg-slate-50"
                  >
                    <option value="Front of House">Front of House (FOH)</option>
                    <option value="Back of House">Back of House (Kitchen)</option>
                    <option value="Management">Management & Floor</option>
                    <option value="Procurement">Procurement & Stores</option>
                    <option value="Beverage">Bar & Beverage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Hourly Wage ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">4-Digit Terminal PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={formData.pin}
                    onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-3 py-2.5 border rounded-xl font-mono tracking-widest text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@restoflow.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Next of Kin (+234 802 000 1111)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {editingStaff ? 'Update Profile' : 'Save Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL SHIFT LOG */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Add Manual Shift Record
              </h3>
              <button onClick={() => setShowAddLogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLog} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Employee</label>
                <select
                  value={manualLogStaffId}
                  onChange={(e) => setManualLogStaffId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role}) - {currencySymbol}{s.hourlyRate}/h</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Shift Date</label>
                <input
                  type="date"
                  value={manualLogDate}
                  onChange={(e) => setManualLogDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Clock In</label>
                  <input
                    type="text"
                    value={manualLogClockIn}
                    onChange={(e) => setManualLogClockIn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Clock Out</label>
                  <input
                    type="text"
                    value={manualLogClockOut}
                    onChange={(e) => setManualLogClockOut(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.5"
                  max="24"
                  value={manualLogDuration}
                  onChange={(e) => setManualLogDuration(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Shift Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Deactivate Staff Member?</h4>
              <p className="text-xs text-slate-500 mt-1">
                This employee will be removed from active floor scheduling and terminal login.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(showDeleteConfirm)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffView;
