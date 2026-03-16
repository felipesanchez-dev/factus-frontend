import type { WidgetId, WidgetConfig, GridLayoutItem } from "./grid.types";

export const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480 };
export const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 2 };
export const GRID_ROW_HEIGHT = 60;
export const GRID_MARGIN: [number, number] = [16, 16];
export const LAYOUT_STORAGE_KEY = "factus_dashboard_layout";
export const LAYOUT_VERSION = 8;

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
  { i: "welcome-banner", x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
  { i: "kpi-users", x: 0, y: 2, w: 6, h: 2, minW: 2, minH: 2 },
  { i: "kpi-branches", x: 6, y: 2, w: 6, h: 2, minW: 2, minH: 2 },
  { i: "table-recent-invoices", x: 0, y: 4, w: 12, h: 8, minW: 6, minH: 6 },
  { i: "table-top-clients", x: 0, y: 12, w: 12, h: 7, minW: 4, minH: 6 },
  { i: "chart-invoices-bar", x: 0, y: 19, w: 6, h: 5, minW: 4, minH: 5 },
  { i: "chart-daily-revenue", x: 6, y: 19, w: 6, h: 5, minW: 4, minH: 5 },
  { i: "chart-tax-vs-revenue", x: 0, y: 24, w: 12, h: 5, minW: 4, minH: 5 },
];

/** Default layout for md (10 cols). */
export const DEFAULT_LAYOUT_MD: GridLayoutItem[] = [
  { i: "welcome-banner", x: 0, y: 0, w: 10, h: 2, minW: 6, minH: 2 },
  { i: "kpi-users", x: 0, y: 2, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "kpi-branches", x: 5, y: 2, w: 5, h: 2, minW: 2, minH: 2 },
  { i: "table-recent-invoices", x: 0, y: 4, w: 10, h: 8, minW: 6, minH: 6 },
  { i: "table-top-clients", x: 0, y: 12, w: 10, h: 7, minW: 4, minH: 6 },
  { i: "chart-invoices-bar", x: 0, y: 19, w: 10, h: 5, minW: 4, minH: 5 },
  { i: "chart-daily-revenue", x: 0, y: 24, w: 10, h: 5, minW: 4, minH: 5 },
  { i: "chart-tax-vs-revenue", x: 0, y: 29, w: 10, h: 5, minW: 4, minH: 5 },
];

/** Default layout for sm (6 cols). */
export const DEFAULT_LAYOUT_SM: GridLayoutItem[] = [
  { i: "welcome-banner", x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
  { i: "kpi-users", x: 0, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "kpi-branches", x: 3, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "table-recent-invoices", x: 0, y: 4, w: 6, h: 8, minW: 4, minH: 6 },
  { i: "table-top-clients", x: 0, y: 12, w: 6, h: 7, minW: 4, minH: 6 },
  { i: "chart-invoices-bar", x: 0, y: 19, w: 6, h: 5, minW: 4, minH: 5 },
  { i: "chart-daily-revenue", x: 0, y: 24, w: 6, h: 5, minW: 4, minH: 5 },
  { i: "chart-tax-vs-revenue", x: 0, y: 29, w: 6, h: 5, minW: 4, minH: 5 },
];

/** Default layout for xs (2 cols) — fully stacked mobile. */
export const DEFAULT_LAYOUT_XS: GridLayoutItem[] = [
  { i: "welcome-banner", x: 0, y: 0, w: 2, h: 3, minW: 2, minH: 2 },
  { i: "kpi-users", x: 0, y: 3, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "kpi-branches", x: 0, y: 5, w: 2, h: 2, minW: 2, minH: 2 },
  { i: "table-recent-invoices", x: 0, y: 7, w: 2, h: 8, minW: 2, minH: 6 },
  { i: "table-top-clients", x: 0, y: 15, w: 2, h: 7, minW: 2, minH: 6 },
  { i: "chart-invoices-bar", x: 0, y: 22, w: 2, h: 5, minW: 2, minH: 5 },
  { i: "chart-daily-revenue", x: 0, y: 27, w: 2, h: 5, minW: 2, minH: 5 },
  { i: "chart-tax-vs-revenue", x: 0, y: 32, w: 2, h: 5, minW: 2, minH: 5 },
];

export const DEFAULT_LAYOUTS: Record<string, GridLayoutItem[]> = {
  lg: DEFAULT_LAYOUT_LG,
  md: DEFAULT_LAYOUT_MD,
  sm: DEFAULT_LAYOUT_SM,
  xs: DEFAULT_LAYOUT_XS,
};
