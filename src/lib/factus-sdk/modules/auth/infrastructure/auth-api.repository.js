"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthApiRepository = void 0;
const OAUTH_TOKEN_PATH = "/oauth/token";
class AuthApiRepository {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async login(credentials) {
        const body = new URLSearchParams({
            grant_type: "password",
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            username: credentials.username,
            password: credentials.password,
        });
        const response = await this.httpClient.post(OAUTH_TOKEN_PATH, body, { "Content-Type": "application/x-www-form-urlencoded" });
        return response.data;
    }
    async refreshToken(request) {
        const body = new URLSearchParams({
            grant_type: "refresh_token",
            client_id: request.clientId,
            client_secret: request.clientSecret,
            refresh_token: request.refreshToken,
        });
        const response = await this.httpClient.post(OAUTH_TOKEN_PATH, body, { "Content-Type": "application/x-www-form-urlencoded" });
        return response.data;
    }
}
exports.AuthApiRepository = AuthApiRepository;
//# sourceMappingURL=auth-api.repository.js.map