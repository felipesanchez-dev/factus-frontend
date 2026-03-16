import type { Role, Area, Permission, RoleConfig } from "./permissions.types";

export const AREA_PATHS: Record<Area, string> = {
  dashboard: "/dashboard",
  empresa: "/dashboard/empresa",
  productos: "/dashboard/productos",
  facturacion: "/dashboard/facturacion",
  usuarios: "/dashboard/usuarios",
  sucursales: "/dashboard/sucursales",
  metricas: "/dashboard/metricas",
  configuracion: "/dashboard/configuracion",
  tienda: "/dashboard/tienda",
};

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, RoleConfig> = {
  super_admin: {
    label: "Super Admin",
    areas: ["dashboard", "empresa", "productos", "facturacion", "usuarios", "sucursales", "metricas", "configuracion", "tienda"],
    permissions: ["read", "write", "delete"],
    branchScoped: false,
    homePage: "dashboard",
  },
  admin_sucursal: {
    label: "Admin Sucursal",
    areas: ["dashboard", "productos", "facturacion", "metricas"],
    permissions: ["read", "write"],
    branchScoped: true,
    homePage: "dashboard",
  },
  vendedor: {
    label: "Vendedor",
    areas: ["dashboard", "productos", "facturacion", "tienda"],
    permissions: ["read", "write"],
    branchScoped: true,
    homePage: "dashboard",
  },
  visor: {
    label: "Visor",
    areas: ["dashboard", "metricas"],
    permissions: ["read"],
    branchScoped: true,
    homePage: "dashboard",
  },
};

export function hasAccess(role: Role, area: Area, config?: Record<Role, RoleConfig>): boolean {
  const cfg = config ?? DEFAULT_ROLE_PERMISSIONS;
  return cfg[role]?.areas.includes(area) ?? false;
}

export function hasPermission(role: Role, permission: Permission, config?: Record<Role, RoleConfig>): boolean {
  const cfg = config ?? DEFAULT_ROLE_PERMISSIONS;
  return cfg[role]?.permissions.includes(permission) ?? false;
}

export function canAccessArea(role: Role, area: Area, permission: Permission, config?: Record<Role, RoleConfig>): boolean {
  return hasAccess(role, area, config) && hasPermission(role, permission, config);
}

export function getMenuItemsForRole(role: Role, config?: Record<Role, RoleConfig>): Area[] {
  const cfg = config ?? DEFAULT_ROLE_PERMISSIONS;
  return cfg[role]?.areas ?? [];
}

export function getRoleLabel(role: Role, config?: Record<Role, RoleConfig>): string {
  const cfg = config ?? DEFAULT_ROLE_PERMISSIONS;
  return cfg[role]?.label ?? role;
}

export function isBranchScoped(role: Role, config?: Record<Role, RoleConfig>): boolean {
  const cfg = config ?? DEFAULT_ROLE_PERMISSIONS;
  return cfg[role]?.branchScoped ?? true;
}

export function getHomePath(role: Role, config?: Record<Role, RoleConfig>): string {
  const cfg = config ?? DEFAULT_ROLE_PERMISSIONS;
  const roleConfig = cfg[role];
  if (roleConfig?.homePage && AREA_PATHS[roleConfig.homePage]) {
    return AREA_PATHS[roleConfig.homePage];
  }
  // Fallback: first area in the role's list
  if (roleConfig?.areas.length > 0) {
    return AREA_PATHS[roleConfig.areas[0]] ?? "/dashboard";
  }
  return "/dashboard";
}
