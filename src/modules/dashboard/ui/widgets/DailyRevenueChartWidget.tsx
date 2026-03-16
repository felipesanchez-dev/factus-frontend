"use client";

import { TrendingUp } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { DailyRevenueChart } from "../charts/DailyRevenueChart";

interface Props {
  data: { day: string; revenue: number }[];
  isEditing: boolean;
  onRemove?: () => void;
}

export function DailyRevenueChartWidget({ data, isEditing, onRemove }: Props) {
  return (
    <WidgetWrapper
      title="Ventas Diarias"
      description="Tendencia de ingresos ultimos dias"
      icon={<TrendingUp className="h-4 w-4" />}
      isEditing={isEditing}
      onRemove={onRemove}
      noPadding
    >
      <div className="h-full px-3 pb-3">
        <DailyRevenueChart data={data} bare />
      </div>
    </WidgetWrapper>
  );
}
