import { RouteGuard } from "@/shared/components/RouteGuard";
import { TiendaPage } from "@/modules/tienda/ui/TiendaPage";

export default function TiendaRoute() {
  return (
    <RouteGuard area="tienda">
      <TiendaPage />
    </RouteGuard>
  );
}
