"use server";

import { readJsonFile, writeJsonFile, generateId } from "@/shared/lib/json-storage";
import { getFactusClient } from "@/shared/lib/factus-auth";
import type { Branch, CreateBranchRequest, UpdateBranchRequest, BranchActionResponse } from "../domain/branches.types";

export interface Municipality {
  id: number;
  code: string;
  name: string;
  department: string;
}

let municipalitiesCache: Municipality[] | null = null;

export async function getMunicipalitiesAction(): Promise<Municipality[]> {
  if (municipalitiesCache) return municipalitiesCache;

  try {
    const factus = await getFactusClient();
    const data = await factus.catalogs.municipalities();
    municipalitiesCache = data;
    return data;
  } catch {
    return [];
  }
}

export async function getAllBranchesAction(): Promise<Branch[]> {
  return readJsonFile<Branch[]>("branches.json");
}

export async function getBranchByIdAction(id: string): Promise<Branch | null> {
  const branches = await readJsonFile<Branch[]>("branches.json");
  return branches.find((b) => b.id === id) ?? null;
}

export async function createBranchAction(data: CreateBranchRequest): Promise<BranchActionResponse> {
  try {
    const branches = await readJsonFile<Branch[]>("branches.json");

    const now = new Date().toISOString();
    const newBranch: Branch = {
      id: generateId("br"),
      name: data.name,
      address: data.address,
      phone: data.phone,
      city: data.city,
      municipalityCode: data.municipalityCode,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    branches.push(newBranch);
    await writeJsonFile("branches.json", branches);

    return { success: true, data: newBranch };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear sucursal",
    };
  }
}

export async function updateBranchAction(
  id: string,
  data: UpdateBranchRequest
): Promise<BranchActionResponse> {
  try {
    const branches = await readJsonFile<Branch[]>("branches.json");
    const index = branches.findIndex((b) => b.id === id);

    if (index === -1) {
      return { success: false, error: "Sucursal no encontrada" };
    }

    const updated: Branch = {
      ...branches[index],
      name: data.name,
      address: data.address,
      phone: data.phone,
      city: data.city,
      municipalityCode: data.municipalityCode,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      isActive: data.isActive,
      updatedAt: new Date().toISOString(),
    };

    branches[index] = updated;
    await writeJsonFile("branches.json", branches);

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar sucursal",
    };
  }
}

export async function removeBranchAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const branches = await readJsonFile<Branch[]>("branches.json");
    const filtered = branches.filter((b) => b.id !== id);

    if (filtered.length === branches.length) {
      return { success: false, error: "Sucursal no encontrada" };
    }

    await writeJsonFile("branches.json", filtered);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar sucursal",
    };
  }
}
