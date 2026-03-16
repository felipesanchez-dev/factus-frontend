/** Minimal layout item shape matching react-grid-layout's Layout. */
export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

/** Every widget in the dashboard has a unique string identifier. */
export type WidgetId =
  | "welcome-banner"
  | "kpi-users"
  | "kpi-branches"
  | "chart-invoices-bar"
  | "chart-daily-revenue"
  | "chart-tax-vs-revenue"
  | "table-recent-invoices"
  | "table-top-clients";

/** Metadata for a widget type. */
export interface WidgetConfig {
  id: WidgetId;
  title: string;
  description?: string;
  category: "kpi" | "chart" | "table" | "banner";
  minW: number;
  minH: number;
  defaultVisible: boolean;
}

/** Persisted layout state saved in localStorage. */
export interface DashboardLayoutState {
  layouts: Record<string, GridLayoutItem[]>;
  hiddenWidgets: WidgetId[];
  version: number;
}
