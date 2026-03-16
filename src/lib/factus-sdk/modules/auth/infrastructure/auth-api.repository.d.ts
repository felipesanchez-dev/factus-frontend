import { HttpClient } from "../../../core/http";
import { LoginCredentials, OAuthTokenResponse, RefreshTokenRequest } from "../../../core/types";
import { AuthRepository } from "../domain";
export declare class AuthApiRepository implements AuthRepository {
    private readonly httpClient;
    constructor(httpClient: HttpClient);
    login(credentials: LoginCredentials): Promise<OAuthTokenResponse>;
    refreshToken(request: RefreshTokenRequest): Promise<OAuthTokenResponse>;
}
//# sourceMappingURL=auth-api.repository.d.ts.map