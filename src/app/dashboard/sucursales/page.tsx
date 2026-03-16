import { RouteGuard } from "@/shared/components/RouteGuard";
import { BranchesList } from "@/modules/branches/ui/BranchesList";

export default function SucursalesPage() {
  return (
    <RouteGuard area="sucursales">
      <BranchesList />
    </RouteGuard>
  );
}
