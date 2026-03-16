"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/shared/components/Card";
import {
  getTopClientsAction,
  type TopClientsResult,
} from "../infrastructure/dashboard.actions";
import type { TopClient } from "../domain/dashboard.types";

type DateRange = "month" | "quarter" | "semester" | "year";

const RANGE_LABELS: Record<DateRange, string> = {
  month: "Mes",
  quarter: "Trimestre",
  semester: "Semestre",
  year: "Año",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface TopClientsTableProps {
  initialClients: TopClient[];
}

export function TopClientsTable({ initialClients }: TopClientsTableProps) {
  const [range, setRange] = useState<DateRange>("month");
  const [clients, setClients] = useState<TopClient[]>(initialClients);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const latestRequestRef = useRef(0);
  const cacheRef = useRef(new Map<DateRange, TopClientsResult>());

  const fetchClients = useCallback(async (r: DateRange, force = false) => {
    const cached = cacheRef.current.get(r);
    if (cached && !force) {
      setClients(cached.clients);
      setAnalyzed(cached.totalBillsAnalyzed);
      setError(null);
      return;
    }

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setLoading(true);
    setError(null);

    try {
      const result: TopClientsResult = await getTopClientsAction(r);
      if (latestRequestRef.current !== requestId) return;

      cacheRef.current.set(r, result);
      setClients(result.clients);
      setAnalyzed(result.totalBillsAnalyzed);
    } catch {
      if (latestRequestRef.current !== requestId) return;
      setError("No se pudo actualizar. Mostrando los ultimos datos.");
    } finally {
      if (latestRequestRef.current !== requestId) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClients(range);
  }, [range, fetchClients]);

  const maxTotal = Math.max(...clients.map((c) => c.total), 1);

  return (
    <Card>
      <div className='mb-4'>
        <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
          Top Clientes
        </h3>
        <p className='text-xs text-gray-400 dark:text-gray-500 mb-3'>
          Clientes con mayor volumen de facturacion
        </p>
        <div className='flex flex-wrap gap-1'>
          {(Object.keys(RANGE_LABELS) as DateRange[]).map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                range === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {RANGE_LABELS[key]}
            </button>
          ))}
        </div>
        {loading && clients.length > 0 && (
          <p className='mt-2 text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1'>
            <Loader2 className='h-3 w-3 animate-spin' />
            Actualizando datos...
          </p>
        )}
        {error && (
          <div className='mt-2 flex items-center justify-between gap-2 text-xs'>
            <span className='text-amber-600 dark:text-amber-400'>{error}</span>
            <button
              onClick={() => void fetchClients(range, true)}
              className='text-blue-600 dark:text-blue-400 font-medium hover:underline'
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      {loading && clients.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8 gap-2'>
          <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
          <p className='text-xs text-gray-400 dark:text-gray-500'>
            Analizando facturas...
          </p>
        </div>
      ) : clients.length === 0 ? (
        <div className='py-8 text-center text-sm text-gray-400 dark:text-gray-500'>
          Sin datos de clientes en este periodo
        </div>
      ) : (
        <>
          <div className='space-y-3'>
            {clients.map((client, i) => (
              <div key={client.document || client.name} className='space-y-1.5'>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                        i === 0
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : i === 1
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            : i === 2
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className='truncate text-gray-900 dark:text-gray-100 font-medium'>
                      {client.name}
                    </span>
                    <span className='text-xs text-gray-400 dark:text-gray-500 shrink-0'>
                      {client.count} fact.
                    </span>
                  </div>
                  <span className='font-semibold text-gray-900 dark:text-gray-100 shrink-0 ml-2'>
                    {formatCurrency(client.total)}
                  </span>
                </div>
                <div className='h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden'>
                  <div
                    className={`h-full rounded-full transition-all ${
                      i === 0
                        ? "bg-linear-to-r from-amber-400 to-amber-500"
                        : i === 1
                          ? "bg-linear-to-r from-gray-400 to-gray-500"
                          : i === 2
                            ? "bg-linear-to-r from-orange-400 to-orange-500"
                            : "bg-linear-to-r from-blue-500 to-indigo-500"
                    }`}
                    style={{ width: `${(client.total / maxTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {analyzed > 0 && (
            <p className='mt-3 text-xs text-gray-400 dark:text-gray-600 text-right'>
              Basado en {analyzed.toLocaleString("es-CO")} facturas
            </p>
          )}
        </>
      )}
    </Card>
  );
}
