"use server";

import {
  readJsonFile,
  writeJsonFile,
  generateId,
} from "@/shared/lib/json-storage";
import { hashPassword } from "@/shared/lib/password";
import type {
  User,
  SafeUser,
  CreateUserRequest,
  UpdateUserRequest,
  UserActionResponse,
} from "../domain/users.types";

function stripPassword(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...safe } = user;
  return safe;
}

export async function getAllUsersAction(): Promise<SafeUser[]> {
  const users = await readJsonFile<User[]>("users.json");
  return users.map(stripPassword);
}

export async function getUserByIdAction(id: string): Promise<SafeUser | null> {
  const users = await readJsonFile<User[]>("users.json");
  const user = users.find((u) => u.id === id);
  return user ? stripPassword(user) : null;
}

export async function createUserAction(
  data: CreateUserRequest,
): Promise<UserActionResponse> {
  try {
    const users = await readJsonFile<User[]>("users.json");

    if (users.some((u) => u.username === data.username)) {
      return { success: false, error: "El nombre de usuario ya existe" };
    }

    const now = new Date().toISOString();
    const hashedPwd = await hashPassword(data.password);
    const newUser: User = {
      id: generateId("usr"),
      username: data.username,
      password: hashedPwd,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      branchId: data.branchId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    await writeJsonFile("users.json", users);

    return { success: true, data: stripPassword(newUser) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear usuario",
    };
  }
}

export async function updateUserAction(
  id: string,
  data: UpdateUserRequest,
): Promise<UserActionResponse> {
  try {
    const users = await readJsonFile<User[]>("users.json");
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const updated: User = {
      ...users[index],
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      branchId: data.branchId,
      isActive: data.isActive,
      updatedAt: new Date().toISOString(),
    };

    if (data.password) {
      updated.password = await hashPassword(data.password);
    }

    users[index] = updated;
    await writeJsonFile("users.json", users);

    return { success: true, data: stripPassword(updated) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al actualizar usuario",
    };
  }
}

export async function removeUserAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const users = await readJsonFile<User[]>("users.json");
    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) {
      return { success: false, error: "Usuario no encontrado" };
    }

    await writeJsonFile("users.json", filtered);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar usuario",
    };
  }
}
