"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Role, RoleConfig } from "@/shared/lib/permissions.types";
import { DEFAULT_ROLE_PERMISSIONS } from "@/shared/lib/permissions";
import { getRolesConfigAction } from "@/modules/roles/infrastructure/roles.actions";

type RolesConfig = Record<Role, RoleConfig>;

interface RolesConfigContextValue {
  config: RolesConfig;
  reload: () => Promise<void>;
}

const RolesConfigContext = createContext<RolesConfigContextValue>({
  config: DEFAULT_ROLE_PERMISSIONS,
  reload: async () => {},
});

export function RolesConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<RolesConfig | null>(null);

  const reload = useCallback(async () => {
    const loaded = await getRolesConfigAction();
    setConfig(loaded);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Block rendering until roles config is loaded
  if (!config) return null;

  return (
    <RolesConfigContext.Provider value={{ config, reload }}>
      {children}
    </RolesConfigContext.Provider>
  );
}

export function useRolesConfig(): RolesConfigContextValue {
  return useContext(RolesConfigContext);
}
