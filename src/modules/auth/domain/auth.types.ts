import type { Role } from "@/shared/lib/permissions.types";

export interface AppLoginRequest {
  username: string;
  password: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
}

export interface SessionUser {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  branchId: string | null;
}

export interface LoginSuccess {
  success: true;
  data: TokenInfo;
  user: SessionUser;
}

export interface LoginError {
  success: false;
  error: string;
}

export type LoginResponse = LoginSuccess | LoginError;

export interface RefreshSuccess {
  success: true;
  data: TokenInfo;
}

export interface RefreshError {
  success: false;
  error: string;
}

export type RefreshResponse = RefreshSuccess | RefreshError;
