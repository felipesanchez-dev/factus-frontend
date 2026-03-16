"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Role } from "@/shared/lib/permissions.types";

interface AuthContextValue {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  branchId: string | null;
  logout: () => void;
}

const AuthCtx = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: ReactNode;
}) {
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useSession(): AuthContextValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("useSession must be used within AuthProvider");
  }
  return ctx;
}
