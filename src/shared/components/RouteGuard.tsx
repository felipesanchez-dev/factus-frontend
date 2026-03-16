"use client";

import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";
import { useSession } from "@/modules/layout/ui/AuthContext";
import { hasAccess, getHomePath, getRoleLabel } from "@/shared/lib/permissions";
import { useRolesConfig } from "@/shared/context/RolesConfigContext";
import { Button } from "@/shared/components/Button";
import type { Area } from "@/shared/lib/permissions.types";

interface RouteGuardProps {
  area: Area;
  children: React.ReactNode;
}

export function RouteGuard({ area, children }: RouteGuardProps) {
  const { role } = useSession();
  const { config } = useRolesConfig();
  const router = useRouter();
  const allowed = hasAccess(role, area, config);

  if (!allowed) {
    const homePath = getHomePath(role, config);
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Acceso restringido
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
          Tu rol <span className="font-medium text-gray-700 dark:text-gray-300">({getRoleLabel(role, config)})</span> no tiene permisos para acceder a esta seccion.
        </p>
        <Button onClick={() => router.replace(homePath)} className="mt-2">
          Ir al inicio
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
