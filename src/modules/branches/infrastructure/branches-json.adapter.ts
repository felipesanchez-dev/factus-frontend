import type { BranchesRepository } from "../domain/branches.repository";
import type { Branch, CreateBranchRequest, UpdateBranchRequest, BranchActionResponse } from "../domain/branches.types";
import {
  getAllBranchesAction,
  getBranchByIdAction,
  createBranchAction,
  updateBranchAction,
  removeBranchAction,
} from "./branches.actions";

export class BranchesJsonAdapter implements BranchesRepository {
  async getAll(): Promise<Branch[]> {
    return getAllBranchesAction();
  }

  async getById(id: string): Promise<Branch | null> {
    return getBranchByIdAction(id);
  }

  async create(data: CreateBranchRequest): Promise<BranchActionResponse> {
    return createBranchAction(data);
  }

  async update(id: string, data: UpdateBranchRequest): Promise<BranchActionResponse> {
    return updateBranchAction(id, data);
  }

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    return removeBranchAction(id);
  }
}
