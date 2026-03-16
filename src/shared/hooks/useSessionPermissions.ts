"use client";

import { useSession } from "@/modules/layout/ui/AuthContext";
import {
  hasAccess,
  hasPermission,
  isBranchScoped as checkBranchScoped,
} from "@/shared/lib/permissions";
import { useRolesConfig } from "@/shared/context/RolesConfigContext";
import type { Area } from "@/shared/lib/permissions.types";

export function useSessionPermissions() {
  const session = useSession();
  const { config } = useRolesConfig();
  const { role, branchId } = session;

  const scoped = checkBranchScoped(role, config);

  return {
    ...session,
    canAccess: (area: Area) => hasAccess(role, area, config),
    canWrite: hasPermission(role, "write", config),
    canDelete: hasPermission(role, "delete", config),
    isBranchScoped: scoped,
    effectiveBranchId: scoped ? branchId : undefined,
  };
}
