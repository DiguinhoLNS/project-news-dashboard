import { toast as sonner } from 'sonner'
import ApiError from '@/modules/api/errors/ApiError'
import type { ExternalToast } from 'sonner'

export type TToastOptions = ExternalToast

export const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir a requisição.'

/**
 * Traduz qualquer erro em uma mensagem apresentável ao usuário.
 *
 * Falha de rede não traz mensagem útil (`Falha de conexão.`), por isso recebe um texto próprio.
 * Nos demais casos vale a mensagem do `ApiError`, que já vem pronta da API.
 */
export function getErrorMessage(error: unknown, fallback: string = DEFAULT_ERROR_MESSAGE) {
    if (error instanceof ApiError && error.isNetworkError) {
        return 'Falha de conexão. Verifique sua internet e tente novamente.'
    }

    if (error instanceof Error && error.message) return error.message

    return fallback
}

/**
 * Camada única sobre o Sonner: todo toast da aplicação passa por aqui.
 *
 * O `<Toaster />` (montado no `AppClientProvider`) é quem renderiza — sem ele nada aparece.
 *
 * Erros de request já são notificados automaticamente pelo `queryClient`;
 * use estes métodos apenas para avisos que não vêm de uma query/mutation.
 */
const toast = {
    success: (message: string, options?: TToastOptions) => sonner.success(message, options),

    error: (message: string, options?: TToastOptions) => sonner.error(message, options),

    warning: (message: string, options?: TToastOptions) => sonner.warning(message, options),

    info: (message: string, options?: TToastOptions) => sonner.info(message, options),

    loading: (message: string, options?: TToastOptions) => sonner.loading(message, options),

    message: (message: string, options?: TToastOptions) => sonner.message(message, options),

    fromError: (error: unknown, { fallback, ...options }: TToastOptions & { fallback?: string } = {}) => {
        return sonner.error(getErrorMessage(error, fallback), options)
    },

    promise: sonner.promise,

    dismiss: sonner.dismiss
}

export default toast
