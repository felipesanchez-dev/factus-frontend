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
  Filter,
  ChevronDown,
  ChevronUp,
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

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

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const [filterIdentification, setFilterIdentification] = useState("");
  const [filterNames, setFilterNames] = useState("");
  const [filterNumber, setFilterNumber] = useState("");
  const [filterPrefix, setFilterPrefix] = useState("");
  const [filterReferenceCode, setFilterReferenceCode] = useState("");
  const [statusFilter, setStatusFilter] = useState<0 | 1 | 2 | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isFetchingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced versions of filter values
  const [debouncedQuickSearch, setDebouncedQuickSearch] = useState("");
  const [debouncedIdentification, setDebouncedIdentification] = useState("");
  const [debouncedNames, setDebouncedNames] = useState("");
  const [debouncedNumber, setDebouncedNumber] = useState("");
  const [debouncedPrefix, setDebouncedPrefix] = useState("");
  const [debouncedReferenceCode, setDebouncedReferenceCode] = useState("");

  // Debounce all text filters
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuickSearch(quickSearch);
      setDebouncedIdentification(filterIdentification);
      setDebouncedNames(filterNames);
      setDebouncedNumber(filterNumber);
      setDebouncedPrefix(filterPrefix);
      setDebouncedReferenceCode(filterReferenceCode);
      setCurrentPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    quickSearch,
    filterIdentification,
    filterNames,
    filterNumber,
    filterPrefix,
    filterReferenceCode,
  ]);

  // Reset page on status or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, pageSize]);

  // Build filter params
  const filterParams = useMemo((): InvoicePageParams => {
    const params: InvoicePageParams = {
      page: currentPage,
      perPage: pageSize,
      status: statusFilter,
    };

    // If advanced filters are open, use individual fields
    if (showAdvancedFilters) {
      if (debouncedIdentification.trim())
        params.identification = debouncedIdentification.trim();
      if (debouncedNames.trim()) params.names = debouncedNames.trim();
      if (debouncedNumber.trim()) params.number = debouncedNumber.trim();
      if (debouncedPrefix.trim()) params.prefix = debouncedPrefix.trim();
      if (debouncedReferenceCode.trim())
        params.reference_code = debouncedReferenceCode.trim();
    } else {
      // Quick search: detect if it looks like a document/NIT (digits, dots, dashes)
      const text = debouncedQuickSearch.trim();
      if (text) {
        const cleaned = text.replace(/[\s.\-]/g, "");
        if (/^\d+$/.test(cleaned)) {
          params.identification = cleaned;
        } else {
          params.names = text;
        }
      }
    }

    return params;
  }, [
    currentPage,
    pageSize,
    statusFilter,
    showAdvancedFilters,
    debouncedQuickSearch,
    debouncedIdentification,
    debouncedNames,
    debouncedNumber,
    debouncedPrefix,
    debouncedReferenceCode,
  ]);

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

  const hasFilters =
    debouncedQuickSearch !== "" ||
    debouncedIdentification !== "" ||
    debouncedNames !== "" ||
    debouncedNumber !== "" ||
    debouncedPrefix !== "" ||
    debouncedReferenceCode !== "" ||
    statusFilter !== undefined;

  const totalItems = pagination.total;
  const perPage = pagination.perPage || 10;
  const from = totalItems === 0 ? 0 : (pagination.currentPage - 1) * perPage + 1;
  const to = Math.min(pagination.currentPage * perPage, totalItems);

  function clearFilters() {
    setQuickSearch("");
    setDebouncedQuickSearch("");
    setFilterIdentification("");
    setDebouncedIdentification("");
    setFilterNames("");
    setDebouncedNames("");
    setFilterNumber("");
    setDebouncedNumber("");
    setFilterPrefix("");
    setDebouncedPrefix("");
    setFilterReferenceCode("");
    setDebouncedReferenceCode("");
    setStatusFilter(undefined);
    setCurrentPage(1);
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20";

  return (
    <Card>
      {/* Header + Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Facturas Recientes
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                {totalItems.toLocaleString("es-CO")} facturas en total
                {refreshing && (
                  <>
                    <span>&middot;</span>
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  </>
                )}
              </p>
            </div>

            {/* Page size selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Mostrar:
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-1.5 py-0.5 text-xs text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showAdvancedFilters
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filtros Avanzados
            {showAdvancedFilters ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Quick search + Status (always visible) */}
        <div className="flex flex-wrap items-center gap-2">
          {!showAdvancedFilters && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Buscar por nombre o documento..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 pr-8 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
              {quickSearch && (
                <button
                  onClick={() => setQuickSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

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

        {/* Advanced filter panel */}
        {showAdvancedFilters && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Identificacion / NIT
                </label>
                <input
                  type="text"
                  value={filterIdentification}
                  onChange={(e) => setFilterIdentification(e.target.value)}
                  placeholder="Ej: 900123456"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={filterNames}
                  onChange={(e) => setFilterNames(e.target.value)}
                  placeholder="Ej: Juan Perez"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  No. Factura
                </label>
                <input
                  type="text"
                  value={filterNumber}
                  onChange={(e) => setFilterNumber(e.target.value)}
                  placeholder="Ej: 1234"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Prefijo
                </label>
                <input
                  type="text"
                  value={filterPrefix}
                  onChange={(e) => setFilterPrefix(e.target.value)}
                  placeholder="Ej: SETT"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Codigo de Referencia
                </label>
                <input
                  type="text"
                  value={filterReferenceCode}
                  onChange={(e) => setFilterReferenceCode(e.target.value)}
                  placeholder="Ej: REF-001"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Estado
                </label>
                <select
                  value={statusFilter === undefined ? "" : String(statusFilter)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStatusFilter(
                      v === "" ? undefined : (Number(v) as 0 | 1 | 2),
                    );
                  }}
                  className={inputClass}
                >
                  <option value="">Todos</option>
                  <option value="1">Validada</option>
                  <option value="0">Pendiente</option>
                  <option value="2">Rechazada</option>
                </select>
              </div>
            </div>
          </div>
        )}
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
              {from}-{to} de {totalItems.toLocaleString("es-CO")} facturas
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
