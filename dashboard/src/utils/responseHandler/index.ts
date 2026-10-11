import ApiError from '@/modules/api/errors/ApiError'
import type { IDefaultResponsePattern } from '@/interfaces/IDefaultResponsePattern'

export type TResponseHandler = <T>(response: unknown) => T

/**
 * Formato da API: `{ ok, message, data }`.
 * Retorna `data` ou lança `ApiError` quando `ok` é `false`.
 */
export const handleDefaultResponse: TResponseHandler = <T>(response: unknown) => {
    const parsed = response as IDefaultResponsePattern<T> | null

    if (!parsed?.ok) {
        throw new ApiError(parsed?.message || 'Não foi possível concluir a requisição.', 200)
    }

    return parsed.data
}
