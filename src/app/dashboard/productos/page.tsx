import { RouteGuard } from "@/shared/components/RouteGuard";
import { ProductsList } from "@/modules/products/ui/ProductsList";

export default function ProductosPage() {
  return (
    <RouteGuard area="productos">
      <ProductsList />
    </RouteGuard>
  );
}
