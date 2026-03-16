"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Users,
  MapPin,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  AlertCircle,
  Loader2,
  Database,
  Store,
} from "lucide-react";
import { StatCard } from "@/shared/components/StatCard";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { useDashboard } from "./useDashboardMetrics";
import { useSession } from "@/modules/layout/ui/AuthContext";
import { useCompanyInfo } from "@/modules/layout/ui/CompanyContext";
import { useSessionPermissions } from "@/shared/hooks/useSessionPermissions";
import { getRoleLabel } from "@/shared/lib/permissions";
import { getBranchByIdAction } from "@/modules/branches/infrastructure/branches.actions";
import { RevenueChart } from "./charts/RevenueChart";
import { InvoicesBarChart } from "./charts/InvoicesBarChart";
import { StatusPieChart } from "./charts/StatusPieChart";
import { DailyRevenueChart } from "./charts/DailyRevenueChart";
import { TaxVsRevenueChart } from "./charts/TaxVsRevenueChart";
import { RecentInvoicesTable } from "./RecentInvoicesTable";
import { TopClientsTable } from "./TopClientsTable";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import { InvoicePreviewModal } from "./InvoicePreviewModal";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(value);
}

export function DashboardOverview() {
  const { data, loading, error } = useDashboard();
  const session = useSession();
  const { logoUrl } = useCompanyInfo();
  const { effectiveBranchId } = useSessionPermissions();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [previewBill, setPreviewBill] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveBranchId) return;
    getBranchByIdAction(effectiveBranchId).then((b) =>
      setBranchName(b?.name ?? null),
    );
  }, [effectiveBranchId]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-3'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
        <p className='text-sm text-gray-400 dark:text-gray-500'>
          Cargando metricas del dashboard...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className='border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'>
        <div className='flex items-center gap-3'>
          <AlertCircle className='h-5 w-5 text-red-500' />
          <div>
            <p className='text-sm font-medium text-red-800 dark:text-red-300'>
              Error al cargar datos
            </p>
            <p className='text-xs text-red-600 dark:text-red-400'>
              {error || "Intenta recargar la pagina"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const { system, invoices } = data;

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='rounded-xl border border-blue-100/80 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6 shadow-sm dark:border-blue-900/40 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 dark:shadow-lg'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            {logoUrl && (
              <Image
                src={logoUrl}
                alt='Logo'
                width={56}
                height={56}
                className='h-20 w-20 rounded-xl'
              />
            )}
            <div>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>
                Bienvenido, {session.fullName}
              </h2>
              <p className='mt-1 text-slate-600 dark:text-blue-200'>
                {getRoleLabel(session.role)} &middot; {system.companyName}
              </p>
              {branchName && (
                <p className='mt-1.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-blue-300'>
                  <Store className='h-3.5 w-3.5' />
                  Sucursal: {branchName}
                </p>
              )}
              <p className='mt-1.5 text-sm text-slate-500 dark:text-blue-300'>
                Panel de control y metricas de facturacion electronica FACTUS
              </p>
            </div>
          </div>
          <div className='hidden sm:flex flex-col items-end gap-2'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='success'
                className='border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'
              >
                API Conectada
              </Badge>
              <Badge
                variant='info'
                className='border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300'
              >
                Sandbox
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Row - Facturacion */}
      <div>
        <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3'>
          Facturacion Electronica
        </h3>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            icon={<FileText className='h-5 w-5' />}
            title='Total Facturas'
            value={formatNumber(invoices.totalInApi)}
            subtitle={`${formatNumber(invoices.totalFetched)} analizadas en detalle`}
          />
          <StatCard
            icon={<DollarSign className='h-5 w-5' />}
            title='Ingresos (muestra)'
            value={formatCurrency(invoices.totalRevenue)}
            subtitle={`De ${invoices.totalFetched} facturas analizadas`}
          />
          <StatCard
            icon={<Receipt className='h-5 w-5' />}
            title='IVA Estimado'
            value={formatCurrency(invoices.totalTax)}
            subtitle='Estimado sobre facturas validadas'
          />
          <StatCard
            icon={<TrendingUp className='h-5 w-5' />}
            title='Promedio/Factura'
            value={formatCurrency(invoices.avgInvoiceValue)}
            subtitle='Valor promedio por factura'
          />
        </div>
      </div>

      {/* KPI Stats Row - Sistema */}
      <div>
        <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3'>
          Sistema
        </h3>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            icon={<Users className='h-5 w-5' />}
            title='Usuarios'
            value={system.totalUsers}
            subtitle={`${system.activeUsers} activo(s)`}
          />
          <StatCard
            icon={<MapPin className='h-5 w-5' />}
            title='Sucursales'
            value={system.totalBranches}
            subtitle={`${system.activeBranches} activa(s)`}
          />
          <StatCard
            icon={<Building2 className='h-5 w-5' />}
            title='Empresa'
            value={system.companyConfigured ? "Configurada" : "Pendiente"}
            subtitle={system.companyName}
          />
          <StatCard
            icon={<Database className='h-5 w-5' />}
            title='API FACTUS'
            value='Conectado'
            subtitle={`${formatNumber(invoices.totalInApi)} facturas totales`}
          />
        </div>
      </div>

      {/* Charts Row 1: Revenue Area + Invoices Bar */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <RevenueChart data={invoices.monthlyData} />
        <InvoicesBarChart data={invoices.monthlyData} />
      </div>

      {/* Charts Row 2: Daily Revenue Line + Status Pie */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <DailyRevenueChart data={invoices.dailyRevenue} />
        </div>
        <StatusPieChart data={invoices.statusBreakdown} />
      </div>

      {/* Charts Row 3: Tax vs Revenue */}
      <TaxVsRevenueChart data={invoices.monthlyData} />

      {/* Data Tables Row */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
        <div className='lg:col-span-3'>
          <RecentInvoicesTable
            invoices={invoices.recentInvoices}
            onViewDetail={(billNumber) => setSelectedBill(billNumber)}
            onPreview={(billNumber) => setPreviewBill(billNumber)}
          />
        </div>
        <div className='lg:col-span-2'>
          <TopClientsTable initialClients={invoices.topClients} />
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        billNumber={selectedBill}
        onClose={() => setSelectedBill(null)}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        billNumber={previewBill}
        onClose={() => setPreviewBill(null)}
      />
    </div>
  );
}
