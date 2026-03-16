"use server";

import { readJsonFile, writeJsonFile, generateId } from "@/shared/lib/json-storage";
import { getFactusClient } from "@/shared/lib/factus-auth";
import { getMunicipalitiesAction } from "@/modules/branches/infrastructure/branches.actions";
import { FactusError } from "factus-sdk";
import type { CreateBillRequest } from "factus-sdk";
import type { Product } from "@/modules/products/domain/products.types";
import type { Branch } from "@/modules/branches/domain/branches.types";
import type {
  CartItem,
  CustomerData,
  PaymentInfo,
  InvoiceResult,
  Sale,
  NumberingRange,
} from "../domain/tienda.types";

// ─── Productos de la sucursal ─────────────────────────────────────────

export async function getStoreProductsAction(branchId: string): Promise<Product[]> {
  const products = await readJsonFile<Product[]>("products.json");
  return products.filter(
    (p) => p.branchId === branchId && p.isActive && p.stock > 0,
  );
}

// ─── Rango de numeracion FACTUS ───────────────────────────────────────

export async function getNumberingRangeAction(): Promise<NumberingRange | null> {
  try {
    const factus = await getFactusClient();
    // First try filtering by active invoice ranges via API
    const ranges = await factus.numberingRanges.list({ is_active: 1 });
    const active = ranges.find(
      (r) => r.document === "Factura de Venta",
    );
    if (!active) {
      console.warn("[getNumberingRangeAction] No active 'Factura de Venta' range found. Ranges returned:", ranges.map((r) => ({ id: r.id, document: r.document, is_active: r.is_active })));
      return null;
    }
    return { id: active.id, prefix: active.prefix ?? "" };
  } catch (err) {
    console.error("[getNumberingRangeAction] Error fetching numbering ranges:", err);
    return null;
  }
}

// ─── Crear factura FACTUS + registrar venta ───────────────────────────

interface CreateInvoiceInput {
  branchId: string;
  sellerId: string;
  sellerName: string;
  customer: CustomerData;
  payment: PaymentInfo;
  items: CartItem[];
  numberingRangeId: number;
}

export async function createInvoiceAction(data: CreateInvoiceInput): Promise<InvoiceResult> {
  try {
    const factus = await getFactusClient();

    // Obtener sucursal y resolver municipality_id de Factus desde código DANE
    const branches = await readJsonFile<Branch[]>("branches.json");
    const branch = branches.find((b) => b.id === data.branchId);
    const daneCode = branch?.municipalityCode ?? "73001";

    // Buscar el ID interno de Factus para el municipio (el API no acepta código DANE)
    const municipalities = await getMunicipalitiesAction();
    const municipality = municipalities.find((m) => m.code === daneCode);
    const factusmunicipId = municipality?.id ?? 0;
    if (!factusmunicipId) {
      console.warn(`[createInvoiceAction] No Factus municipality found for DANE code "${daneCode}". Available sample:`, municipalities.slice(0, 5));
    }

    const referenceCode = `VTA-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    // billing_period.end_date must be strictly after start_date
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDateStr = nextDay.toISOString().slice(0, 10);

    const factusItems = data.items.map((item) => ({
      code_reference: item.code,
      name: item.name,
      quantity: item.quantity,
      discount_rate: item.discountRate,
      price: item.price,
      tax_rate: item.taxRate.toFixed(2),
      unit_measure_id: 70,
      standard_code_id: 1,
      is_excluded: 0,
      tribute_id: 1,
      withholding_taxes: [],
    }));

    // Calcular fecha de vencimiento (30 dias para credito, hoy para contado)
    const dueDate = new Date(now);
    if (data.payment.paymentForm === "2") {
      dueDate.setDate(dueDate.getDate() + 30);
    }
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    const payload: CreateBillRequest = {
      document: "01",
      numbering_range_id: data.numberingRangeId,
      reference_code: referenceCode,
      observation: "",
      payment_form: data.payment.paymentForm as "1" | "2",
      payment_due_date: dueDateStr,
      payment_method_code: data.payment.paymentMethodCode,
      operation_type: 10,
      send_email: true,
      order_reference: {
        reference_code: referenceCode,
        issue_date: todayStr,
      },
      billing_period: {
        start_date: todayStr,
        start_time: "00:00:00",
        end_date: endDateStr,
        end_time: "23:59:59",
      },
      establishment: {
        name: branch?.name ?? "",
        address: branch?.address ?? "",
        phone_number: branch?.phone ?? "",
        email: branch?.email ?? data.customer.email,
        municipality_id: factusmunicipId,
      },
      customer: {
        identification: data.customer.identification,
        dv: "",
        company: "",
        trade_name: "",
        names: data.customer.names,
        address: data.customer.address,
        email: data.customer.email,
        phone: data.customer.phone,
        legal_organization_id: data.customer.legalOrganizationId,
        tribute_id: data.customer.tributeId,
        identification_document_id: data.customer.identificationDocumentId,
        municipality_id: factusmunicipId,
      },
      items: factusItems,
    };

    const result = await factus.bills.create(payload);

    const bill = result.bill;
    const billNumber = bill?.number ?? "";
    const cufe = bill?.cufe ?? "";
    const publicUrl = bill?.public_url ?? "";
    const total = parseFloat(bill?.total ?? "0");

    // Guardar venta en sales.json
    const saleItems = data.items.map((item) => {
      const grossValue = item.price * item.quantity;
      const discountAmount = grossValue * (item.discountRate / 100);
      const taxableAmount = grossValue - discountAmount;
      const taxAmount = taxableAmount * (item.taxRate / 100);
      return {
        productId: item.productId,
        code: item.code,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        discountRate: item.discountRate,
        subtotal: grossValue,
        taxAmount: Math.round(taxAmount),
        total: Math.round(taxableAmount + taxAmount),
      };
    });

    const subtotal = saleItems.reduce((s, i) => s + i.subtotal, 0);
    const taxTotal = saleItems.reduce((s, i) => s + i.taxAmount, 0);
    const discountTotal = data.items.reduce((s, item) => {
      const gross = item.price * item.quantity;
      return s + gross * (item.discountRate / 100);
    }, 0);

    const sale: Sale = {
      id: generateId("sale"),
      branchId: data.branchId,
      sellerId: data.sellerId,
      sellerName: data.sellerName,
      billNumber,
      referenceCode,
      cufe,
      publicUrl,
      customerName: data.customer.names,
      customerIdentification: data.customer.identification,
      items: saleItems,
      subtotal,
      taxTotal: Math.round(taxTotal),
      discountTotal: Math.round(discountTotal),
      total,
      paymentForm: data.payment.paymentForm === "1" ? "Contado" : "Credito",
      paymentMethod: getPaymentMethodLabel(data.payment.paymentMethodCode),
      status: "validada",
      createdAt: new Date().toISOString(),
    };

    const sales = await readJsonFile<Sale[]>("sales.json");
    sales.push(sale);
    await writeJsonFile("sales.json", sales);

    // Descontar stock
    const products = await readJsonFile<Product[]>("products.json");
    for (const cartItem of data.items) {
      const product = products.find((p) => p.id === cartItem.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - cartItem.quantity);
        product.updatedAt = new Date().toISOString();
      }
    }
    await writeJsonFile("products.json", products);

    return {
      success: true,
      billNumber,
      referenceCode,
      cufe,
      publicUrl,
      total,
    };
  } catch (err) {
    if (err instanceof FactusError) {
      const detail = err.errors ? err.getValidationSummary() : err.message;
      console.error("[createInvoiceAction] FactusError:", {
        code: err.code,
        status: err.statusCode,
        message: err.message,
        errors: err.errors,
        body: JSON.stringify(err.originalError, null, 2),
      });
      return { success: false, error: detail };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error inesperado al facturar",
    };
  }
}

// ─── Ventas ───────────────────────────────────────────────────────────

export async function getSalesAction(branchId?: string): Promise<Sale[]> {
  const sales = await readJsonFile<Sale[]>("sales.json");
  if (branchId) return sales.filter((s) => s.branchId === branchId);
  return sales;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function getPaymentMethodLabel(code: string): string {
  const methods: Record<string, string> = {
    "10": "Efectivo",
    "42": "Consignacion bancaria",
    "47": "Transferencia debito bancaria",
    "48": "Tarjeta credito",
    "49": "Tarjeta debito",
    ZZZ: "Otro",
  };
  return methods[code] ?? "Otro";
}
