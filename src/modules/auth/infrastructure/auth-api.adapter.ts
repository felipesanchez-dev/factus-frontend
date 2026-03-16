import { AuthRepository } from "../domain/auth.repository";
import { AppLoginRequest, LoginResponse, RefreshResponse } from "../domain/auth.types";
import { loginAction, refreshTokenAction } from "./auth.actions";

export class AuthApiAdapter implements AuthRepository {
  async login(credentials: AppLoginRequest): Promise<LoginResponse> {
    return loginAction(credentials);
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    return refreshTokenAction(refreshToken);
  }
}
