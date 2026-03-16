"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactusError = exports.FactusErrorCode = void 0;
var FactusErrorCode;
(function (FactusErrorCode) {
    FactusErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    FactusErrorCode["TIMEOUT"] = "TIMEOUT";
    FactusErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    FactusErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    FactusErrorCode["TOKEN_REFRESH_FAILED"] = "TOKEN_REFRESH_FAILED";
    FactusErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    FactusErrorCode["FORBIDDEN"] = "FORBIDDEN";
    FactusErrorCode["NOT_FOUND"] = "NOT_FOUND";
    FactusErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    FactusErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    FactusErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
    FactusErrorCode["UNKNOWN"] = "UNKNOWN";
})(FactusErrorCode || (exports.FactusErrorCode = FactusErrorCode = {}));
class FactusError extends Error {
    constructor(message, code, statusCode = null, originalError) {
        super(message);
        this.name = "FactusError";
        this.code = code;
        this.statusCode = statusCode;
        this.originalError = originalError;
        // Restore prototype chain (required for extending Error in TS)
        Object.setPrototypeOf(this, FactusError.prototype);
    }
    static fromHttpStatus(status, body) {
        const message = typeof body === "object" && body !== null && "message" in body
            ? String(body.message)
            : `HTTP ${status}`;
        switch (status) {
            case 400:
                return new FactusError(message, FactusErrorCode.VALIDATION_ERROR, status, body);
            case 401:
                return new FactusError(message, FactusErrorCode.UNAUTHORIZED, status, body);
            case 403:
                return new FactusError(message, FactusErrorCode.FORBIDDEN, status, body);
            case 404:
                return new FactusError(message, FactusErrorCode.NOT_FOUND, status, body);
            case 429:
                return new FactusError(message, FactusErrorCode.RATE_LIMITED, status, body);
            default:
                if (status >= 500) {
                    return new FactusError(message, FactusErrorCode.SERVER_ERROR, status, body);
                }
                return new FactusError(message, FactusErrorCode.UNKNOWN, status, body);
        }
    }
    static networkError(error) {
        const message = error instanceof Error ? error.message : "Network error occurred";
        return new FactusError(message, FactusErrorCode.NETWORK_ERROR, null, error);
    }
    static timeout() {
        return new FactusError("Request timed out", FactusErrorCode.TIMEOUT, null);
    }
}
exports.FactusError = FactusError;
//# sourceMappingURL=factus.error.js.map