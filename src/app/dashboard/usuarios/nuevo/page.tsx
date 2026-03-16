import { RouteGuard } from "@/shared/components/RouteGuard";
import { UserForm } from "@/modules/users/ui/UserForm";

export default function NuevoUsuarioPage() {
  return (
    <RouteGuard area="usuarios">
      <UserForm />
    </RouteGuard>
  );
}
