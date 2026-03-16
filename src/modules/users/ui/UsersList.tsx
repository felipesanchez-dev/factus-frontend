"use client";

import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Table, Column } from "@/shared/components/Table";
import { Badge } from "@/shared/components/Badge";
import { UserRoleBadge } from "./UserRoleBadge";
import { useUsers } from "./useUsers";
import type { SafeUser } from "../domain/users.types";

export function UsersList() {
  const router = useRouter();
  const { users, loading, error } = useUsers();

  const columns: Column<SafeUser>[] = [
    { key: "fullName", header: "Nombre" },
    { key: "username", header: "Usuario" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Rol",
      render: (row) => <UserRoleBadge role={row.role} />,
    },
    {
      key: "isActive",
      header: "Estado",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "danger"}>
          {row.isActive ? "Activo" : "Inactivo"}
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} usuario(s)</p>
        <Button onClick={() => router.push("/dashboard/usuarios/nuevo")}>
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={users}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/dashboard/usuarios/${row.id}`)}
      />
    </div>
  );
}
