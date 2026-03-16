"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { getClientOfMonthAction } from "../../infrastructure/dashboard.actions";
import type { ClientOfMonth } from "../../domain/dashboard.types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const REFRESH_INTERVAL = 60_000;

interface Props {
  isEditing: boolean;
  onRemove?: () => void;
}

export function ClientOfMonthWidget({ isEditing, onRemove }: Props) {
  const [client, setClient] = useState<ClientOfMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchClient = useCallback(async (isBackground: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!isBackground) setLoading(true);

    try {
      const result = await getClientOfMonthAction();
      setClient(result);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void fetchClient(false);
  }, [fetchClient]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchClient(true);
    }, REFRESH_INTERVAL);
    return () => window.clearInterval(interval);
  }, [fetchClient]);

  return (
    <WidgetWrapper
      title="Cliente del Mes"
      icon={<Crown className="h-4 w-4" />}
      isEditing={isEditing}
      onRemove={onRemove}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
        </div>
      ) : !client ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Sin datos este mes
          </p>
        </div>
      ) : (
        <div className="flex flex-col justify-center h-full gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 shrink-0">
              <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {client.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {client.document}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(client.total)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {client.count} factura{client.count !== 1 ? "s" : ""} &middot;{" "}
                {client.percentOfTotal}% del total
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
              style={{ width: `${Math.min(client.percentOfTotal, 100)}%` }}
            />
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
}
