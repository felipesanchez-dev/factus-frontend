"use client";

import { BarChart3 } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { InvoicesBarChart } from "../charts/InvoicesBarChart";
import type { MonthlyData } from "../../domain/dashboard.types";

interface Props {
  data: MonthlyData[];
  isEditing: boolean;
  onRemove?: () => void;
}

export function InvoicesBarChartWidget({ data, isEditing, onRemove }: Props) {
  return (
    <WidgetWrapper
      title="Facturas por Mes"
      description="Cantidad de facturas electronicas generadas"
      icon={<BarChart3 className="h-4 w-4" />}
      isEditing={isEditing}
      onRemove={onRemove}
      noPadding
    >
      <div className="h-full px-3 pb-3">
        <InvoicesBarChart data={data} bare />
      </div>
    </WidgetWrapper>
  );
}
