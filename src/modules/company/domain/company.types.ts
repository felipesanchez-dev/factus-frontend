export type CompanySize = "micro" | "small" | "medium" | "large" | "enterprise" | "";

export interface Company {
  id: string;
  name: string;
  description: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  industry: string;
  city: string;
  website: string;
  legalRepresentative: string;
  companySize: CompanySize;
  branchCount: number;
  employeeCount: number;
  foundedYear: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyRequest {
  name: string;
  description: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  industry: string;
  city: string;
  website: string;
  legalRepresentative: string;
  companySize: CompanySize;
  branchCount: number;
  employeeCount: number;
  foundedYear: number | null;
}

export interface UpdateCompanyResponse {
  success: boolean;
  error?: string;
  data?: Company;
}

export interface UploadLogoRequest {
  base64: string;
  filename: string;
}

export interface UploadLogoResponse {
  success: boolean;
  error?: string;
  logoUrl?: string;
}

export interface SyncCompanyToFactusResponse {
  success: boolean;
  error?: string;
  companyName?: string;
}

export interface FactusCompanyInfo {
  name: string;
  nit: string;
  email: string;
  phone: string;
  address: string;
  municipality: string;
  legalOrganization: string;
  graphicRepresentationName: string;
}
