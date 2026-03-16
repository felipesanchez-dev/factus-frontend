import {
  LayoutDashboard,
  Building2,
  Package,
  FileText,
  Users,
  MapPin,
  BarChart3,
  ShieldCheck,
  Store,
  LucideIcon,
} from "lucide-react";
import type { Area, Role, RoleConfig } from "@/shared/lib/permissions.types";
import { getMenuItemsForRole } from "@/shared/lib/permissions";

export interface NavItem {
  area: Area;
  label: string;
  icon: LucideIcon;
  href: string;
}

const NAV_MAP: Record<Area, { label: string; icon: LucideIcon; href: string }> =
  {
    dashboard: {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    empresa: { label: "Empresa", icon: Building2, href: "/dashboard/empresa" },
    productos: {
      label: "Productos",
      icon: Package,
      href: "/dashboard/productos",
    },
    facturacion: {
      label: "Facturacion",
      icon: FileText,
      href: "/dashboard/facturacion",
    },
    usuarios: { label: "Usuarios", icon: Users, href: "/dashboard/usuarios" },
    sucursales: {
      label: "Sucursales",
      icon: MapPin,
      href: "/dashboard/sucursales",
    },
    metricas: {
      label: "Metricas",
      icon: BarChart3,
      href: "/dashboard/metricas",
    },
    configuracion: {
      label: "Roles",
      icon: ShieldCheck,
      href: "/dashboard/configuracion",
    },
    tienda: {
      label: "Mi Tienda",
      icon: Store,
      href: "/dashboard/tienda",
    },
  };

export function useSidebarNav(role: Role, config?: Record<Role, RoleConfig>): NavItem[] {
  const areas = getMenuItemsForRole(role, config);
  return areas.map((area) => ({ area, ...NAV_MAP[area] }));
}
