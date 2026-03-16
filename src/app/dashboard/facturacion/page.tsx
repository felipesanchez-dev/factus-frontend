import { FileText } from "lucide-react";
import { RouteGuard } from "@/shared/components/RouteGuard";
import { Card } from "@/shared/components/Card";

export default function FacturacionPage() {
  return (
    <RouteGuard area="facturacion">
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Facturacion Electronica</h2>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          Modulo de facturacion — Proximamente
        </p>
      </Card>
    </RouteGuard>
  );
}
