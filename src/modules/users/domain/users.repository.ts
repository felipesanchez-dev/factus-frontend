import type { SafeUser, CreateUserRequest, UpdateUserRequest, UserActionResponse } from "./users.types";

export interface UsersRepository {
  getAll(): Promise<SafeUser[]>;
  getById(id: string): Promise<SafeUser | null>;
  create(data: CreateUserRequest): Promise<UserActionResponse>;
  update(id: string, data: UpdateUserRequest): Promise<UserActionResponse>;
  remove(id: string): Promise<{ success: boolean; error?: string }>;
}
