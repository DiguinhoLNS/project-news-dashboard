import ApiError from '../errors/ApiError'

export interface IRequestOptions {
    signal?: AbortSignal
    headers?: HeadersInit
}

const SERVER_ERROR_MESSAGE = 'Erro no servidor. Tente novamente em alguns instantes.'

export default class RequestService {
    private url: string

    constructor(baseUrl: string) {
        this.url = baseUrl
    }

    protected createHeaders(extraHeaders?: HeadersInit) {
        const headers = new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json'
        })

        if (extraHeaders) {
            const inputHeaders = new Headers(extraHeaders)
            inputHeaders.forEach((value, key) => headers.set(key, value))
        }

        return headers
    }

    protected async parseBody(response: Response) {
        const text = await response.text()

        if (!text) return null

        try {
            return JSON.parse(text)
        } catch {
            return text
        }
    }

    protected async validateResponse(response: Response) {
        const body = await this.parseBody(response)

        if (!response.ok) {
            const message = body && typeof body === 'object' && typeof body.message === 'string' && body.message
                ? body.message
                : response.status >= 500 ? SERVER_ERROR_MESSAGE : response.statusText || 'Erro na requisição.'

            throw new ApiError(message, response.status)
        }

        return body
    }

    protected async request(endpoint: string, { headers, ...options }: RequestInit) {
        let response: Response

        try {
            response = await fetch(`${this.url}/${endpoint}`, {
                ...options,
                headers: this.createHeaders(headers)
            })
        } catch (error) {
            if (options.signal?.aborted) throw error

            throw new ApiError('Falha de conexão.', 0)
        }

        return this.validateResponse(response)
    }

    public async get(endpoint: string, options?: IRequestOptions) {
        return this.request(endpoint, {
            ...options,
            method: 'GET'
        })
    }

    public async post<K>(endpoint: string, body?: K, options?: IRequestOptions) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body)
        })
    }

    public async put<K>(endpoint: string, body?: K, options?: IRequestOptions) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body)
        })
    }

    public async patch<K>(endpoint: string, body?: K, options?: IRequestOptions) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body)
        })
    }

    public async delete<K>(endpoint: string, body?: K, options?: IRequestOptions) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE',
            body: JSON.stringify(body)
        })
    }
}
