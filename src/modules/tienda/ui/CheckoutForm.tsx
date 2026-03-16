"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileCheck,
  User,
  CreditCard,
  ShoppingBag,
  ClipboardCheck,
  Package,
  Check,
  Mail,
  Phone,
  MapPin,
  Receipt,
  Banknote,
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import type { CartItem, CustomerData, PaymentInfo } from "../domain/tienda.types";

interface CheckoutFormProps {
  items: CartItem[];
  onBack: () => void;
  onSubmit: (customer: CustomerData, payment: PaymentInfo) => void;
  loading: boolean;
  error: string | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

const ID_DOCUMENT_TYPES = [
  { value: "1", label: "Registro civil" },
  { value: "2", label: "Tarjeta de identidad" },
  { value: "3", label: "Cedula de ciudadania" },
  { value: "4", label: "Tarjeta de extranjeria" },
  { value: "5", label: "Cedula de extranjeria" },
  { value: "6", label: "NIT" },
  { value: "7", label: "Pasaporte" },
];

const PAYMENT_METHODS = [
  { value: "10", label: "Efectivo" },
  { value: "42", label: "Consignacion bancaria" },
  { value: "47", label: "Transferencia" },
  { value: "48", label: "Tarjeta de credito" },
  { value: "49", label: "Tarjeta de debito" },
];

type WizardStep = 0 | 1 | 2 | 3;

const STEPS = [
  { label: "Pedido", icon: ShoppingBag },
  { label: "Cliente", icon: User },
  { label: "Pago", icon: CreditCard },
  { label: "Confirmar", icon: ClipboardCheck },
];

function calcItemTotals(item: CartItem) {
  const grossValue = item.price * item.quantity;
  const discountAmount = grossValue * (item.discountRate / 100);
  const taxableAmount = grossValue - discountAmount;
  const taxAmount = taxableAmount * (item.taxRate / 100);
  return {
    grossValue,
    discountAmount: Math.round(discountAmount),
    taxAmount: Math.round(taxAmount),
    total: Math.round(taxableAmount + taxAmount),
  };
}

function getDocTypeLabel(value: string): string {
  return ID_DOCUMENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

function getPaymentFormLabel(value: string): string {
  return value === "1" ? "Contado" : "Credito";
}

function getPaymentMethodLabel(value: string): string {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

function getLegalOrgLabel(value: string): string {
  return value === "1" ? "Persona Juridica" : "Persona Natural";
}

function getTributeLabel(value: string): string {
  return value === "21" ? "No responsable de IVA" : "Responsable de IVA";
}

export function CheckoutForm({ items, onBack, onSubmit, loading, error }: CheckoutFormProps) {
  const [wizardStep, setWizardStep] = useState<WizardStep>(0);

  const [customer, setCustomer] = useState<CustomerData>({
    identification: "",
    names: "",
    email: "",
    phone: "",
    address: "",
    identificationDocumentId: "3",
    legalOrganizationId: "2",
    tributeId: "21",
  });

  const [payment, setPayment] = useState<PaymentInfo>({
    paymentForm: "1",
    paymentMethodCode: "10",
  });

  function updateCustomer(field: keyof CustomerData, value: string) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }

  // Totals
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountTotal = items.reduce((s, i) => s + calcItemTotals(i).discountAmount, 0);
  const taxTotal = items.reduce((s, i) => s + calcItemTotals(i).taxAmount, 0);
  const total = subtotal - discountTotal + taxTotal;

  const isCustomerValid =
    customer.identification.trim() !== "" &&
    customer.names.trim() !== "" &&
    customer.email.trim() !== "" &&
    customer.phone.trim() !== "" &&
    customer.address.trim() !== "";

  function handleSubmit() {
    if (!isCustomerValid || loading) return;
    onSubmit(customer, payment);
  }

  // ─── Wizard stepper ─────────────────────────────────────────────────

  function renderStepper() {
    return (
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = wizardStep === i;
          const isDone = wizardStep > i;

          return (
            <div key={s.label} className="flex items-center">
              {i > 0 && (
                <div
                  className={`w-8 sm:w-14 h-0.5 ${isDone ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  if (isDone) setWizardStep(i as WizardStep);
                }}
                disabled={!isDone && !isActive}
                className={`flex flex-col items-center gap-1.5 ${isDone ? "cursor-pointer" : ""}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive
                      ? "border-blue-500 bg-blue-500 text-white"
                      : isDone
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-500"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : isDone
                        ? "text-blue-500"
                        : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── Step 0: Order review with product images ───────────────────────

  function renderOrderReview() {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Revisa tu pedido
        </h3>

        <div className="space-y-3">
          {items.map((item) => {
            const totals = calcItemTotals(item);
            return (
              <div
                key={item.productId}
                className="flex gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
              >
                <div className="h-20 w-20 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{item.code}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.price)} x {item.quantity}
                    </span>
                    {item.taxRate > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-medium">
                        IVA {item.taxRate}%
                      </span>
                    )}
                    {item.discountRate > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-medium">
                        -{item.discountRate}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totals.total)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 p-5 space-y-2.5">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Subtotal ({items.length} producto{items.length !== 1 ? "s" : ""})</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
              <span>Descuentos</span>
              <span>-{formatCurrency(discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>IVA</span>
            <span>{formatCurrency(taxTotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
            <span>Total a facturar</span>
            <span className="text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </Button>
          <Button onClick={() => setWizardStep(1)}>
            Datos del cliente
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Step 1: Customer data ──────────────────────────────────────────

  function renderCustomerForm() {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Datos del cliente
        </h3>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Tipo de documento
              </label>
              <select
                value={customer.identificationDocumentId}
                onChange={(e) => updateCustomer("identificationDocumentId", e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {ID_DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Numero de documento *
              </label>
              <input
                type="text"
                value={customer.identification}
                onChange={(e) => updateCustomer("identification", e.target.value)}
                placeholder="123456789"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Nombre completo *
              </label>
              <input
                type="text"
                value={customer.names}
                onChange={(e) => updateCustomer("names", e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Correo electronico *
              </label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => updateCustomer("email", e.target.value)}
                placeholder="cliente@correo.com"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Telefono *
              </label>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => updateCustomer("phone", e.target.value)}
                placeholder="3001234567"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Direccion *
              </label>
              <input
                type="text"
                value={customer.address}
                onChange={(e) => updateCustomer("address", e.target.value)}
                placeholder="Calle 1 # 2-3"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Organizacion legal
              </label>
              <select
                value={customer.legalOrganizationId}
                onChange={(e) => updateCustomer("legalOrganizationId", e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="1">Persona Juridica</option>
                <option value="2">Persona Natural</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Responsabilidad tributaria
              </label>
              <select
                value={customer.tributeId}
                onChange={(e) => updateCustomer("tributeId", e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="21">No responsable de IVA</option>
                <option value="49">Responsable de IVA</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={() => setWizardStep(0)}>
            <ArrowLeft className="h-4 w-4" />
            Atras
          </Button>
          <Button onClick={() => setWizardStep(2)} disabled={!isCustomerValid}>
            Forma de pago
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Step 2: Payment ────────────────────────────────────────────────

  function renderPayment() {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Forma de pago
        </h3>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Forma de pago
              </label>
              <select
                value={payment.paymentForm}
                onChange={(e) => setPayment((p) => ({ ...p, paymentForm: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="1">Contado</option>
                <option value="2">Credito</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Metodo de pago
              </label>
              <select
                value={payment.paymentMethodCode}
                onChange={(e) => setPayment((p) => ({ ...p, paymentMethodCode: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={() => setWizardStep(1)}>
            <ArrowLeft className="h-4 w-4" />
            Atras
          </Button>
          <Button onClick={() => setWizardStep(3)}>
            Revisar y confirmar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Step 3: Full confirmation ──────────────────────────────────────

  function renderConfirmation() {
    return (
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Confirmar factura electronica
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-3">
          Verifica que todos los datos sean correctos antes de generar la factura.
        </p>

        {/* ── Cliente ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cliente</span>
            </div>
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Editar
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div className="sm:col-span-2">
                <p className="text-base font-semibold text-gray-900 dark:text-white">{customer.names}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {getDocTypeLabel(customer.identificationDocumentId)}: {customer.identification}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span>{customer.address}</span>
              </div>
              <div className="text-xs text-gray-400">
                {getLegalOrgLabel(customer.legalOrganizationId)} &middot; {getTributeLabel(customer.tributeId)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Pago ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pago</span>
            </div>
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Editar
            </button>
          </div>
          <div className="p-5 flex gap-6">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Forma</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{getPaymentFormLabel(payment.paymentForm)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Metodo</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{getPaymentMethodLabel(payment.paymentMethodCode)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Productos ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Productos ({items.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWizardStep(0)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Editar
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map((item) => {
              const totals = calcItemTotals(item);
              return (
                <div key={item.productId} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{item.code}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.price)} x {item.quantity}
                      </span>
                      {item.taxRate > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-medium">
                          IVA {item.taxRate}%
                        </span>
                      )}
                      {item.discountRate > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-medium">
                          -{item.discountRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(totals.total)}</p>
                    {totals.taxAmount > 0 && (
                      <p className="text-[10px] text-gray-400">IVA: {formatCurrency(totals.taxAmount)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals inside the card */}
          <div className="px-5 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span>Descuentos</span>
                <span>-{formatCurrency(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>IVA</span>
              <span>{formatCurrency(taxTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold pt-3 border-t border-blue-200 dark:border-blue-800">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={() => setWizardStep(2)}>
            <ArrowLeft className="h-4 w-4" />
            Atras
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isCustomerValid || loading}
            loading={loading}
            className="text-base px-8 py-3"
          >
            <FileCheck className="h-5 w-5" />
            Generar Factura
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      {renderStepper()}
      {wizardStep === 0 && renderOrderReview()}
      {wizardStep === 1 && renderCustomerForm()}
      {wizardStep === 2 && renderPayment()}
      {wizardStep === 3 && renderConfirmation()}
    </div>
  );
}
