import type { ProductsRepository } from "../domain/products.repository";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductActionResponse,
  UploadProductImageResponse,
} from "../domain/products.types";
import {
  getAllProductsAction,
  getProductsByBranchAction,
  getProductByIdAction,
  createProductAction,
  updateProductAction,
  removeProductAction,
} from "./products.actions";

export class ProductsJsonAdapter implements ProductsRepository {
  async getAll(): Promise<Product[]> {
    return getAllProductsAction();
  }

  async getByBranch(branchId: string): Promise<Product[]> {
    return getProductsByBranchAction(branchId);
  }

  async getById(id: string): Promise<Product | null> {
    return getProductByIdAction(id);
  }

  async create(data: CreateProductRequest): Promise<ProductActionResponse> {
    return createProductAction(data);
  }

  async update(
    id: string,
    data: UpdateProductRequest,
  ): Promise<ProductActionResponse> {
    return updateProductAction(id, data);
  }

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    return removeProductAction(id);
  }

  async uploadImage(
    productId: string,
    formData: FormData,
  ): Promise<UploadProductImageResponse> {
    formData.append("productId", productId);
    const token = sessionStorage.getItem("factus_token");
    const parsed = token ? JSON.parse(token) : null;
    const res = await fetch("/api/products/upload-image", {
      method: "POST",
      headers: parsed?.accessToken
        ? { Authorization: `Bearer ${parsed.accessToken}` }
        : {},
      body: formData,
    });
    return res.json();
  }
}
