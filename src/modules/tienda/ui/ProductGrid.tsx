"use client";

import { useState } from "react";
import { Search, Plus, Package } from "lucide-react";
import type { Product } from "@/modules/products/domain/products.types";
import type { CartItem } from "../domain/tienda.types";

interface ProductGridProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function ProductGrid({ products, cart, onAddToCart }: ProductGridProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()),
  );

  function getCartQty(productId: string): number {
    return cart.find((c) => c.productId === productId)?.quantity ?? 0;
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Package className="h-12 w-12 mb-3" />
          <p className="text-sm">
            {search ? "No se encontraron productos" : "No hay productos disponibles"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((product) => {
            const inCart = getCartQty(product.id);
            const availableStock = product.stock - inCart;

            return (
              <div
                key={product.id}
                className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  {/* Stock badge */}
                  <span
                    className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      availableStock <= 3
                        ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    }`}
                  >
                    Stock: {availableStock}
                  </span>
                  {inCart > 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold">
                      {inCart} en carrito
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mb-0.5">
                    {product.code}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(product.price)}
                    </span>
                    {product.taxRate > 0 && (
                      <span className="text-[10px] text-gray-400">
                        IVA {product.taxRate}%
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={availableStock <= 0}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 dark:disabled:text-gray-500 text-sm font-medium py-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
