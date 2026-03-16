export interface HttpRequestConfig {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: Record<string, string>;
    body?: string | URLSearchParams;
    timeout?: number;
}
export interface HttpResponse<T = unknown> {
    status: number;
    data: T;
    headers: Record<string, string>;
}
//# sourceMappingURL=http.types.d.ts.map