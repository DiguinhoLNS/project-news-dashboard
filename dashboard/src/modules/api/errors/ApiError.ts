/**
 * Erro padrão lançado pela camada de API.
 *
 * O React Query depende de erros lançados (e não de `null`) para preencher
 * `isError`/`error` e decidir sobre `retry`, por isso toda falha de request
 * vira um `ApiError`.
 *
 * - `status = 0`: falha de rede (a request não chegou ao proxy).
 * - `status = 2xx`: HTTP ok, mas a API respondeu `ok: false`.
 */
export default class ApiError extends Error {

    constructor(
        message: string,
        public readonly status: number
    ) {
        super(message)
        this.name = 'ApiError'
    }

    public get isNetworkError() {
        return this.status === 0
    }

    public get isServerError() {
        return this.status >= 500
    }

}
