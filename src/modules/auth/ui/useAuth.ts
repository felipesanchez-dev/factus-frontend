"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "../application/auth.service";
import { AuthApiAdapter } from "../infrastructure/auth-api.adapter";
import type { AppLoginRequest, LoginResponse, TokenInfo, SessionUser } from "../domain/auth.types";
import { getRolesConfigAction } from "@/modules/roles/infrastructure/roles.actions";
import { getHomePath } from "@/shared/lib/permissions";

const TOKEN_STORAGE_KEY = "factus_token";
const USER_STORAGE_KEY = "factus_user";
const REFRESH_INTERVAL_MS = 45 * 60 * 1000; // 45 minutos

// Wiring hexagonal
const authAdapter = new AuthApiAdapter();
const authService = new AuthService(authAdapter);

function saveTokenToStorage(token: TokenInfo): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
}

function getTokenFromStorage(): TokenInfo | null {
  const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenInfo;
  } catch {
    return null;
  }
}

function saveUserToStorage(user: SessionUser): void {
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function getUserFromStorage(): SessionUser | null {
  const raw = sessionStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function clearStorage(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

export function useAuth() {
  const router = useRouter();
  const [tokenData, setTokenData] = useState<TokenInfo | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restaurar sesion desde sessionStorage al montar
  useEffect(() => {
    const storedToken = getTokenFromStorage();
    const storedUser = getUserFromStorage();
    if (storedToken && storedUser) {
      setTokenData(storedToken);
      setUser(storedUser);
    }
  }, []);

  // Auto-refresh: configurar intervalo cuando hay token
  const startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    refreshTimerRef.current = setInterval(async () => {
      const currentToken = getTokenFromStorage();
      if (!currentToken?.refreshToken) return;

      const result = await authService.refreshToken(currentToken.refreshToken);
      if (result.success) {
        setTokenData(result.data);
        saveTokenToStorage(result.data);
      } else {
        clearStorage();
        setTokenData(null);
        setUser(null);
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
        router.push("/");
      }
    }, REFRESH_INTERVAL_MS);
  }, [router]);

  // Iniciar timer cuando hay token
  useEffect(() => {
    if (tokenData) {
      startRefreshTimer();
    }
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [tokenData, startRefreshTimer]);

  const login = useCallback(
    async (credentials: AppLoginRequest): Promise<LoginResponse> => {
      setError(null);
      setLoading(true);

      try {
        const response = await authService.login(credentials);

        if (response.success) {
          setTokenData(response.data);
          setUser(response.user);
          saveTokenToStorage(response.data);
          saveUserToStorage(response.user);
          const rolesConfig = await getRolesConfigAction();
          router.push(getHomePath(response.user.role, rolesConfig));
        } else {
          setError(response.error);
        }

        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    clearStorage();
    setTokenData(null);
    setUser(null);
    setError(null);
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    router.push("/");
  }, [router]);

  return {
    tokenData,
    user,
    loading,
    error,
    isAuthenticated: !!tokenData,
    login,
    logout,
  };
}
