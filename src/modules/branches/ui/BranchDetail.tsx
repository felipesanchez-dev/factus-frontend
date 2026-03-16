"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Package,
  PackageCheck,
  DollarSign,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { StatCard } from "@/shared/components/StatCard";
import { Table, Column } from "@/shared/components/Table";
import { DynamicMapView } from "@/shared/components/DynamicMapView";
import { useSessionPermissions } from "@/shared/hooks/useSessionPermissions";
import { useBranch } from "./useBranches";
import { useProducts } from "@/modules/products/ui/useProducts";
import type { Product } from "@/modules/products/domain/products.types";

interface BranchDetailProps {
  branchId: string;
}

export function BranchDetail({ branchId }: BranchDetailProps) {
  const router = useRouter();
  const { canWrite } = useSessionPermissions();
  const { branch, loading: branchLoading } = useBranch(branchId);
  const { products, loading: productsLoading } = useProducts(branchId);

  const loading = branchLoading || productsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Sucursal no encontrada
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/sucursales")}
        >
          Volver a Sucursales
        </Button>
      </div>
    );
  }

  const activeProducts = products.filter((p) => p.isActive);
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0,
  );

  const productColumns: Column<Product>[] = [
    {
      key: "image",
      header: "",
      className: "w-12",
      render: (row) =>
        row.image ? (
          <Image
            src={row.image}
            alt={row.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
            <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
        ),
    },
    { key: "code", header: "Codigo" },
    { key: "name", header: "Nombre" },
    {
      key: "price",
      header: "Precio",
      render: (row) =>
        `$${row.price.toLocaleString("es-CO")}`,
    },
    {
      key: "taxRate",
      header: "IVA",
      render: (row) => `${row.taxRate}%`,
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) => (
        <span
          className={
            row.stock <= 0
              ? "font-semibold text-red-600 dark:text-red-400"
              : row.stock <= 5
                ? "font-semibold text-amber-600 dark:text-amber-400"
                : "text-gray-900 dark:text-gray-100"
          }
        >
          {row.stock}
        </span>
      ),
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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Back + Header */}
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/sucursales")}
        className="gap-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Sucursales
      </Button>

      {/* Branch Info */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {branch.name}
              </h2>
              <Badge variant={branch.isActive ? "success" : "danger"}>
                {branch.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <div className="mt-3 space-y-1.5">
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                {branch.address}
                {branch.city && ` — ${branch.city}`}
              </p>
              {branch.phone && (
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  {branch.phone}
                </p>
              )}
            </div>
          </div>
          {canWrite && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/sucursales/${branchId}/editar`)
              }
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </Card>

      {/* Map */}
      {branch.latitude != null && branch.longitude != null && (
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Ubicacion
          </h3>
          <DynamicMapView
            latitude={branch.latitude}
            longitude={branch.longitude}
            popupText={branch.name}
          />
        </Card>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          title="Total Productos"
          value={products.length}
          subtitle={`${activeProducts.length} activos`}
        />
        <StatCard
          icon={<PackageCheck className="h-5 w-5" />}
          title="Productos en Stock"
          value={products.filter((p) => p.stock > 0).length}
          subtitle={`${products.filter((p) => p.stock <= 5 && p.stock > 0).length} con stock bajo`}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          title="Valor del Inventario"
          value={`$${totalInventoryValue.toLocaleString("es-CO")}`}
          subtitle="Precio x Stock"
        />
      </div>

      {/* Products Table */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Catalogo de Productos
          </h3>
          {canWrite && (
            <Button
              onClick={() =>
                router.push(
                  `/dashboard/productos/nuevo?branchId=${branchId}`,
                )
              }
            >
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          )}
        </div>
        <Table
          columns={productColumns}
          data={products}
          rowKey={(row) => row.id}
          onRowClick={(row) =>
            router.push(`/dashboard/productos/${row.id}`)
          }
          emptyMessage="No hay productos en esta sucursal"
        />
      </Card>
    </div>
  );
}
