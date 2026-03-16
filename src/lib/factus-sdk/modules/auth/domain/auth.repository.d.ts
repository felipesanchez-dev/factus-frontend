import { LoginCredentials, OAuthTokenResponse, RefreshTokenRequest } from "../../../core/types";
/**
 * Port: defines the contract that any auth infrastructure adapter must implement.
 */
export interface AuthRepository {
    login(credentials: LoginCredentials): Promise<OAuthTokenResponse>;
    refreshToken(request: RefreshTokenRequest): Promise<OAuthTokenResponse>;
}
//# sourceMappingURL=auth.repository.d.ts.map