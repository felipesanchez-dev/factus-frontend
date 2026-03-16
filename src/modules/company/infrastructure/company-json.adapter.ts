import type { CompanyRepository } from "../domain/company.repository";
import type { Company, UpdateCompanyRequest, UpdateCompanyResponse, UploadLogoRequest, UploadLogoResponse } from "../domain/company.types";
import { getCompanyAction, updateCompanyAction, uploadLogoAction } from "./company.actions";

export class CompanyJsonAdapter implements CompanyRepository {
  async getCompany(): Promise<Company> {
    return getCompanyAction();
  }

  async updateCompany(data: UpdateCompanyRequest): Promise<UpdateCompanyResponse> {
    return updateCompanyAction(data);
  }

  async uploadLogo(data: UploadLogoRequest): Promise<UploadLogoResponse> {
    return uploadLogoAction(data);
  }
}
