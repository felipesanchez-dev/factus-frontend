"use client";

import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/shared/components/Button";
import type { CartItem } from "../domain/tienda.types";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

function calcItemTotals(item: CartItem) {
  const grossValue = item.price * item.quantity;
  const discountAmount = grossValue * (item.discountRate / 100);
  const taxableAmount = grossValue - discountAmount;
  const taxAmount = taxableAmount * (item.taxRate / 100);
  return {
    grossValue,
    discountAmount: Math.round(discountAmount),
    taxAmount: Math.round(taxAmount),
    total: Math.round(taxableAmount + taxAmount),
  };
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discountTotal = items.reduce(
    (sum, item) => sum + calcItemTotals(item).discountAmount,
    0,
  );
  const taxTotal = items.reduce(
    (sum, item) => sum + calcItemTotals(item).taxAmount,
    0,
  );
  const total = subtotal - discountTotal + taxTotal;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <ShoppingCart className="h-12 w-12 mb-3" />
        <p className="text-sm font-medium">Carrito vacio</p>
        <p className="text-xs mt-1">Agrega productos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Items list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {items.map((item) => {
          const totals = calcItemTotals(item);
          return (
            <div
              key={item.productId}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
            >
              <div className="flex items-start gap-3">
                {/* Image thumbnail */}
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatCurrency(item.price)} c/u
                  </p>
                </div>

                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-7 w-7 rounded-md border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="h-7 w-7 rounded-md border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
            <span>Descuentos</span>
            <span>-{formatCurrency(discountTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>IVA</span>
          <span>{formatCurrency(taxTotal)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <Button onClick={onCheckout} className="w-full mt-3">
          <ShoppingCart className="h-4 w-4" />
          Continuar al pago
        </Button>
      </div>
    </div>
  );
}
