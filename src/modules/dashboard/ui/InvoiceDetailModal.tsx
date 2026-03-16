"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { getBillDetailAction } from "../infrastructure/dashboard.actions";
import type { BillDetail } from "../domain/dashboard.types";
import Image from "next/image";

function formatCOP(value: string | number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
  }).format(typeof value === "string" ? parseFloat(value) : value);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className='inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
    >
      {copied ? (
        <Check className='h-3 w-3 text-green-500' />
      ) : (
        <Copy className='h-3 w-3' />
      )}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

interface InvoiceDetailModalProps {
  billNumber: string | null;
  onClose: () => void;
}

export function InvoiceDetailModal({
  billNumber,
  onClose,
}: InvoiceDetailModalProps) {
  const [detail, setDetail] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billNumber) return;

    let cancelled = false;

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBillDetailAction(billNumber);
        if (cancelled) return;
        if (data) {
          setDetail(data);
        } else {
          setError("No se pudo cargar el detalle de la factura");
        }
      } catch {
        if (!cancelled) setError("Error al conectar con FACTUS API");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [billNumber]);

  const bill = detail?.bill;
  const customer = detail?.customer;
  const items = detail?.items ?? [];
  const company = detail?.company;
  const range = detail?.numbering_range;
  const hasErrors = bill?.errors && Object.keys(bill.errors).length > 0;

  return (
    <Modal
      open={!!billNumber}
      onClose={onClose}
      title={`Factura ${billNumber || ""}`}
      size='lg'
    >
      {loading && (
        <div className='flex flex-col items-center gap-3 py-12'>
          <Loader2 className='h-6 w-6 animate-spin text-blue-500' />
          <p className='text-sm text-gray-400 dark:text-gray-500'>
            Cargando factura desde FACTUS...
          </p>
        </div>
      )}

      {error && (
        <div className='flex items-center gap-2 text-red-600 dark:text-red-400 text-sm py-8 justify-center'>
          <AlertTriangle className='h-4 w-4' />
          {error}
        </div>
      )}

      {!loading && !error && bill && (
        <div className='space-y-5 max-h-[70vh] overflow-y-auto pr-1'>
          {/* Status + Meta */}
          <div className='flex items-center justify-between flex-wrap gap-2'>
            <div className='flex items-center gap-2'>
              <Badge
                variant={
                  bill.status === 1
                    ? "success"
                    : bill.status === 0
                      ? "warning"
                      : "danger"
                }
              >
                {bill.status === 1
                  ? "Validada DIAN"
                  : bill.status === 0
                    ? "Pendiente"
                    : "Rechazada"}
              </Badge>
              <Badge variant='info'>{bill.document.name}</Badge>
              <Badge variant='default'>{bill.payment_form.name}</Badge>
            </div>
            {bill.public_url && (
              <a
                href={bill.public_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium'
              >
                <ExternalLink className='h-3 w-3' />
                Ver en FACTUS
              </a>
            )}
          </div>

          {/* Errors */}
          {hasErrors && (
            <div className='rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3'>
              <div className='flex items-center gap-1.5 mb-1.5'>
                <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                <span className='text-xs font-semibold text-amber-800 dark:text-amber-300'>
                  Notificaciones DIAN
                </span>
              </div>
              <div className='space-y-1'>
                {Object.entries(bill.errors).map(([code, msg]) => (
                  <p
                    key={code}
                    className='text-xs text-amber-700 dark:text-amber-400'
                  >
                    <span className='font-mono font-medium'>{code}:</span> {msg}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Grid: Company + Customer */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {company && (
              <Card className='p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2'>
                  Emisor
                </p>
                <div className='flex items-center gap-3'>
                  {company.url_logo && (
                    <Image
                      src={company.url_logo}
                      alt='Logo'
                      width={40}
                      height={40}
                      className='h-10 w-10 rounded object-contain '
                    />
                  )}
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate'>
                      {company.company}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      NIT: {company.nit}-{company.dv}
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500 truncate'>
                      {company.direction}, {company.municipality}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {customer && (
              <Card className='p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2'>
                  Cliente
                </p>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    {customer.graphic_representation_name}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {customer.legal_organization?.name} &middot; Doc:{" "}
                    {customer.identification}
                  </p>
                  <p className='text-xs text-gray-400 dark:text-gray-500'>
                    {customer.address} &middot; {customer.municipality?.name}
                  </p>
                  {customer.email && (
                    <p className='text-xs text-gray-400 dark:text-gray-500'>
                      {customer.email}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Items Table */}
          <Card className='p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3'>
              Productos / Servicios ({items.length})
            </p>
            <div className='overflow-x-auto'>
              <table className='w-full text-xs'>
                <thead>
                  <tr className='border-b border-gray-100 dark:border-gray-800'>
                    <th className='pb-2 text-left font-medium text-gray-400 dark:text-gray-500'>
                      Producto
                    </th>
                    <th className='pb-2 text-center font-medium text-gray-400 dark:text-gray-500'>
                      Cant.
                    </th>
                    <th className='pb-2 text-right font-medium text-gray-400 dark:text-gray-500'>
                      Precio
                    </th>
                    <th className='pb-2 text-right font-medium text-gray-400 dark:text-gray-500'>
                      IVA
                    </th>
                    <th className='pb-2 text-right font-medium text-gray-400 dark:text-gray-500'>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50 dark:divide-gray-800'>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className='py-2'>
                        <p className='text-gray-900 dark:text-gray-100 font-medium'>
                          {item.name}
                        </p>
                        <p className='text-gray-400 dark:text-gray-500'>
                          Cod: {item.code_reference} &middot;{" "}
                          {item.unit_measure?.name}
                        </p>
                      </td>
                      <td className='py-2 text-center text-gray-700 dark:text-gray-300'>
                        {parseFloat(item.quantity)}
                      </td>
                      <td className='py-2 text-right text-gray-700 dark:text-gray-300'>
                        {formatCOP(item.price)}
                      </td>
                      <td className='py-2 text-right text-gray-500 dark:text-gray-400'>
                        {item.tax_rate}%
                      </td>
                      <td className='py-2 text-right font-semibold text-gray-900 dark:text-gray-100'>
                        {formatCOP(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Totals */}
          <Card className='p-4'>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500 dark:text-gray-400'>
                  Subtotal
                </span>
                <span className='text-gray-900 dark:text-gray-100'>
                  {formatCOP(bill.gross_value)}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500 dark:text-gray-400'>
                  Base Gravable
                </span>
                <span className='text-gray-900 dark:text-gray-100'>
                  {formatCOP(bill.taxable_amount)}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500 dark:text-gray-400'>IVA</span>
                <span className='text-gray-900 dark:text-gray-100'>
                  {formatCOP(bill.tax_amount)}
                </span>
              </div>
              {parseFloat(bill.discount_amount) > 0 && (
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Descuento
                  </span>
                  <span className='text-red-600 dark:text-red-400'>
                    -{formatCOP(bill.discount_amount)}
                  </span>
                </div>
              )}
              <div className='border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-base font-bold'>
                <span className='text-gray-700 dark:text-gray-200'>Total</span>
                <span className='text-gray-900 dark:text-white'>
                  {formatCOP(bill.total)}
                </span>
              </div>
            </div>
          </Card>

          {/* CUFE + QR */}
          <Card className='p-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1 space-y-2'>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                      CUFE
                    </p>
                    <CopyButton text={bill.cufe} />
                  </div>
                  <p className='text-xs text-gray-600 dark:text-gray-400 font-mono break-all leading-relaxed'>
                    {bill.cufe}
                  </p>
                </div>
                {range && (
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1'>
                      Resolucion
                    </p>
                    <p className='text-xs text-gray-600 dark:text-gray-400'>
                      No. {range.resolution_number} &middot; Prefijo:{" "}
                      {range.prefix} &middot; Vigencia: {range.start_date} a{" "}
                      {range.end_date}
                    </p>
                  </div>
                )}
                <div className='flex items-center gap-2'>
                  <p className='text-xs text-gray-400 dark:text-gray-500'>
                    Emitida: {bill.created_at}
                  </p>
                  {bill.validated && (
                    <>
                      <span className='text-gray-300 dark:text-gray-300'>
                        &middot;
                      </span>
                      <div className='flex items-center gap-1'>
                        <CheckCircle className='h-3 w-3 text-green-500' />
                        <p className='text-xs text-green-600 dark:text-green-400'>
                          Validada: {bill.validated}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {bill.qr_image && (
                <div className='flex flex-col items-center gap-1 shrink-0'>
                  <Image
                    src={bill.qr_image}
                    alt='QR DIAN'
                    width={112}
                    height={112}
                    className='h-28 w-28 rounded-lg'
                  />
                  <a
                    href={bill.qr}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    Verificar DIAN
                  </a>
                </div>
              )}
            </div>
          </Card>

          {bill.observation && (
            <p className='text-xs text-gray-400 dark:text-gray-500 italic'>
              {bill.observation}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
