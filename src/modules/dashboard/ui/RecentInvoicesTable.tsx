"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import type { InvoicePageParams } from "../domain/dashboard.types";
import { listInvoicesPageAction } from "../infrastructure/dashboard.actions";
import type { RecentInvoice } from "../domain/dashboard.types";

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

const STATUS_OPTIONS: { label: string; value: 0 | 1 | 2 | undefined }[] = [
  { label: "Todos", value: undefined },
  { label: "Validada", value: 1 },
  { label: "Pendiente", value: 0 },
  { label: "Rechazada", value: 2 },
];

const REFRESH_INTERVAL_MS = 10_000;
const DEBOUNCE_MS = 500;

interface RecentInvoicesTableProps {
  onViewDetail: (billNumber: string) => void;
  onPreview: (billNumber: string) => void;
}

export function RecentInvoicesTable({
  onViewDetail,
  onPreview,
}: RecentInvoicesTableProps) {
  const [invoices, setInvoices] = useState<RecentInvoice[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<0 | 1 | 2 | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);

  const isFetchingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search text
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  // Reset page on status change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Build filter params
  const filterParams = useMemo((): InvoicePageParams => {
    const params: InvoicePageParams = {
      page: currentPage,
      status: statusFilter,
    };

    const text = debouncedSearch.trim();
    if (text) {
      if (/^\d+$/.test(text)) {
        params.identification = text;
      } else {
        params.names = text;
      }
    }

    return params;
  }, [currentPage, statusFilter, debouncedSearch]);

  // Fetch invoices
  const fetchInvoices = useCallback(
    async (isBackground: boolean) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      try {
        const result = await listInvoicesPageAction(filterParams);
        setInvoices(result.invoices);
        setPagination(result.pagination);
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [filterParams],
  );

  // Fetch on params change
  useEffect(() => {
    void fetchInvoices(false);
  }, [fetchInvoices]);

  // Auto-refresh polling
  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchInvoices(true);
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchInvoices]);

  const hasFilters = debouncedSearch !== "" || statusFilter !== undefined;

  const from =
    pagination.total === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.perPage + 1;
  const to = Math.min(
    pagination.currentPage * pagination.perPage,
    pagination.total,
  );

  function clearFilters() {
    setSearchText("");
    setDebouncedSearch("");
    setStatusFilter(undefined);
    setCurrentPage(1);
  }

  return (
    <Card>
      {/* Header + Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Facturas Recientes
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              {pagination.total.toLocaleString("es-CO")} facturas en total
              {refreshing && (
                <>
                  <span>&middot;</span>
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                </>
              )}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 pr-8 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === opt.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Cargando facturas...
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          {hasFilters
            ? "No se encontraron facturas con los filtros aplicados"
            : "No hay facturas recientes"}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    No. Factura
                  </th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Cliente
                  </th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Pago
                  </th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Fecha
                  </th>
                  <th className="pb-2 text-right text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Total
                  </th>
                  <th className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Estado
                  </th>
                  <th className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onViewDetail(inv.number)}
                    className="hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-700 dark:text-gray-300 font-medium">
                          {inv.number}
                        </span>
                        {inv.hasErrors && (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 max-w-xs">
                      <p className="text-gray-900 dark:text-gray-100 truncate text-xs">
                        {inv.clientName}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs truncate">
                        {inv.clientDocument}
                      </p>
                    </td>
                    <td className="py-2.5 text-xs text-gray-500 dark:text-gray-400">
                      {inv.paymentForm}
                    </td>
                    <td className="py-2.5 text-xs text-gray-500 dark:text-gray-400">
                      {inv.date}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100 text-xs">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-2.5 text-center">
                      <Badge
                        variant={STATUS_VARIANT[inv.statusLabel] || "default"}
                      >
                        {inv.statusLabel}
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(inv.number);
                          }}
                          className="rounded-md p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreview(inv.number);
                          }}
                          className="rounded-md p-1 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          title="Ver PDF"
                        >
                          <FileText className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {from}-{to} de {pagination.total.toLocaleString("es-CO")} facturas
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                .filter((page) => {
                  if (pagination.lastPage <= 5) return true;
                  if (page === 1 || page === pagination.lastPage) return true;
                  return Math.abs(page - currentPage) <= 1;
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
                      className="px-1 text-xs text-gray-300 dark:text-gray-600"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`min-w-7 rounded px-1.5 py-1 text-xs font-medium transition-colors ${
                        item === currentPage
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
                  setCurrentPage((p) => Math.min(pagination.lastPage, p + 1))
                }
                disabled={currentPage >= pagination.lastPage}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
