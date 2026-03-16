"use client";

import { CheckCircle, ExternalLink, RotateCcw, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import type { InvoiceResult } from "../domain/tienda.types";

interface InvoiceSuccessProps {
  result: InvoiceResult;
  onNewSale: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function InvoiceSuccess({ result, onNewSale }: InvoiceSuccessProps) {
  const [copied, setCopied] = useState(false);

  function handleCopyCufe() {
    if (result.cufe) {
      navigator.clipboard.writeText(result.cufe);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 max-w-lg mx-auto">
      {/* Success icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
        <CheckCircle className="h-10 w-10 text-emerald-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Factura generada
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
        La factura electronica ha sido creada y validada exitosamente por la DIAN.
      </p>

      {/* Invoice details */}
      <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4 mb-8">
        {result.billNumber && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Numero de factura
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {result.billNumber}
            </span>
          </div>
        )}

        {result.referenceCode && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Codigo de referencia
            </span>
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {result.referenceCode}
            </span>
          </div>
        )}

        {result.total != null && (
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total facturado
            </span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(result.total)}
            </span>
          </div>
        )}

        {result.cufe && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                CUFE
              </span>
              <button
                onClick={handleCopyCufe}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copiar
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] font-mono text-gray-400 break-all leading-relaxed">
              {result.cufe}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {result.publicUrl && (
          <a
            href={result.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-4 py-2.5 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ver factura
          </a>
        )}

        <Button onClick={onNewSale} className="flex-1">
          <RotateCcw className="h-4 w-4" />
          Nueva venta
        </Button>
      </div>
    </div>
  );
}
