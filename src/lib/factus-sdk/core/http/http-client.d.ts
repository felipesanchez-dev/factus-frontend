import { HttpRequestConfig, HttpResponse } from "../types";
export declare class HttpClient {
    private readonly baseUrl;
    private readonly defaultHeaders;
    constructor(baseUrl: string);
    request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
    post<T>(url: string, body: string | URLSearchParams, headers?: Record<string, string>): Promise<HttpResponse<T>>;
    get<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>>;
    put<T>(url: string, body: string | URLSearchParams, headers?: Record<string, string>): Promise<HttpResponse<T>>;
    delete<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>>;
}
//# sourceMappingURL=http-client.d.ts.map