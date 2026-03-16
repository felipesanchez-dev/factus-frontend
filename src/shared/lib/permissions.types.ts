export type Role = "super_admin" | "admin_sucursal" | "vendedor" | "visor";

export type Area =
  | "dashboard"
  | "empresa"
  | "productos"
  | "facturacion"
  | "usuarios"
  | "sucursales"
  | "metricas"
  | "configuracion"
  | "tienda";

export type Permission = "read" | "write" | "delete";

export interface RoleConfig {
  label: string;
  areas: Area[];
  permissions: Permission[];
  branchScoped: boolean;
  homePage: Area;
}
