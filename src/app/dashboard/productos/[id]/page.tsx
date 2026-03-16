import { Suspense } from "react";
import { RouteGuard } from "@/shared/components/RouteGuard";
import { ProductForm } from "@/modules/products/ui/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductoPage({ params }: Props) {
  const { id } = await params;
  return (
    <RouteGuard area="productos">
      <Suspense>
        <ProductForm productId={id} />
      </Suspense>
    </RouteGuard>
  );
}
