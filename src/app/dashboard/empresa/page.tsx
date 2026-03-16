import { RouteGuard } from "@/shared/components/RouteGuard";
import { CompanyView } from "@/modules/company/ui/CompanyView";

export default function EmpresaPage() {
  return (
    <RouteGuard area="empresa">
      <CompanyView />
    </RouteGuard>
  );
}
