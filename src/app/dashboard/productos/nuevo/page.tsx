import { Suspense } from "react";
import { RouteGuard } from "@/shared/components/RouteGuard";
import { ProductForm } from "@/modules/products/ui/ProductForm";

export default function NuevoProductoPage() {
  return (
    <RouteGuard area="productos">
      <Suspense>
        <ProductForm />
      </Suspense>
    </RouteGuard>
  );
}
