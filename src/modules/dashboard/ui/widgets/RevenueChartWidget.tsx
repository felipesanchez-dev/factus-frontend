"use client";

import { AreaChart as AreaChartIcon } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { RevenueChart } from "../charts/RevenueChart";
import type { MonthlyData } from "../../domain/dashboard.types";

interface Props {
  data: MonthlyData[];
  isEditing: boolean;
  onRemove?: () => void;
}

export function RevenueChartWidget({ data, isEditing, onRemove }: Props) {
  return (
    <WidgetWrapper
      title="Ingresos Mensuales"
      description="Evolucion de ingresos por facturacion"
      icon={<AreaChartIcon className="h-4 w-4" />}
      isEditing={isEditing}
      onRemove={onRemove}
      noPadding
    >
      <div className="h-full px-3 pb-3">
        <RevenueChart data={data} bare />
      </div>
    </WidgetWrapper>
  );
}
