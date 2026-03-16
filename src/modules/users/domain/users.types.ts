import type { Role } from "@/shared/lib/permissions.types";

export interface User {
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

export type SafeUser = Omit<User, "password">;

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: Role;
  branchId: string | null;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  role: Role;
  branchId: string | null;
  isActive: boolean;
  password?: string;
}

export interface UserActionResponse {
  success: boolean;
  error?: string;
  data?: SafeUser;
}
