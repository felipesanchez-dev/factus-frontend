"use client";

import { useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser, TokenInfo } from "@/modules/auth/domain/auth.types";
import { AuthProvider } from "./AuthContext";
import { CompanyProvider } from "./CompanyContext";
import { RolesConfigProvider } from "@/shared/context/RolesConfigContext";

const TOKEN_KEY = "factus_token";
const USER_KEY = "factus_user";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const rawToken = sessionStorage.getItem(TOKEN_KEY);
    const rawUser = sessionStorage.getItem(USER_KEY);

    if (!rawToken || !rawUser) {
      router.replace("/");
      return;
    }

    try {
      JSON.parse(rawToken) as TokenInfo;
      const parsed = JSON.parse(rawUser) as SessionUser;
      setUser(parsed);
      setReady(true);
    } catch {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      router.replace("/");
    }
  }, [router]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    router.replace("/");
  }, [router]);

  if (!ready || !user) return null;

  return (
    <AuthProvider
      value={{
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        branchId: user.branchId,
        logout,
      }}
    >
      <CompanyProvider>
        <RolesConfigProvider>{children}</RolesConfigProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}
