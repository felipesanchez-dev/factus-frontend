import { AppLoginRequest, LoginResponse, RefreshResponse } from "./auth.types";

/**
 * Port: contrato que cualquier adapter de autenticacion debe implementar.
 */
export interface AuthRepository {
  login(credentials: AppLoginRequest): Promise<LoginResponse>;
  refreshToken(refreshToken: string): Promise<RefreshResponse>;
}
