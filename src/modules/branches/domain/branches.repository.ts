import type { Branch, CreateBranchRequest, UpdateBranchRequest, BranchActionResponse } from "./branches.types";

export interface BranchesRepository {
  getAll(): Promise<Branch[]>;
  getById(id: string): Promise<Branch | null>;
  create(data: CreateBranchRequest): Promise<BranchActionResponse>;
  update(id: string, data: UpdateBranchRequest): Promise<BranchActionResponse>;
  remove(id: string): Promise<{ success: boolean; error?: string }>;
}
