export declare enum FactusErrorCode {
    NETWORK_ERROR = "NETWORK_ERROR",
    TIMEOUT = "TIMEOUT",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    TOKEN_REFRESH_FAILED = "TOKEN_REFRESH_FAILED",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    RATE_LIMITED = "RATE_LIMITED",
    SERVER_ERROR = "SERVER_ERROR",
    UNKNOWN = "UNKNOWN"
}
export declare class FactusError extends Error {
    readonly code: FactusErrorCode;
    readonly statusCode: number | null;
    readonly originalError?: unknown;
    constructor(message: string, code: FactusErrorCode, statusCode?: number | null, originalError?: unknown);
    static fromHttpStatus(status: number, body?: unknown): FactusError;
    static networkError(error: unknown): FactusError;
    static timeout(): FactusError;
}
//# sourceMappingURL=factus.error.d.ts.map