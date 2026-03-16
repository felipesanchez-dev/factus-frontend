"use client";

import { Users, MapPin, Building2, Database } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import type { SystemMetrics, InvoiceMetrics } from "../../domain/dashboard.types";

type Variant = "users" | "branches" | "company" | "api";

interface Props {
  variant: Variant;
  system: SystemMetrics;
  invoices: InvoiceMetrics;
  isEditing: boolean;
  onRemove?: () => void;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(value);
}

const config: Record<
  Variant,
  {
    icon: typeof Users;
    bgClass: string;
    textClass: string;
  }
> = {
  users: {
    icon: Users,
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  branches: {
    icon: MapPin,
    bgClass: "bg-rose-50 dark:bg-rose-900/20",
    textClass: "text-rose-600 dark:text-rose-400",
  },
  company: {
    icon: Building2,
    bgClass: "bg-indigo-50 dark:bg-indigo-900/20",
    textClass: "text-indigo-600 dark:text-indigo-400",
  },
  api: {
    icon: Database,
    bgClass: "bg-cyan-50 dark:bg-cyan-900/20",
    textClass: "text-cyan-600 dark:text-cyan-400",
  },
};

function getContent(
  variant: Variant,
  system: SystemMetrics,
  invoices: InvoiceMetrics,
) {
  switch (variant) {
    case "users":
      return {
        label: "Usuarios",
        value: String(system.totalUsers),
        subtitle: `${system.activeUsers} activo(s)`,
      };
    case "branches":
      return {
        label: "Sucursales",
        value: String(system.totalBranches),
        subtitle: `${system.activeBranches} activa(s)`,
      };
    case "company":
      return {
        label: "Empresa",
        value: system.companyConfigured ? "Configurada" : "Pendiente",
        subtitle: system.companyName,
      };
    case "api":
      return {
        label: "API FACTUS",
        value: "Conectado",
        subtitle: `${formatNumber(invoices.totalInApi)} facturas totales`,
      };
  }
}

export function KpiSystemWidget({
  variant,
  system,
  invoices,
  isEditing,
  onRemove,
}: Props) {
  const { icon: Icon, bgClass, textClass } = config[variant];
  const { label, value, subtitle } = getContent(variant, system, invoices);

  return (
    <WidgetWrapper isEditing={isEditing} onRemove={onRemove}>
      <div className="flex items-start justify-between h-full">
        <div className="flex flex-col justify-center h-full">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {subtitle}
          </p>
        </div>
        <div className={`rounded-xl ${bgClass} p-2.5 ${textClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </WidgetWrapper>
  );
}
