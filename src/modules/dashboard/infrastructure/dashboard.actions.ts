"use server";

import { readJsonFile } from "@/shared/lib/json-storage";
import { getFactusClient } from "@/shared/lib/factus-auth";
import type { Factus, BillSummary } from "factus-sdk";
import type {
  DashboardData,
  SystemMetrics,
  InvoiceMetrics,
  RecentInvoice,
  StatusBreakdown,
  MonthlyData,
  TopClient,
  BillDetail,
  InvoicePageParams,
  InvoicePageResult,
  ClientOfMonth,
} from "../domain/dashboard.types";

interface UserData {
  id: string;
  isActive: boolean;
}

interface BranchData {
  id: string;
  isActive: boolean;
}

interface CompanyData {
  name: string;
}

// Use BillSummary from SDK as FactusBill
type FactusBill = BillSummary;

const CONCURRENT_BATCH = 5; // Fetch 5 pages in parallel at a time
const MAX_PAGES = 20; // 20 pages × 10 = 200 bills max (balance speed/data)

interface FactusBillsResponse {
  bills: FactusBill[];
  totalInApi: number;
}

async function fetchPage(
  factus: Factus,
  page: number,
): Promise<{ bills: FactusBill[]; total: number; lastPage: number } | null> {
  try {
    const result = await factus.bills.list({ page });
    return {
      bills: result.data,
      total: result.pagination.total,
      lastPage: result.pagination.lastPage,
    };
  } catch {
    return null;
  }
}

async function fetchFactusBills(factus: Factus): Promise<FactusBillsResponse> {
  // 1. Fetch first page to get pagination info
  const first = await fetchPage(factus, 1);
  if (!first || first.bills.length === 0) {
    return { bills: first?.bills ?? [], totalInApi: first?.total ?? 0 };
  }

  const allBills: FactusBill[] = [...first.bills];
  const totalInApi = first.total;
  const lastPage = Math.min(first.lastPage, MAX_PAGES);

  // 2. Fetch remaining pages in concurrent batches
  for (
    let batchStart = 2;
    batchStart <= lastPage;
    batchStart += CONCURRENT_BATCH
  ) {
    const batchEnd = Math.min(batchStart + CONCURRENT_BATCH - 1, lastPage);
    const pages: number[] = [];
    for (let p = batchStart; p <= batchEnd; p++) pages.push(p);

    const results = await Promise.all(pages.map((p) => fetchPage(factus, p)));

    let hasFailure = false;
    for (const result of results) {
      if (!result) {
        hasFailure = true;
        continue;
      }
      allBills.push(...result.bills);
    }

    // If any page in the batch failed, stop fetching more
    if (hasFailure) break;
  }

  return { bills: allBills, totalInApi };
}

// Parse FACTUS date format "DD-MM-YYYY HH:MM:SS AM/PM" to Date
function parseFactusDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // "21-02-2026 10:55:16 AM"
  const match = dateStr.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i,
  );
  if (!match) return null;

  const [, dd, mm, yyyy, hh, min, sec, ampm] = match;
  let hours = parseInt(hh);
  if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;

  return new Date(
    parseInt(yyyy),
    parseInt(mm) - 1,
    parseInt(dd),
    hours,
    parseInt(min),
    parseInt(sec),
  );
}

function getMonthName(monthIndex: number): string {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return months[monthIndex];
}

function getStatusLabel(status: number): string {
  const map: Record<number, string> = {
    1: "Validada",
    0: "Pendiente",
    2: "Rechazada",
    3: "Anulada",
  };
  return map[status] ?? "Emitida";
}

function mapBillToRecentInvoice(bill: FactusBill): RecentInvoice {
  const total = parseFloat(String(bill.total ?? "0"));
  const status: number = bill.status ?? 1;
  const dateStr: string = bill.created_at || "";
  const clientName: string =
    bill.graphic_representation_name || bill.names || "Cliente";
  const clientDoc: string = bill.identification || "";
  const paymentFormName: string = bill.payment_form?.name || "Otro";
  const date = parseFactusDate(dateStr);

  return {
    id: bill.id,
    number: bill.number || "-",
    referenceCode: bill.reference_code || "",
    clientName,
    clientDocument: clientDoc,
    email: bill.email ?? null,
    date: date ? date.toLocaleDateString("es-CO") : dateStr,
    isoDate: date ? date.toISOString() : "",
    total,
    status,
    statusLabel: getStatusLabel(status),
    paymentForm: paymentFormName,
    documentType: bill.document?.name || "Factura",
    hasErrors: Boolean(bill.errors && Object.keys(bill.errors).length > 0),
  };
}

function processInvoiceMetrics(
  bills: FactusBill[],
  totalInApi: number,
): InvoiceMetrics {
  if (bills.length === 0) {
    return getEmptyInvoiceMetrics();
  }

  let totalRevenue = 0;
  let totalTax = 0;
  const statusMap = new Map<string, number>();
  const monthlyMap = new Map<
    string,
    { facturas: number; ingresos: number; impuestos: number }
  >();
  const clientMap = new Map<
    string,
    { name: string; document: string; total: number; count: number }
  >();
  const dailyMap = new Map<string, number>();
  const paymentMap = new Map<string, number>();
  const recentInvoices: RecentInvoice[] = [];

  for (const bill of bills) {
    const total = parseFloat(String(bill.total ?? "0"));
    const status: number = bill.status ?? 1;
    const dateStr: string = bill.created_at || "";
    const clientName: string =
      bill.graphic_representation_name || bill.names || "Cliente";
    const clientDoc: string = bill.identification || "";
    const paymentFormName: string = bill.payment_form?.name || "Otro";

    totalRevenue += total;
    // Tax not available in list endpoint, estimate 19% IVA on validated
    if (status === 1) totalTax += (total * 0.19) / 1.19;

    // Status breakdown
    const statusLabel = getStatusLabel(status);
    statusMap.set(statusLabel, (statusMap.get(statusLabel) || 0) + 1);

    // Payment form
    paymentMap.set(paymentFormName, (paymentMap.get(paymentFormName) || 0) + 1);

    // Date parsing
    const date = parseFactusDate(dateStr);
    if (date) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(monthKey) || {
        facturas: 0,
        ingresos: 0,
        impuestos: 0,
      };
      existing.facturas += 1;
      existing.ingresos += total;
      existing.impuestos += status === 1 ? (total * 0.19) / 1.19 : 0;
      monthlyMap.set(monthKey, existing);

      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + total);
    }

    // Client aggregation
    const clientKey = clientDoc || clientName;
    const existingClient = clientMap.get(clientKey) || {
      name: clientName,
      document: clientDoc,
      total: 0,
      count: 0,
    };
    existingClient.total += total;
    existingClient.count += 1;
    clientMap.set(clientKey, existingClient);

    // Recent invoices
    recentInvoices.push(mapBillToRecentInvoice(bill));
  }

  // Status breakdown with colors
  const statusColors: Record<string, string> = {
    Validada: "#10b981",
    Pendiente: "#f59e0b",
    Rechazada: "#ef4444",
    Anulada: "#6b7280",
    Emitida: "#3b82f6",
  };

  const statusBreakdown: StatusBreakdown[] = Array.from(
    statusMap.entries(),
  ).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || "#8b5cf6",
  }));

  // Payment form breakdown
  const paymentColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const paymentFormBreakdown = Array.from(paymentMap.entries()).map(
    ([name, value], i) => ({
      name,
      value,
      color: paymentColors[i % paymentColors.length],
    }),
  );

  // Monthly data sorted by date
  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, val]) => {
      const [, m] = key.split("-");
      return {
        month: getMonthName(parseInt(m) - 1),
        facturas: val.facturas,
        ingresos: Math.round(val.ingresos),
        impuestos: Math.round(val.impuestos),
      };
    });

  // Top clients
  const topClients: TopClient[] = Array.from(clientMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Daily revenue (last 30 days)
  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([day, revenue]) => {
      const d = new Date(day + "T00:00:00");
      return {
        day: d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        revenue: Math.round(revenue),
      };
    });

  // Sort recent invoices by id (desc) — most recent first
  recentInvoices.sort((a, b) => b.id - a.id);

  return {
    totalInApi,
    totalFetched: bills.length,
    totalRevenue: Math.round(totalRevenue),
    totalTax: Math.round(totalTax),
    avgInvoiceValue:
      bills.length > 0 ? Math.round(totalRevenue / bills.length) : 0,
    statusBreakdown,
    monthlyData,
    recentInvoices,
    topClients,
    dailyRevenue,
    paymentFormBreakdown,
  };
}

function getEmptyInvoiceMetrics(): InvoiceMetrics {
  return {
    totalInApi: 0,
    totalFetched: 0,
    totalRevenue: 0,
    totalTax: 0,
    avgInvoiceValue: 0,
    statusBreakdown: [],
    monthlyData: [],
    recentInvoices: [],
    topClients: [],
    dailyRevenue: [],
    paymentFormBreakdown: [],
  };
}

async function getSystemMetrics(): Promise<SystemMetrics> {
  const [users, branches, company] = await Promise.all([
    readJsonFile<UserData[]>("users.json"),
    readJsonFile<BranchData[]>("branches.json"),
    readJsonFile<CompanyData>("company.json"),
  ]);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.isActive).length,
    totalBranches: branches.length,
    activeBranches: branches.filter((b) => b.isActive).length,
    companyConfigured: !!company.name,
    companyName: company.name || "Sin configurar",
  };
}

export async function getDashboardDataAction(): Promise<DashboardData> {
  const [system, factus] = await Promise.all([
    getSystemMetrics(),
    getFactusClient().catch(() => null),
  ]);

  let invoices: InvoiceMetrics;

  if (factus) {
    const { bills, totalInApi } = await fetchFactusBills(factus);
    invoices = processInvoiceMetrics(bills, totalInApi);
  } else {
    invoices = getEmptyInvoiceMetrics();
  }

  return { system, invoices };
}

// Pages to fetch per date range (API returns most recent first, 10 per page)
const RANGE_PAGES: Record<string, number> = {
  month: 20, // 200 bills
  quarter: 60, // 600 bills
  semester: 100, // 1000 bills
  year: 150, // 1500 bills
  all: 200, // 2000 bills
};

function getDateThreshold(range: string): Date | null {
  if (range === "all") return null;
  const now = new Date();
  switch (range) {
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "quarter":
      return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    case "semester":
      return new Date(now.getFullYear(), now.getMonth() - 5, 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
}

async function fetchBillsWithLimit(
  factus: Factus,
  maxPages: number,
): Promise<FactusBill[]> {
  const first = await fetchPage(factus, 1);
  if (!first || first.bills.length === 0) return first?.bills ?? [];

  const allBills: FactusBill[] = [...first.bills];
  const lastPage = Math.min(first.lastPage, maxPages);

  for (
    let batchStart = 2;
    batchStart <= lastPage;
    batchStart += CONCURRENT_BATCH
  ) {
    const batchEnd = Math.min(batchStart + CONCURRENT_BATCH - 1, lastPage);
    const pages: number[] = [];
    for (let p = batchStart; p <= batchEnd; p++) pages.push(p);

    const results = await Promise.all(pages.map((p) => fetchPage(factus, p)));

    let hasFailure = false;
    for (const result of results) {
      if (!result) {
        hasFailure = true;
        continue;
      }
      allBills.push(...result.bills);
    }
    if (hasFailure) break;
  }

  return allBills;
}

export interface TopClientsResult {
  clients: TopClient[];
  totalBillsAnalyzed: number;
}

export interface RecentInvoicesResult {
  invoices: RecentInvoice[];
  success: boolean;
}

export async function getRecentInvoicesAction(
  limit = 50,
): Promise<RecentInvoicesResult> {
  try {
    const factus = await getFactusClient();
    const first = await fetchPage(factus, 1);
    if (!first || first.bills.length === 0) {
      return { invoices: [], success: true };
    }

    const invoices: RecentInvoice[] = first.bills
      .slice(0, Math.max(1, limit))
      .map(mapBillToRecentInvoice)
      .sort((a, b) => b.id - a.id);

    return { invoices, success: true };
  } catch {
    return { invoices: [], success: false };
  }
}

export async function getTopClientsAction(
  range: string,
): Promise<TopClientsResult> {
  try {
    const factus = await getFactusClient();
    const maxPages = RANGE_PAGES[range] ?? 20;
    const bills = await fetchBillsWithLimit(factus, maxPages);

    const threshold = getDateThreshold(range);
    const clientMap = new Map<
      string,
      { name: string; document: string; total: number; count: number }
    >();
    let analyzed = 0;

    for (const bill of bills) {
      const dateStr: string = bill.created_at || "";
      const date = parseFactusDate(dateStr);

      // Filter by date threshold
      if (threshold && date && date < threshold) continue;

      const total = parseFloat(String(bill.total ?? "0"));
      const clientName: string =
        bill.graphic_representation_name || bill.names || "Cliente";
      const clientDoc: string = bill.identification || "";
      const clientKey = clientDoc || clientName;

      const existing = clientMap.get(clientKey) || {
        name: clientName,
        document: clientDoc,
        total: 0,
        count: 0,
      };
      existing.total += total;
      existing.count += 1;
      clientMap.set(clientKey, existing);
      analyzed++;
    }

    const clients: TopClient[] = Array.from(clientMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { clients, totalBillsAnalyzed: analyzed };
  } catch {
    return { clients: [], totalBillsAnalyzed: 0 };
  }
}

export async function downloadBillPdfAction(
  billNumber: string,
): Promise<{ pdf: string } | null> {
  try {
    const factus = await getFactusClient();
    const result = await factus.bills.downloadPdf(billNumber);
    if (!result.pdf_base_64_encoded) return null;
    return { pdf: result.pdf_base_64_encoded };
  } catch {
    return null;
  }
}

export async function getBillDetailAction(
  billNumber: string,
): Promise<BillDetail | null> {
  try {
    const factus = await getFactusClient();
    const detail = await factus.bills.show(billNumber);
    return detail as unknown as BillDetail;
  } catch {
    return null;
  }
}

// ---- Server-side paginated invoice listing ----

export async function listInvoicesPageAction(
  params: InvoicePageParams,
): Promise<InvoicePageResult> {
  try {
    const factus = await getFactusClient();
    const result = await factus.bills.list({
      page: params.page ?? 1,
      identification: params.identification || undefined,
      names: params.names || undefined,
      number: params.number || undefined,
      reference_code: params.reference_code || undefined,
      status: params.status,
    });

    const invoices = result.data.map(mapBillToRecentInvoice);

    return {
      invoices,
      pagination: {
        total: result.pagination.total,
        perPage: result.pagination.perPage,
        currentPage: result.pagination.currentPage,
        lastPage: result.pagination.lastPage,
      },
    };
  } catch {
    return {
      invoices: [],
      pagination: { total: 0, perPage: 10, currentPage: 1, lastPage: 1 },
    };
  }
}

// ---- Client of the month ----

export async function getClientOfMonthAction(): Promise<ClientOfMonth | null> {
  try {
    const factus = await getFactusClient();
    const bills = await fetchBillsWithLimit(factus, 20); // 200 bills

    const threshold = getDateThreshold("month");
    const clientMap = new Map<
      string,
      { name: string; document: string; total: number; count: number }
    >();
    let totalRevenue = 0;

    for (const bill of bills) {
      const dateStr: string = bill.created_at || "";
      const date = parseFactusDate(dateStr);
      if (threshold && date && date < threshold) continue;

      const total = parseFloat(String(bill.total ?? "0"));
      totalRevenue += total;

      const clientName =
        bill.graphic_representation_name || bill.names || "Cliente";
      const clientDoc = bill.identification || "";
      const clientKey = clientDoc || clientName;

      const existing = clientMap.get(clientKey) || {
        name: clientName,
        document: clientDoc,
        total: 0,
        count: 0,
      };
      existing.total += total;
      existing.count += 1;
      clientMap.set(clientKey, existing);
    }

    if (clientMap.size === 0 || totalRevenue === 0) return null;

    const sorted = Array.from(clientMap.values()).sort(
      (a, b) => b.total - a.total,
    );
    const top = sorted[0];

    return {
      name: top.name,
      document: top.document,
      total: Math.round(top.total),
      count: top.count,
      percentOfTotal: Math.round((top.total / totalRevenue) * 100),
    };
  } catch {
    return null;
  }
}
