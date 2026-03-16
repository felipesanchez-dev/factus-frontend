export interface OAuthTokenResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
}
export interface TokenData {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresAt: number;
}
export interface LoginCredentials {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
}
export interface RefreshTokenRequest {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
}
//# sourceMappingURL=auth.types.d.ts.map