"use server";

import { readJsonFile, writeJsonFile } from "@/shared/lib/json-storage";
import type { Role, RoleConfig } from "@/shared/lib/permissions.types";
import { DEFAULT_ROLE_PERMISSIONS } from "@/shared/lib/permissions";

type RolesConfig = Record<Role, RoleConfig>;

export async function getRolesConfigAction(): Promise<RolesConfig> {
  try {
    return await readJsonFile<RolesConfig>("roles.json");
  } catch {
    return DEFAULT_ROLE_PERMISSIONS;
  }
}

export async function updateRoleConfigAction(
  role: Role,
  config: RoleConfig,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (role === "super_admin") {
      return { success: false, error: "No se puede editar el rol Super Admin" };
    }

    const roles = await getRolesConfigAction();
    roles[role] = config;
    await writeJsonFile("roles.json", roles);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar rol",
    };
  }
}
