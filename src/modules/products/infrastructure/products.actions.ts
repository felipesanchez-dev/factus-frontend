"use server";

import {
  readJsonFile,
  writeJsonFile,
  generateId,
} from "@/shared/lib/json-storage";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductActionResponse,
} from "../domain/products.types";

export async function getAllProductsAction(): Promise<Product[]> {
  return readJsonFile<Product[]>("products.json");
}

export async function getProductsByBranchAction(
  branchId: string,
): Promise<Product[]> {
  const products = await readJsonFile<Product[]>("products.json");
  return products.filter((p) => p.branchId === branchId);
}

export async function getProductByIdAction(
  id: string,
): Promise<Product | null> {
  const products = await readJsonFile<Product[]>("products.json");
  return products.find((p) => p.id === id) ?? null;
}

export async function createProductAction(
  data: CreateProductRequest,
): Promise<ProductActionResponse> {
  try {
    const products = await readJsonFile<Product[]>("products.json");

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: generateId("prod"),
      branchId: data.branchId,
      code: data.code,
      name: data.name,
      description: data.description,
      image: "",
      price: data.price,
      taxRate: data.taxRate,
      discount: data.discount,
      discountRate: data.discountRate,
      stock: data.stock,
      unitMeasure: data.unitMeasure,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    products.push(newProduct);
    await writeJsonFile("products.json", products);

    return { success: true, data: newProduct };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al crear producto",
    };
  }
}

export async function updateProductAction(
  id: string,
  data: UpdateProductRequest,
): Promise<ProductActionResponse> {
  try {
    const products = await readJsonFile<Product[]>("products.json");
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return { success: false, error: "Producto no encontrado" };
    }

    const updated: Product = {
      ...products[index],
      branchId: data.branchId,
      code: data.code,
      name: data.name,
      description: data.description,
      price: data.price,
      taxRate: data.taxRate,
      discount: data.discount,
      discountRate: data.discountRate,
      stock: data.stock,
      unitMeasure: data.unitMeasure,
      isActive: data.isActive,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    await writeJsonFile("products.json", products);

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar producto",
    };
  }
}

export async function removeProductAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const products = await readJsonFile<Product[]>("products.json");
    const filtered = products.filter((p) => p.id !== id);

    if (filtered.length === products.length) {
      return { success: false, error: "Producto no encontrado" };
    }

    await writeJsonFile("products.json", filtered);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al eliminar producto",
    };
  }
}
