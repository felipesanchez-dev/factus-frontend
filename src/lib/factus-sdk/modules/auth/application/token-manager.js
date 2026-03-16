"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
/** Buffer in milliseconds to refresh before actual expiry (1 minute). */
const EXPIRY_BUFFER_MS = 60000;
class TokenManager {
    constructor() {
        this.tokenData = null;
        this.refreshPromise = null;
    }
    /** Store a new token from an OAuth response. */
    store(response) {
        this.tokenData = {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            tokenType: response.token_type,
            expiresAt: Date.now() + response.expires_in * 1000,
        };
    }
    /** Get the current access token if one exists. */
    getAccessToken() {
        return this.tokenData?.accessToken ?? null;
    }
    /** Get the current refresh token if one exists. */
    getRefreshToken() {
        return this.tokenData?.refreshToken ?? null;
    }
    /** Returns true if we have a token and it is still valid (with buffer). */
    isTokenValid() {
        if (!this.tokenData)
            return false;
        return Date.now() < this.tokenData.expiresAt - EXPIRY_BUFFER_MS;
    }
    /** Returns true if we have a token stored (regardless of validity). */
    hasToken() {
        return this.tokenData !== null;
    }
    /** Returns a snapshot of the current token data, or null. */
    getTokenData() {
        return this.tokenData ? { ...this.tokenData } : null;
    }
    /** Clear all stored token data. */
    clear() {
        this.tokenData = null;
        this.refreshPromise = null;
    }
    /**
     * Ensures only one refresh operation runs at a time.
     * Returns a deduplication guard: if a refresh is already in flight,
     * subsequent callers await the same promise.
     */
    async executeRefresh(refreshFn) {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }
        this.refreshPromise = refreshFn().finally(() => {
            this.refreshPromise = null;
        });
        return this.refreshPromise;
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=token-manager.js.map