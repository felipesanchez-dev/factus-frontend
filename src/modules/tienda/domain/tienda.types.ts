export interface CartItem {
  productId: string;
  code: string;
  name: string;
  image: string;
  price: number;
  taxRate: number;
  discountRate: number;
  unitMeasure: string;
  quantity: number;
  maxStock: number;
}

export interface CustomerData {
  identification: string;
  names: string;
  email: string;
  phone: string;
  address: string;
  identificationDocumentId: string;
  legalOrganizationId: string;
  tributeId: string;
}

export interface PaymentInfo {
  paymentForm: string;
  paymentMethodCode: string;
}

export interface InvoiceResult {
  success: boolean;
  billNumber?: string;
  referenceCode?: string;
  cufe?: string;
  publicUrl?: string;
  total?: number;
  error?: string;
}

export interface Sale {
  id: string;
  branchId: string;
  sellerId: string;
  sellerName: string;
  billNumber: string;
  referenceCode: string;
  cufe: string;
  publicUrl: string;
  customerName: string;
  customerIdentification: string;
  items: SaleItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  paymentForm: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  code: string;
  name: string;
  quantity: number;
  price: number;
  taxRate: number;
  discountRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface NumberingRange {
  id: number;
  prefix: string;
}
