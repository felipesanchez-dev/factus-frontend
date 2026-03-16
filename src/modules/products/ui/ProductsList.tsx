"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Loader2, Package } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { useSessionPermissions } from "@/shared/hooks/useSessionPermissions";
import { useProducts } from "./useProducts";
import { getAllBranchesAction } from "@/modules/branches/infrastructure/branches.actions";
import type { Branch } from "@/modules/branches/domain/branches.types";
import type { Product } from "../domain/products.types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductsList() {
  const router = useRouter();
  const { effectiveBranchId, canWrite } = useSessionPermissions();
  const { products, loading, error } = useProducts(effectiveBranchId ?? undefined);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filterBranch, setFilterBranch] = useState<string>("");

  useEffect(() => {
    getAllBranchesAction().then(setBranches);
  }, []);

  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  const filtered = filterBranch
    ? products.filter((p) => p.branchId === filterBranch)
    : products;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} producto(s)
          </p>
          {!effectiveBranchId && branches.length > 0 && (
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Todas las sucursales</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {canWrite && (
          <Button onClick={() => router.push("/dashboard/productos/nuevo")}>
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No hay productos registrados
          </p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 w-12" />
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Codigo
                  </th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Nombre
                  </th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Sucursal
                  </th>
                  <th className="pb-2 text-right text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Precio
                  </th>
                  <th className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    IVA
                  </th>
                  <th className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Stock
                  </th>
                  <th className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((product: Product) => (
                  <tr
                    key={product.id}
                    onClick={() =>
                      router.push(`/dashboard/productos/${product.id}`)
                    }
                    className="hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                          <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                        {product.code}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <p className="text-gray-900 dark:text-gray-100 font-medium text-xs">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-gray-400 dark:text-gray-500 text-xs truncate max-w-xs">
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 text-xs text-gray-500 dark:text-gray-400">
                      {branchMap.get(product.branchId) || "—"}
                    </td>
                    <td className="py-2.5 text-right text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-2.5 text-center text-xs text-gray-500 dark:text-gray-400">
                      {product.taxRate}%
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`text-xs font-semibold ${
                          product.stock <= 0
                            ? "text-red-500"
                            : product.stock <= 5
                              ? "text-amber-500"
                              : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <Badge
                        variant={product.isActive ? "success" : "danger"}
                      >
                        {product.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
