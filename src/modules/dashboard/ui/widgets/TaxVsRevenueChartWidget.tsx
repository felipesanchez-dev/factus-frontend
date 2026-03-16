"use client";

import { BarChart3 } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { TaxVsRevenueChart } from "../charts/TaxVsRevenueChart";
import type { MonthlyData } from "../../domain/dashboard.types";

interface Props {
  data: MonthlyData[];
  isEditing: boolean;
  onRemove?: () => void;
}

export function TaxVsRevenueChartWidget({ data, isEditing, onRemove }: Props) {
  return (
    <WidgetWrapper
      title="Ingresos vs Impuestos"
      description="Comparativa mensual"
      icon={<BarChart3 className="h-4 w-4" />}
      isEditing={isEditing}
      onRemove={onRemove}
      noPadding
    >
      <div className="h-full px-3 pb-3">
        <TaxVsRevenueChart data={data} bare />
      </div>
    </WidgetWrapper>
  );
}
