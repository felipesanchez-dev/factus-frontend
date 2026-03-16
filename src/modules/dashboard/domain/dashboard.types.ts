export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalBranches: number;
  activeBranches: number;
  companyConfigured: boolean;
  companyName: string;
}

export interface RecentInvoice {
  id: number;
  number: string;
  referenceCode: string;
  clientName: string;
  clientDocument: string;
  email: string | null;
  date: string;
  isoDate: string;
  total: number;
  status: number;
  statusLabel: string;
  paymentForm: string;
  documentType: string;
  hasErrors: boolean;
}

export interface StatusBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  facturas: number;
  ingresos: number;
  impuestos: number;
}

export interface TopClient {
  name: string;
  document: string;
  total: number;
  count: number;
}

export interface InvoiceMetrics {
  totalInApi: number;
  totalFetched: number;
  totalRevenue: number;
  totalTax: number;
  avgInvoiceValue: number;
  statusBreakdown: StatusBreakdown[];
  monthlyData: MonthlyData[];
  recentInvoices: RecentInvoice[];
  topClients: TopClient[];
  dailyRevenue: { day: string; revenue: number }[];
  paymentFormBreakdown: { name: string; value: number; color: string }[];
}

export interface DashboardData {
  system: SystemMetrics;
  invoices: InvoiceMetrics;
}

// ---- Server-side pagination types ----

export interface InvoicePageParams {
  page?: number;
  perPage?: number;
  identification?: string;
  names?: string;
  number?: string;
  prefix?: string;
  reference_code?: string;
  status?: 0 | 1 | 2;
}

export interface InvoicePageResult {
  invoices: RecentInvoice[];
  pagination: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

export interface ClientOfMonth {
  name: string;
  document: string;
  total: number;
  count: number;
  percentOfTotal: number;
}

// ---- Bill Detail Types (from /v1/bills/show/{number}) ----

export interface BillDetailCompany {
  url_logo: string;
  nit: string;
  dv: string;
  company: string;
  name: string;
  phone: string;
  email: string;
  direction: string;
  municipality: string;
}

export interface BillDetailCustomer {
  identification: string;
  dv: string | null;
  graphic_representation_name: string;
  names: string;
  address: string;
  email: string;
  phone: string;
  legal_organization: { name: string };
  tribute: { name: string };
  municipality: { name: string };
}

export interface BillDetailItem {
  code_reference: string;
  name: string;
  quantity: string;
  price: string;
  discount: string;
  discount_rate: string;
  gross_value: string;
  tax_rate: string;
  taxable_amount: string;
  tax_amount: string;
  total: number;
  unit_measure: { name: string };
  tribute: { name: string };
}

export interface BillDetail {
  company: BillDetailCompany;
  customer: BillDetailCustomer;
  bill: {
    id: number;
    number: string;
    reference_code: string;
    status: number;
    cufe: string;
    qr: string;
    qr_image: string;
    public_url: string;
    gross_value: string;
    taxable_amount: string;
    tax_amount: string;
    discount_amount: string;
    total: string;
    observation: string;
    created_at: string;
    validated: string;
    payment_form: { name: string };
    payment_method: { name: string };
    document: { name: string };
    operation_type: { name: string };
    errors: Record<string, string>;
  };
  items: BillDetailItem[];
  numbering_range: {
    prefix: string;
    resolution_number: string;
    start_date: string;
    end_date: string;
  };
}
