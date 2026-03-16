import { RouteGuard } from "@/shared/components/RouteGuard";
import { BranchForm } from "@/modules/branches/ui/BranchForm";

export default async function EditarSucursalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteGuard area="sucursales">
      <BranchForm branchId={id} />
    </RouteGuard>
  );
}
