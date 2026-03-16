"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Modal } from "@/shared/components/Modal";
import { UsersService } from "../application/users.service";
import { UsersJsonAdapter } from "../infrastructure/users-json.adapter";
import { getAllBranchesAction } from "@/modules/branches/infrastructure/branches.actions";
import type { Branch } from "@/modules/branches/domain/branches.types";
import type {
  CreateUserRequest,
  UpdateUserRequest,
} from "../domain/users.types";
import type { Role } from "@/shared/lib/permissions.types";
import { useRolesConfig } from "@/shared/context/RolesConfigContext";

const adapter = new UsersJsonAdapter();
const service = new UsersService(adapter);

const ROLE_KEYS: Role[] = ["super_admin", "admin_sucursal", "vendedor", "visor"];

interface UserFormProps {
  userId?: string;
}

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const { config } = useRolesConfig();
  const isEdit = !!userId;

  const roleOptions = ROLE_KEYS.map((key) => ({
    value: key,
    label: config[key]?.label ?? key,
  }));

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("vendedor");
  const [branchId, setBranchId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);

  const needsBranch = role !== "super_admin";

  useEffect(() => {
    getAllBranchesAction().then(setBranches);
  }, []);

  useEffect(() => {
    if (!userId) return;
    service.getById(userId).then((user) => {
      if (user) {
        setUsername(user.username);
        setFullName(user.fullName);
        setEmail(user.email);
        setRole(user.role);
        setBranchId(user.branchId || "");
        setIsActive(user.isActive);
      }
      setLoading(false);
    });
  }, [userId]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);

      try {
        if (needsBranch && !branchId) {
          setError("Debe seleccionar una sucursal para este rol");
          return;
        }

        const effectiveBranchId = needsBranch ? branchId : null;

        if (isEdit && userId) {
          const data: UpdateUserRequest = {
            fullName,
            email,
            role,
            branchId: effectiveBranchId,
            isActive,
            ...(password ? { password } : {}),
          };
          const result = await service.update(userId, data);
          if (!result.success) {
            setError(result.error || "Error al actualizar");
            return;
          }
        } else {
          if (!password) {
            setError("La contrasena es obligatoria");
            return;
          }
          const data: CreateUserRequest = {
            username,
            password,
            fullName,
            email,
            role,
            branchId: effectiveBranchId,
          };
          const result = await service.create(data);
          if (!result.success) {
            setError(result.error || "Error al crear");
            return;
          }
        }
        router.push("/dashboard/usuarios");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setSaving(false);
      }
    },
    [
      isEdit,
      userId,
      username,
      password,
      fullName,
      email,
      role,
      branchId,
      needsBranch,
      isActive,
      router,
    ],
  );

  const handleDelete = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    const result = await service.remove(userId);
    if (result.success) {
      router.push("/dashboard/usuarios");
    } else {
      setError(result.error || "Error al eliminar");
      setSaving(false);
    }
  }, [userId, router]);

  if (loading) {
    return (
      <p className='mx-auto max-w-2xl py-12 text-center text-gray-400 dark:text-gray-500'>
        Cargando...
      </p>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className='mx-auto w-full max-w-3xl space-y-6'
      >
        {error && (
          <div className='rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400'>
            {error}
          </div>
        )}

        <Card>
          <div className='mb-5'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Completa los datos del usuario y asigna su rol en el sistema.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <Input
                label='Nombre Completo'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <Input
              label='Nombre de Usuario'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isEdit}
              required={!isEdit}
            />
            <Select
              label='Rol'
              options={roleOptions}
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as Role;
                setRole(newRole);
                if (newRole === "super_admin") setBranchId("");
              }}
            />
            {needsBranch && (
              <Select
                label='Sucursal'
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                placeholder='Seleccionar sucursal...'
                required
              />
            )}
            <Input
              label='Email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={
                isEdit
                  ? "Nueva Contraseña (dejar vacio para no cambiar)"
                  : "Contraseña"
              }
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
            />
            {isEdit && (
              <div className='sm:col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2'
                />
                <label
                  htmlFor='isActive'
                  className='text-sm text-gray-700 dark:text-gray-300'
                >
                  Usuario activo
                </label>
              </div>
            )}
          </div>
        </Card>

        <div className='flex items-center justify-between'>
          {isEdit ? (
            <Button
              type='button'
              variant='ghost'
              className='text-red-600 hover:bg-red-50'
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className='h-4 w-4' />
              Eliminar
            </Button>
          ) : (
            <div />
          )}
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type='submit' loading={saving}>
              {isEdit ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </div>
        </div>
      </form>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title='Eliminar Usuario'
        size='sm'
      >
        <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
          Esta accion no se puede deshacer. El usuario sera eliminado
          permanentemente.
        </p>
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={() => setShowDelete(false)}>
            Cancelar
          </Button>
          <Button
            className='bg-red-600 hover:bg-red-700'
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
