"use client";

import { FileText } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import type { InvoiceMetrics } from "../../domain/dashboard.types";

interface Props {
  data: InvoiceMetrics;
  isEditing: boolean;
  onRemove?: () => void;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(value);
}

export function KpiInvoicesWidget({ data, isEditing, onRemove }: Props) {
  return (
    <WidgetWrapper isEditing={isEditing} onRemove={onRemove}>
      <div className="flex items-start justify-between h-full">
        <div className="flex flex-col justify-center h-full">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Total Facturas
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(data.totalInApi)}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {formatNumber(data.totalFetched)} analizadas en detalle
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-2.5 text-blue-600 dark:text-blue-400">
          <FileText className="h-5 w-5" />
        </div>
      </div>
    </WidgetWrapper>
  );
}
