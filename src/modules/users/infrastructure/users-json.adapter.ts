import type { UsersRepository } from "../domain/users.repository";
import type { SafeUser, CreateUserRequest, UpdateUserRequest, UserActionResponse } from "../domain/users.types";
import {
  getAllUsersAction,
  getUserByIdAction,
  createUserAction,
  updateUserAction,
  removeUserAction,
} from "./users.actions";

export class UsersJsonAdapter implements UsersRepository {
  async getAll(): Promise<SafeUser[]> {
    return getAllUsersAction();
  }

  async getById(id: string): Promise<SafeUser | null> {
    return getUserByIdAction(id);
  }

  async create(data: CreateUserRequest): Promise<UserActionResponse> {
    return createUserAction(data);
  }

  async update(id: string, data: UpdateUserRequest): Promise<UserActionResponse> {
    return updateUserAction(id, data);
  }

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    return removeUserAction(id);
  }
}
