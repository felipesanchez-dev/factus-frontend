"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductsService } from "../application/products.service";
import { ProductsJsonAdapter } from "../infrastructure/products-json.adapter";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductActionResponse,
} from "../domain/products.types";

const adapter = new ProductsJsonAdapter();
const service = new ProductsService(adapter);

export function useProducts(branchId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = branchId
        ? await service.getByBranch(branchId)
        : await service.getAll();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar productos",
      );
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(
    async (data: CreateProductRequest): Promise<ProductActionResponse> => {
      setSaving(true);
      try {
        const result = await service.create(data);
        if (result.success) await fetchProducts();
        return result;
      } finally {
        setSaving(false);
      }
    },
    [fetchProducts],
  );

  const updateProduct = useCallback(
    async (
      id: string,
      data: UpdateProductRequest,
    ): Promise<ProductActionResponse> => {
      setSaving(true);
      try {
        const result = await service.update(id, data);
        if (result.success) await fetchProducts();
        return result;
      } finally {
        setSaving(false);
      }
    },
    [fetchProducts],
  );

  const removeProduct = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      setSaving(true);
      try {
        const result = await service.remove(id);
        if (result.success) await fetchProducts();
        return result;
      } finally {
        setSaving(false);
      }
    },
    [fetchProducts],
  );

  return {
    products,
    loading,
    saving,
    error,
    createProduct,
    updateProduct,
    removeProduct,
    refetch: fetchProducts,
  };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    service.getById(id).then((data) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);

  return { product, loading };
}
