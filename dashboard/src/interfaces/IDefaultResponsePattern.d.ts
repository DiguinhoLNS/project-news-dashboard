/** Formato de resposta da API do Project News: `{ ok, message, data }`. */
export interface IDefaultResponsePattern<T> {
    ok: boolean
    message: string
    data: T
}
