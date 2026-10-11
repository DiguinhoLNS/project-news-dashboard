import RequestService, { type IRequestOptions } from './requestService'
import type { TResponseHandler } from '@/utils/responseHandler'

export default class ApiService {

    protected request: RequestService

    protected responseHandler: TResponseHandler

    constructor(
        protected baseUrl: string,
        responseHandler: TResponseHandler = <T>(res: unknown) => res as T
    ) {
        this.responseHandler = responseHandler
        this.request = new RequestService(this.baseUrl)
    }

    /**
     * Makes a GET request to the specified endpoint.
     * @param endpoint The API endpoint to call.
     * @param options Request options (e.g. React Query `signal`).
     * @returns A promise that resolves to the response data.
     * @throws {ApiError}
     */
    public async get<T>(endpoint: string, options?: IRequestOptions): Promise<T> {
        const response = await this.request.get(endpoint, options)
        return this.responseHandler<T>(response)
    }

    /**
     * Makes a POST request to the specified endpoint with the provided body.
     * @param endpoint The API endpoint to call.
     * @param body The body to send with the POST request.
     * @param options Request options.
     * @returns A promise that resolves to the response data.
     * @throws {ApiError}
     */
    public async post<T, K = unknown>(endpoint: string, body?: K, options?: IRequestOptions): Promise<T> {
        const response = await this.request.post<K>(endpoint, body, options)
        return this.responseHandler<T>(response)
    }

    /**
     * Makes a PUT request to the specified endpoint with the provided body.
     * @param endpoint The API endpoint to call.
     * @param body The body to send with the PUT request.
     * @param options Request options.
     * @returns A promise that resolves to the response data.
     * @throws {ApiError}
     */
    public async put<T, K = unknown>(endpoint: string, body?: K, options?: IRequestOptions): Promise<T> {
        const response = await this.request.put<K>(endpoint, body, options)
        return this.responseHandler<T>(response)
    }

    /**
     * Makes a PATCH request to the specified endpoint with the provided body.
     * @param endpoint The API endpoint to call.
     * @param body The body to send with the PATCH request.
     * @param options Request options.
     * @returns A promise that resolves to the response data.
     * @throws {ApiError}
     */
    public async patch<T, K = unknown>(endpoint: string, body?: K, options?: IRequestOptions): Promise<T> {
        const response = await this.request.patch<K>(endpoint, body, options)
        return this.responseHandler<T>(response)
    }

    /**
     * Makes a DELETE request to the specified endpoint with the provided body.
     * @param endpoint The API endpoint to call.
     * @param body The body to send with the DELETE request.
     * @param options Request options.
     * @returns A promise that resolves to the response data.
     * @throws {ApiError}
     */
    public async delete<T, K = unknown>(endpoint: string, body?: K, options?: IRequestOptions): Promise<T> {
        const response = await this.request.delete<K>(endpoint, body, options)
        return this.responseHandler<T>(response)
    }

}
