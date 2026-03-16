import type { BranchesRepository } from "../domain/branches.repository";
import type { Branch, CreateBranchRequest, UpdateBranchRequest, BranchActionResponse } from "../domain/branches.types";

export class BranchesService {
  constructor(private readonly repository: BranchesRepository) {}

  async getAll(): Promise<Branch[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<Branch | null> {
    return this.repository.getById(id);
  }

  async create(data: CreateBranchRequest): Promise<BranchActionResponse> {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateBranchRequest): Promise<BranchActionResponse> {
    return this.repository.update(id, data);
  }

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    return this.repository.remove(id);
  }
}
