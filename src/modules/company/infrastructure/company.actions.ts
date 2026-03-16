"use server";

import { readJsonFile, writeJsonFile } from "@/shared/lib/json-storage";
import { cloudinary } from "@/shared/lib/cloudinary";
import { getFactusClient } from "@/shared/lib/factus-auth";
import type {
  Company,
  UpdateCompanyRequest,
  UpdateCompanyResponse,
  UploadLogoRequest,
  UploadLogoResponse,
  SyncCompanyToFactusResponse,
  FactusCompanyInfo,
} from "../domain/company.types";

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

// ── Factus Company Sync ─────────────────────────────────────────────

export async function getFactusCompanyAction(): Promise<FactusCompanyInfo | null> {
  try {
    const factus = await getFactusClient();
    const data = await factus.company.show();
    return {
      name: data.company || data.graphic_representation_name || `${data.names} ${data.surnames}`.trim(),
      nit: `${data.nit}-${data.dv}`,
      email: data.email,
      phone: data.phone,
      address: data.address,
      municipality: data.municipality?.name
        ? `${data.municipality.name}, ${data.municipality.department?.name || ""}`
        : "",
      legalOrganization: data.legal_organization?.name || "",
      graphicRepresentationName: data.graphic_representation_name,
    };
  } catch {
    return null;
  }
}

export async function syncCompanyToFactusAction(): Promise<SyncCompanyToFactusResponse> {
  try {
    const company = await getCompanyAction();

    if (!company.name || !company.email) {
      return {
        success: false,
        error: "Configure el nombre y email de la empresa antes de sincronizar.",
      };
    }

    const factus = await getFactusClient();

    // Look up municipality code by city name
    let municipalityCode = "11001"; // Default: Bogotá
    if (company.city) {
      try {
        const municipalities = await factus.catalogs.municipalities();
        const cityNorm = company.city.trim().toLowerCase();
        const match = municipalities.find(
          (m) => m.name.toLowerCase() === cityNorm,
        );
        if (match) {
          municipalityCode = match.code;
        }
      } catch {
        // Keep default if catalog lookup fails
      }
    }

    // Split legalRepresentative into names/surnames for persona natural
    const repParts = (company.legalRepresentative || "").trim().split(/\s+/);
    const repNames = repParts.slice(0, Math.ceil(repParts.length / 2)).join(" ") || null;
    const repSurnames = repParts.slice(Math.ceil(repParts.length / 2)).join(" ") || null;

    await factus.company.update({
      legal_organization_code: "1", // Persona jurídica
      company: company.name,
      trade_name: company.name,
      names: repNames,
      surnames: repSurnames,
      registration_code: null,
      economic_activity: "6920",
      phone: company.phone || "0000000000",
      email: company.email,
      address: company.address || "Sin dirección",
      tribute_code: "ZZ",
      municipality_code: municipalityCode,
      responsibilities: "5",
    });

    return {
      success: true,
      companyName: company.name,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al sincronizar con Factus",
    };
  }
}
