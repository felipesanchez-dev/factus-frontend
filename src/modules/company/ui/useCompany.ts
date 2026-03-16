"use client";

import { useCallback, useEffect, useState } from "react";
import { CompanyService } from "../application/company.service";
import { CompanyJsonAdapter } from "../infrastructure/company-json.adapter";
import type { Company, UpdateCompanyRequest } from "../domain/company.types";

const adapter = new CompanyJsonAdapter();
const service = new CompanyService(adapter);

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getCompany();
      setCompany(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar empresa");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const updateCompany = useCallback(async (data: UpdateCompanyRequest) => {
    setSaving(true);
    setError(null);
    try {
      const result = await service.updateCompany(data);
      if (result.success && result.data) {
        setCompany(result.data);
      } else {
        setError(result.error || "Error al guardar");
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    setSaving(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      const result = await service.uploadLogo({ base64, filename: file.name });
      if (result.success && result.logoUrl) {
        setCompany((prev) => prev ? { ...prev, logoUrl: result.logoUrl! } : prev);
      } else {
        setError(result.error || "Error al subir logo");
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al subir logo";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  return { company, loading, saving, error, updateCompany, uploadLogo, refetch: fetchCompany };
}
