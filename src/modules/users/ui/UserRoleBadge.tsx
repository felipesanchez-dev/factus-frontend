"use client";

import { Badge } from "@/shared/components/Badge";
import { getRoleLabel } from "@/shared/lib/permissions";
import { useRolesConfig } from "@/shared/context/RolesConfigContext";
import type { Role } from "@/shared/lib/permissions.types";

const ROLE_VARIANT: Record<Role, "info" | "success" | "warning" | "default"> = {
  super_admin: "info",
  admin_sucursal: "success",
  vendedor: "warning",
  visor: "default",
};

export function UserRoleBadge({ role }: { role: Role }) {
  const { config } = useRolesConfig();
  return <Badge variant={ROLE_VARIANT[role]}>{getRoleLabel(role, config)}</Badge>;
}
