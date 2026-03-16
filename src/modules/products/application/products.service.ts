import type { ProductsRepository } from "../domain/products.repository";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductActionResponse,
  UploadProductImageResponse,
} from "../domain/products.types";

export class ProductsService {
  constructor(private readonly repository: ProductsRepository) {}

  async getAll(): Promise<Product[]> {
    return this.repository.getAll();
  }

  async getByBranch(branchId: string): Promise<Product[]> {
    return this.repository.getByBranch(branchId);
  }

  async getById(id: string): Promise<Product | null> {
    return this.repository.getById(id);
  }

  async create(data: CreateProductRequest): Promise<ProductActionResponse> {
    return this.repository.create(data);
  }

  async update(
    id: string,
    data: UpdateProductRequest,
  ): Promise<ProductActionResponse> {
    return this.repository.update(id, data);
  }

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    return this.repository.remove(id);
  }

  async uploadImage(
    productId: string,
    formData: FormData,
  ): Promise<UploadProductImageResponse> {
    return this.repository.uploadImage(productId, formData);
  }
}
