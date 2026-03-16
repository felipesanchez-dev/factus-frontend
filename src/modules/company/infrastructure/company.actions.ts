"use server";

import { readJsonFile, writeJsonFile } from "@/shared/lib/json-storage";
import { cloudinary } from "@/shared/lib/cloudinary";
import type { Company, UpdateCompanyRequest, UpdateCompanyResponse, UploadLogoRequest, UploadLogoResponse } from "../domain/company.types";

const COMPANY_SIZES: Company["companySize"][] = [
  "",
  "micro",
  "small",
  "medium",
  "large",
  "enterprise",
];

function normalizeCompany(raw: Partial<Company>): Company {
  const now = new Date().toISOString();
  const size = (raw.companySize ?? "") as Company["companySize"];

  return {
    id: raw.id || "comp_001",
    name: raw.name || "",
    description: raw.description || "",
    nit: raw.nit || "",
    address: raw.address || "",
    phone: raw.phone || "",
    email: raw.email || "",
    logoUrl: raw.logoUrl || "",
    industry: raw.industry || "",
    city: raw.city || "",
    website: raw.website || "",
    legalRepresentative: raw.legalRepresentative || "",
    companySize: COMPANY_SIZES.includes(size) ? size : "",
    branchCount: typeof raw.branchCount === "number" ? raw.branchCount : 0,
    employeeCount: typeof raw.employeeCount === "number" ? raw.employeeCount : 0,
    foundedYear: typeof raw.foundedYear === "number" ? raw.foundedYear : null,
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
  };
}

export async function getCompanyAction(): Promise<Company> {
  const company = await readJsonFile<Partial<Company>>("company.json");
  return normalizeCompany(company);
}

export async function updateCompanyAction(
  data: UpdateCompanyRequest
): Promise<UpdateCompanyResponse> {
  try {
    const company = await getCompanyAction();

    const updated: Company = {
      ...company,
      name: data.name,
      description: data.description,
      nit: data.nit,
      address: data.address,
      phone: data.phone,
      email: data.email,
      industry: data.industry,
      city: data.city,
      website: data.website,
      legalRepresentative: data.legalRepresentative,
      companySize: data.companySize,
      branchCount: data.branchCount,
      employeeCount: data.employeeCount,
      foundedYear: data.foundedYear,
      updatedAt: new Date().toISOString(),
    };

    await writeJsonFile("company.json", updated);
    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar empresa",
    };
  }
}

export async function uploadLogoAction(data: UploadLogoRequest): Promise<UploadLogoResponse> {
  try {
    const { base64, filename } = data;
    if (!base64 || !filename) {
      return { success: false, error: "No se envio archivo" };
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "png";
    const allowed = ["png", "jpg", "jpeg", "webp", "svg"];
    if (!allowed.includes(ext)) {
      return { success: false, error: "Formato no permitido. Usa: " + allowed.join(", ") };
    }

    const dataUri = `data:image/${ext};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "retofactus/logos",
      public_id: "company-logo",
      overwrite: true,
      resource_type: "image",
    });

    const logoUrl = result.secure_url;

    // Update company.json with new logo URL
    const company = await getCompanyAction();
    company.logoUrl = logoUrl;
    company.updatedAt = new Date().toISOString();
    await writeJsonFile("company.json", company);

    return { success: true, logoUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al subir logo",
    };
  }
}
