"use client";

import { useCallback, useEffect, useState } from "react";
import { UsersService } from "../application/users.service";
import { UsersJsonAdapter } from "../infrastructure/users-json.adapter";
import type { SafeUser, CreateUserRequest, UpdateUserRequest } from "../domain/users.types";

const adapter = new UsersJsonAdapter();
const service = new UsersService(adapter);

export function useUsers() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(async (data: CreateUserRequest) => {
    setSaving(true);
    setError(null);
    try {
      const result = await service.create(data);
      if (result.success) await fetchUsers();
      else setError(result.error || "Error al crear");
      return result;
    } finally {
      setSaving(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, data: UpdateUserRequest) => {
    setSaving(true);
    setError(null);
    try {
      const result = await service.update(id, data);
      if (result.success) await fetchUsers();
      else setError(result.error || "Error al actualizar");
      return result;
    } finally {
      setSaving(false);
    }
  }, [fetchUsers]);

  const removeUser = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const result = await service.remove(id);
      if (result.success) await fetchUsers();
      else setError(result.error || "Error al eliminar");
      return result;
    } finally {
      setSaving(false);
    }
  }, [fetchUsers]);

  return { users, loading, saving, error, createUser, updateUser, removeUser, refetch: fetchUsers };
}

export function useUser(id: string) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    service.getById(id).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, [id]);

  return { user, loading };
}
