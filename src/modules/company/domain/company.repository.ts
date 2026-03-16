import type { Company, UpdateCompanyRequest, UpdateCompanyResponse, UploadLogoRequest, UploadLogoResponse } from "./company.types";

export interface CompanyRepository {
  getCompany(): Promise<Company>;
  updateCompany(data: UpdateCompanyRequest): Promise<UpdateCompanyResponse>;
  uploadLogo(data: UploadLogoRequest): Promise<UploadLogoResponse>;
}
