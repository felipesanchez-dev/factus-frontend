import { AuthRepository } from "../domain/auth.repository";
import { AppLoginRequest, LoginResponse, RefreshResponse } from "../domain/auth.types";

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async login(credentials: AppLoginRequest): Promise<LoginResponse> {
    return this.repository.login(credentials);
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    return this.repository.refreshToken(refreshToken);
  }
}
