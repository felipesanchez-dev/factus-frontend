import { RouteGuard } from "@/shared/components/RouteGuard";
import { DashboardOverview } from "@/modules/dashboard/ui/DashboardOverview";

export default function DashboardPage() {
  return (
    <RouteGuard area="dashboard">
      <DashboardOverview />
    </RouteGuard>
  );
}
