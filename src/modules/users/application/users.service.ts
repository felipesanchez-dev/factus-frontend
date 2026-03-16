import type { UsersRepository } from "../domain/users.repository";
import type { SafeUser, CreateUserRequest, UpdateUserRequest, UserActionResponse } from "../domain/users.types";

export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async getAll(): Promise<SafeUser[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<SafeUser | null> {
    return this.repository.getById(id);
  }

  async create(data: CreateUserRequest): Promise<UserActionResponse> {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateUserRequest): Promise<UserActionResponse> {
    return this.repository.update(id, data);
  }

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    return this.repository.remove(id);
  }
}
