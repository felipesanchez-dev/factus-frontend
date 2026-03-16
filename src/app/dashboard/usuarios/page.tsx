import { RouteGuard } from "@/shared/components/RouteGuard";
import { UsersList } from "@/modules/users/ui/UsersList";

export default function UsuariosPage() {
  return (
    <RouteGuard area="usuarios">
      <UsersList />
    </RouteGuard>
  );
}
