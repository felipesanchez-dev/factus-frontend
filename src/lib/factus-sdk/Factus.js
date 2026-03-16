"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Factus = void 0;
const config_1 = require("./core/config");
const http_1 = require("./core/http");
const application_1 = require("./modules/auth/application");
const infrastructure_1 = require("./modules/auth/infrastructure");
class Factus {
    constructor(config) {
        const baseUrl = (0, config_1.getBaseUrl)(config.environment);
        this.httpClient = new http_1.HttpClient(baseUrl);
        this.tokenManager = new application_1.TokenManager();
        const authRepository = new infrastructure_1.AuthApiRepository(this.httpClient);
        this.auth = new application_1.AuthService(authRepository, config, this.tokenManager);
    }
    /**
     * Returns a valid access token for use in external HTTP calls.
     * Handles automatic refresh transparently.
     */
    async getValidToken() {
        return this.auth.getValidToken();
    }
    /**
     * Returns the underlying HttpClient so future modules can reuse it.
     * @internal — meant for internal module wiring, not public API consumers.
     */
    getHttpClient() {
        return this.httpClient;
    }
    /**
     * Returns the shared TokenManager instance.
     * @internal — meant for internal module wiring.
     */
    getTokenManager() {
        return this.tokenManager;
    }
}
exports.Factus = Factus;
//# sourceMappingURL=Factus.js.map