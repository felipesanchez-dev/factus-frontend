import { RouteGuard } from "@/shared/components/RouteGuard";
import { RolesEditor } from "@/modules/roles/ui/RolesEditor";

export default function ConfiguracionPage() {
  return (
    <RouteGuard area="configuracion">
      <RolesEditor />
    </RouteGuard>
  );
}
