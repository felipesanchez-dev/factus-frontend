"use client";

import Image from "next/image";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import type { Company, CompanySize } from "../domain/company.types";

interface CompanyProfileProps {
  company: Company;
  onEdit?: () => void;
}

const SIZE_LABELS: Record<Exclude<CompanySize, "">, string> = {
  micro: "Microempresa",
  small: "Pequena",
  medium: "Mediana",
  large: "Grande",
  enterprise: "Corporativa",
};

function textOrFallback(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : "No registrado";
}

function numberOrFallback(value: number | null | undefined): string {
  if (value == null) return "No registrado";
  return new Intl.NumberFormat("es-CO").format(value);
}

function formatDate(value: string): string {
  if (!value) return "No disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";

  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}

export function CompanyProfile({ company, onEdit }: CompanyProfileProps) {
  const companySize = company.companySize
    ? SIZE_LABELS[company.companySize as Exclude<CompanySize, "">]
    : "No registrado";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt="Logo empresa"
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl border border-gray-200 bg-white object-cover dark:border-gray-700 dark:bg-gray-900"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-400 dark:border-gray-700 dark:text-gray-500">
                LOGO
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {textOrFallback(company.name)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {textOrFallback(company.description)}
              </p>
            </div>
          </div>
          {onEdit && (
            <Button type="button" variant="outline" onClick={onEdit}>
              Editar hoja de vida
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Informacion General
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="NIT" value={textOrFallback(company.nit)} />
          <Field label="Representante Legal" value={textOrFallback(company.legalRepresentative)} />
          <Field label="Sector Economico" value={textOrFallback(company.industry)} />
          <Field label="Ciudad Principal" value={textOrFallback(company.city)} />
          <Field label="Direccion" value={textOrFallback(company.address)} />
          <Field label="Ano de Fundacion" value={company.foundedYear?.toString() || "No registrado"} />
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Contacto y Estructura
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Telefono" value={textOrFallback(company.phone)} />
          <Field label="Email" value={textOrFallback(company.email)} />
          <Field label="Sitio Web" value={textOrFallback(company.website)} />
          <Field label="Tamano de Empresa" value={companySize} />
          <Field label="Sucursales" value={numberOrFallback(company.branchCount)} />
          <Field label="Empleados" value={numberOrFallback(company.employeeCount)} />
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Creado" value={formatDate(company.createdAt)} />
          <Field label="Ultima Actualizacion" value={formatDate(company.updatedAt)} />
        </div>
      </Card>
    </div>
  );
}
