"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Store } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/shared/components/Badge";
import { useSession } from "@/modules/layout/ui/AuthContext";
import { useCompanyInfo } from "@/modules/layout/ui/CompanyContext";
import { useSessionPermissions } from "@/shared/hooks/useSessionPermissions";
import { getRoleLabel } from "@/shared/lib/permissions";
import { getBranchByIdAction } from "@/modules/branches/infrastructure/branches.actions";
import type { SystemMetrics } from "../../domain/dashboard.types";

interface WelcomeBannerWidgetProps {
  system: SystemMetrics;
  isEditing: boolean;
  onRemove?: () => void;
}

export function WelcomeBannerWidget({
  system,
  isEditing,
  onRemove,
}: WelcomeBannerWidgetProps) {
  const session = useSession();
  const { logoUrl } = useCompanyInfo();
  const { effectiveBranchId } = useSessionPermissions();
  const [branchName, setBranchName] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveBranchId) return;
    getBranchByIdAction(effectiveBranchId).then((b) =>
      setBranchName(b?.name ?? null),
    );
  }, [effectiveBranchId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="h-full rounded-xl border border-blue-100/80 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5 shadow-sm dark:border-blue-900/40 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950"
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-4">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt="Logo"
              width={56}
              height={56}
              className="h-16 w-16 rounded-xl object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bienvenido, {session.fullName}
            </h2>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-blue-200">
              {getRoleLabel(session.role)} &middot; {system.companyName}
            </p>
            {branchName && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-blue-300">
                <Store className="h-3 w-3" />
                Sucursal: {branchName}
              </p>
            )}
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="success"
              className="border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              API Conectada
            </Badge>
            <Badge
              variant="info"
              className="border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300"
            >
              Sandbox
            </Badge>
          </div>
          {isEditing && onRemove && (
            <button
              onClick={onRemove}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Ocultar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
