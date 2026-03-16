"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import type { RecentInvoice } from "../domain/dashboard.types";
import { getRecentInvoicesAction } from "../infrastructure/dashboard.actions";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "danger" | "default" | "info"
> = {
  Validada: "success",
  Pendiente: "warning",
  Rechazada: "danger",
  Anulada: "default",
  Emitida: "info",
};

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
const REFRESH_INTERVAL_MS = 10_000;

interface RecentInvoicesTableProps {
  invoices: RecentInvoice[];
  onViewDetail: (billNumber: string) => void;
  onPreview: (billNumber: string) => void;
}

export function RecentInvoicesTable({
  invoices,
  onViewDetail,
  onPreview,
}: RecentInvoicesTableProps) {
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [liveInvoices, setLiveInvoices] = useState<RecentInvoice[]>(invoices);
  const [refreshing, setRefreshing] = useState(false);
  const isFetchingRef = useRef(false);

  const totalPages = Math.max(1, Math.ceil(liveInvoices.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const refreshInvoices = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setRefreshing(true);

    try {
      const result = await getRecentInvoicesAction(50);
      if (result.success) {
        setLiveInvoices(result.invoices);
      }
    } finally {
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshInvoices();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshInvoices]);

  const paginatedInvoices = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return liveInvoices.slice(start, start + pageSize);
  }, [liveInvoices, safeCurrentPage, pageSize]);

  const from =
    liveInvoices.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const to = Math.min(safeCurrentPage * pageSize, liveInvoices.length);

  function handlePageSizeChange(newSize: number) {
    setPageSize(newSize);
    setCurrentPage(1);
  }

  return (
    <Card>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
            Facturas Recientes
          </h3>
          <p className='text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5'>
            Click en una factura para ver detalle completo
            {refreshing && (
              <>
                <span>&middot;</span>
                <Loader2 className='h-3 w-3 animate-spin text-blue-500' />
                <span className='text-blue-500 dark:text-blue-400'>
                  Actualizando...
                </span>
              </>
            )}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-xs text-gray-400 dark:text-gray-500'>
            Mostrar
          </label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className='rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none'
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {liveInvoices.length === 0 ? (
        <div className='py-8 text-center text-sm text-gray-400 dark:text-gray-500'>
          No hay facturas recientes
        </div>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-100 dark:border-gray-800'>
                  <th className='pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                    No. Factura
                  </th>
                  <th className='pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                    Cliente
                  </th>
                  <th className='pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                    Pago
                  </th>
                  <th className='pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                    Fecha
                  </th>
                  <th className='pb-2 text-right text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                    Total
                  </th>
                  <th className='pb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                    Estado
                  </th>
                  <th className='pb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50 dark:divide-gray-800'>
                {paginatedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onViewDetail(inv.number)}
                    className='hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer group'
                  >
                    <td className='py-2.5'>
                      <div className='flex items-center gap-1.5'>
                        <span className='font-mono text-xs text-gray-700 dark:text-gray-300 font-medium'>
                          {inv.number}
                        </span>
                        {inv.hasErrors && (
                          <AlertTriangle className='h-3 w-3 text-amber-500' />
                        )}
                      </div>
                    </td>
                    <td className='py-2.5 max-w-xs'>
                      <p className='text-gray-900 dark:text-gray-100 truncate text-xs'>
                        {inv.clientName}
                      </p>
                      <p className='text-gray-400 dark:text-gray-500 text-xs truncate'>
                        {inv.clientDocument}
                      </p>
                    </td>
                    <td className='py-2.5 text-xs text-gray-500 dark:text-gray-400'>
                      {inv.paymentForm}
                    </td>
                    <td className='py-2.5 text-xs text-gray-500 dark:text-gray-400'>
                      {inv.date}
                    </td>
                    <td className='py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100 text-xs'>
                      {formatCurrency(inv.total)}
                    </td>
                    <td className='py-2.5 text-center'>
                      <Badge
                        variant={STATUS_VARIANT[inv.statusLabel] || "default"}
                      >
                        {inv.statusLabel}
                      </Badge>
                    </td>
                    <td className='py-2.5'>
                      <div className='flex items-center justify-center gap-1'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(inv.number);
                          }}
                          className='rounded-md p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors'
                          title='Ver detalle'
                        >
                          <Eye className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors' />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreview(inv.number);
                          }}
                          className='rounded-md p-1 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors'
                          title='Ver PDF'
                        >
                          <FileText className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className='flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-3'>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              {from}-{to} de {liveInvoices.length} facturas
            </p>

            <div className='flex items-center gap-1'>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className='rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  return Math.abs(page - safeCurrentPage) <= 1;
                })
                .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) acc.push("...");
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className='px-1 text-xs text-gray-300 dark:text-gray-600'
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`min-w-7 rounded px-1.5 py-1 text-xs font-medium transition-colors ${
                        item === safeCurrentPage
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safeCurrentPage >= totalPages}
                className='rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
