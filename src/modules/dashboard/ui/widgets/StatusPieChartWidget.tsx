"use client";

import { PieChart } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { StatusPieChart } from "../charts/StatusPieChart";
import type { StatusBreakdown } from "../../domain/dashboard.types";

interface Props {
  data: StatusBreakdown[];
  isEditing: boolean;
  onRemove?: () => void;
}

export function StatusPieChartWidget({ data, isEditing, onRemove }: Props) {
  return (
    <WidgetWrapper
      title="Estado de Facturas"
      description="Distribucion por estado DIAN"
      icon={<PieChart className="h-4 w-4" />}
      isEditing={isEditing}
      onRemove={onRemove}
      noPadding
    >
      <div className="h-full px-3 pb-3">
        <StatusPieChart data={data} bare />
      </div>
    </WidgetWrapper>
  );
}
