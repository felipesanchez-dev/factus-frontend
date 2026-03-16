"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Download } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { downloadBillPdfAction } from "../infrastructure/dashboard.actions";

interface InvoicePreviewModalProps {
  billNumber: string | null;
  onClose: () => void;
}

export function InvoicePreviewModal({
  billNumber,
  onClose,
}: InvoicePreviewModalProps) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billNumber) {
      setPdfDataUrl(null);
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      setPdfDataUrl(null);

      try {
        const result = await downloadBillPdfAction(billNumber);
        if (cancelled) return;

        if (result?.pdf) {
          setPdfDataUrl(`data:application/pdf;base64,${result.pdf}`);
        } else {
          setError("No se pudo obtener el PDF de la factura");
        }
      } catch {
        if (!cancelled) setError("Error al conectar con FACTUS API");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
    };
  }, [billNumber]);

  function handleDownload() {
    if (!pdfDataUrl || !billNumber) return;

    const link = document.createElement("a");
    link.href = pdfDataUrl;
    link.download = `Factura-${billNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Modal
      open={!!billNumber}
      onClose={onClose}
      title={`Factura ${billNumber || ""}`}
      size="xl"
    >
      {loading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Cargando PDF desde FACTUS...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm py-12 justify-center">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {!loading && !error && pdfDataUrl && (
        <div className="space-y-3">
          {/* Action bar */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar PDF
            </button>
          </div>

          {/* PDF Embed */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800">
            <iframe
              src={pdfDataUrl}
              title={`Factura ${billNumber}`}
              className="w-full h-[70vh]"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
