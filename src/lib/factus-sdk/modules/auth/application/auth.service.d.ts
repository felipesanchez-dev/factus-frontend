import { FactusConfig, TokenData } from "../../../core/types";
import { AuthRepository } from "../domain";
import { TokenManager } from "./token-manager";
export declare class AuthService {
    private readonly repository;
    private readonly config;
    private readonly tokenManager;
    constructor(repository: AuthRepository, config: FactusConfig, tokenManager: TokenManager);
    /** Authenticate using password grant and store the token. */
    login(): Promise<void>;
    /** Explicitly refresh the current token. */
    refresh(): Promise<void>;
    /**
     * Returns a valid access token, refreshing automatically if needed.
     * This is the main method other modules should call to get a token.
     * Handles concurrency: only one refresh runs at a time.
     */
    getValidToken(): Promise<string>;
    /** Returns the full stored token info, or null if not authenticated. */
    getTokenInfo(): TokenData | null;
    /** Log out — clear stored tokens. */
    logout(): void;
    /** Check whether we have a stored token (may or may not be valid). */
    isAuthenticated(): boolean;
}
//# sourceMappingURL=auth.service.d.ts.map