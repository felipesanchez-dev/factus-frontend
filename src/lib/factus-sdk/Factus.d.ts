import { FactusConfig } from "./core/types";
import { HttpClient } from "./core/http";
import { AuthService, TokenManager } from "./modules/auth/application";
export declare class Factus {
    readonly auth: AuthService;
    private readonly httpClient;
    private readonly tokenManager;
    constructor(config: FactusConfig);
    /**
     * Returns a valid access token for use in external HTTP calls.
     * Handles automatic refresh transparently.
     */
    getValidToken(): Promise<string>;
    /**
     * Returns the underlying HttpClient so future modules can reuse it.
     * @internal — meant for internal module wiring, not public API consumers.
     */
    getHttpClient(): HttpClient;
    /**
     * Returns the shared TokenManager instance.
     * @internal — meant for internal module wiring.
     */
    getTokenManager(): TokenManager;
}
//# sourceMappingURL=Factus.d.ts.map