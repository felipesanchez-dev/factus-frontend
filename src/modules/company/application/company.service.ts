import type { CompanyRepository } from "../domain/company.repository";
import type { Company, UpdateCompanyRequest, UpdateCompanyResponse, UploadLogoRequest, UploadLogoResponse } from "../domain/company.types";

export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  async getCompany(): Promise<Company> {
    return this.repository.getCompany();
  }

  async updateCompany(data: UpdateCompanyRequest): Promise<UpdateCompanyResponse> {
    return this.repository.updateCompany(data);
  }

  async uploadLogo(data: UploadLogoRequest): Promise<UploadLogoResponse> {
    return this.repository.uploadLogo(data);
  }
}
