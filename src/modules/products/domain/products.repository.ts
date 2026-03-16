import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductActionResponse,
  UploadProductImageResponse,
} from "./products.types";

export interface ProductsRepository {
  getAll(): Promise<Product[]>;
  getByBranch(branchId: string): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(data: CreateProductRequest): Promise<ProductActionResponse>;
  update(id: string, data: UpdateProductRequest): Promise<ProductActionResponse>;
  remove(id: string): Promise<{ success: boolean; error?: string }>;
  uploadImage(productId: string, formData: FormData): Promise<UploadProductImageResponse>;
}
