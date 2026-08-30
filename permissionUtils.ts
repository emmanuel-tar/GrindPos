import { StaffMember, UserRole, PermissionKey, RoleConfig, SecurityAndRbacSettings } from './types';
import { DEFAULT_ROLE_CONFIGS, DEFAULT_PERMISSION_DEFINITIONS } from './constants';

/**
 * Checks if a staff member has a specific permission key.
 * If roleConfigs is not passed, falls back to DEFAULT_ROLE_CONFIGS.
 */
export function hasPermission(
  staff: StaffMember | null | undefined,
  permission: PermissionKey,
  roleConfigs: RoleConfig[] = DEFAULT_ROLE_CONFIGS
): boolean {
  if (!staff) return false;
  if (staff.role === 'admin') return true;

  const roleConfig = roleConfigs.find(r => r.role === staff.role);
  if (!roleConfig) return false;

  return roleConfig.permissions.includes(permission);
}

/**
 * Checks if a staff member can access a main top-level view.
 */
export function canAccessView(
  staff: StaffMember | null | undefined,
  view: string,
  roleConfigs: RoleConfig[] = DEFAULT_ROLE_CONFIGS
): boolean {
  if (!staff) return false;
  if (staff.role === 'admin') return true;

  switch (view) {
    case 'pos':
      return hasPermission(staff, 'pos_create_order', roleConfigs) ||
             hasPermission(staff, 'pos_process_refund', roleConfigs) ||
             hasPermission(staff, 'pos_split_check', roleConfigs);
    case 'kds':
      return hasPermission(staff, 'kds_view', roleConfigs);
    case 'purchasing':
      return hasPermission(staff, 'purchasing_create_po', roleConfigs) ||
             hasPermission(staff, 'purchasing_receive_grn', roleConfigs) ||
             hasPermission(staff, 'purchasing_enter_bill', roleConfigs);
    case 'inventory':
      return hasPermission(staff, 'inventory_view_stock', roleConfigs);
    case 'tables':
      return hasPermission(staff, 'tables_manage_floor', roleConfigs) ||
             hasPermission(staff, 'tables_manage_reservations', roleConfigs);
    case 'reports':
      return hasPermission(staff, 'reports_view_sales', roleConfigs) ||
             hasPermission(staff, 'reports_generate_zreport', roleConfigs);
    case 'staff':
      return hasPermission(staff, 'staff_view_roster', roleConfigs);
    case 'settings':
      return hasPermission(staff, 'settings_company_tax', roleConfigs) ||
             hasPermission(staff, 'settings_printers_hardware', roleConfigs) ||
             hasPermission(staff, 'settings_network_sync', roleConfigs);
    case 'integrations':
    case 'dashboard':
      return staff.role === 'admin' || staff.role === 'manager';
    default:
      return true;
  }
}

/**
 * Checks if a staff member is a Manager or Admin.
 */
export function isManagerOrAdmin(staff: StaffMember | null | undefined): boolean {
  if (!staff) return false;
  return staff.role === 'admin' || staff.role === 'manager';
}

/**
 * Gets the maximum discount percentage allowed for a staff member's role.
 */
export function getMaxDiscountPercent(
  staff: StaffMember | null | undefined,
  roleConfigs: RoleConfig[] = DEFAULT_ROLE_CONFIGS
): number {
  if (!staff) return 0;
  if (staff.role === 'admin') return 100;

  const roleConfig = roleConfigs.find(r => r.role === staff.role);
  return roleConfig ? roleConfig.maxDiscountPercentAllowed : 0;
}

/**
 * Returns human-readable label and description for a role.
 */
export function getRoleMeta(role: UserRole, roleConfigs: RoleConfig[] = DEFAULT_ROLE_CONFIGS): { name: string; description: string; color: string } {
  const cfg = roleConfigs.find(r => r.role === role);
  if (cfg) {
    return { name: cfg.name, description: cfg.description, color: cfg.color };
  }
  return {
    name: role.toUpperCase(),
    description: 'System user role',
    color: 'bg-slate-600'
  };
}
