"use client";

import { useCallback, useEffect, useState } from "react";
import { useCompany } from "./useCompany";
import { CompanyForm } from "./CompanyForm";
import { CompanyProfile } from "./CompanyProfile";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Cloud } from "lucide-react";
import type { Company, UpdateCompanyRequest, FactusCompanyInfo } from "../domain/company.types";
import {
  getFactusCompanyAction,
  syncCompanyToFactusAction,
} from "../infrastructure/company.actions";

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function isCompanyConfigured(company: Company): boolean {
  return hasText(company.name) && hasText(company.nit) && hasText(company.email);
}

type SyncStatus = "idle" | "syncing" | "success" | "error";

export function CompanyView() {
  const { company, loading, saving, error, updateCompany, uploadLogo } = useCompany();
  const [isEditing, setIsEditing] = useState(false);

  // Factus sync state
  const [factusInfo, setFactusInfo] = useState<FactusCompanyInfo | null>(null);
  const [factusLoading, setFactusLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchFactusInfo = useCallback(async () => {
    setFactusLoading(true);
    try {
      const info = await getFactusCompanyAction();
      setFactusInfo(info);
    } catch {
      // Silently fail — info is optional
    } finally {
      setFactusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFactusInfo();
  }, [fetchFactusInfo]);

  async function handleSync() {
    setSyncStatus("syncing");
    setSyncError(null);
    const result = await syncCompanyToFactusAction();
    if (result.success) {
      setSyncStatus("success");
      await fetchFactusInfo();
    } else {
      setSyncStatus("error");
      setSyncError(result.error || "Error desconocido");
    }
  }

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
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
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
        <>
          <CompanyProfile company={company} onEdit={() => setIsEditing(true)} />

          {/* Factus Sync Section */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sincronizacion con Factus
              </h3>
            </div>

            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Sincroniza los datos de tu empresa con Factus para que las facturas se emitan con el nombre correcto.
            </p>

            {/* Current Factus info */}
            {factusLoading ? (
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Consultando datos de Factus...
              </div>
            ) : factusInfo ? (
              <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                  Emisor actual en Factus
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Nombre: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {factusInfo.graphicRepresentationName || factusInfo.name || "Sin configurar"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">NIT: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {factusInfo.nit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Email: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {factusInfo.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Municipio: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {factusInfo.municipality || "No registrado"}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Sync status messages */}
            {syncStatus === "success" && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Empresa sincronizada correctamente con Factus.
              </div>
            )}
            {syncStatus === "error" && syncError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {syncError}
              </div>
            )}

            <Button
              type="button"
              onClick={handleSync}
              loading={syncStatus === "syncing"}
              disabled={syncStatus === "syncing"}
            >
              {syncStatus === "syncing" ? (
                "Sincronizando..."
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Sincronizar con Factus
                </span>
              )}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
