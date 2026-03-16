export interface Product {
  id: string;
  branchId: string;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  taxRate: number;
  discount: number;
  discountRate: number;
  stock: number;
  unitMeasure: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  branchId: string;
  code: string;
  name: string;
  description: string;
  price: number;
  taxRate: number;
  discount: number;
  discountRate: number;
  stock: number;
  unitMeasure: string;
}

export interface UpdateProductRequest {
  branchId: string;
  code: string;
  name: string;
  description: string;
  price: number;
  taxRate: number;
  discount: number;
  discountRate: number;
  stock: number;
  unitMeasure: string;
  isActive: boolean;
}

export interface UploadProductImageResponse {
  success: boolean;
  error?: string;
  imageUrl?: string;
}

export interface ProductActionResponse {
  success: boolean;
  error?: string;
  data?: Product;
}
