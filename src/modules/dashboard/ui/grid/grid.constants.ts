import type { WidgetId, WidgetConfig, GridLayoutItem } from "./grid.types";

export const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480 };
export const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 2 };
export const GRID_ROW_HEIGHT = 60;
export const GRID_MARGIN: [number, number] = [16, 16];
export const LAYOUT_STORAGE_KEY = "factus_dashboard_layout";
export const LAYOUT_VERSION = 3;

/** Widget metadata registry. */
export const WIDGET_CONFIGS: Record<WidgetId, WidgetConfig> = {
  "welcome-banner": {
    id: "welcome-banner",
    title: "Banner de Bienvenida",
    category: "banner",
    minW: 6,
    minH: 2,
    defaultVisible: true,
  },
  "kpi-invoices": {
    id: "kpi-invoices",
    title: "Total Facturas",
    category: "kpi",
    minW: 2,
    minH: 2,
    defaultVisible: true,
  },
  "kpi-revenue": {
    id: "kpi-revenue",
    title: "Ingresos",
    category: "kpi",
    minW: 2,
    minH: 2,
    defaultVisible: true,
  },
  "kpi-tax": {
    id: "kpi-tax",
    title: "IVA Estimado",
    category: "kpi",
    minW: 2,
    minH: 2,
    defaultVisible: true,
  },
  "kpi-avg-value": {
    id: "kpi-avg-value",
    title: "Promedio / Factura",
    category: "kpi",
    minW: 2,
    minH: 2,
    defaultVisible: true,
  },
  "kpi-users": {
    id: "kpi-users",
    title: "Usuarios",
    category: "kpi",
    minW: 2,
    minH: 2,
    defaultVisible: true,
  },
  "kpi-branches": {
    id: "kpi-branches",
    title: "Sucursales",
    category: "kpi",
    minW: 2,
    minH: 2,
    defaultVisible: true,
  },
  "kpi-company": {
    id: "kpi-company",
    title: "Empresa",
    category: "kpi",
    minW: 2,
    minH: 2,
    defaultVisible: true,
  },
  "kpi-api": {
    id: "kpi-api",
    title: "API FACTUS",
    category: "kpi",
    minW: 2,
    minH: 2,
    defaultVisible: true,
  },
  "client-of-month": {
    id: "client-of-month",
    title: "Cliente del Mes",
    description: "Cliente con mayor facturacion del mes",
    category: "kpi",
    minW: 3,
    minH: 3,
    defaultVisible: true,
  },
  "chart-revenue": {
    id: "chart-revenue",
    title: "Ingresos Mensuales",
    description: "Evolucion de ingresos por facturacion",
    category: "chart",
    minW: 4,
    minH: 5,
    defaultVisible: true,
  },
  "chart-invoices-bar": {
    id: "chart-invoices-bar",
    title: "Facturas por Mes",
    description: "Cantidad de facturas emitidas",
    category: "chart",
    minW: 4,
    minH: 5,
    defaultVisible: true,
  },
  "chart-daily-revenue": {
    id: "chart-daily-revenue",
    title: "Ventas Diarias",
    description: "Ingresos de los ultimos 30 dias",
    category: "chart",
    minW: 4,
    minH: 5,
    defaultVisible: true,
  },
  "chart-status-pie": {
    id: "chart-status-pie",
    title: "Estado de Facturas",
    description: "Distribucion por estado",
    category: "chart",
    minW: 3,
    minH: 5,
    defaultVisible: true,
  },
  "chart-tax-vs-revenue": {
    id: "chart-tax-vs-revenue",
    title: "Ingresos vs Impuestos",
    description: "Comparacion mensual",
    category: "chart",
    minW: 4,
    minH: 5,
    defaultVisible: true,
  },
  "table-recent-invoices": {
    id: "table-recent-invoices",
    title: "Facturas Recientes",
    description: "Ultimas facturas emitidas",
    category: "table",
    minW: 6,
    minH: 6,
    defaultVisible: true,
  },
  "table-top-clients": {
    id: "table-top-clients",
    title: "Top Clientes",
    description: "Mejores clientes por ingresos",
    category: "table",
    minW: 4,
    minH: 6,
    defaultVisible: true,
  },
};

/** Default layout for lg (12 cols). */
export const DEFAULT_LAYOUT_LG: GridLayoutItem[] = [
  // Row 0-1: Welcome banner full width
  { i: "welcome-banner", x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
  // Row 2-3: KPI cards — 4 across
  { i: "kpi-invoices", x: 0, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-revenue", x: 3, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-tax", x: 6, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-avg-value", x: 9, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
  // Row 4-5: System KPIs — 4 across
  { i: "kpi-users", x: 0, y: 4, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-branches", x: 3, y: 4, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-company", x: 6, y: 4, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-api", x: 9, y: 4, w: 3, h: 2, minW: 2, minH: 2 },
  // Row 6-13: Recent invoices table — full width, right below KPIs
  { i: "table-recent-invoices", x: 0, y: 6, w: 12, h: 8, minW: 6, minH: 6 },
  // Row 14-16: Client of the month + Top clients
  { i: "client-of-month", x: 0, y: 14, w: 4, h: 3, minW: 3, minH: 3 },
  { i: "table-top-clients", x: 4, y: 14, w: 8, h: 7, minW: 4, minH: 6 },
  // Row 21-25: Charts row 1
  { i: "chart-revenue", x: 0, y: 21, w: 4, h: 5, minW: 4, minH: 5 },
  { i: "chart-invoices-bar", x: 4, y: 21, w: 4, h: 5, minW: 4, minH: 5 },
  { i: "chart-daily-revenue", x: 8, y: 21, w: 4, h: 5, minW: 4, minH: 5 },
  // Row 26-30: Charts row 2
  { i: "chart-status-pie", x: 0, y: 26, w: 4, h: 5, minW: 3, minH: 5 },
  { i: "chart-tax-vs-revenue", x: 4, y: 26, w: 8, h: 5, minW: 4, minH: 5 },
];

/** Default layout for md (10 cols). */
export const DEFAULT_LAYOUT_MD: GridLayoutItem[] = [
  { i: "welcome-banner", x: 0, y: 0, w: 10, h: 2, minW: 6, minH: 2 },
  { i: "kpi-invoices", x: 0, y: 2, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "kpi-revenue", x: 5, y: 2, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "kpi-tax", x: 0, y: 4, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "kpi-avg-value", x: 5, y: 4, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "kpi-users", x: 0, y: 6, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "kpi-branches", x: 5, y: 6, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "kpi-company", x: 0, y: 8, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "kpi-api", x: 5, y: 8, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "table-recent-invoices", x: 0, y: 10, w: 10, h: 8, minW: 6, minH: 6 },
  { i: "client-of-month", x: 0, y: 18, w: 10, h: 3, minW: 3, minH: 3 },
  { i: "table-top-clients", x: 0, y: 21, w: 10, h: 7, minW: 4, minH: 6 },
  { i: "chart-revenue", x: 0, y: 28, w: 10, h: 5, minW: 4, minH: 5 },
  { i: "chart-invoices-bar", x: 0, y: 33, w: 10, h: 5, minW: 4, minH: 5 },
  { i: "chart-daily-revenue", x: 0, y: 38, w: 10, h: 5, minW: 4, minH: 5 },
  { i: "chart-status-pie", x: 0, y: 43, w: 10, h: 5, minW: 3, minH: 5 },
  { i: "chart-tax-vs-revenue", x: 0, y: 48, w: 10, h: 5, minW: 4, minH: 5 },
];

/** Default layout for sm (6 cols). */
export const DEFAULT_LAYOUT_SM: GridLayoutItem[] = [
  { i: "welcome-banner", x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
  { i: "kpi-invoices", x: 0, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-revenue", x: 3, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-tax", x: 0, y: 4, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-avg-value", x: 3, y: 4, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-users", x: 0, y: 6, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-branches", x: 3, y: 6, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-company", x: 0, y: 8, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-api", x: 3, y: 8, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "table-recent-invoices", x: 0, y: 10, w: 6, h: 8, minW: 4, minH: 6 },
  { i: "client-of-month", x: 0, y: 18, w: 6, h: 3, minW: 3, minH: 3 },
  { i: "table-top-clients", x: 0, y: 21, w: 6, h: 7, minW: 4, minH: 6 },
  { i: "chart-revenue", x: 0, y: 28, w: 6, h: 5, minW: 4, minH: 5 },
  { i: "chart-invoices-bar", x: 0, y: 33, w: 6, h: 5, minW: 4, minH: 5 },
  { i: "chart-daily-revenue", x: 0, y: 38, w: 6, h: 5, minW: 4, minH: 5 },
  { i: "chart-status-pie", x: 0, y: 43, w: 6, h: 5, minW: 3, minH: 5 },
  { i: "chart-tax-vs-revenue", x: 0, y: 48, w: 6, h: 5, minW: 4, minH: 5 },
];

/** Default layout for xs (2 cols) — fully stacked mobile. */
export const DEFAULT_LAYOUT_XS: GridLayoutItem[] = [
  { i: "welcome-banner", x: 0, y: 0, w: 2, h: 3, minW: 2, minH: 2 },
  { i: "kpi-invoices", x: 0, y: 3, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "kpi-revenue", x: 0, y: 5, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "kpi-tax", x: 0, y: 7, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "kpi-avg-value", x: 0, y: 9, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "kpi-users", x: 0, y: 11, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "kpi-branches", x: 0, y: 13, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "kpi-company", x: 0, y: 15, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "kpi-api", x: 0, y: 17, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "table-recent-invoices", x: 0, y: 19, w: 2, h: 8, minW: 2, minH: 6 },
  { i: "client-of-month", x: 0, y: 27, w: 2, h: 3, minW: 2, minH: 3 },
  { i: "table-top-clients", x: 0, y: 30, w: 2, h: 7, minW: 2, minH: 6 },
  { i: "chart-revenue", x: 0, y: 37, w: 2, h: 5, minW: 2, minH: 5 },
  { i: "chart-invoices-bar", x: 0, y: 42, w: 2, h: 5, minW: 2, minH: 5 },
  { i: "chart-daily-revenue", x: 0, y: 47, w: 2, h: 5, minW: 2, minH: 5 },
  { i: "chart-status-pie", x: 0, y: 52, w: 2, h: 5, minW: 2, minH: 5 },
  { i: "chart-tax-vs-revenue", x: 0, y: 57, w: 2, h: 5, minW: 2, minH: 5 },
];

export const DEFAULT_LAYOUTS: Record<string, GridLayoutItem[]> = {
  lg: DEFAULT_LAYOUT_LG,
  md: DEFAULT_LAYOUT_MD,
  sm: DEFAULT_LAYOUT_SM,
  xs: DEFAULT_LAYOUT_XS,
};
