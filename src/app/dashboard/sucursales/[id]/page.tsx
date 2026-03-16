import { Suspense } from "react";
import { RouteGuard } from "@/shared/components/RouteGuard";
import { BranchDetail } from "@/modules/branches/ui/BranchDetail";

export default async function DetalleSucursalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteGuard area="sucursales">
      <Suspense>
        <BranchDetail branchId={id} />
      </Suspense>
    </RouteGuard>
  );
}
