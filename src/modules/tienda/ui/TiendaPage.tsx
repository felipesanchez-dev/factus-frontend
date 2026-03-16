"use client";

import { useState, useEffect, useCallback } from "react";
import { Store, ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import { useSession } from "@/modules/layout/ui/AuthContext";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import {
  getStoreProductsAction,
  getNumberingRangeAction,
  createInvoiceAction,
} from "../infrastructure/tienda.actions";
import { ProductGrid } from "./ProductGrid";
import { Cart } from "./Cart";
import { CheckoutForm } from "./CheckoutForm";
import { InvoiceSuccess } from "./InvoiceSuccess";
import type { Product } from "@/modules/products/domain/products.types";
import type {
  CartItem,
  CustomerData,
  PaymentInfo,
  InvoiceResult,
  NumberingRange,
} from "../domain/tienda.types";

type Step = "products" | "checkout" | "result";

export function TiendaPage() {
  const { id: sellerId, fullName: sellerName, branchId } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>("products");
  const [numberingRange, setNumberingRange] = useState<NumberingRange | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoicing, setInvoicing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const [prods, range] = await Promise.all([
        getStoreProductsAction(branchId),
        getNumberingRangeAction(),
      ]);
      setProducts(prods);
      setNumberingRange(range);
    } catch {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ─── Cart actions ───────────────────────────────────────────────────

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((c) =>
          c.productId === product.id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          code: product.code,
          name: product.name,
          image: product.image,
          price: product.price,
          taxRate: product.taxRate,
          discountRate: product.discountRate,
          unitMeasure: product.unitMeasure,
          quantity: 1,
          maxStock: product.stock,
        },
      ];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.productId === productId
          ? { ...c, quantity: Math.min(quantity, c.maxStock) }
          : c,
      ),
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }

  // ─── Checkout ───────────────────────────────────────────────────────

  async function handleInvoice(customer: CustomerData, payment: PaymentInfo) {
    if (!branchId) return;
    if (!numberingRange) {
      setError("No se encontro un rango de numeracion activo en FACTUS. Verifica la configuracion de tu cuenta.");
      return;
    }
    setInvoicing(true);
    setError(null);

    const result = await createInvoiceAction({
      branchId,
      sellerId,
      sellerName,
      customer,
      payment,
      items: cart,
      numberingRangeId: numberingRange.id,
    });

    setInvoicing(false);

    if (result.success) {
      setInvoiceResult(result);
      setStep("result");
    } else {
      setError(result.error ?? "Error al generar la factura");
    }
  }

  function handleNewSale() {
    setCart([]);
    setInvoiceResult(null);
    setStep("products");
    setError(null);
    loadProducts();
  }

  // ─── Loading state ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cargando tienda...
        </p>
      </div>
    );
  }

  if (!branchId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="h-10 w-10 text-amber-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Tu usuario no tiene una sucursal asignada.<br />
          Contacta al administrador para vincular tu cuenta.
        </p>
      </div>
    );
  }

  // ─── Result step ───────────────────────────────────────────────────

  if (step === "result" && invoiceResult) {
    return <InvoiceSuccess result={invoiceResult} onNewSale={handleNewSale} />;
  }

  // ─── Checkout step ─────────────────────────────────────────────────

  if (step === "checkout") {
    return (
      <CheckoutForm
        items={cart}
        onBack={() => { setStep("products"); setError(null); }}
        onSubmit={handleInvoice}
        loading={invoicing}
        error={error}
      />
    );
  }

  // ─── Products + Cart step ──────────────────────────────────────────

  const cartItemCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Punto de Venta
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {products.length} producto{products.length !== 1 ? "s" : ""} disponible{products.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {!numberingRange && (
          <Badge variant="warning">Sin rango de numeracion</Badge>
        )}

        {/* Mobile cart toggle */}
        <button
          onClick={() => setShowMobileCart(!showMobileCart)}
          className="lg:hidden relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Two column layout */}
      <div className="flex gap-6">
        {/* Products column */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            cart={cart}
            onAddToCart={addToCart}
          />
        </div>

        {/* Cart column — desktop */}
        <div className="hidden lg:block w-96 flex-shrink-0">
          <Card className="sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Carrito
              </h3>
              {cartItemCount > 0 && (
                <Badge variant="info">{cartItemCount} item{cartItemCount !== 1 ? "s" : ""}</Badge>
              )}
            </div>
            <Cart
              items={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onCheckout={() => setStep("checkout")}
            />
          </Card>
        </div>
      </div>

      {/* Cart — mobile overlay */}
      {showMobileCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white dark:bg-gray-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Carrito
              </h3>
              <button
                onClick={() => setShowMobileCart(false)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cerrar
              </button>
            </div>
            <Cart
              items={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onCheckout={() => {
                setShowMobileCart(false);
                setStep("checkout");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
