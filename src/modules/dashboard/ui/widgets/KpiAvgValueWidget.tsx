"use client";

import { TrendingUp } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import type { InvoiceMetrics } from "../../domain/dashboard.types";

interface Props {
  data: InvoiceMetrics;
  isEditing: boolean;
  onRemove?: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function KpiAvgValueWidget({ data, isEditing, onRemove }: Props) {
  return (
    <WidgetWrapper isEditing={isEditing} onRemove={onRemove}>
      <div className="flex items-start justify-between h-full">
        <div className="flex flex-col justify-center h-full">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Promedio / Factura
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data.avgInvoiceValue)}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Valor promedio por factura
          </p>
        </div>
        <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 p-2.5 text-violet-600 dark:text-violet-400">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
    </WidgetWrapper>
  );
}
