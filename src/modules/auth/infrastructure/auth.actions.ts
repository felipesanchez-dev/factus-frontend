"use server";

import { FactusError } from "factus-sdk";
import { getFactusClient } from "@/shared/lib/factus-auth";
import { readJsonFile } from "@/shared/lib/json-storage";
import { verifyPassword } from "@/shared/lib/password";
import type { Role } from "@/shared/lib/permissions.types";
import {
  AppLoginRequest,
  LoginResponse,
  RefreshResponse,
} from "../domain/auth.types";

interface DataUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: Role;
  branchId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function validateAppUser(
  credentials: AppLoginRequest,
): Promise<DataUser | null> {
  const users = await readJsonFile<DataUser[]>("users.json");
  for (const u of users) {
    if (u.username !== credentials.username || !u.isActive) continue;
    const match = await verifyPassword(credentials.password, u.password);
    if (match) return u;
  }
  return null;
}

export async function loginAction(
  credentials: AppLoginRequest,
): Promise<LoginResponse> {
  // 1. Validar usuario contra JSON local
  const user = await validateAppUser(credentials);
  if (!user) {
    return { success: false, error: "Usuario o contraseña incorrectos." };
  }

  // 2. Autenticar contra FACTUS API usando el SDK singleton
  try {
    const factus = await getFactusClient();

    const tokenInfo = factus.auth.getTokenInfo();
    if (!tokenInfo) {
      return {
        success: false,
        error: "No se pudo obtener el token de la API FACTUS.",
      };
    }

    return {
      success: true,
      data: {
        accessToken: tokenInfo.accessToken,
        refreshToken: tokenInfo.refreshToken,
        tokenType: tokenInfo.tokenType,
        expiresAt: tokenInfo.expiresAt,
      },
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        branchId: user.branchId,
      },
    };
  } catch (error) {
    if (error instanceof FactusError) {
      return { success: false, error: `[${error.code}] ${error.message}` };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al autenticar con FACTUS",
    };
  }
}

export async function refreshTokenAction(
  _refreshToken: string,
): Promise<RefreshResponse> {
  try {
    // Use SDK singleton — it handles token refresh automatically
    const factus = await getFactusClient();
    await factus.auth.refresh();

    const tokenInfo = factus.auth.getTokenInfo();
    if (!tokenInfo) {
      return { success: false, error: "No se pudo refrescar el token." };
    }

    return {
      success: true,
      data: {
        accessToken: tokenInfo.accessToken,
        refreshToken: tokenInfo.refreshToken,
        tokenType: tokenInfo.tokenType,
        expiresAt: tokenInfo.expiresAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al refrescar token",
    };
  }
}
