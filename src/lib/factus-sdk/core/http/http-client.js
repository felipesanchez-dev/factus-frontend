"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const errors_1 = require("../errors");
const DEFAULT_TIMEOUT = 30000;
class HttpClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            Accept: "application/json",
        };
    }
    async request(config) {
        const url = config.url.startsWith("http")
            ? config.url
            : `${this.baseUrl}${config.url}`;
        const headers = {
            ...this.defaultHeaders,
            ...config.headers,
        };
        const controller = new AbortController();
        const timeout = config.timeout ?? DEFAULT_TIMEOUT;
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, {
                method: config.method,
                headers,
                body: config.body ?? undefined,
                signal: controller.signal,
            });
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });
            let data;
            const contentType = response.headers.get("content-type") ?? "";
            if (contentType.includes("application/json")) {
                data = (await response.json());
            }
            else {
                data = (await response.text());
            }
            if (!response.ok) {
                throw errors_1.FactusError.fromHttpStatus(response.status, data);
            }
            return {
                status: response.status,
                data,
                headers: responseHeaders,
            };
        }
        catch (error) {
            if (error instanceof errors_1.FactusError) {
                throw error;
            }
            if (error instanceof DOMException && error.name === "AbortError") {
                throw errors_1.FactusError.timeout();
            }
            throw errors_1.FactusError.networkError(error);
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    async post(url, body, headers) {
        return this.request({ url, method: "POST", body, headers });
    }
    async get(url, headers) {
        return this.request({ url, method: "GET", headers });
    }
    async put(url, body, headers) {
        return this.request({ url, method: "PUT", body, headers });
    }
    async delete(url, headers) {
        return this.request({ url, method: "DELETE", headers });
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http-client.js.map