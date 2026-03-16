"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Modal } from "@/shared/components/Modal";
import { DynamicMapPicker } from "@/shared/components/DynamicMapPicker";
import {
  SearchableSelect,
  type SearchableOption,
} from "@/shared/components/SearchableSelect";
import { BranchesService } from "../application/branches.service";
import { BranchesJsonAdapter } from "../infrastructure/branches-json.adapter";
import {
  getMunicipalitiesAction,
  type Municipality,
} from "../infrastructure/branches.actions";
import type {
  CreateBranchRequest,
  UpdateBranchRequest,
} from "../domain/branches.types";

const adapter = new BranchesJsonAdapter();
const service = new BranchesService(adapter);

interface BranchFormProps {
  branchId?: string;
}

export function BranchForm({ branchId }: BranchFormProps) {
  const router = useRouter();
  const isEdit = !!branchId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [municipalityCode, setMunicipalityCode] = useState("");
  const [city, setCity] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Municipality options
  const [municipalities, setMunicipalities] = useState<SearchableOption[]>([]);
  const [municipalitiesLoading, setMunicipalitiesLoading] = useState(true);
  const [municipalitiesMap, setMunicipalitiesMap] = useState<
    Map<string, Municipality>
  >(new Map());

  // Load municipalities on mount
  useEffect(() => {
    getMunicipalitiesAction()
      .then((data) => {
        const map = new Map<string, Municipality>();
        const opts: SearchableOption[] = data.map((m) => {
          map.set(m.code, m);
          return {
            value: m.code,
            label: m.name,
            sublabel: m.department,
          };
        });
        setMunicipalities(opts);
        setMunicipalitiesMap(map);
      })
      .finally(() => setMunicipalitiesLoading(false));
  }, []);

  // Load branch data for edit
  useEffect(() => {
    if (!branchId) return;
    service.getById(branchId).then((branch) => {
      if (branch) {
        setName(branch.name);
        setAddress(branch.address);
        setPhone(branch.phone);
        setCity(branch.city);
        setMunicipalityCode(branch.municipalityCode || "");
        setIsActive(branch.isActive);
        setLatitude(branch.latitude ?? null);
        setLongitude(branch.longitude ?? null);
      }
      setLoading(false);
    });
  }, [branchId]);

  const handleMunicipalityChange = useCallback(
    (code: string, option: SearchableOption | null) => {
      setMunicipalityCode(code);
      if (option) {
        setCity(
          option.sublabel ? `${option.label}, ${option.sublabel}` : option.label,
        );
      } else {
        setCity("");
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);

      if (!municipalityCode) {
        setError("Debes seleccionar un municipio");
        setSaving(false);
        return;
      }

      try {
        if (isEdit && branchId) {
          const data: UpdateBranchRequest = {
            name,
            address,
            phone,
            city,
            municipalityCode,
            isActive,
            latitude,
            longitude,
          };
          const result = await service.update(branchId, data);
          if (!result.success) {
            setError(result.error || "Error al actualizar");
            return;
          }
        } else {
          const data: CreateBranchRequest = {
            name,
            address,
            phone,
            city,
            municipalityCode,
            latitude,
            longitude,
          };
          const result = await service.create(data);
          if (!result.success) {
            setError(result.error || "Error al crear");
            return;
          }
        }
        router.push(
          isEdit
            ? `/dashboard/sucursales/${branchId}`
            : "/dashboard/sucursales",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setSaving(false);
      }
    },
    [isEdit, branchId, name, address, phone, city, municipalityCode, isActive, latitude, longitude, router],
  );

  const handleDelete = useCallback(async () => {
    if (!branchId) return;
    setSaving(true);
    const result = await service.remove(branchId);
    if (result.success) {
      router.push("/dashboard/sucursales");
    } else {
      setError(result.error || "Error al eliminar");
      setSaving(false);
    }
  }, [branchId, router]);

  if (loading) {
    return (
      <p className="mx-auto max-w-2xl py-12 text-center text-gray-400 dark:text-gray-500">
        Cargando...
      </p>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl space-y-6"
      >
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEdit ? "Editar Sucursal" : "Nueva Sucursal"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Registra la informacion principal de la sucursal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nombre de la Sucursal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sucursal Centro"
              required
            />
            <SearchableSelect
              label="Municipio"
              options={municipalities}
              value={municipalityCode}
              onChange={handleMunicipalityChange}
              placeholder="Buscar municipio..."
              loading={municipalitiesLoading}
              required
            />
            <Input
              label="Direccion"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle 123 #45-67"
              required
            />
            <Input
              label="Telefono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 123 4567"
            />
            {isEdit && (
              <div className="sm:col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Sucursal activa
                </label>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ubicacion en el Mapa
            </label>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Haz clic en el mapa para seleccionar la ubicacion de la sucursal.
            </p>
            <DynamicMapPicker
              latitude={latitude}
              longitude={longitude}
              onLocationChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
            {latitude != null && longitude != null && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-between">
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {isEdit ? "Guardar Cambios" : "Crear Sucursal"}
            </Button>
          </div>
        </div>
      </form>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Eliminar Sucursal"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Esta accion no se puede deshacer. La sucursal sera eliminada permanentemente.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDelete(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            loading={saving}
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}
