export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  city: string;
  municipalityCode: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchRequest {
  name: string;
  address: string;
  phone: string;
  email?: string;
  city: string;
  municipalityCode: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateBranchRequest {
  name: string;
  address: string;
  phone: string;
  email?: string;
  city: string;
  municipalityCode: string;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BranchActionResponse {
  success: boolean;
  error?: string;
  data?: Branch;
}
