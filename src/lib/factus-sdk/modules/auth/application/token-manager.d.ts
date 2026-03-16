import { TokenData, OAuthTokenResponse } from "../../../core/types";
export declare class TokenManager {
    private tokenData;
    private refreshPromise;
    /** Store a new token from an OAuth response. */
    store(response: OAuthTokenResponse): void;
    /** Get the current access token if one exists. */
    getAccessToken(): string | null;
    /** Get the current refresh token if one exists. */
    getRefreshToken(): string | null;
    /** Returns true if we have a token and it is still valid (with buffer). */
    isTokenValid(): boolean;
    /** Returns true if we have a token stored (regardless of validity). */
    hasToken(): boolean;
    /** Returns a snapshot of the current token data, or null. */
    getTokenData(): TokenData | null;
    /** Clear all stored token data. */
    clear(): void;
    /**
     * Ensures only one refresh operation runs at a time.
     * Returns a deduplication guard: if a refresh is already in flight,
     * subsequent callers await the same promise.
     */
    executeRefresh(refreshFn: () => Promise<void>): Promise<void>;
}
//# sourceMappingURL=token-manager.d.ts.map