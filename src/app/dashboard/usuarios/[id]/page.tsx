import { RouteGuard } from "@/shared/components/RouteGuard";
import { UserForm } from "@/modules/users/ui/UserForm";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteGuard area="usuarios">
      <UserForm userId={id} />
    </RouteGuard>
  );
}
