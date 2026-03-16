"use client";

import { useCallback, useEffect, useState } from "react";
import { BranchesService } from "../application/branches.service";
import { BranchesJsonAdapter } from "../infrastructure/branches-json.adapter";
import type { Branch, CreateBranchRequest, UpdateBranchRequest } from "../domain/branches.types";

const adapter = new BranchesJsonAdapter();
const service = new BranchesService(adapter);

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getAll();
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar sucursales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const createBranch = useCallback(async (data: CreateBranchRequest) => {
    setSaving(true);
    setError(null);
    try {
      const result = await service.create(data);
      if (result.success) await fetchBranches();
      else setError(result.error || "Error al crear");
      return result;
    } finally {
      setSaving(false);
    }
  }, [fetchBranches]);

  const updateBranch = useCallback(async (id: string, data: UpdateBranchRequest) => {
    setSaving(true);
    setError(null);
    try {
      const result = await service.update(id, data);
      if (result.success) await fetchBranches();
      else setError(result.error || "Error al actualizar");
      return result;
    } finally {
      setSaving(false);
    }
  }, [fetchBranches]);

  const removeBranch = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const result = await service.remove(id);
      if (result.success) await fetchBranches();
      else setError(result.error || "Error al eliminar");
      return result;
    } finally {
      setSaving(false);
    }
  }, [fetchBranches]);

  return { branches, loading, saving, error, createBranch, updateBranch, removeBranch, refetch: fetchBranches };
}

export function useBranch(id: string) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    service.getById(id).then((data) => {
      setBranch(data);
      setLoading(false);
    });
  }, [id]);

  return { branch, loading };
}
