import { RouteGuard } from "@/shared/components/RouteGuard";
import { BranchForm } from "@/modules/branches/ui/BranchForm";

export default function NuevaSucursalPage() {
  return (
    <RouteGuard area="sucursales">
      <BranchForm />
    </RouteGuard>
  );
}
