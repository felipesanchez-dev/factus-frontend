"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const errors_1 = require("../../../core/errors");
class AuthService {
    constructor(repository, config, tokenManager) {
        this.repository = repository;
        this.config = config;
        this.tokenManager = tokenManager;
    }
    /** Authenticate using password grant and store the token. */
    async login() {
        const response = await this.repository.login({
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            username: this.config.username,
            password: this.config.password,
        });
        this.tokenManager.store(response);
    }
    /** Explicitly refresh the current token. */
    async refresh() {
        const refreshToken = this.tokenManager.getRefreshToken();
        if (!refreshToken) {
            throw new errors_1.FactusError("No refresh token available. Call login() first.", errors_1.FactusErrorCode.TOKEN_EXPIRED);
        }
        try {
            const response = await this.repository.refreshToken({
                clientId: this.config.clientId,
                clientSecret: this.config.clientSecret,
                refreshToken,
            });
            this.tokenManager.store(response);
        }
        catch (error) {
            // If refresh fails, attempt a full re-login as fallback
            try {
                await this.login();
            }
            catch (loginError) {
                this.tokenManager.clear();
                throw new errors_1.FactusError("Token refresh failed and re-login also failed.", errors_1.FactusErrorCode.TOKEN_REFRESH_FAILED, null, loginError);
            }
        }
    }
    /**
     * Returns a valid access token, refreshing automatically if needed.
     * This is the main method other modules should call to get a token.
     * Handles concurrency: only one refresh runs at a time.
     */
    async getValidToken() {
        if (!this.tokenManager.hasToken()) {
            throw new errors_1.FactusError("Not authenticated. Call login() first.", errors_1.FactusErrorCode.UNAUTHORIZED);
        }
        if (this.tokenManager.isTokenValid()) {
            return this.tokenManager.getAccessToken();
        }
        // Token expired or about to expire — refresh with concurrency guard
        await this.tokenManager.executeRefresh(() => this.refresh());
        const token = this.tokenManager.getAccessToken();
        if (!token) {
            throw new errors_1.FactusError("Failed to obtain a valid token after refresh.", errors_1.FactusErrorCode.TOKEN_REFRESH_FAILED);
        }
        return token;
    }
    /** Returns the full stored token info, or null if not authenticated. */
    getTokenInfo() {
        return this.tokenManager.getTokenData();
    }
    /** Log out — clear stored tokens. */
    logout() {
        this.tokenManager.clear();
    }
    /** Check whether we have a stored token (may or may not be valid). */
    isAuthenticated() {
        return this.tokenManager.hasToken();
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map