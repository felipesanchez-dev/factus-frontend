"use client";

import { useState } from "react";
import { useCompany } from "./useCompany";
import { CompanyForm } from "./CompanyForm";
import { CompanyProfile } from "./CompanyProfile";
import { Loader2 } from "lucide-react";
import type { Company, UpdateCompanyRequest } from "../domain/company.types";

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function isCompanyConfigured(company: Company): boolean {
  return hasText(company.name) && hasText(company.nit) && hasText(company.email);
}

export function CompanyView() {
  const { company, loading, saving, error, updateCompany, uploadLogo } = useCompany();
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!company) {
    return (
      <p className="text-center text-red-500 dark:text-red-400 py-12">
        No se pudo cargar la empresa.
      </p>
    );
  }

  const configured = isCompanyConfigured(company);
  const showForm = !configured || isEditing;

  async function handleSave(data: UpdateCompanyRequest) {
    const result = await updateCompany(data);
    if (result.success) {
      setIsEditing(false);
    }
    return result;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      {showForm ? (
        <CompanyForm
          company={company}
          saving={saving}
          onSave={handleSave}
          onUploadLogo={uploadLogo}
          onCancel={configured ? () => setIsEditing(false) : undefined}
        />
      ) : (
        <CompanyProfile company={company} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}
