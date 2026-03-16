"use client";

import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Table, Column } from "@/shared/components/Table";
import { Badge } from "@/shared/components/Badge";
import { useSessionPermissions } from "@/shared/hooks/useSessionPermissions";
import { useBranches } from "./useBranches";
import type { Branch } from "../domain/branches.types";

export function BranchesList() {
  const router = useRouter();
  const { effectiveBranchId, canWrite, isBranchScoped } = useSessionPermissions();
  const { branches, loading, error } = useBranches();

  const columns: Column<Branch>[] = [
    { key: "name", header: "Nombre" },
    { key: "city", header: "Ciudad" },
    { key: "address", header: "Direccion" },
    { key: "phone", header: "Telefono" },
    {
      key: "isActive",
      header: "Estado",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "danger"}>
          {row.isActive ? "Activa" : "Inactiva"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const visibleBranches = effectiveBranchId
    ? branches.filter((b) => b.id === effectiveBranchId)
    : branches;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{visibleBranches.length} sucursal(es)</p>
        {canWrite && !isBranchScoped && (
          <Button onClick={() => router.push("/dashboard/sucursales/nueva")}>
            <Plus className="h-4 w-4" />
            Nueva Sucursal
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={visibleBranches}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/dashboard/sucursales/${row.id}`)}
        emptyMessage="No hay sucursales creadas"
      />
    </div>
  );
}
