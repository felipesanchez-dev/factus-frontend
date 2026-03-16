"use client";

import { Receipt } from "lucide-react";
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

export function KpiTaxWidget({ data, isEditing, onRemove }: Props) {
  return (
    <WidgetWrapper isEditing={isEditing} onRemove={onRemove}>
      <div className="flex items-start justify-between h-full">
        <div className="flex flex-col justify-center h-full">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            IVA Estimado
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data.totalTax)}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Estimado sobre facturas validadas
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-2.5 text-amber-600 dark:text-amber-400">
          <Receipt className="h-5 w-5" />
        </div>
      </div>
    </WidgetWrapper>
  );
}
