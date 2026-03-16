"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { useDashboard } from "./useDashboardMetrics";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DashboardGrid } from "./grid/DashboardGrid";
import { DashboardGridToolbar } from "./grid/DashboardGridToolbar";
import { useGridLayout } from "./grid/useGridLayout";
import type { WidgetId } from "./grid/grid.types";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import { InvoicePreviewModal } from "./InvoicePreviewModal";

// Widgets
import { WelcomeBannerWidget } from "./widgets/WelcomeBannerWidget";
import { KpiInvoicesWidget } from "./widgets/KpiInvoicesWidget";
import { KpiRevenueWidget } from "./widgets/KpiRevenueWidget";
import { KpiTaxWidget } from "./widgets/KpiTaxWidget";
import { KpiAvgValueWidget } from "./widgets/KpiAvgValueWidget";
import { KpiSystemWidget } from "./widgets/KpiSystemWidget";
import { RevenueChartWidget } from "./widgets/RevenueChartWidget";
import { InvoicesBarChartWidget } from "./widgets/InvoicesBarChartWidget";
import { DailyRevenueChartWidget } from "./widgets/DailyRevenueChartWidget";
import { StatusPieChartWidget } from "./widgets/StatusPieChartWidget";
import { TaxVsRevenueChartWidget } from "./widgets/TaxVsRevenueChartWidget";
import { RecentInvoicesWidget } from "./widgets/RecentInvoicesWidget";
import { TopClientsWidget } from "./widgets/TopClientsWidget";

export function DashboardOverview() {
  const { data, loading, error } = useDashboard();
  const gridLayout = useGridLayout();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [previewBill, setPreviewBill] = useState<string | null>(null);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Error al cargar datos
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              {error || "Intenta recargar la pagina"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const { system, invoices } = data;

  function renderWidget(widgetId: WidgetId): React.ReactNode {
    const common = {
      isEditing: gridLayout.isEditing,
      onRemove: () => gridLayout.toggleWidget(widgetId),
    };

    switch (widgetId) {
      case "welcome-banner":
        return <WelcomeBannerWidget {...common} system={system} />;
      case "kpi-invoices":
        return <KpiInvoicesWidget {...common} data={invoices} />;
      case "kpi-revenue":
        return <KpiRevenueWidget {...common} data={invoices} />;
      case "kpi-tax":
        return <KpiTaxWidget {...common} data={invoices} />;
      case "kpi-avg-value":
        return <KpiAvgValueWidget {...common} data={invoices} />;
      case "kpi-users":
        return (
          <KpiSystemWidget
            {...common}
            variant="users"
            system={system}
            invoices={invoices}
          />
        );
      case "kpi-branches":
        return (
          <KpiSystemWidget
            {...common}
            variant="branches"
            system={system}
            invoices={invoices}
          />
        );
      case "kpi-company":
        return (
          <KpiSystemWidget
            {...common}
            variant="company"
            system={system}
            invoices={invoices}
          />
        );
      case "kpi-api":
        return (
          <KpiSystemWidget
            {...common}
            variant="api"
            system={system}
            invoices={invoices}
          />
        );
      case "chart-revenue":
        return <RevenueChartWidget {...common} data={invoices.monthlyData} />;
      case "chart-invoices-bar":
        return (
          <InvoicesBarChartWidget {...common} data={invoices.monthlyData} />
        );
      case "chart-daily-revenue":
        return (
          <DailyRevenueChartWidget {...common} data={invoices.dailyRevenue} />
        );
      case "chart-status-pie":
        return (
          <StatusPieChartWidget {...common} data={invoices.statusBreakdown} />
        );
      case "chart-tax-vs-revenue":
        return (
          <TaxVsRevenueChartWidget {...common} data={invoices.monthlyData} />
        );
      case "table-recent-invoices":
        return (
          <RecentInvoicesWidget
            {...common}
            invoices={invoices.recentInvoices}
            onViewDetail={setSelectedBill}
            onPreview={setPreviewBill}
          />
        );
      case "table-top-clients":
        return (
          <TopClientsWidget {...common} initialClients={invoices.topClients} />
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-4">
      <DashboardGridToolbar
        isEditing={gridLayout.isEditing}
        onToggleEdit={() => gridLayout.setIsEditing(!gridLayout.isEditing)}
        onReset={gridLayout.resetLayout}
        hiddenWidgets={gridLayout.hiddenWidgets}
        onToggleWidget={gridLayout.toggleWidget}
      />

      <DashboardGrid
        layouts={gridLayout.layouts}
        visibleWidgets={gridLayout.visibleWidgets}
        isEditing={gridLayout.isEditing}
        onLayoutChange={gridLayout.onLayoutChange}
        renderWidget={renderWidget}
      />

      <InvoiceDetailModal
        billNumber={selectedBill}
        onClose={() => setSelectedBill(null)}
      />
      <InvoicePreviewModal
        billNumber={previewBill}
        onClose={() => setPreviewBill(null)}
      />
    </div>
  );
}
