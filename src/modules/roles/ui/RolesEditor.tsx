"use client";

import { useState, useCallback } from "react";
import { Save, Shield, ShieldCheck, Loader2, Check } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { useRolesConfig } from "@/shared/context/RolesConfigContext";
import { updateRoleConfigAction } from "../infrastructure/roles.actions";
import type { Role, Area, Permission, RoleConfig } from "@/shared/lib/permissions.types";

const EDITABLE_ROLES: Role[] = ["admin_sucursal", "vendedor", "visor"];

const ALL_AREAS: { value: Area; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "empresa", label: "Empresa" },
  { value: "productos", label: "Productos" },
  { value: "facturacion", label: "Facturacion" },
  { value: "usuarios", label: "Usuarios" },
  { value: "sucursales", label: "Sucursales" },
  { value: "metricas", label: "Metricas" },
  { value: "configuracion", label: "Configuracion" },
  { value: "tienda", label: "Mi Tienda" },
];

const ALL_PERMISSIONS: { value: Permission; label: string }[] = [
  { value: "read", label: "Lectura" },
  { value: "write", label: "Escritura" },
  { value: "delete", label: "Eliminar" },
];

export function RolesEditor() {
  const { config, reload } = useRolesConfig();
  const [editState, setEditState] = useState<Record<string, RoleConfig>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedRole, setSavedRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function getEditConfig(role: Role): RoleConfig {
    return editState[role] ?? config[role];
  }

  function updateField(role: Role, updates: Partial<RoleConfig>) {
    setEditState((prev) => ({
      ...prev,
      [role]: { ...getEditConfig(role), ...updates },
    }));
    setSavedRole(null);
  }

  function toggleArea(role: Role, area: Area) {
    const current = getEditConfig(role);
    const has = current.areas.includes(area);
    const newAreas = has
      ? current.areas.filter((a) => a !== area)
      : [...current.areas, area];
    updateField(role, { areas: newAreas as Area[] });
  }

  function togglePermission(role: Role, permission: Permission) {
    const current = getEditConfig(role);
    const has = current.permissions.includes(permission);
    const newPerms = has
      ? current.permissions.filter((p) => p !== permission)
      : [...current.permissions, permission];
    updateField(role, { permissions: newPerms as Permission[] });
  }

  const handleSave = useCallback(
    async (role: Role) => {
      setSaving(role);
      setError(null);
      const roleConfig = getEditConfig(role);
      const result = await updateRoleConfigAction(role, roleConfig);
      if (result.success) {
        await reload();
        setEditState((prev) => {
          const next = { ...prev };
          delete next[role];
          return next;
        });
        setSavedRole(role);
        setTimeout(() => setSavedRole(null), 2000);
      } else {
        setError(result.error ?? "Error al guardar");
      }
      setSaving(null);
    },
    [editState, config, reload],
  );

  const hasChanges = (role: Role) => !!editState[role];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Configuracion de Roles
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Personaliza las areas y permisos de cada rol del sistema.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Super Admin — Read Only */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {config.super_admin.label}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Acceso total al sistema
              </p>
            </div>
          </div>
          <Badge variant="info">No editable</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_AREAS.map((area) => (
            <span
              key={area.value}
              className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            >
              {area.label}
            </span>
          ))}
          <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ml-2">
            Todos los permisos
          </span>
        </div>
      </Card>

      {/* Editable Roles */}
      {EDITABLE_ROLES.map((role) => {
        const roleConfig = getEditConfig(role);
        const isSaving = saving === role;
        const justSaved = savedRole === role;
        const changed = hasChanges(role);

        return (
          <Card key={role}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <input
                    type="text"
                    value={roleConfig.label}
                    onChange={(e) => updateField(role, { label: e.target.value })}
                    className="text-base font-semibold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors px-0 py-0.5"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    {role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {justSaved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    Guardado
                  </span>
                )}
                <Button
                  onClick={() => handleSave(role)}
                  disabled={!changed || isSaving}
                  loading={isSaving}
                  className="text-sm"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
              </div>
            </div>

            {/* Areas */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Areas de acceso
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_AREAS.map((area) => {
                  const checked = roleConfig.areas.includes(area.value);

                  return (
                    <label
                      key={area.value}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        checked
                          ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArea(role, area.value)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {area.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Permissions */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Permisos
              </p>
              <div className="flex gap-3">
                {ALL_PERMISSIONS.map((perm) => {
                  const checked = roleConfig.permissions.includes(perm.value);

                  return (
                    <label
                      key={perm.value}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm cursor-pointer transition-colors ${
                        checked
                          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(role, perm.value)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      {perm.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Home Page */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Pagina de inicio
              </p>
              <select
                value={roleConfig.homePage}
                onChange={(e) =>
                  updateField(role, { homePage: e.target.value as Area })
                }
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none"
              >
                {roleConfig.areas.map((area) => {
                  const areaInfo = ALL_AREAS.find((a) => a.value === area);
                  return (
                    <option key={area} value={area}>
                      {areaInfo?.label ?? area}
                    </option>
                  );
                })}
              </select>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                A donde se redirige al iniciar sesion
              </p>
            </div>

            {/* Branch Scoped */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Vinculacion a sucursal
              </p>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roleConfig.branchScoped}
                  onChange={(e) =>
                    updateField(role, { branchScoped: e.target.checked })
                  }
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Este rol esta vinculado a una sucursal especifica
              </label>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
